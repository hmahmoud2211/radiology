from pydantic import BaseModel, EmailStr, constr
from typing import Optional
from datetime import datetime

class ReferringPhysicianBase(BaseModel):
    first_name: constr(min_length=1, max_length=50)
    last_name: constr(min_length=1, max_length=50)
    specialization: constr(min_length=1, max_length=100)
    contact_number: Optional[constr(max_length=20)] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    hospital_affiliation: Optional[constr(max_length=100)] = None
    license_number: constr(min_length=1, max_length=50)
    is_active: Optional[bool] = True

class ReferringPhysicianCreate(ReferringPhysicianBase):
    pass

class ReferringPhysicianUpdate(BaseModel):
    first_name: Optional[constr(min_length=1, max_length=50)] = None
    last_name: Optional[constr(min_length=1, max_length=50)] = None
    specialization: Optional[constr(min_length=1, max_length=100)] = None
    contact_number: Optional[constr(max_length=20)] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    hospital_affiliation: Optional[constr(max_length=100)] = None
    license_number: Optional[constr(min_length=1, max_length=50)] = None
    is_active: Optional[bool] = None

class ReferringPhysician(ReferringPhysicianBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True 