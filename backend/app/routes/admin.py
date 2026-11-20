from typing import Optional, List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from app.database import get_db
from app.models.complaint import Complaint, ComplaintLog
from app.models.cluster import ComplaintCluster
from app.models.department import Department
from app.schemas.complaint import (
    ComplaintResponse,
    ComplaintStatusUpdate,
    HumanTriageUpdate,
    ComplaintClusterDetail
)

router = APIRouter(prefix="/api/admin", tags=["Admin & Operations"])

@router.get("/complaints", response_model=List[ComplaintResponse])
def get_complaints(
    department: Optional[str] = None,
    status: Optional[str] = None,
    urgency: Optional[str] = None,
    needs_review: Optional[bool] = None,
    cluster_id: Optional[int] = None,
    search: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """
    Department-wise and triage queues for administrators.
    """
    query = db.query(Complaint)

    if department and department != "All" and isinstance(department, str):
        query = query.filter(Complaint.department == department)

    if status and status != "All" and isinstance(status, str):
        query = query.filter(Complaint.status == status)

    if urgency and urgency != "All" and isinstance(urgency, str):
        query = query.filter(Complaint.urgency == urgency)

    if needs_review is not None and isinstance(needs_review, bool):
        query = query.filter(Complaint.needs_human_review == needs_review)

    if cluster_id is not None and isinstance(cluster_id, int):
        query = query.filter(Complaint.cluster_id == cluster_id)

    if search and isinstance(search, str):
        search_fmt = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Complaint.ticket_id.ilike(search_fmt),
                Complaint.raw_text.ilike(search_fmt),
                Complaint.building.ilike(search_fmt),
                Complaint.english_translation.ilike(search_fmt)
            )
        )

    return query.order_by(desc(Complaint.created_at)).offset(offset).limit(limit).all()


@router.get("/complaints/{ticket_id}", response_model=ComplaintResponse)
def get_complaint_detail(ticket_id: str, db: Session = Depends(get_db)):
    """Retrieve detailed view of a single complaint with full audit logs."""
    complaint = db.query(Complaint).filter(Complaint.ticket_id == ticket_id.upper()).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint ticket not found.")
    return complaint


@router.patch("/complaints/{ticket_id}/status", response_model=ComplaintResponse)
def update_complaint_status(
    ticket_id: str,
    payload: ComplaintStatusUpdate,
    db: Session = Depends(get_db)
):
    """
    Update ticket status (e.g. In Progress, Resolved) and log the action.
    """
    complaint = db.query(Complaint).filter(Complaint.ticket_id == ticket_id.upper()).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint ticket not found.")

    old_status = complaint.status
    complaint.status = payload.status
    if payload.admin_notes:
        complaint.admin_notes = payload.admin_notes

    if payload.status == "Resolved" and not complaint.resolved_at:
        complaint.resolved_at = datetime.utcnow()

    # Add audit log
    db.add(ComplaintLog(
        complaint_id=complaint.id,
        action="Status Changed",
        performed_by=payload.performed_by or "Admin",
        note=f"Status transitioned from '{old_status}' to '{payload.status}'. Notes: {payload.admin_notes or 'None'}"
    ))

    db.commit()
    db.refresh(complaint)
    return complaint


@router.post("/complaints/{ticket_id}/triage", response_model=ComplaintResponse)
def human_triage_complaint(
    ticket_id: str,
    payload: HumanTriageUpdate,
    db: Session = Depends(get_db)
):
    """
    Human review endpoint for uncertain AI predictions.
    Reassigns department, verifies building/urgency, and removes from Triage Queue.
    """
    complaint = db.query(Complaint).filter(Complaint.ticket_id == ticket_id.upper()).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint ticket not found.")

    prev_dept = complaint.department
    complaint.department = payload.department
    if payload.urgency:
        complaint.urgency = payload.urgency
    if payload.building:
        complaint.building = payload.building
    if payload.floor:
        complaint.floor = payload.floor
    if payload.specific_location:
        complaint.specific_location = payload.specific_location
    if payload.preferred_time_slot:
        complaint.preferred_time_slot = payload.preferred_time_slot

    complaint.needs_human_review = False
    complaint.human_reviewed_by = payload.performed_by or "Admin"
    complaint.human_review_notes = payload.notes
    if complaint.status == "In Review":
        complaint.status = "Submitted"

    # Add audit log
    db.add(ComplaintLog(
        complaint_id=complaint.id,
        action="Human Triage Verified",
        performed_by=payload.performed_by or "Admin",
        note=f"Reclassified from '{prev_dept}' to '{payload.department}'. Urgency set to '{complaint.urgency}'."
    ))

    db.commit()
    db.refresh(complaint)
    return complaint


@router.get("/clusters", response_model=List[ComplaintClusterDetail])
def list_clusters(db: Session = Depends(get_db)):
    """List all complaint clusters with their grouped complaints."""
    return db.query(ComplaintCluster).order_by(desc(ComplaintCluster.updated_at)).all()


@router.patch("/clusters/{cluster_id}/status")
def update_cluster_status(
    cluster_id: int,
    status_update: ComplaintStatusUpdate,
    db: Session = Depends(get_db)
):
    """
    Bulk updates all complaints grouped in this cluster when the master incident is resolved.
    """
    cluster = db.query(ComplaintCluster).filter(ComplaintCluster.id == cluster_id).first()
    if not cluster:
        raise HTTPException(status_code=404, detail="Cluster not found.")

    cluster.status = status_update.status
    
    # Bulk update complaints in this cluster
    complaints = db.query(Complaint).filter(Complaint.cluster_id == cluster_id).all()
    for comp in complaints:
        comp.status = status_update.status
        if status_update.status == "Resolved" and not comp.resolved_at:
            comp.resolved_at = datetime.utcnow()
        db.add(ComplaintLog(
            complaint_id=comp.id,
            action="Bulk Cluster Update",
            performed_by=status_update.performed_by or "Admin",
            note=f"Master Cluster #{cluster_id} marked as '{status_update.status}'."
        ))

    db.commit()
    return {"message": f"Cluster #{cluster_id} and {len(complaints)} complaints updated to '{status_update.status}'."}


@router.get("/departments")
def list_departments(db: Session = Depends(get_db)):
    """List active campus departments."""
    return db.query(Department).filter(Department.is_active == True).all()
