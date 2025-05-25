from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import date
from backend.models.tortoise_models import Insurance, Insurance_Pydantic, InsuranceIn_Pydantic

router = APIRouter(
    prefix="/insurances",
    tags=["insurances"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=Insurance_Pydantic)
async def create_insurance(insurance: InsuranceIn_Pydantic):
    insurance_obj = await Insurance.create(**insurance.dict(exclude_unset=True))
    return await Insurance_Pydantic.from_tortoise_orm(insurance_obj)

@router.get("/{insurance_id}", response_model=Insurance_Pydantic)
async def get_insurance(insurance_id: int):
    insurance = await Insurance.get_or_none(id=insurance_id)
    if not insurance:
        raise HTTPException(status_code=404, detail="Insurance not found")
    return await Insurance_Pydantic.from_tortoise_orm(insurance)

@router.get("/", response_model=List[Insurance_Pydantic])
async def get_insurances(
    skip: int = 0,
    limit: int = 100,
    patient_id: Optional[int] = None,
    provider_name: Optional[str] = None,
    status: Optional[str] = None,
    is_primary: Optional[bool] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
):
    query = Insurance.all()
    if patient_id:
        query = query.filter(patient_id=patient_id)
    if provider_name:
        query = query.filter(provider_name__icontains=provider_name)
    if status:
        query = query.filter(status=status)
    if is_primary is not None:
        query = query.filter(is_primary=is_primary)
    if start_date:
        query = query.filter(start_date__gte=start_date)
    if end_date:
        query = query.filter(end_date__lte=end_date)
    return await Insurance_Pydantic.from_queryset(query.offset(skip).limit(limit))

@router.put("/{insurance_id}", response_model=Insurance_Pydantic)
async def update_insurance(insurance_id: int, insurance: InsuranceIn_Pydantic):
    insurance_obj = await Insurance.get_or_none(id=insurance_id)
    if not insurance_obj:
        raise HTTPException(status_code=404, detail="Insurance not found")
    await insurance_obj.update_from_dict(insurance.dict(exclude_unset=True)).save()
    return await Insurance_Pydantic.from_tortoise_orm(insurance_obj)

@router.delete("/{insurance_id}")
async def delete_insurance(insurance_id: int):
    deleted_count = await Insurance.filter(id=insurance_id).delete()
    if not deleted_count:
        raise HTTPException(status_code=404, detail="Insurance not found")
    return {"message": "Insurance deleted successfully"}

@router.get("/patient/{patient_id}", response_model=List[Insurance_Pydantic])
async def get_patient_insurances(patient_id: int):
    return await Insurance_Pydantic.from_queryset(Insurance.filter(patient_id=patient_id)) 