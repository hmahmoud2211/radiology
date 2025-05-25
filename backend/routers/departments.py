from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from backend.models.tortoise_models import Department, Department_Pydantic, DepartmentIn_Pydantic

router = APIRouter(
    prefix="/departments",
    tags=["departments"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=Department_Pydantic)
async def create_department(department: DepartmentIn_Pydantic):
    department_obj = await Department.create(**department.dict(exclude_unset=True))
    return await Department_Pydantic.from_tortoise_orm(department_obj)

@router.get("/{department_id}", response_model=Department_Pydantic)
async def get_department(department_id: int):
    department = await Department.get_or_none(id=department_id)
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    return await Department_Pydantic.from_tortoise_orm(department)

@router.get("/", response_model=List[Department_Pydantic])
async def get_departments(
    status: Optional[str] = Query(None)
):
    query = Department.all()
    if status is not None:
        query = query.filter(status=status)
    return await Department_Pydantic.from_queryset(query)

@router.put("/{department_id}", response_model=Department_Pydantic)
async def update_department(department_id: int, department: DepartmentIn_Pydantic):
    department_obj = await Department.get_or_none(id=department_id)
    if not department_obj:
        raise HTTPException(status_code=404, detail="Department not found")
    await department_obj.update_from_dict(department.dict(exclude_unset=True)).save()
    return await Department_Pydantic.from_tortoise_orm(department_obj)

@router.delete("/{department_id}")
async def delete_department(department_id: int):
    deleted_count = await Department.filter(id=department_id).delete()
    if not deleted_count:
        raise HTTPException(status_code=404, detail="Department not found")
    return {"message": "Department deleted successfully"} 