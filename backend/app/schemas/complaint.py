from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class ComplaintCreate(BaseModel):
    raw_text: str = Field(..., min_length=5, description="Raw complaint description in Hinglish, Hindi, or English")
    student_name: Optional[str] = Field(None, max_length=100)
    student_email: Optional[str] = Field(None, max_length=150)
    student_phone: Optional[str] = Field(None, max_length=50)
    preferred_time_slot: Optional[str] = Field(None, max_length=100, description="Preferred visit window for technician")

class ComplaintLogResponse(BaseModel):
    id: int
    action: str
    performed_by: str
    note: Optional[str]
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)

class ComplaintClusterSimple(BaseModel):
    id: int
    cluster_title: str
    status: str

    model_config = ConfigDict(from_attributes=True)

class ComplaintResponse(BaseModel):
    id: int
    ticket_id: str
    raw_text: str
    detected_language: str
    english_translation: Optional[str]
    department: str
    building: Optional[str]
    floor: Optional[str]
    specific_location: Optional[str]
    duration: Optional[str]
    urgency: str
    confidence_score: float
    confidence_reason: Optional[str]
    needs_human_review: bool
    status: str
    admin_notes: Optional[str]
    location_id: Optional[int]
    cluster_id: Optional[int]
    cluster_rel: Optional[ComplaintClusterSimple] = None
    similarity_score_to_cluster: Optional[float]
    student_name: Optional[str]
    student_email: Optional[str]
    student_phone: Optional[str]
    preferred_time_slot: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime]
    logs: List[ComplaintLogResponse] = []

    model_config = ConfigDict(from_attributes=True)

class ComplaintStatusUpdate(BaseModel):
    status: str = Field(..., description="Submitted, In Review, In Progress, Resolved, Rejected")
    admin_notes: Optional[str] = None
    performed_by: Optional[str] = "Admin"

class HumanTriageUpdate(BaseModel):
    department: str = Field(..., description="Corrected Department")
    urgency: Optional[str] = None
    building: Optional[str] = None
    floor: Optional[str] = None
    specific_location: Optional[str] = None
    preferred_time_slot: Optional[str] = None
    notes: Optional[str] = None
    performed_by: Optional[str] = "Admin"

class ComplaintClusterDetail(BaseModel):
    id: int
    cluster_title: str
    department_code: str
    building_name: Optional[str]
    status: str
    summary: Optional[str]
    created_at: datetime
    updated_at: datetime
    complaints: List[ComplaintResponse] = []

    model_config = ConfigDict(from_attributes=True)
