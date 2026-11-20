from collections import Counter
from datetime import datetime, timedelta
from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.complaint import Complaint
from app.models.location import CampusLocation
from app.models.cluster import ComplaintCluster
from app.models.department import Department
from app.schemas.analytics import HeatmapResponse, HeatmapPoint, AnalyticsOverview, DepartmentStat, RepeatIssueStat

router = APIRouter(prefix="/api/analytics", tags=["Analytics & Heatmap"])

URGENCY_WEIGHTS = {
    "Critical": 4.0,
    "High": 3.0,
    "Medium": 2.0,
    "Low": 1.0
}

@router.get("/heatmap", response_model=HeatmapResponse)
def get_campus_heatmap(db: Session = Depends(get_db)):
    """
    Returns campus locations with active complaint density and calculated severity scores.
    """
    locations = db.query(CampusLocation).all()
    points: List[HeatmapPoint] = []
    zone_density = Counter()
    total_active = 0

    for loc in locations:
        # Find complaints matching this location accurately by location_id or normalized building name
        base_building = loc.name.split('(')[0].strip()
        complaints = db.query(Complaint).filter(
            (Complaint.location_id == loc.id) | 
            (Complaint.building == loc.name) | 
            (Complaint.building.ilike(f"{base_building}%"))
        ).all()

        total = len(complaints)
        open_items = [c for c in complaints if c.status in ("Submitted", "In Review", "In Progress")]
        open_count = len(open_items)
        critical_count = sum(1 for c in open_items if c.urgency == "Critical")
        total_active += open_count

        if loc.zone:
            zone_density[loc.zone] += open_count

        # Calculate severity score: weighted sum of open complaints
        if open_count > 0:
            weighted_sum = sum(URGENCY_WEIGHTS.get(c.urgency, 2.0) for c in open_items)
            severity = round(weighted_sum, 1)
        else:
            severity = 0.0

        top_issues = [c.english_translation or c.raw_text[:60] for c in open_items[:3]]

        points.append(HeatmapPoint(
            location_id=loc.id,
            name=loc.name,
            building_code=loc.building_code,
            zone=loc.zone,
            coord_x=loc.coord_x,
            coord_y=loc.coord_y,
            type=loc.type,
            total_complaints=total,
            open_complaints=open_count,
            critical_complaints=critical_count,
            severity_score=severity,
            top_issues=top_issues
        ))

    highest_zone = zone_density.most_common(1)[0][0] if zone_density else "None"

    return HeatmapResponse(
        points=points,
        total_active_complaints=total_active,
        highest_density_zone=highest_zone
    )


@router.get("/overview", response_model=AnalyticsOverview)
def get_analytics_overview(db: Session = Depends(get_db)):
    """
    Returns high-level statistics, recurring issue clusters,
    language distributions, and department workload breakdown.
    """
    total = db.query(Complaint).count()
    open_count = db.query(Complaint).filter(Complaint.status.in_(["Submitted", "In Review", "In Progress"])).count()
    resolved_count = db.query(Complaint).filter(Complaint.status == "Resolved").count()
    needs_review_count = db.query(Complaint).filter(Complaint.needs_human_review == True).count()
    active_clusters_count = db.query(ComplaintCluster).filter(ComplaintCluster.status != "Resolved").count()

    # Department stats
    departments = db.query(Department).all()
    dept_stats: List[DepartmentStat] = []
    for dept in departments:
        d_total = db.query(Complaint).filter(Complaint.department == dept.code).count()
        d_open = db.query(Complaint).filter(Complaint.department == dept.code, Complaint.status.in_(["Submitted", "In Review"])).count()
        d_in_prog = db.query(Complaint).filter(Complaint.department == dept.code, Complaint.status == "In Progress").count()
        d_resolved = db.query(Complaint).filter(Complaint.department == dept.code, Complaint.status == "Resolved").count()
        d_needs_rev = db.query(Complaint).filter(Complaint.department == dept.code, Complaint.needs_human_review == True).count()
        dept_stats.append(DepartmentStat(
            department=dept.code,
            total=d_total,
            open=d_open,
            in_progress=d_in_prog,
            resolved=d_resolved,
            needs_review=d_needs_rev
        ))

    # Urgency distribution
    urgency_rows = db.query(Complaint.urgency, func.count(Complaint.id)).group_by(Complaint.urgency).all()
    urgency_dist = {u: count for u, count in urgency_rows}

    # Language distribution
    lang_rows = db.query(Complaint.detected_language, func.count(Complaint.id)).group_by(Complaint.detected_language).all()
    lang_dist = {l: count for l, count in lang_rows}

    # Top repeat issues grouped by building and department
    repeat_query = (
        db.query(
            Complaint.building,
            Complaint.department,
            func.count(Complaint.id).label("issue_count")
        )
        .filter(Complaint.building != None)
        .group_by(Complaint.building, Complaint.department)
        .having(func.count(Complaint.id) > 1)
        .order_by(func.count(Complaint.id).desc())
        .limit(5)
        .all()
    )

    repeat_issues: List[RepeatIssueStat] = []
    for building, dept, count in repeat_query:
        sample = db.query(Complaint).filter(Complaint.building == building, Complaint.department == dept).first()
        repeat_issues.append(RepeatIssueStat(
            building=building,
            department=dept,
            count=count,
            common_keyword=f"Multiple {dept} reports",
            sample_complaint=sample.raw_text[:80] + "..." if sample else "N/A"
        ))

    # 7-day trend
    now = datetime.utcnow()
    recent_trend = []
    for day_offset in range(6, -1, -1):
        target_date = now - timedelta(days=day_offset)
        start_of_day = target_date.replace(hour=0, minute=0, second=0, microsecond=0)
        end_of_day = target_date.replace(hour=23, minute=59, second=59, microsecond=999999)
        day_count = db.query(Complaint).filter(Complaint.created_at >= start_of_day, Complaint.created_at <= end_of_day).count()
        recent_trend.append({
            "date": target_date.strftime("%b %d"),
            "complaints": day_count
        })

    return AnalyticsOverview(
        total_complaints=total,
        open_complaints=open_count,
        resolved_complaints=resolved_count,
        needs_human_review_count=needs_review_count,
        active_clusters_count=active_clusters_count,
        department_stats=dept_stats,
        urgency_distribution=urgency_dist,
        language_distribution=lang_dist,
        top_repeat_issues=repeat_issues,
        recent_activity_trend=recent_trend
    )
