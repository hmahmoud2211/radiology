from fastapi import APIRouter, HTTPException
from typing import List
from backend.models.tortoise_models import ReferringPhysician, ReferringPhysician_Pydantic, ReferringPhysicianIn_Pydantic

router = APIRouter(
    prefix="/referring-physicians",
    tags=["referring-physicians"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=ReferringPhysician_Pydantic)
async def create_referring_physician(physician: ReferringPhysicianIn_Pydantic):
    physician_obj = await ReferringPhysician.create(**physician.dict(exclude_unset=True))
    return await ReferringPhysician_Pydantic.from_tortoise_orm(physician_obj)

@router.get("/{physician_id}", response_model=ReferringPhysician_Pydantic)
async def get_referring_physician(physician_id: int):
    physician = await ReferringPhysician.get_or_none(id=physician_id)
    if not physician:
        raise HTTPException(status_code=404, detail="Referring physician not found")
    return await ReferringPhysician_Pydantic.from_tortoise_orm(physician)

@router.get("/", response_model=List[ReferringPhysician_Pydantic])
async def get_referring_physicians():
    return await ReferringPhysician_Pydantic.from_queryset(ReferringPhysician.all())

@router.put("/{physician_id}", response_model=ReferringPhysician_Pydantic)
async def update_referring_physician(physician_id: int, physician: ReferringPhysicianIn_Pydantic):
    physician_obj = await ReferringPhysician.get_or_none(id=physician_id)
    if not physician_obj:
        raise HTTPException(status_code=404, detail="Referring physician not found")
    await physician_obj.update_from_dict(physician.dict(exclude_unset=True)).save()
    return await ReferringPhysician_Pydantic.from_tortoise_orm(physician_obj)

@router.delete("/{physician_id}")
async def delete_referring_physician(physician_id: int):
    deleted_count = await ReferringPhysician.filter(id=physician_id).delete()
    if not deleted_count:
        raise HTTPException(status_code=404, detail="Referring physician not found")
    return {"message": "Referring physician deleted successfully"} 