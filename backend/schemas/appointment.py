from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from backend.models.tortoise_models import Appointment, AppointmentStatus, AppointmentType

class AppointmentBase(BaseModel):
    patient_id: int
    scheduled_time: datetime
    type: AppointmentType
    status: Optional[AppointmentStatus] = AppointmentStatus.SCHEDULED
    reason: Optional[str] = None

class AppointmentCreate(AppointmentBase):
    pass

class AppointmentUpdate(BaseModel):
    scheduled_time: Optional[datetime] = None
    type: Optional[AppointmentType] = None
    status: Optional[AppointmentStatus] = None
    reason: Optional[str] = None

class Appointment(AppointmentBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True 