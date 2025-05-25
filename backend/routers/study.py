from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import date
from backend.models.tortoise_models import Study_Pydantic, StudyIn_Pydantic
from backend.crud import study as study_crud

router = APIRouter(
    prefix="/studies",
    tags=["studies"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=Study_Pydantic)
async def create_study(study: StudyIn_Pydantic):
    return await study_crud.create_study(study)

@router.get("/{study_id}", response_model=Study_Pydantic)
async def read_study(study_id: int):
    study = await study_crud.get_study(study_id)
    if study is None:
        raise HTTPException(status_code=404, detail="Study not found")
    return study

@router.get("/", response_model=List[Study_Pydantic])
async def read_studies(
    skip: int = 0,
    limit: int = 100,
    patient_id: Optional[int] = None,
    physician_id: Optional[int] = None,
    status: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
):
    return await study_crud.get_all_studies(
        skip, limit, patient_id, physician_id, status, start_date, end_date
    )

@router.put("/{study_id}", response_model=Study_Pydantic)
async def update_study(study_id: int, study: StudyIn_Pydantic):
    updated_study = await study_crud.update_study(study_id, study)
    if updated_study is None:
        raise HTTPException(status_code=404, detail="Study not found")
    return updated_study

@router.delete("/{study_id}")
async def delete_study(study_id: int):
    success = await study_crud.delete_study(study_id)
    if not success:
        raise HTTPException(status_code=404, detail="Study not found")
    return {"message": "Study deleted successfully"}

@router.get("/patient/{patient_id}", response_model=List[Study_Pydantic])
async def read_patient_studies(patient_id: int):
    return await study_crud.get_patient_studies(patient_id)

@router.get("/physician/{physician_id}", response_model=List[Study_Pydantic])
async def read_physician_studies(physician_id: int):
    return await study_crud.get_physician_studies(physician_id)

@router.get("/date-range/", response_model=List[Study_Pydantic])
async def read_studies_by_date_range(
    start_date: date,
    end_date: date
):
    return await study_crud.get_studies_by_date_range(start_date, end_date)

@router.get("/status/{status}", response_model=List[Study_Pydantic])
async def read_studies_by_status(status: str):
    return await study_crud.get_studies_by_status(status) 