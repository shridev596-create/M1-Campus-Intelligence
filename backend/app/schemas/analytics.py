from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class HeatmapPoint(BaseModel):
    location_id: Optional[int]
    name: str
    building_code: Optional[str]
    zone: Optional[str]
    coord_x: float
    coord_y: float
    type: Optional[str]
    total_complaints: int
    open_complaints: int
    critical_complaints: int
    severity_score: float # Weighted score based on urgency (e.g. Critical=4, High=3, etc.)
    top_issues: List[str]

class HeatmapResponse(BaseModel):
    points: List[HeatmapPoint]
    total_active_complaints: int
    highest_density_zone: Optional[str]

class DepartmentStat(BaseModel):
    department: str
    total: int
    open: int
    in_progress: int
    resolved: int
    needs_review: int

class RepeatIssueStat(BaseModel):
    building: str
    department: str
    count: int
    common_keyword: str
    sample_complaint: str

class AnalyticsOverview(BaseModel):
    total_complaints: int
    open_complaints: int
    resolved_complaints: int
    needs_human_review_count: int
    active_clusters_count: int
    department_stats: List[DepartmentStat]
    urgency_distribution: Dict[str, int]
    language_distribution: Dict[str, int]
    top_repeat_issues: List[RepeatIssueStat]
    recent_activity_trend: List[Dict[str, Any]]
