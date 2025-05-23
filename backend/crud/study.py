from sqlalchemy.orm import Session
from models.study import Study, StudyStatus
from schemas.study import StudyCreate, StudyUpdate
from typing import List, Optional
from datetime import datetime, date

def get_study(db: Session, study_id: int) -> Optional[Study]:
    return db.query(Study).filter(Study.id == study_id).first()

def get_studies(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    patient_id: Optional[int] = None,
    physician_id: Optional[int] = None,
    status: Optional[StudyStatus] = None,
    study_type: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    priority: Optional[str] = None
) -> List[Study]:
    query = db.query(Study)
    
    if patient_id:
        query = query.filter(Study.patient_id == patient_id)
    if physician_id:
        query = query.filter(Study.referring_physician_id == physician_id)
    if status:
        query = query.filter(Study.status == status)
    if study_type:
        query = query.filter(Study.study_type == study_type)
    if start_date:
        query = query.filter(Study.study_date >= start_date)
    if end_date:
        query = query.filter(Study.study_date <= end_date)
    if priority:
        query = query.filter(Study.priority == priority)
    
    return query.order_by(Study.study_date.desc()).offset(skip).limit(limit).all()

def create_study(db: Session, study: StudyCreate) -> Study:
    db_study = Study(**study.model_dump())
    db.add(db_study)
    db.commit()
    db.refresh(db_study)
    return db_study

def update_study(
    db: Session,
    study_id: int,
    study_update: StudyUpdate
) -> Optional[Study]:
    db_study = get_study(db, study_id)
    if not db_study:
        return None
    
    update_data = study_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_study, field, value)
    
    db.commit()
    db.refresh(db_study)
    return db_study

def delete_study(db: Session, study_id: int) -> bool:
    db_study = get_study(db, study_id)
    if not db_study:
        return False
    
    db.delete(db_study)
    db.commit()
    return True

def get_patient_studies(
    db: Session,
    patient_id: int,
    skip: int = 0,
    limit: int = 100
) -> List[Study]:
    return db.query(Study)\
        .filter(Study.patient_id == patient_id)\
        .order_by(Study.study_date.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()

def get_physician_studies(
    db: Session,
    physician_id: int,
    skip: int = 0,
    limit: int = 100
) -> List[Study]:
    return db.query(Study)\
        .filter(Study.referring_physician_id == physician_id)\
        .order_by(Study.study_date.desc())\
        .offset(skip)\
        .limit(limit)\
        .all() 