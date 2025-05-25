from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import enum

class DepartmentStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    UNDER_MAINTENANCE = "under_maintenance"

class DepartmentBase(BaseModel):
    name: str = Field(..., max_length=100)
    description: Optional[str] = None
    status: DepartmentStatus = Field(default=DepartmentStatus.ACTIVE)

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    status: Optional[DepartmentStatus] = None

class DepartmentInDB(DepartmentBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class Department(DepartmentInDB):
    pass 