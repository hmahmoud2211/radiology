from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import date
from backend.models.tortoise_models import (
    ProtocolTemplate, ProtocolTemplate_Pydantic, ProtocolTemplateIn_Pydantic,
    ProtocolCategory
)

router = APIRouter(
    prefix="/protocol-template",
    tags=["protocol-template"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=ProtocolTemplate_Pydantic)
async def create_protocol_template(protocol: ProtocolTemplateIn_Pydantic):
    protocol_obj = await ProtocolTemplate.create(**protocol.dict(exclude_unset=True))
    return await ProtocolTemplate_Pydantic.from_tortoise_orm(protocol_obj)

@router.get("/{protocol_id}", response_model=ProtocolTemplate_Pydantic)
async def get_protocol_template(protocol_id: int):
    protocol = await ProtocolTemplate.get_or_none(id=protocol_id)
    if not protocol:
        raise HTTPException(status_code=404, detail="Protocol template not found")
    return await ProtocolTemplate_Pydantic.from_tortoise_orm(protocol)

@router.get("/", response_model=List[ProtocolTemplate_Pydantic])
async def get_protocol_templates(
    skip: int = 0,
    limit: int = 100,
    category: Optional[ProtocolCategory] = None,
    equipment_type: Optional[str] = None,
    department_id: Optional[int] = None,
    is_active: Optional[bool] = None,
    created_by: Optional[int] = None,
    updated_by: Optional[int] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
):
    query = ProtocolTemplate.all()
    if category:
        query = query.filter(category=category)
    if equipment_type:
        query = query.filter(equipment_type=equipment_type)
    if department_id:
        query = query.filter(department_id=department_id)
    if is_active is not None:
        query = query.filter(is_active=is_active)
    if created_by:
        query = query.filter(created_by_id=created_by)
    if updated_by:
        query = query.filter(updated_by_id=updated_by)
    if start_date:
        query = query.filter(created_at__date__gte=start_date)
    if end_date:
        query = query.filter(created_at__date__lte=end_date)
    return await ProtocolTemplate_Pydantic.from_queryset(query.offset(skip).limit(limit))

@router.put("/{protocol_id}", response_model=ProtocolTemplate_Pydantic)
async def update_protocol_template(protocol_id: int, protocol: ProtocolTemplateIn_Pydantic):
    protocol_obj = await ProtocolTemplate.get_or_none(id=protocol_id)
    if not protocol_obj:
        raise HTTPException(status_code=404, detail="Protocol template not found")
    await protocol_obj.update_from_dict(protocol.dict(exclude_unset=True)).save()
    return await ProtocolTemplate_Pydantic.from_tortoise_orm(protocol_obj)

@router.delete("/{protocol_id}")
async def delete_protocol_template(protocol_id: int):
    deleted_count = await ProtocolTemplate.filter(id=protocol_id).delete()
    if not deleted_count:
        raise HTTPException(status_code=404, detail="Protocol template not found")
    return {"message": "Protocol template deleted successfully"}

@router.get("/category/{category}", response_model=List[ProtocolTemplate_Pydantic])
async def get_protocols_by_category(category: ProtocolCategory):
    return await ProtocolTemplate_Pydantic.from_queryset(
        ProtocolTemplate.filter(category=category, is_active=True)
    )

@router.get("/equipment/{equipment_type}", response_model=List[ProtocolTemplate_Pydantic])
async def get_protocols_by_equipment(equipment_type: str):
    return await ProtocolTemplate_Pydantic.from_queryset(
        ProtocolTemplate.filter(equipment_type=equipment_type, is_active=True)
    )

@router.get("/department/{department_id}", response_model=List[ProtocolTemplate_Pydantic])
async def get_department_protocols(department_id: int):
    return await ProtocolTemplate_Pydantic.from_queryset(
        ProtocolTemplate.filter(department_id=department_id, is_active=True)
    )

@router.get("/active", response_model=List[ProtocolTemplate_Pydantic])
async def get_active_protocols():
    return await ProtocolTemplate_Pydantic.from_queryset(
        ProtocolTemplate.filter(is_active=True)
    )

@router.post("/{protocol_id}/duplicate", response_model=ProtocolTemplate_Pydantic)
async def duplicate_protocol_template(protocol_id: int):
    protocol = await ProtocolTemplate.get_or_none(id=protocol_id)
    if not protocol:
        raise HTTPException(status_code=404, detail="Protocol template not found")
    
    # Create a new version of the protocol
    protocol_dict = await ProtocolTemplate_Pydantic.from_tortoise_orm(protocol)
    protocol_dict = protocol_dict.dict()
    
    # Remove id and timestamps
    protocol_dict.pop('id', None)
    protocol_dict.pop('created_at', None)
    protocol_dict.pop('updated_at', None)
    
    # Create new protocol
    new_protocol = await ProtocolTemplate.create(**protocol_dict)
    return await ProtocolTemplate_Pydantic.from_tortoise_orm(new_protocol) 