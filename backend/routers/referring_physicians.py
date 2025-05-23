from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database.database import get_db
from schemas.referring_physician import ReferringPhysician, ReferringPhysicianCreate, ReferringPhysicianUpdate
from crud import referring_physician as physician_crud

router = APIRouter(
    prefix="/referring-physicians",
    tags=["referring-physicians"]
)

@router.post("/", response_model=ReferringPhysician)
def create_referring_physician(physician: ReferringPhysicianCreate, db: Session = Depends(get_db)):
    db_physician = physician_crud.get_referring_physician_by_license(db, physician.license_number)
    if db_physician:
        raise HTTPException(status_code=400, detail="License number already registered")
    return physician_crud.create_referring_physician(db=db, physician=physician)

@router.get("/", response_model=List[ReferringPhysician])
def read_referring_physicians(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    specialization: Optional[str] = None,
    hospital: Optional[str] = None,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    return physician_crud.get_referring_physicians(
        db, 
        skip=skip, 
        limit=limit, 
        search=search,
        specialization=specialization,
        hospital=hospital,
        is_active=is_active
    )

@router.get("/{physician_id}", response_model=ReferringPhysician)
def read_referring_physician(physician_id: int, db: Session = Depends(get_db)):
    db_physician = physician_crud.get_referring_physician(db, physician_id=physician_id)
    if db_physician is None:
        raise HTTPException(status_code=404, detail="Referring physician not found")
    return db_physician

@router.put("/{physician_id}", response_model=ReferringPhysician)
def update_referring_physician(
    physician_id: int,
    physician: ReferringPhysicianUpdate,
    db: Session = Depends(get_db)
):
    db_physician = physician_crud.update_referring_physician(
        db, 
        physician_id=physician_id, 
        physician_update=physician
    )
    if db_physician is None:
        raise HTTPException(status_code=404, detail="Referring physician not found")
    return db_physician

@router.delete("/{physician_id}")
def delete_referring_physician(physician_id: int, db: Session = Depends(get_db)):
    success = physician_crud.delete_referring_physician(db, physician_id=physician_id)
    if not success:
        raise HTTPException(status_code=404, detail="Referring physician not found")
    return {"message": "Referring physician deleted successfully"} 