from sqlalchemy import Column, Integer, String, Text, Numeric, Date, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class MaintenanceStatus(str, Enum):
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class MaintenanceRecord(Base):
    __tablename__ = "maintenance_records"

    maintenance_id = Column(Integer, primary_key=True, index=True)
    equipment_id = Column(Integer, ForeignKey("equipment.equipment_id"), nullable=False)
    description = Column(Text, nullable=False)
    performed_by = Column(String(100), nullable=False)
    cost = Column(Numeric(10, 2), nullable=False)
    date = Column(Date, nullable=False, default=datetime.utcnow)
    last_maintenance_date = Column(Date, nullable=False)
    next_maintenance_date = Column(Date, nullable=False)
    status = Column(String(50), nullable=False, default=MaintenanceStatus.SCHEDULED)
    maintenance_type = Column(String(50), nullable=False)  # e.g., "preventive", "corrective", "emergency"
    parts_replaced = Column(Text)  # List of parts replaced during maintenance
    technician_notes = Column(Text)  # Additional notes from the technician
    created_at = Column(Date, default=datetime.utcnow)
    updated_at = Column(Date, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship with Equipment
    equipment = relationship("Equipment", back_populates="maintenance_records") 