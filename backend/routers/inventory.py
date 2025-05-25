from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import date, datetime, timedelta
from backend.models.tortoise_models import (
    Supply, Supply_Pydantic, SupplyIn_Pydantic,
    InventoryTransaction, InventoryTransaction_Pydantic, InventoryTransactionIn_Pydantic,
    InventoryAlert, InventoryAlert_Pydantic, InventoryAlertIn_Pydantic,
    SupplyCategory, SupplyStatus, TransactionType, AlertType
)

router = APIRouter(
    prefix="/inventory",
    tags=["inventory"],
    responses={404: {"description": "Not found"}},
)

# Supply endpoints
@router.post("/supplies", response_model=Supply_Pydantic)
async def create_supply(supply: SupplyIn_Pydantic):
    supply_obj = await Supply.create(**supply.dict(exclude_unset=True))
    return await Supply_Pydantic.from_tortoise_orm(supply_obj)

@router.get("/supplies/{supply_id}", response_model=Supply_Pydantic)
async def get_supply(supply_id: int):
    supply = await Supply.get_or_none(id=supply_id)
    if not supply:
        raise HTTPException(status_code=404, detail="Supply not found")
    return await Supply_Pydantic.from_tortoise_orm(supply)

@router.get("/supplies", response_model=List[Supply_Pydantic])
async def get_supplies(
    skip: int = 0,
    limit: int = 100,
    category: Optional[SupplyCategory] = None,
    status: Optional[SupplyStatus] = None,
    department_id: Optional[int] = None,
    search: Optional[str] = None,
    low_stock: Optional[bool] = None,
    expiring_soon: Optional[bool] = None
):
    query = Supply.all()
    if category:
        query = query.filter(category=category)
    if status:
        query = query.filter(status=status)
    if department_id:
        query = query.filter(department_id=department_id)
    if search:
        query = query.filter(name__icontains=search)
    if low_stock:
        query = query.filter(current_quantity__lte=Supply.minimum_quantity)
    if expiring_soon:
        # Filter for items expiring in the next 30 days
        thirty_days_from_now = datetime.now().date() + timedelta(days=30)
        query = query.filter(expiration_date__lte=thirty_days_from_now)
    return await Supply_Pydantic.from_queryset(query.offset(skip).limit(limit))

@router.put("/supplies/{supply_id}", response_model=Supply_Pydantic)
async def update_supply(supply_id: int, supply: SupplyIn_Pydantic):
    supply_obj = await Supply.get_or_none(id=supply_id)
    if not supply_obj:
        raise HTTPException(status_code=404, detail="Supply not found")
    await supply_obj.update_from_dict(supply.dict(exclude_unset=True)).save()
    return await Supply_Pydantic.from_tortoise_orm(supply_obj)

@router.delete("/supplies/{supply_id}")
async def delete_supply(supply_id: int):
    deleted_count = await Supply.filter(id=supply_id).delete()
    if not deleted_count:
        raise HTTPException(status_code=404, detail="Supply not found")
    return {"message": "Supply deleted successfully"}

# Inventory Transaction endpoints
@router.post("/transactions", response_model=InventoryTransaction_Pydantic)
async def create_transaction(transaction: InventoryTransactionIn_Pydantic):
    # Get the supply
    supply = await Supply.get_or_none(id=transaction.supply_id)
    if not supply:
        raise HTTPException(status_code=404, detail="Supply not found")
    
    # Create transaction
    transaction_obj = await InventoryTransaction.create(**transaction.dict(exclude_unset=True))
    
    # Update supply quantity based on transaction type
    if transaction.transaction_type == TransactionType.RECEIVED:
        supply.current_quantity += transaction.quantity
    elif transaction.transaction_type == TransactionType.ISSUED:
        if supply.current_quantity < transaction.quantity:
            raise HTTPException(status_code=400, detail="Insufficient quantity")
        supply.current_quantity -= transaction.quantity
    
    # Update supply status
    if supply.current_quantity <= supply.minimum_quantity:
        supply.status = SupplyStatus.LOW_STOCK
    elif supply.current_quantity <= 0:
        supply.status = SupplyStatus.OUT_OF_STOCK
    else:
        supply.status = SupplyStatus.IN_STOCK
    
    await supply.save()
    return await InventoryTransaction_Pydantic.from_tortoise_orm(transaction_obj)

@router.get("/transactions", response_model=List[InventoryTransaction_Pydantic])
async def get_transactions(
    skip: int = 0,
    limit: int = 100,
    supply_id: Optional[int] = None,
    transaction_type: Optional[TransactionType] = None,
    department_id: Optional[int] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
):
    query = InventoryTransaction.all()
    if supply_id:
        query = query.filter(supply_id=supply_id)
    if transaction_type:
        query = query.filter(transaction_type=transaction_type)
    if department_id:
        query = query.filter(department_id=department_id)
    if start_date:
        query = query.filter(transaction_date__date__gte=start_date)
    if end_date:
        query = query.filter(transaction_date__date__lte=end_date)
    return await InventoryTransaction_Pydantic.from_queryset(query.offset(skip).limit(limit))

# Inventory Alert endpoints
@router.post("/alerts", response_model=InventoryAlert_Pydantic)
async def create_alert(alert: InventoryAlertIn_Pydantic):
    alert_obj = await InventoryAlert.create(**alert.dict(exclude_unset=True))
    return await InventoryAlert_Pydantic.from_tortoise_orm(alert_obj)

@router.get("/alerts", response_model=List[InventoryAlert_Pydantic])
async def get_alerts(
    skip: int = 0,
    limit: int = 100,
    supply_id: Optional[int] = None,
    alert_type: Optional[AlertType] = None,
    is_active: Optional[bool] = None,
    department_id: Optional[int] = None
):
    query = InventoryAlert.all()
    if supply_id:
        query = query.filter(supply_id=supply_id)
    if alert_type:
        query = query.filter(alert_type=alert_type)
    if is_active is not None:
        query = query.filter(is_active=is_active)
    if department_id:
        query = query.filter(department_id=department_id)
    return await InventoryAlert_Pydantic.from_queryset(query.offset(skip).limit(limit))

@router.put("/alerts/{alert_id}/acknowledge", response_model=InventoryAlert_Pydantic)
async def acknowledge_alert(alert_id: int, user_id: int):
    alert = await InventoryAlert.get_or_none(id=alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert.is_active = False
    alert.acknowledged_at = datetime.now()
    alert.acknowledged_by_id = user_id
    await alert.save()
    return await InventoryAlert_Pydantic.from_tortoise_orm(alert)

# Additional utility endpoints
@router.get("/supplies/low-stock", response_model=List[Supply_Pydantic])
async def get_low_stock_supplies():
    return await Supply_Pydantic.from_queryset(
        Supply.filter(current_quantity__lte=Supply.minimum_quantity)
    )

@router.get("/supplies/expiring-soon", response_model=List[Supply_Pydantic])
async def get_expiring_supplies():
    thirty_days_from_now = datetime.now().date() + timedelta(days=30)
    return await Supply_Pydantic.from_queryset(
        Supply.filter(expiration_date__lte=thirty_days_from_now)
    )

@router.get("/supplies/department/{department_id}", response_model=List[Supply_Pydantic])
async def get_department_supplies(department_id: int):
    return await Supply_Pydantic.from_queryset(
        Supply.filter(department_id=department_id)
    ) 