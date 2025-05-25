from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import date
from backend.models.tortoise_models import MaintenanceRecord_Pydantic, MaintenanceRecordIn_Pydantic
from backend.crud import maintenance as maintenance_crud

router = APIRouter(
    prefix="/maintenance",
    tags=["maintenance"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=MaintenanceRecord_Pydantic)
async def create_maintenance_record(maintenance: MaintenanceRecordIn_Pydantic):
    return await maintenance_crud.create_maintenance_record(maintenance)

@router.get("/{maintenance_id}", response_model=MaintenanceRecord_Pydantic)
async def read_maintenance_record(maintenance_id: int):
    maintenance = await maintenance_crud.get_maintenance_record(maintenance_id)
    if maintenance is None:
        raise HTTPException(status_code=404, detail="Maintenance record not found")
    return maintenance

@router.get("/", response_model=List[MaintenanceRecord_Pydantic])
async def read_maintenance_records(
    skip: int = 0,
    limit: int = 100,
    equipment_id: Optional[int] = None,
    status: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
):
    return await maintenance_crud.get_all_maintenance_records(
        skip, limit, equipment_id, status, start_date, end_date
    )

@router.put("/{maintenance_id}", response_model=MaintenanceRecord_Pydantic)
async def update_maintenance_record(
    maintenance_id: int,
    maintenance: MaintenanceRecordIn_Pydantic
):
    updated_maintenance = await maintenance_crud.update_maintenance_record(
        maintenance_id, maintenance
    )
    if updated_maintenance is None:
        raise HTTPException(status_code=404, detail="Maintenance record not found")
    return updated_maintenance

@router.delete("/{maintenance_id}")
async def delete_maintenance_record(maintenance_id: int):
    success = await maintenance_crud.delete_maintenance_record(maintenance_id)
    if not success:
        raise HTTPException(status_code=404, detail="Maintenance record not found")
    return {"message": "Maintenance record deleted successfully"}

@router.get("/equipment/{equipment_id}", response_model=List[MaintenanceRecord_Pydantic])
async def read_equipment_maintenance_history(equipment_id: int):
    return await maintenance_crud.get_equipment_maintenance_history(equipment_id)

@router.get("/upcoming", response_model=List[MaintenanceRecord_Pydantic])
async def read_upcoming_maintenance():
    return await maintenance_crud.get_upcoming_maintenance()

@router.get("/status/{status}", response_model=List[MaintenanceRecord_Pydantic])
async def read_maintenance_by_status(status: str):
    return await maintenance_crud.get_maintenance_by_status(status) 