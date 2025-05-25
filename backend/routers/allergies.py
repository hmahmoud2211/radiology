from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import date
from backend.models.tortoise_models import Allergy, Allergy_Pydantic, AllergyIn_Pydantic

router = APIRouter(
    prefix="/allergies",
    tags=["allergies"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=Allergy_Pydantic)
async def create_allergy(allergy: AllergyIn_Pydantic):
    allergy_obj = await Allergy.create(**allergy.dict(exclude_unset=True))
    return await Allergy_Pydantic.from_tortoise_orm(allergy_obj)

@router.get("/{allergy_id}", response_model=Allergy_Pydantic)
async def get_allergy(allergy_id: int):
    allergy = await Allergy.get_or_none(id=allergy_id)
    if not allergy:
        raise HTTPException(status_code=404, detail="Allergy record not found")
    return await Allergy_Pydantic.from_tortoise_orm(allergy)

@router.get("/", response_model=List[Allergy_Pydantic])
async def get_allergies(
    skip: int = 0,
    limit: int = 100,
    patient_id: Optional[int] = None,
    allergen: Optional[str] = None,
    severity: Optional[str] = None,
    is_active: Optional[bool] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
):
    query = Allergy.all()
    if patient_id:
        query = query.filter(patient_id=patient_id)
    if allergen:
        query = query.filter(allergen__icontains=allergen)
    if severity:
        query = query.filter(severity=severity)
    if is_active is not None:
        query = query.filter(is_active=is_active)
    if start_date:
        query = query.filter(onset_date__gte=start_date)
    if end_date:
        query = query.filter(onset_date__lte=end_date)
    return await Allergy_Pydantic.from_queryset(query.offset(skip).limit(limit))

@router.put("/{allergy_id}", response_model=Allergy_Pydantic)
async def update_allergy(allergy_id: int, allergy: AllergyIn_Pydantic):
    allergy_obj = await Allergy.get_or_none(id=allergy_id)
    if not allergy_obj:
        raise HTTPException(status_code=404, detail="Allergy record not found")
    await allergy_obj.update_from_dict(allergy.dict(exclude_unset=True)).save()
    return await Allergy_Pydantic.from_tortoise_orm(allergy_obj)

@router.delete("/{allergy_id}")
async def delete_allergy(allergy_id: int):
    deleted_count = await Allergy.filter(id=allergy_id).delete()
    if not deleted_count:
        raise HTTPException(status_code=404, detail="Allergy record not found")
    return {"message": "Allergy record deleted successfully"}

@router.get("/patient/{patient_id}", response_model=List[Allergy_Pydantic])
async def get_patient_allergies(patient_id: int):
    return await Allergy_Pydantic.from_queryset(Allergy.filter(patient_id=patient_id))

@router.get("/patient/{patient_id}/active", response_model=List[Allergy_Pydantic])
async def get_patient_active_allergies(patient_id: int):
    return await Allergy_Pydantic.from_queryset(
        Allergy.filter(patient_id=patient_id, is_active=True)
    ) 