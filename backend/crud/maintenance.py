from typing import List, Optional
from backend.models.tortoise_models import MaintenanceRecord, MaintenanceRecord_Pydantic, MaintenanceRecordIn_Pydantic
from tortoise.exceptions import DoesNotExist
from datetime import date

async def create_maintenance_record(maintenance: MaintenanceRecordIn_Pydantic) -> MaintenanceRecord_Pydantic:
    maintenance_obj = await MaintenanceRecord.create(**maintenance.dict(exclude_unset=True))
    return await MaintenanceRecord_Pydantic.from_tortoise_orm(maintenance_obj)

async def get_maintenance_record(maintenance_id: int) -> Optional[MaintenanceRecord_Pydantic]:
    try:
        maintenance = await MaintenanceRecord.get(id=maintenance_id)
        return await MaintenanceRecord_Pydantic.from_tortoise_orm(maintenance)
    except DoesNotExist:
        return None

async def get_all_maintenance_records(
    skip: int = 0,
    limit: int = 100,
    equipment_id: Optional[int] = None,
    status: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
) -> List[MaintenanceRecord_Pydantic]:
    query = MaintenanceRecord.all()
    
    if equipment_id:
        query = query.filter(equipment_id=equipment_id)
    if status:
        query = query.filter(status=status)
    if start_date:
        query = query.filter(date__gte=start_date)
    if end_date:
        query = query.filter(date__lte=end_date)
    
    maintenance_records = await query.offset(skip).limit(limit)
    return [await MaintenanceRecord_Pydantic.from_tortoise_orm(m) for m in maintenance_records]

async def update_maintenance_record(
    maintenance_id: int,
    maintenance: MaintenanceRecordIn_Pydantic
) -> Optional[MaintenanceRecord_Pydantic]:
    try:
        await MaintenanceRecord.filter(id=maintenance_id).update(**maintenance.dict(exclude_unset=True))
        return await get_maintenance_record(maintenance_id)
    except DoesNotExist:
        return None

async def delete_maintenance_record(maintenance_id: int) -> bool:
    try:
        await MaintenanceRecord.filter(id=maintenance_id).delete()
        return True
    except DoesNotExist:
        return False

async def get_equipment_maintenance_history(equipment_id: int) -> List[MaintenanceRecord_Pydantic]:
    maintenance_records = await MaintenanceRecord.filter(equipment_id=equipment_id).order_by('-date')
    return [await MaintenanceRecord_Pydantic.from_tortoise_orm(m) for m in maintenance_records]

async def get_upcoming_maintenance() -> List[MaintenanceRecord_Pydantic]:
    today = date.today()
    maintenance_records = await MaintenanceRecord.filter(
        next_maintenance_date__gte=today,
        status='scheduled'
    ).order_by('next_maintenance_date')
    return [await MaintenanceRecord_Pydantic.from_tortoise_orm(m) for m in maintenance_records]

async def get_maintenance_by_status(status: str) -> List[MaintenanceRecord_Pydantic]:
    maintenance_records = await MaintenanceRecord.filter(status=status)
    return [await MaintenanceRecord_Pydantic.from_tortoise_orm(m) for m in maintenance_records] 