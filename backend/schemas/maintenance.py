from pydantic import BaseModel, Field, condecimal
from datetime import date
from typing import Optional
from enum import Enum

class MaintenanceStatus(str, Enum):
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class MaintenanceType(str, Enum):
    PREVENTIVE = "preventive"
    CORRECTIVE = "corrective"
    EMERGENCY = "emergency"
    ROUTINE = "routine"

class MaintenanceRecordBase(BaseModel):
    equipment_id: int
    description: str
    performed_by: str
    cost: condecimal(max_digits=10, decimal_places=2)
    date: date
    last_maintenance_date: date
    next_maintenance_date: date
    status: MaintenanceStatus = MaintenanceStatus.SCHEDULED
    maintenance_type: MaintenanceType
    parts_replaced: Optional[str] = None
    technician_notes: Optional[str] = None

class MaintenanceRecordCreate(MaintenanceRecordBase):
    pass

class MaintenanceRecordUpdate(BaseModel):
    description: Optional[str] = None
    performed_by: Optional[str] = None
    cost: Optional[condecimal(max_digits=10, decimal_places=2)] = None
    date: Optional[date] = None
    last_maintenance_date: Optional[date] = None
    next_maintenance_date: Optional[date] = None
    status: Optional[MaintenanceStatus] = None
    maintenance_type: Optional[MaintenanceType] = None
    parts_replaced: Optional[str] = None
    technician_notes: Optional[str] = None

class MaintenanceRecord(MaintenanceRecordBase):
    maintenance_id: int
    created_at: date
    updated_at: date

    class Config:
        from_attributes = True 