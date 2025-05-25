from typing import List, Optional
from backend.models.tortoise_models import Schedule, Schedule_Pydantic, ScheduleIn_Pydantic
from tortoise.exceptions import DoesNotExist
from datetime import date, time, datetime
from tortoise.expressions import Q

async def create_schedule(schedule: ScheduleIn_Pydantic) -> Schedule_Pydantic:
    schedule_obj = await Schedule.create(**schedule.dict(exclude_unset=True))
    return await Schedule_Pydantic.from_tortoise_orm(schedule_obj)

async def get_schedule(schedule_id: int) -> Optional[Schedule_Pydantic]:
    try:
        schedule = await Schedule.get(id=schedule_id)
        return await Schedule_Pydantic.from_tortoise_orm(schedule)
    except DoesNotExist:
        return None

async def get_all_schedules(
    skip: int = 0,
    limit: int = 100,
    user_id: Optional[int] = None,
    department_id: Optional[int] = None,
    status: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
) -> List[Schedule_Pydantic]:
    query = Schedule.all()
    
    if user_id:
        query = query.filter(user_id=user_id)
    if department_id:
        query = query.filter(department_id=department_id)
    if status:
        query = query.filter(status=status)
    if start_date:
        query = query.filter(date__gte=start_date)
    if end_date:
        query = query.filter(date__lte=end_date)
    
    schedules = await query.offset(skip).limit(limit)
    return [await Schedule_Pydantic.from_tortoise_orm(s) for s in schedules]

async def update_schedule(schedule_id: int, schedule: ScheduleIn_Pydantic) -> Optional[Schedule_Pydantic]:
    try:
        await Schedule.filter(id=schedule_id).update(**schedule.dict(exclude_unset=True))
        return await get_schedule(schedule_id)
    except DoesNotExist:
        return None

async def delete_schedule(schedule_id: int) -> bool:
    try:
        await Schedule.filter(id=schedule_id).delete()
        return True
    except DoesNotExist:
        return False

async def get_user_schedules(user_id: int) -> List[Schedule_Pydantic]:
    schedules = await Schedule.filter(user_id=user_id).order_by('date', 'start_time')
    return [await Schedule_Pydantic.from_tortoise_orm(s) for s in schedules]

async def get_department_schedules(department_id: int) -> List[Schedule_Pydantic]:
    schedules = await Schedule.filter(department_id=department_id).order_by('date', 'start_time')
    return [await Schedule_Pydantic.from_tortoise_orm(s) for s in schedules]

async def get_schedules_by_date_range(start_date: date, end_date: date) -> List[Schedule_Pydantic]:
    schedules = await Schedule.filter(
        date__gte=start_date,
        date__lte=end_date
    ).order_by('date', 'start_time')
    return [await Schedule_Pydantic.from_tortoise_orm(s) for s in schedules]

async def get_schedules_by_status(status: str) -> List[Schedule_Pydantic]:
    schedules = await Schedule.filter(status=status).order_by('date', 'start_time')
    return [await Schedule_Pydantic.from_tortoise_orm(s) for s in schedules]

async def check_schedule_conflict(
    user_id: int,
    date: date,
    start_time: time,
    end_time: time,
    exclude_schedule_id: Optional[int] = None
) -> bool:
    query = Schedule.filter(
        user_id=user_id,
        date=date
    ).filter(
        Q(start_time__lte=start_time, end_time__gt=start_time) |
        Q(start_time__lt=end_time, end_time__gte=end_time) |
        Q(start_time__gte=start_time, end_time__lte=end_time)
    )
    
    if exclude_schedule_id:
        query = query.exclude(id=exclude_schedule_id)
    
    return await query.exists() 