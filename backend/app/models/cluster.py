from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.orm import relationship
from app.database import Base

class ComplaintCluster(Base):
    __tablename__ = "complaint_clusters"

    id = Column(Integer, primary_key=True, index=True)
    cluster_title = Column(String(255), nullable=False) # e.g. "Hostel 3 Water Supply Interruption"
    department_code = Column(String(50), nullable=False)
    building_name = Column(String(100), nullable=True)
    status = Column(String(50), default="Open") # "Open", "Investigating", "Resolved"
    summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    complaints = relationship("Complaint", back_populates="cluster_rel")
