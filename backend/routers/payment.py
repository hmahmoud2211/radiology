from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import date
from backend.models.tortoise_models import Payment, Payment_Pydantic, PaymentIn_Pydantic, Billing

router = APIRouter(
    prefix="/payment",
    tags=["payment"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=Payment_Pydantic)
async def create_payment(payment: PaymentIn_Pydantic):
    # Verify billing exists
    billing = await Billing.get_or_none(id=payment.billing_id)
    if not billing:
        raise HTTPException(status_code=404, detail="Billing record not found")
    
    payment_obj = await Payment.create(**payment.dict(exclude_unset=True))
    
    # Update billing status if payment is completed
    if payment_obj.status == "completed":
        billing.is_paid = True
        await billing.save()
    
    return await Payment_Pydantic.from_tortoise_orm(payment_obj)

@router.get("/{payment_id}", response_model=Payment_Pydantic)
async def get_payment(payment_id: int):
    payment = await Payment.get_or_none(id=payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment record not found")
    return await Payment_Pydantic.from_tortoise_orm(payment)

@router.get("/", response_model=List[Payment_Pydantic])
async def get_payments(
    skip: int = 0,
    limit: int = 100,
    billing_id: Optional[int] = None,
    payment_method: Optional[str] = None,
    status: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
):
    query = Payment.all()
    if billing_id:
        query = query.filter(billing_id=billing_id)
    if payment_method:
        query = query.filter(payment_method=payment_method)
    if status:
        query = query.filter(status=status)
    if start_date:
        query = query.filter(payment_date__gte=start_date)
    if end_date:
        query = query.filter(payment_date__lte=end_date)
    return await Payment_Pydantic.from_queryset(query.offset(skip).limit(limit))

@router.put("/{payment_id}", response_model=Payment_Pydantic)
async def update_payment(payment_id: int, payment: PaymentIn_Pydantic):
    payment_obj = await Payment.get_or_none(id=payment_id)
    if not payment_obj:
        raise HTTPException(status_code=404, detail="Payment record not found")
    
    # Store old status for comparison
    old_status = payment_obj.status
    
    # Update payment
    await payment_obj.update_from_dict(payment.dict(exclude_unset=True)).save()
    
    # Update billing status if payment status changed to/from completed
    if old_status != payment_obj.status:
        billing = await Billing.get(id=payment_obj.billing_id)
        if payment_obj.status == "completed":
            billing.is_paid = True
        elif old_status == "completed":
            billing.is_paid = False
        await billing.save()
    
    return await Payment_Pydantic.from_tortoise_orm(payment_obj)

@router.delete("/{payment_id}")
async def delete_payment(payment_id: int):
    payment = await Payment.get_or_none(id=payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment record not found")
    
    # Update billing status if payment was completed
    if payment.status == "completed":
        billing = await Billing.get(id=payment.billing_id)
        billing.is_paid = False
        await billing.save()
    
    await payment.delete()
    return {"message": "Payment record deleted successfully"}

@router.get("/billing/{billing_id}", response_model=List[Payment_Pydantic])
async def get_billing_payments(billing_id: int):
    return await Payment_Pydantic.from_queryset(Payment.filter(billing_id=billing_id))

@router.get("/patient/{patient_id}", response_model=List[Payment_Pydantic])
async def get_patient_payments(patient_id: int):
    return await Payment_Pydantic.from_queryset(
        Payment.filter(billing__patient_id=patient_id)
    ) 