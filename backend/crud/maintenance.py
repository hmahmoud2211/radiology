from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from ..models.maintenance import MaintenanceRecord
from ..schemas.maintenance import MaintenanceRecordCreate, MaintenanceRecordUpdate

def get_maintenance_record(db: Session, maintenance_id: int) -> Optional[MaintenanceRecord]:
    return db.query(MaintenanceRecord).filter(MaintenanceRecord.maintenance_id == maintenance_id).first()

def get_maintenance_records(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    equipment_id: Optional[int] = None,
    status: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
) -> List[MaintenanceRecord]:
    query = db.query(MaintenanceRecord)
    
    if equipment_id:
        query = query.filter(MaintenanceRecord.equipment_id == equipment_id)
    if status:
        query = query.filter(MaintenanceRecord.status == status)
    if start_date:
        query = query.filter(MaintenanceRecord.date >= start_date)
    if end_date:
        query = query.filter(MaintenanceRecord.date <= end_date)
    
    return query.offset(skip).limit(limit).all()

def create_maintenance_record(
    db: Session,
    maintenance_record: MaintenanceRecordCreate
) -> MaintenanceRecord:
    db_maintenance = MaintenanceRecord(**maintenance_record.model_dump())
    db.add(db_maintenance)
    db.commit()
    db.refresh(db_maintenance)
    return db_maintenance

def update_maintenance_record(
    db: Session,
    maintenance_id: int,
    maintenance_record: MaintenanceRecordUpdate
) -> Optional[MaintenanceRecord]:
    db_maintenance = get_maintenance_record(db, maintenance_id)
    if not db_maintenance:
        return None
    
    update_data = maintenance_record.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_maintenance, field, value)
    
    db.commit()
    db.refresh(db_maintenance)
    return db_maintenance

def delete_maintenance_record(db: Session, maintenance_id: int) -> bool:
    db_maintenance = get_maintenance_record(db, maintenance_id)
    if not db_maintenance:
        return False
    
    db.delete(db_maintenance)
    db.commit()
    return True

def get_upcoming_maintenance(
    db: Session,
    days_ahead: int = 30
) -> List[MaintenanceRecord]:
    from datetime import timedelta
    today = date.today()
    future_date = today + timedelta(days=days_ahead)
    
    return db.query(MaintenanceRecord).filter(
        MaintenanceRecord.next_maintenance_date <= future_date,
        MaintenanceRecord.next_maintenance_date >= today,
        MaintenanceRecord.status != "completed"
    ).all() 