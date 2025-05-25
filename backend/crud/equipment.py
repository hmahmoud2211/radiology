from typing import List, Optional
from backend.models.tortoise_models import Equipment, Equipment_Pydantic, EquipmentIn_Pydantic
from tortoise.exceptions import DoesNotExist
from datetime import date

async def create_equipment(equipment: EquipmentIn_Pydantic) -> Equipment_Pydantic:
    equipment_obj = await Equipment.create(**equipment.dict(exclude_unset=True))
    return await Equipment_Pydantic.from_tortoise_orm(equipment_obj)

async def get_equipment(equipment_id: int) -> Optional[Equipment_Pydantic]:
    try:
        equipment = await Equipment.get(id=equipment_id)
        return await Equipment_Pydantic.from_tortoise_orm(equipment)
    except DoesNotExist:
        return None

async def get_all_equipment(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    type: Optional[str] = None,
    room_id: Optional[int] = None
) -> List[Equipment_Pydantic]:
    query = Equipment.all()
    
    if status:
        query = query.filter(status=status)
    if type:
        query = query.filter(type=type)
    if room_id:
        query = query.filter(room_id=room_id)
    
    equipment = await query.offset(skip).limit(limit)
    return [await Equipment_Pydantic.from_tortoise_orm(e) for e in equipment]

async def update_equipment(equipment_id: int, equipment: EquipmentIn_Pydantic) -> Optional[Equipment_Pydantic]:
    try:
        await Equipment.filter(id=equipment_id).update(**equipment.dict(exclude_unset=True))
        return await get_equipment(equipment_id)
    except DoesNotExist:
        return None

async def delete_equipment(equipment_id: int) -> bool:
    try:
        await Equipment.filter(id=equipment_id).delete()
        return True
    except DoesNotExist:
        return False

async def get_equipment_by_serial(serial_number: str) -> Optional[Equipment_Pydantic]:
    try:
        equipment = await Equipment.get(serial_number=serial_number)
        return await Equipment_Pydantic.from_tortoise_orm(equipment)
    except DoesNotExist:
        return None

async def get_equipment_needing_maintenance() -> List[Equipment_Pydantic]:
    today = date.today()
    equipment = await Equipment.filter(
        next_calibration_date__lte=today
    ).prefetch_related('maintenance_records')
    return [await Equipment_Pydantic.from_tortoise_orm(e) for e in equipment]

async def get_equipment_by_room(room_id: int) -> List[Equipment_Pydantic]:
    equipment = await Equipment.filter(room_id=room_id)
    return [await Equipment_Pydantic.from_tortoise_orm(e) for e in equipment] 