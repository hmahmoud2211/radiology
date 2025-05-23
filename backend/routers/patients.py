from fastapi import APIRouter, HTTPException
from typing import List
from models.tortoise_models import Patient, Patient_Pydantic, PatientIn_Pydantic

router = APIRouter(
    prefix="/patients",
    tags=["patients"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=Patient_Pydantic)
async def create_patient(patient: PatientIn_Pydantic):
    patient_obj = await Patient.create(**patient.dict(exclude_unset=True))
    return await Patient_Pydantic.from_tortoise_orm(patient_obj)

@router.get("/{patient_id}", response_model=Patient_Pydantic)
async def get_patient(patient_id: int):
    patient = await Patient.get_or_none(id=patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return await Patient_Pydantic.from_tortoise_orm(patient)

@router.get("/", response_model=List[Patient_Pydantic])
async def get_patients():
    return await Patient_Pydantic.from_queryset(Patient.all())

@router.put("/{patient_id}", response_model=Patient_Pydantic)
async def update_patient(patient_id: int, patient: PatientIn_Pydantic):
    patient_obj = await Patient.get_or_none(id=patient_id)
    if not patient_obj:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    update_data = patient.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(patient_obj, field, value)
    await patient_obj.save()
    return await Patient_Pydantic.from_tortoise_orm(patient_obj)

@router.delete("/{patient_id}")
async def delete_patient(patient_id: int):
    patient = await Patient.get_or_none(id=patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    await patient.delete()
    return {"message": "Patient deleted successfully"} 