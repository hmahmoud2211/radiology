from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import date
from backend.models.tortoise_models import Billing, Billing_Pydantic, BillingIn_Pydantic

router = APIRouter(
    prefix="/billing",
    tags=["billing"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=Billing_Pydantic)
async def create_billing(billing: BillingIn_Pydantic):
    billing_obj = await Billing.create(**billing.dict(exclude_unset=True))
    return await Billing_Pydantic.from_tortoise_orm(billing_obj)

@router.get("/{billing_id}", response_model=Billing_Pydantic)
async def get_billing(billing_id: int):
    billing = await Billing.get_or_none(id=billing_id)
    if not billing:
        raise HTTPException(status_code=404, detail="Billing record not found")
    return await Billing_Pydantic.from_tortoise_orm(billing)

@router.get("/", response_model=List[Billing_Pydantic])
async def get_billings(
    skip: int = 0,
    limit: int = 100,
    patient_id: Optional[int] = None,
    study_id: Optional[int] = None,
    insurance_id: Optional[int] = None,
    is_paid: Optional[bool] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
):
    query = Billing.all()
    if patient_id:
        query = query.filter(patient_id=patient_id)
    if study_id:
        query = query.filter(study_id=study_id)
    if insurance_id:
        query = query.filter(insurance_id=insurance_id)
    if is_paid is not None:
        query = query.filter(is_paid=is_paid)
    if start_date:
        query = query.filter(billing_date__gte=start_date)
    if end_date:
        query = query.filter(billing_date__lte=end_date)
    return await Billing_Pydantic.from_queryset(query.offset(skip).limit(limit))

@router.put("/{billing_id}", response_model=Billing_Pydantic)
async def update_billing(billing_id: int, billing: BillingIn_Pydantic):
    billing_obj = await Billing.get_or_none(id=billing_id)
    if not billing_obj:
        raise HTTPException(status_code=404, detail="Billing record not found")
    await billing_obj.update_from_dict(billing.dict(exclude_unset=True)).save()
    return await Billing_Pydantic.from_tortoise_orm(billing_obj)

@router.delete("/{billing_id}")
async def delete_billing(billing_id: int):
    deleted_count = await Billing.filter(id=billing_id).delete()
    if not deleted_count:
        raise HTTPException(status_code=404, detail="Billing record not found")
    return {"message": "Billing record deleted successfully"}

@router.get("/patient/{patient_id}", response_model=List[Billing_Pydantic])
async def get_patient_billings(patient_id: int):
    return await Billing_Pydantic.from_queryset(Billing.filter(patient_id=patient_id))

@router.get("/patient/{patient_id}/unpaid", response_model=List[Billing_Pydantic])
async def get_patient_unpaid_billings(patient_id: int):
    return await Billing_Pydantic.from_queryset(
        Billing.filter(patient_id=patient_id, is_paid=False)
    ) 