from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(String(50), unique=True, index=True, nullable=False) # e.g. "M1-2026-X8P2"

    # Input text
    raw_text = Column(Text, nullable=False)
    detected_language = Column(String(50), default="Hinglish")
    english_translation = Column(Text, nullable=True) # Normalized summary/translation

    # AI Extracted entities
    department = Column(String(50), ForeignKey("departments.code"), nullable=False, default="Other")
    building = Column(String(100), nullable=True) # e.g. "Hostel 3"
    floor = Column(String(50), nullable=True) # e.g. "2nd Floor"
    specific_location = Column(String(200), nullable=True) # e.g. "Room 214 washroom"
    duration = Column(String(100), nullable=True) # e.g. "2 days", "since morning"
    urgency = Column(String(50), nullable=False, default="Medium") # Low, Medium, High, Critical
    confidence_score = Column(Float, default=0.85)
    confidence_reason = Column(Text, nullable=True)

    # Human-in-the-loop triage flag
    needs_human_review = Column(Boolean, default=False, index=True)
    human_reviewed_by = Column(String(100), nullable=True)
    human_review_notes = Column(Text, nullable=True)

    # Status & Workflow
    status = Column(String(50), default="Submitted", index=True) # Submitted, In Review, In Progress, Resolved, Rejected
    admin_notes = Column(Text, nullable=True)

    # Location mapping
    location_id = Column(Integer, ForeignKey("campus_locations.id"), nullable=True)

    # Clustering / Duplicate grouping
    cluster_id = Column(Integer, ForeignKey("complaint_clusters.id"), nullable=True)
    similarity_score_to_cluster = Column(Float, nullable=True)

    # Contact info (Optional)
    student_name = Column(String(100), nullable=True)
    student_email = Column(String(150), nullable=True)
    student_phone = Column(String(50), nullable=True)

    # Student Preferred Visit Time Slot
    preferred_time_slot = Column(String(100), nullable=True) # e.g. "Evening (5 PM - 8 PM)"

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    # Relationships
    department_rel = relationship("Department", back_populates="complaints")
    location_rel = relationship("CampusLocation", back_populates="complaints")
    cluster_rel = relationship("ComplaintCluster", back_populates="complaints")
    logs = relationship("ComplaintLog", back_populates="complaint", cascade="all, delete-orphan")


class ComplaintLog(Base):
    __tablename__ = "complaint_logs"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"), nullable=False)
    action = Column(String(100), nullable=False) # e.g. "Status Updated", "Triage Reclassified", "Cluster Linked"
    performed_by = Column(String(100), default="System")
    note = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    complaint = relationship("Complaint", back_populates="logs")
