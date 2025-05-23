from pydantic import BaseModel, constr
from typing import Optional
from datetime import datetime
from models.study import StudyStatus

class StudyBase(BaseModel):
    patient_id: int
    referring_physician_id: int
    room_id: int
    equipment_id: int
    study_date: datetime
    study_type: constr(min_length=1, max_length=100)
    priority: Optional[str] = "normal"
    notes: Optional[str] = None
    status: Optional[StudyStatus] = StudyStatus.SCHEDULED
    report: Optional[str] = None

class StudyCreate(StudyBase):
    pass

class StudyUpdate(BaseModel):
    study_date: Optional[datetime] = None
    study_type: Optional[constr(min_length=1, max_length=100)] = None
    priority: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[StudyStatus] = None
    report: Optional[str] = None
    room_id: Optional[int] = None
    equipment_id: Optional[int] = None

class Study(StudyBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True 