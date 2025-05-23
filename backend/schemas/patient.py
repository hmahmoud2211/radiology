from pydantic import BaseModel, EmailStr
from datetime import date
from typing import Optional
from models.patient import Gender

class PatientBase(BaseModel):
    first_name: str
    last_name: str
    date_of_birth: date
    gender: Gender
    phone_number: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    medical_record_number: str

class PatientCreate(PatientBase):
    pass

class PatientUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[Gender] = None
    phone_number: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    medical_record_number: Optional[str] = None

class Patient(PatientBase):
    id: int

    class Config:
        from_attributes = True 