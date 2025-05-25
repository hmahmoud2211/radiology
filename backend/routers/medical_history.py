from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import date
from backend.models.tortoise_models import MedicalHistory, MedicalHistory_Pydantic, MedicalHistoryIn_Pydantic

router = APIRouter(
    prefix="/medical-history",
    tags=["medical-history"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=MedicalHistory_Pydantic)
async def create_medical_history(history: MedicalHistoryIn_Pydantic):
    history_obj = await MedicalHistory.create(**history.dict(exclude_unset=True))
    return await MedicalHistory_Pydantic.from_tortoise_orm(history_obj)

@router.get("/{history_id}", response_model=MedicalHistory_Pydantic)
async def get_medical_history(history_id: int):
    history = await MedicalHistory.get_or_none(id=history_id)
    if not history:
        raise HTTPException(status_code=404, detail="Medical history record not found")
    return await MedicalHistory_Pydantic.from_tortoise_orm(history)

@router.get("/", response_model=List[MedicalHistory_Pydantic])
async def get_medical_histories(
    skip: int = 0,
    limit: int = 100,
    patient_id: Optional[int] = None,
    condition: Optional[str] = None,
    status: Optional[str] = None,
    icd_code: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
):
    query = MedicalHistory.all()
    if patient_id:
        query = query.filter(patient_id=patient_id)
    if condition:
        query = query.filter(condition__icontains=condition)
    if status:
        query = query.filter(status=status)
    if icd_code:
        query = query.filter(icd_code=icd_code)
    if start_date:
        query = query.filter(diagnosis_date__gte=start_date)
    if end_date:
        query = query.filter(diagnosis_date__lte=end_date)
    return await MedicalHistory_Pydantic.from_queryset(query.offset(skip).limit(limit))

@router.put("/{history_id}", response_model=MedicalHistory_Pydantic)
async def update_medical_history(history_id: int, history: MedicalHistoryIn_Pydantic):
    history_obj = await MedicalHistory.get_or_none(id=history_id)
    if not history_obj:
        raise HTTPException(status_code=404, detail="Medical history record not found")
    await history_obj.update_from_dict(history.dict(exclude_unset=True)).save()
    return await MedicalHistory_Pydantic.from_tortoise_orm(history_obj)

@router.delete("/{history_id}")
async def delete_medical_history(history_id: int):
    deleted_count = await MedicalHistory.filter(id=history_id).delete()
    if not deleted_count:
        raise HTTPException(status_code=404, detail="Medical history record not found")
    return {"message": "Medical history record deleted successfully"}

@router.get("/patient/{patient_id}", response_model=List[MedicalHistory_Pydantic])
async def get_patient_medical_history(patient_id: int):
    return await MedicalHistory_Pydantic.from_queryset(MedicalHistory.filter(patient_id=patient_id)) 