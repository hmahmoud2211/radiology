from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import enum

class RoomStatus(str, enum.Enum):
    AVAILABLE = "available"
    OCCUPIED = "occupied"
    MAINTENANCE = "maintenance"
    INACTIVE = "inactive"

class RoomBase(BaseModel):
    name: str = Field(..., max_length=100)
    department_id: int
    capacity: int
    status: RoomStatus = Field(default=RoomStatus.AVAILABLE)

class RoomCreate(RoomBase):
    pass

class RoomUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    department_id: Optional[int] = None
    capacity: Optional[int] = None
    status: Optional[RoomStatus] = None

class RoomInDB(RoomBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class Room(RoomInDB):
    pass 