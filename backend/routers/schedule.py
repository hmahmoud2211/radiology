from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import date, time
from backend.models.tortoise_models import Schedule_Pydantic, ScheduleIn_Pydantic
from backend.crud import schedule as schedule_crud

router = APIRouter(
    prefix="/schedules",
    tags=["schedules"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=Schedule_Pydantic)
async def create_schedule(schedule: ScheduleIn_Pydantic):
    # Check for schedule conflicts
    has_conflict = await schedule_crud.check_schedule_conflict(
        user_id=schedule.user_id,
        date=schedule.date,
        start_time=schedule.start_time,
        end_time=schedule.end_time
    )
    if has_conflict:
        raise HTTPException(status_code=400, detail="Schedule conflict detected")
    return await schedule_crud.create_schedule(schedule)

@router.get("/{schedule_id}", response_model=Schedule_Pydantic)
async def read_schedule(schedule_id: int):
    schedule = await schedule_crud.get_schedule(schedule_id)
    if schedule is None:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return schedule

@router.get("/", response_model=List[Schedule_Pydantic])
async def read_schedules(
    skip: int = 0,
    limit: int = 100,
    user_id: Optional[int] = None,
    department_id: Optional[int] = None,
    status: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
):
    return await schedule_crud.get_all_schedules(
        skip, limit, user_id, department_id, status, start_date, end_date
    )

@router.put("/{schedule_id}", response_model=Schedule_Pydantic)
async def update_schedule(schedule_id: int, schedule: ScheduleIn_Pydantic):
    # Check for schedule conflicts, excluding the current schedule
    has_conflict = await schedule_crud.check_schedule_conflict(
        user_id=schedule.user_id,
        date=schedule.date,
        start_time=schedule.start_time,
        end_time=schedule.end_time,
        exclude_schedule_id=schedule_id
    )
    if has_conflict:
        raise HTTPException(status_code=400, detail="Schedule conflict detected")
    
    updated_schedule = await schedule_crud.update_schedule(schedule_id, schedule)
    if updated_schedule is None:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return updated_schedule

@router.delete("/{schedule_id}")
async def delete_schedule(schedule_id: int):
    success = await schedule_crud.delete_schedule(schedule_id)
    if not success:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return {"message": "Schedule deleted successfully"}

@router.get("/user/{user_id}", response_model=List[Schedule_Pydantic])
async def read_user_schedules(user_id: int):
    return await schedule_crud.get_user_schedules(user_id)

@router.get("/department/{department_id}", response_model=List[Schedule_Pydantic])
async def read_department_schedules(department_id: int):
    return await schedule_crud.get_department_schedules(department_id)

@router.get("/date-range/", response_model=List[Schedule_Pydantic])
async def read_schedules_by_date_range(
    start_date: date,
    end_date: date
):
    return await schedule_crud.get_schedules_by_date_range(start_date, end_date)

@router.get("/status/{status}", response_model=List[Schedule_Pydantic])
async def read_schedules_by_status(status: str):
    return await schedule_crud.get_schedules_by_status(status) 