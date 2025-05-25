from typing import List, Optional
from backend.models.tortoise_models import Report, Report_Pydantic, ReportIn_Pydantic
from tortoise.exceptions import DoesNotExist
from datetime import date, datetime

async def create_report(report: ReportIn_Pydantic) -> Report_Pydantic:
    report_obj = await Report.create(**report.dict(exclude_unset=True))
    return await Report_Pydantic.from_tortoise_orm(report_obj)

async def get_report(report_id: int) -> Optional[Report_Pydantic]:
    try:
        report = await Report.get(id=report_id)
        return await Report_Pydantic.from_tortoise_orm(report)
    except DoesNotExist:
        return None

async def get_all_reports(
    skip: int = 0,
    limit: int = 100,
    study_id: Optional[int] = None,
    patient_id: Optional[int] = None,
    radiologist_id: Optional[int] = None,
    status: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
) -> List[Report_Pydantic]:
    query = Report.all()
    
    if study_id:
        query = query.filter(study_id=study_id)
    if patient_id:
        query = query.filter(patient_id=patient_id)
    if radiologist_id:
        query = query.filter(radiologist_id=radiologist_id)
    if status:
        query = query.filter(status=status)
    if start_date:
        query = query.filter(created_at__gte=start_date)
    if end_date:
        query = query.filter(created_at__lte=end_date)
    
    reports = await query.offset(skip).limit(limit)
    return [await Report_Pydantic.from_tortoise_orm(r) for r in reports]

async def update_report(report_id: int, report: ReportIn_Pydantic) -> Optional[Report_Pydantic]:
    try:
        await Report.filter(id=report_id).update(**report.dict(exclude_unset=True))
        return await get_report(report_id)
    except DoesNotExist:
        return None

async def delete_report(report_id: int) -> bool:
    try:
        await Report.filter(id=report_id).delete()
        return True
    except DoesNotExist:
        return False

async def get_study_report(study_id: int) -> Optional[Report_Pydantic]:
    try:
        report = await Report.get(study_id=study_id)
        return await Report_Pydantic.from_tortoise_orm(report)
    except DoesNotExist:
        return None

async def get_patient_reports(patient_id: int) -> List[Report_Pydantic]:
    reports = await Report.filter(patient_id=patient_id).order_by('-created_at')
    return [await Report_Pydantic.from_tortoise_orm(r) for r in reports]

async def get_radiologist_reports(radiologist_id: int) -> List[Report_Pydantic]:
    reports = await Report.filter(radiologist_id=radiologist_id).order_by('-created_at')
    return [await Report_Pydantic.from_tortoise_orm(r) for r in reports]

async def get_reports_by_status(status: str) -> List[Report_Pydantic]:
    reports = await Report.filter(status=status)
    return [await Report_Pydantic.from_tortoise_orm(r) for r in reports]

async def get_critical_findings_reports() -> List[Report_Pydantic]:
    reports = await Report.filter(critical_findings=True)
    return [await Report_Pydantic.from_tortoise_orm(r) for r in reports]

async def sign_report(report_id: int, signed_by: str) -> Optional[Report_Pydantic]:
    try:
        await Report.filter(id=report_id).update(
            status="signed",
            signed_at=datetime.now(),
            signed_by=signed_by
        )
        return await get_report(report_id)
    except DoesNotExist:
        return None 