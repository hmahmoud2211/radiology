from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from ..database import get_db
from ..crud import maintenance as maintenance_crud
from ..schemas.maintenance import (
    MaintenanceRecord,
    MaintenanceRecordCreate,
    MaintenanceRecordUpdate
)

router = APIRouter(
    prefix="/maintenance",
    tags=["maintenance"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=MaintenanceRecord)
def create_maintenance_record(
    maintenance_record: MaintenanceRecordCreate,
    db: Session = Depends(get_db)
):
    return maintenance_crud.create_maintenance_record(db, maintenance_record)

@router.get("/{maintenance_id}", response_model=MaintenanceRecord)
def read_maintenance_record(
    maintenance_id: int,
    db: Session = Depends(get_db)
):
    db_maintenance = maintenance_crud.get_maintenance_record(db, maintenance_id)
    if db_maintenance is None:
        raise HTTPException(status_code=404, detail="Maintenance record not found")
    return db_maintenance

@router.get("/", response_model=List[MaintenanceRecord])
def read_maintenance_records(
    skip: int = 0,
    limit: int = 100,
    equipment_id: Optional[int] = None,
    status: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db)
):
    return maintenance_crud.get_maintenance_records(
        db,
        skip=skip,
        limit=limit,
        equipment_id=equipment_id,
        status=status,
        start_date=start_date,
        end_date=end_date
    )

@router.put("/{maintenance_id}", response_model=MaintenanceRecord)
def update_maintenance_record(
    maintenance_id: int,
    maintenance_record: MaintenanceRecordUpdate,
    db: Session = Depends(get_db)
):
    db_maintenance = maintenance_crud.update_maintenance_record(
        db,
        maintenance_id,
        maintenance_record
    )
    if db_maintenance is None:
        raise HTTPException(status_code=404, detail="Maintenance record not found")
    return db_maintenance

@router.delete("/{maintenance_id}")
def delete_maintenance_record(
    maintenance_id: int,
    db: Session = Depends(get_db)
):
    success = maintenance_crud.delete_maintenance_record(db, maintenance_id)
    if not success:
        raise HTTPException(status_code=404, detail="Maintenance record not found")
    return {"message": "Maintenance record deleted successfully"}

@router.get("/upcoming/", response_model=List[MaintenanceRecord])
def get_upcoming_maintenance(
    days_ahead: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db)
):
    return maintenance_crud.get_upcoming_maintenance(db, days_ahead) 