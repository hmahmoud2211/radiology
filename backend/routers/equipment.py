from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import date
from backend.models.tortoise_models import Equipment_Pydantic, EquipmentIn_Pydantic
from backend.crud import equipment as equipment_crud

router = APIRouter(
    prefix="/equipment",
    tags=["equipment"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=Equipment_Pydantic)
async def create_equipment(equipment: EquipmentIn_Pydantic):
    return await equipment_crud.create_equipment(equipment)

@router.get("/{equipment_id}", response_model=Equipment_Pydantic)
async def read_equipment(equipment_id: int):
    equipment = await equipment_crud.get_equipment(equipment_id)
    if equipment is None:
        raise HTTPException(status_code=404, detail="Equipment not found")
    return equipment

@router.get("/", response_model=List[Equipment_Pydantic])
async def read_equipment_list(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    type: Optional[str] = None,
    room_id: Optional[int] = None
):
    return await equipment_crud.get_all_equipment(skip, limit, status, type, room_id)

@router.put("/{equipment_id}", response_model=Equipment_Pydantic)
async def update_equipment(equipment_id: int, equipment: EquipmentIn_Pydantic):
    updated_equipment = await equipment_crud.update_equipment(equipment_id, equipment)
    if updated_equipment is None:
        raise HTTPException(status_code=404, detail="Equipment not found")
    return updated_equipment

@router.delete("/{equipment_id}")
async def delete_equipment(equipment_id: int):
    success = await equipment_crud.delete_equipment(equipment_id)
    if not success:
        raise HTTPException(status_code=404, detail="Equipment not found")
    return {"message": "Equipment deleted successfully"}

@router.get("/serial/{serial_number}", response_model=Equipment_Pydantic)
async def read_equipment_by_serial(serial_number: str):
    equipment = await equipment_crud.get_equipment_by_serial(serial_number)
    if equipment is None:
        raise HTTPException(status_code=404, detail="Equipment not found")
    return equipment

@router.get("/maintenance/needed", response_model=List[Equipment_Pydantic])
async def read_equipment_needing_maintenance():
    return await equipment_crud.get_equipment_needing_maintenance()

@router.get("/room/{room_id}", response_model=List[Equipment_Pydantic])
async def read_equipment_by_room(room_id: int):
    return await equipment_crud.get_equipment_by_room(room_id) 