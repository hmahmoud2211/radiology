from sqlalchemy.orm import Session
from models.referring_physician import ReferringPhysician
from schemas.referring_physician import ReferringPhysicianCreate, ReferringPhysicianUpdate
from typing import List, Optional

def get_referring_physician(db: Session, physician_id: int) -> Optional[ReferringPhysician]:
    return db.query(ReferringPhysician).filter(ReferringPhysician.id == physician_id).first()

def get_referring_physician_by_license(db: Session, license_number: str) -> Optional[ReferringPhysician]:
    return db.query(ReferringPhysician).filter(ReferringPhysician.license_number == license_number).first()

def get_referring_physicians(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    search: Optional[str] = None,
    specialization: Optional[str] = None,
    hospital: Optional[str] = None,
    is_active: Optional[bool] = None
) -> List[ReferringPhysician]:
    query = db.query(ReferringPhysician)
    
    if search:
        search = f"%{search}%"
        query = query.filter(
            (ReferringPhysician.first_name.ilike(search)) |
            (ReferringPhysician.last_name.ilike(search)) |
            (ReferringPhysician.license_number.ilike(search))
        )
    
    if specialization:
        query = query.filter(ReferringPhysician.specialization == specialization)
    
    if hospital:
        query = query.filter(ReferringPhysician.hospital_affiliation.ilike(f"%{hospital}%"))
    
    if is_active is not None:
        query = query.filter(ReferringPhysician.is_active == is_active)
    
    return query.offset(skip).limit(limit).all()

def create_referring_physician(db: Session, physician: ReferringPhysicianCreate) -> ReferringPhysician:
    db_physician = ReferringPhysician(**physician.model_dump())
    db.add(db_physician)
    db.commit()
    db.refresh(db_physician)
    return db_physician

def update_referring_physician(
    db: Session, 
    physician_id: int, 
    physician_update: ReferringPhysicianUpdate
) -> Optional[ReferringPhysician]:
    db_physician = get_referring_physician(db, physician_id)
    if not db_physician:
        return None
    
    update_data = physician_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_physician, field, value)
    
    db.commit()
    db.refresh(db_physician)
    return db_physician

def delete_referring_physician(db: Session, physician_id: int) -> bool:
    db_physician = get_referring_physician(db, physician_id)
    if not db_physician:
        return False
    
    db.delete(db_physician)
    db.commit()
    return True 