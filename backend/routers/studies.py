from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from database.database import get_db
from schemas.study import Study, StudyCreate, StudyUpdate
from models.study import StudyStatus
from crud import study as study_crud

router = APIRouter(
    prefix="/studies",
    tags=["studies"]
)

@router.post("/", response_model=Study)
def create_study(study: StudyCreate, db: Session = Depends(get_db)):
    return study_crud.create_study(db=db, study=study)

@router.get("/", response_model=List[Study])
def read_studies(
    skip: int = 0,
    limit: int = 100,
    patient_id: Optional[int] = None,
    physician_id: Optional[int] = None,
    status: Optional[StudyStatus] = None,
    study_type: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    priority: Optional[str] = None,
    db: Session = Depends(get_db)
):
    return study_crud.get_studies(
        db,
        skip=skip,
        limit=limit,
        patient_id=patient_id,
        physician_id=physician_id,
        status=status,
        study_type=study_type,
        start_date=start_date,
        end_date=end_date,
        priority=priority
    )

@router.get("/{study_id}", response_model=Study)
def read_study(study_id: int, db: Session = Depends(get_db)):
    db_study = study_crud.get_study(db, study_id=study_id)
    if db_study is None:
        raise HTTPException(status_code=404, detail="Study not found")
    return db_study

@router.put("/{study_id}", response_model=Study)
def update_study(
    study_id: int,
    study: StudyUpdate,
    db: Session = Depends(get_db)
):
    db_study = study_crud.update_study(
        db,
        study_id=study_id,
        study_update=study
    )
    if db_study is None:
        raise HTTPException(status_code=404, detail="Study not found")
    return db_study

@router.delete("/{study_id}")
def delete_study(study_id: int, db: Session = Depends(get_db)):
    success = study_crud.delete_study(db, study_id=study_id)
    if not success:
        raise HTTPException(status_code=404, detail="Study not found")
    return {"message": "Study deleted successfully"}

@router.get("/patient/{patient_id}", response_model=List[Study])
def read_patient_studies(
    patient_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    return study_crud.get_patient_studies(
        db,
        patient_id=patient_id,
        skip=skip,
        limit=limit
    )

@router.get("/physician/{physician_id}", response_model=List[Study])
def read_physician_studies(
    physician_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    return study_crud.get_physician_studies(
        db,
        physician_id=physician_id,
        skip=skip,
        limit=limit
    ) 