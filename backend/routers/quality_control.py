from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import date
from backend.models.tortoise_models import (
    QualityControl, QualityControl_Pydantic, QualityControlIn_Pydantic,
    QualityControlStatus, QualityControlType
)

router = APIRouter(
    prefix="/quality-control",
    tags=["quality-control"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=QualityControl_Pydantic)
async def create_quality_control(qc: QualityControlIn_Pydantic):
    qc_obj = await QualityControl.create(**qc.dict(exclude_unset=True))
    return await QualityControl_Pydantic.from_tortoise_orm(qc_obj)

@router.get("/{qc_id}", response_model=QualityControl_Pydantic)
async def get_quality_control(qc_id: int):
    qc = await QualityControl.get_or_none(id=qc_id)
    if not qc:
        raise HTTPException(status_code=404, detail="Quality control record not found")
    return await QualityControl_Pydantic.from_tortoise_orm(qc)

@router.get("/", response_model=List[QualityControl_Pydantic])
async def get_quality_controls(
    skip: int = 0,
    limit: int = 100,
    type: Optional[QualityControlType] = None,
    status: Optional[QualityControlStatus] = None,
    study_id: Optional[int] = None,
    equipment_id: Optional[int] = None,
    report_id: Optional[int] = None,
    performed_by: Optional[int] = None,
    reviewed_by: Optional[int] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    priority: Optional[str] = None
):
    query = QualityControl.all()
    if type:
        query = query.filter(type=type)
    if status:
        query = query.filter(status=status)
    if study_id:
        query = query.filter(study_id=study_id)
    if equipment_id:
        query = query.filter(equipment_id=equipment_id)
    if report_id:
        query = query.filter(report_id=report_id)
    if performed_by:
        query = query.filter(performed_by_id=performed_by)
    if reviewed_by:
        query = query.filter(reviewed_by_id=reviewed_by)
    if start_date:
        query = query.filter(created_at__date__gte=start_date)
    if end_date:
        query = query.filter(created_at__date__lte=end_date)
    if priority:
        query = query.filter(priority=priority)
    return await QualityControl_Pydantic.from_queryset(query.offset(skip).limit(limit))

@router.put("/{qc_id}", response_model=QualityControl_Pydantic)
async def update_quality_control(qc_id: int, qc: QualityControlIn_Pydantic):
    qc_obj = await QualityControl.get_or_none(id=qc_id)
    if not qc_obj:
        raise HTTPException(status_code=404, detail="Quality control record not found")
    await qc_obj.update_from_dict(qc.dict(exclude_unset=True)).save()
    return await QualityControl_Pydantic.from_tortoise_orm(qc_obj)

@router.delete("/{qc_id}")
async def delete_quality_control(qc_id: int):
    deleted_count = await QualityControl.filter(id=qc_id).delete()
    if not deleted_count:
        raise HTTPException(status_code=404, detail="Quality control record not found")
    return {"message": "Quality control record deleted successfully"}

@router.get("/study/{study_id}", response_model=List[QualityControl_Pydantic])
async def get_study_quality_controls(study_id: int):
    return await QualityControl_Pydantic.from_queryset(
        QualityControl.filter(study_id=study_id)
    )

@router.get("/equipment/{equipment_id}", response_model=List[QualityControl_Pydantic])
async def get_equipment_quality_controls(equipment_id: int):
    return await QualityControl_Pydantic.from_queryset(
        QualityControl.filter(equipment_id=equipment_id)
    )

@router.get("/report/{report_id}", response_model=List[QualityControl_Pydantic])
async def get_report_quality_controls(report_id: int):
    return await QualityControl_Pydantic.from_queryset(
        QualityControl.filter(report_id=report_id)
    )

@router.get("/pending", response_model=List[QualityControl_Pydantic])
async def get_pending_quality_controls():
    return await QualityControl_Pydantic.from_queryset(
        QualityControl.filter(status=QualityControlStatus.PENDING)
    )

@router.get("/needs-review", response_model=List[QualityControl_Pydantic])
async def get_needs_review_quality_controls():
    return await QualityControl_Pydantic.from_queryset(
        QualityControl.filter(status=QualityControlStatus.NEEDS_REVIEW)
    ) 