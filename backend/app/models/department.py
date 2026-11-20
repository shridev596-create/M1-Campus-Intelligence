from sqlalchemy import Column, Integer, String, Boolean, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False) # e.g. "Plumbing", "Electrical"
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    contact_email = Column(String(120), nullable=True)
    is_active = Column(Boolean, default=True)

    # Relationships
    complaints = relationship("Complaint", back_populates="department_rel")
