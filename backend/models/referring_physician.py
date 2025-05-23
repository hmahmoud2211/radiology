from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean
from sqlalchemy.orm import relationship
from database.database import Base
from datetime import datetime

class ReferringPhysician(Base):
    __tablename__ = "referring_physicians"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    specialization = Column(String(100), nullable=False)
    contact_number = Column(String(20))
    email = Column(String(100), unique=True, index=True)
    address = Column(Text)
    hospital_affiliation = Column(String(100))
    license_number = Column(String(50), unique=True, index=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    appointments = relationship("Appointment", back_populates="referring_physician")
    studies = relationship("Study", back_populates="referring_physician") 