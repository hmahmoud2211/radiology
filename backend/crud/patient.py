from sqlalchemy.orm import Session
from models.patient import Patient
from schemas.patient import PatientCreate, PatientUpdate
from typing import List, Optional

def get_patient(db: Session, patient_id: int) -> Optional[Patient]:
    return db.query(Patient).filter(Patient.id == patient_id).first()

def get_patient_by_mrn(db: Session, medical_record_number: str) -> Optional[Patient]:
    return db.query(Patient).filter(Patient.medical_record_number == medical_record_number).first()

def get_patients(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    search: Optional[str] = None
) -> List[Patient]:
    query = db.query(Patient)
    if search:
        search = f"%{search}%"
        query = query.filter(
            (Patient.first_name.ilike(search)) |
            (Patient.last_name.ilike(search)) |
            (Patient.medical_record_number.ilike(search))
        )
    return query.offset(skip).limit(limit).all()

def create_patient(db: Session, patient: PatientCreate) -> Patient:
    db_patient = Patient(**patient.model_dump())
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient

def update_patient(
    db: Session, 
    patient_id: int, 
    patient_update: PatientUpdate
) -> Optional[Patient]:
    db_patient = get_patient(db, patient_id)
    if not db_patient:
        return None
    
    update_data = patient_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_patient, field, value)
    
    db.commit()
    db.refresh(db_patient)
    return db_patient

def delete_patient(db: Session, patient_id: int) -> bool:
    db_patient = get_patient(db, patient_id)
    if not db_patient:
        return False
    
    db.delete(db_patient)
    db.commit()
    return True 