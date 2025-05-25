from typing import List, Optional
from backend.models.tortoise_models import Study, Study_Pydantic, StudyIn_Pydantic
from tortoise.exceptions import DoesNotExist
from datetime import date, datetime

async def create_study(study: StudyIn_Pydantic) -> Study_Pydantic:
    study_obj = await Study.create(**study.dict(exclude_unset=True))
    return await Study_Pydantic.from_tortoise_orm(study_obj)

async def get_study(study_id: int) -> Optional[Study_Pydantic]:
    try:
        study = await Study.get(id=study_id)
        return await Study_Pydantic.from_tortoise_orm(study)
    except DoesNotExist:
        return None

async def get_all_studies(
    skip: int = 0,
    limit: int = 100,
    patient_id: Optional[int] = None,
    physician_id: Optional[int] = None,
    status: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
) -> List[Study_Pydantic]:
    query = Study.all()
    
    if patient_id:
        query = query.filter(patient_id=patient_id)
    if physician_id:
        query = query.filter(referring_physician_id=physician_id)
    if status:
        query = query.filter(status=status)
    if start_date:
        query = query.filter(study_date__gte=start_date)
    if end_date:
        query = query.filter(study_date__lte=end_date)
    
    studies = await query.offset(skip).limit(limit)
    return [await Study_Pydantic.from_tortoise_orm(s) for s in studies]

async def update_study(study_id: int, study: StudyIn_Pydantic) -> Optional[Study_Pydantic]:
    try:
        await Study.filter(id=study_id).update(**study.dict(exclude_unset=True))
        return await get_study(study_id)
    except DoesNotExist:
        return None

async def delete_study(study_id: int) -> bool:
    try:
        await Study.filter(id=study_id).delete()
        return True
    except DoesNotExist:
        return False

async def get_patient_studies(patient_id: int) -> List[Study_Pydantic]:
    studies = await Study.filter(patient_id=patient_id).order_by('-study_date')
    return [await Study_Pydantic.from_tortoise_orm(s) for s in studies]

async def get_physician_studies(physician_id: int) -> List[Study_Pydantic]:
    studies = await Study.filter(referring_physician_id=physician_id).order_by('-study_date')
    return [await Study_Pydantic.from_tortoise_orm(s) for s in studies]

async def get_studies_by_date_range(start_date: date, end_date: date) -> List[Study_Pydantic]:
    studies = await Study.filter(
        study_date__gte=start_date,
        study_date__lte=end_date
    ).order_by('study_date')
    return [await Study_Pydantic.from_tortoise_orm(s) for s in studies]

async def get_studies_by_status(status: str) -> List[Study_Pydantic]:
    studies = await Study.filter(status=status)
    return [await Study_Pydantic.from_tortoise_orm(s) for s in studies] 