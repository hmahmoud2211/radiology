from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Enum
from sqlalchemy.orm import relationship
from database.database import Base
import enum
from datetime import datetime

class StudyStatus(str, enum.Enum):
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    REPORTED = "reported"

class Study(Base):
    __tablename__ = "studies"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    referring_physician_id = Column(Integer, ForeignKey("referring_physicians.id"), nullable=False)
    room_id = Column(Integer, ForeignKey("rooms.id"), nullable=False)
    equipment_id = Column(Integer, ForeignKey("equipment.id"), nullable=False)
    
    study_date = Column(DateTime, nullable=False)
    report = Column(Text)
    status = Column(Enum(StudyStatus), default=StudyStatus.SCHEDULED, nullable=False)
    
    # Additional useful fields
    study_type = Column(String(100), nullable=False)  # e.g., X-Ray, MRI, CT Scan
    priority = Column(String(20), default="normal")  # urgent, normal, routine
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    patient = relationship("Patient", back_populates="studies")
    referring_physician = relationship("ReferringPhysician", back_populates="studies")
    room = relationship("Room", back_populates="studies")
    equipment = relationship("Equipment", back_populates="studies")
    images = relationship("Image", back_populates="study", cascade="all, delete-orphan") 