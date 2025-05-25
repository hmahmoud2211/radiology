from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from backend.models.tortoise_models import Technologist, Technologist_Pydantic, TechnologistIn_Pydantic

router = APIRouter(
    prefix="/technologists",
    tags=["technologists"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=Technologist_Pydantic)
async def create_technologist(technologist: TechnologistIn_Pydantic):
    technologist_obj = await Technologist.create(**technologist.dict(exclude_unset=True))
    return await Technologist_Pydantic.from_tortoise_orm(technologist_obj)

@router.get("/{technologist_id}", response_model=Technologist_Pydantic)
async def get_technologist(technologist_id: int):
    technologist = await Technologist.get_or_none(id=technologist_id)
    if not technologist:
        raise HTTPException(status_code=404, detail="Technologist not found")
    return await Technologist_Pydantic.from_tortoise_orm(technologist)

@router.get("/", response_model=List[Technologist_Pydantic])
async def get_technologists(
    skip: int = 0,
    limit: int = 100,
    department_id: Optional[int] = None,
    specialization: Optional[str] = None,
    status: Optional[str] = None
):
    query = Technologist.all()
    if department_id:
        query = query.filter(department_id=department_id)
    if specialization:
        query = query.filter(specialization=specialization)
    if status:
        query = query.filter(status=status)
    return await Technologist_Pydantic.from_queryset(query.offset(skip).limit(limit))

@router.put("/{technologist_id}", response_model=Technologist_Pydantic)
async def update_technologist(technologist_id: int, technologist: TechnologistIn_Pydantic):
    technologist_obj = await Technologist.get_or_none(id=technologist_id)
    if not technologist_obj:
        raise HTTPException(status_code=404, detail="Technologist not found")
    await technologist_obj.update_from_dict(technologist.dict(exclude_unset=True)).save()
    return await Technologist_Pydantic.from_tortoise_orm(technologist_obj)

@router.delete("/{technologist_id}")
async def delete_technologist(technologist_id: int):
    deleted_count = await Technologist.filter(id=technologist_id).delete()
    if not deleted_count:
        raise HTTPException(status_code=404, detail="Technologist not found")
    return {"message": "Technologist deleted successfully"} 