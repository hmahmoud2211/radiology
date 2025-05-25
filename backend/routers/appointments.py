from fastapi import APIRouter, HTTPException
from typing import List
from backend.models.tortoise_models import Appointment, Appointment_Pydantic, AppointmentIn_Pydantic

router = APIRouter(
    prefix="/appointments",
    tags=["appointments"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=Appointment_Pydantic)
async def create_appointment(appointment: AppointmentIn_Pydantic):
    appointment_obj = await Appointment.create(**appointment.dict(exclude_unset=True))
    return await Appointment_Pydantic.from_tortoise_orm(appointment_obj)

@router.get("/{appointment_id}", response_model=Appointment_Pydantic)
async def get_appointment(appointment_id: int):
    appointment = await Appointment.get_or_none(id=appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return await Appointment_Pydantic.from_tortoise_orm(appointment)

@router.get("/", response_model=List[Appointment_Pydantic])
async def get_appointments():
    return await Appointment_Pydantic.from_queryset(Appointment.all())

@router.put("/{appointment_id}", response_model=Appointment_Pydantic)
async def update_appointment(appointment_id: int, appointment: AppointmentIn_Pydantic):
    appointment_obj = await Appointment.get_or_none(id=appointment_id)
    if not appointment_obj:
        raise HTTPException(status_code=404, detail="Appointment not found")
    await appointment_obj.update_from_dict(appointment.dict(exclude_unset=True)).save()
    return await Appointment_Pydantic.from_tortoise_orm(appointment_obj)

@router.delete("/{appointment_id}")
async def delete_appointment(appointment_id: int):
    deleted_count = await Appointment.filter(id=appointment_id).delete()
    if not deleted_count:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return {"message": "Appointment deleted successfully"} 