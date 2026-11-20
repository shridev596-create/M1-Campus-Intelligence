from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.orm import relationship
from app.database import Base

class CampusLocation(Base):
    __tablename__ = "campus_locations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False) # e.g. "Hostel 1 (Boys)"
    building_code = Column(String(50), nullable=True) # e.g. "H1", "LIB"
    zone = Column(String(50), nullable=True) # e.g. "North Campus"
    coord_x = Column(Float, nullable=False, default=50.0) # 0.0 - 100.0 percent
    coord_y = Column(Float, nullable=False, default=50.0) # 0.0 - 100.0 percent
    type = Column(String(50), nullable=True) # "Hostel", "Academic", "Mess", etc.

    # Relationships
    complaints = relationship("Complaint", back_populates="location_rel")
