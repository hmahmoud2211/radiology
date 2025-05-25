from fastapi import APIRouter, HTTPException
from typing import List
from backend.models.tortoise_models import Study, Study_Pydantic, StudyIn_Pydantic

router = APIRouter(
    prefix="/studies",
    tags=["studies"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=Study_Pydantic)
async def create_study(study: StudyIn_Pydantic):
    study_obj = await Study.create(**study.dict(exclude_unset=True))
    return await Study_Pydantic.from_tortoise_orm(study_obj)

@router.get("/{study_id}", response_model=Study_Pydantic)
async def get_study(study_id: int):
    study = await Study.get_or_none(id=study_id)
    if not study:
        raise HTTPException(status_code=404, detail="Study not found")
    return await Study_Pydantic.from_tortoise_orm(study)

@router.get("/", response_model=List[Study_Pydantic])
async def get_studies():
    return await Study_Pydantic.from_queryset(Study.all())

@router.put("/{study_id}", response_model=Study_Pydantic)
async def update_study(study_id: int, study: StudyIn_Pydantic):
    study_obj = await Study.get_or_none(id=study_id)
    if not study_obj:
        raise HTTPException(status_code=404, detail="Study not found")
    await study_obj.update_from_dict(study.dict(exclude_unset=True)).save()
    return await Study_Pydantic.from_tortoise_orm(study_obj)

@router.delete("/{study_id}")
async def delete_study(study_id: int):
    deleted_count = await Study.filter(id=study_id).delete()
    if not deleted_count:
        raise HTTPException(status_code=404, detail="Study not found")
    return {"message": "Study deleted successfully"} 