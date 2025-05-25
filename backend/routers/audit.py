from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import date, datetime
from backend.models.tortoise_models import (
    AuditLog, AuditLog_Pydantic, AuditLogIn_Pydantic,
    ComplianceRecord, ComplianceRecord_Pydantic, ComplianceRecordIn_Pydantic,
    IncidentReport, IncidentReport_Pydantic, IncidentReportIn_Pydantic,
    AuditAction, AuditModule, ComplianceStatus, IncidentSeverity, IncidentStatus
)

router = APIRouter(
    prefix="/audit",
    tags=["audit"],
    responses={404: {"description": "Not found"}},
)

# Audit Log endpoints
@router.post("/logs", response_model=AuditLog_Pydantic)
async def create_audit_log(log: AuditLogIn_Pydantic):
    log_obj = await AuditLog.create(**log.dict(exclude_unset=True))
    return await AuditLog_Pydantic.from_tortoise_orm(log_obj)

@router.get("/logs", response_model=List[AuditLog_Pydantic])
async def get_audit_logs(
    skip: int = 0,
    limit: int = 100,
    user_id: Optional[int] = None,
    action: Optional[AuditAction] = None,
    module: Optional[AuditModule] = None,
    resource_id: Optional[int] = None,
    resource_type: Optional[str] = None,
    department_id: Optional[int] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
):
    query = AuditLog.all()
    if user_id:
        query = query.filter(user_id=user_id)
    if action:
        query = query.filter(action=action)
    if module:
        query = query.filter(module=module)
    if resource_id:
        query = query.filter(resource_id=resource_id)
    if resource_type:
        query = query.filter(resource_type=resource_type)
    if department_id:
        query = query.filter(department_id=department_id)
    if start_date:
        query = query.filter(created_at__date__gte=start_date)
    if end_date:
        query = query.filter(created_at__date__lte=end_date)
    return await AuditLog_Pydantic.from_queryset(query.offset(skip).limit(limit))

# Compliance Record endpoints
@router.post("/compliance", response_model=ComplianceRecord_Pydantic)
async def create_compliance_record(record: ComplianceRecordIn_Pydantic):
    record_obj = await ComplianceRecord.create(**record.dict(exclude_unset=True))
    return await ComplianceRecord_Pydantic.from_tortoise_orm(record_obj)

@router.get("/compliance/{record_id}", response_model=ComplianceRecord_Pydantic)
async def get_compliance_record(record_id: int):
    record = await ComplianceRecord.get_or_none(id=record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Compliance record not found")
    return await ComplianceRecord_Pydantic.from_tortoise_orm(record)

@router.get("/compliance", response_model=List[ComplianceRecord_Pydantic])
async def get_compliance_records(
    skip: int = 0,
    limit: int = 100,
    status: Optional[ComplianceStatus] = None,
    regulation: Optional[str] = None,
    department_id: Optional[int] = None,
    assigned_to: Optional[int] = None,
    due_date_before: Optional[date] = None,
    due_date_after: Optional[date] = None
):
    query = ComplianceRecord.all()
    if status:
        query = query.filter(status=status)
    if regulation:
        query = query.filter(regulation=regulation)
    if department_id:
        query = query.filter(department_id=department_id)
    if assigned_to:
        query = query.filter(assigned_to_id=assigned_to)
    if due_date_before:
        query = query.filter(due_date__lte=due_date_before)
    if due_date_after:
        query = query.filter(due_date__gte=due_date_after)
    return await ComplianceRecord_Pydantic.from_queryset(query.offset(skip).limit(limit))

@router.put("/compliance/{record_id}", response_model=ComplianceRecord_Pydantic)
async def update_compliance_record(record_id: int, record: ComplianceRecordIn_Pydantic):
    record_obj = await ComplianceRecord.get_or_none(id=record_id)
    if not record_obj:
        raise HTTPException(status_code=404, detail="Compliance record not found")
    await record_obj.update_from_dict(record.dict(exclude_unset=True)).save()
    return await ComplianceRecord_Pydantic.from_tortoise_orm(record_obj)

# Incident Report endpoints
@router.post("/incidents", response_model=IncidentReport_Pydantic)
async def create_incident_report(incident: IncidentReportIn_Pydantic):
    incident_obj = await IncidentReport.create(**incident.dict(exclude_unset=True))
    return await IncidentReport_Pydantic.from_tortoise_orm(incident_obj)

@router.get("/incidents/{incident_id}", response_model=IncidentReport_Pydantic)
async def get_incident_report(incident_id: int):
    incident = await IncidentReport.get_or_none(id=incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident report not found")
    return await IncidentReport_Pydantic.from_tortoise_orm(incident)

@router.get("/incidents", response_model=List[IncidentReport_Pydantic])
async def get_incident_reports(
    skip: int = 0,
    limit: int = 100,
    severity: Optional[IncidentSeverity] = None,
    status: Optional[IncidentStatus] = None,
    department_id: Optional[int] = None,
    reported_by: Optional[int] = None,
    assigned_to: Optional[int] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
):
    query = IncidentReport.all()
    if severity:
        query = query.filter(severity=severity)
    if status:
        query = query.filter(status=status)
    if department_id:
        query = query.filter(department_id=department_id)
    if reported_by:
        query = query.filter(reported_by_id=reported_by)
    if assigned_to:
        query = query.filter(assigned_to_id=assigned_to)
    if start_date:
        query = query.filter(incident_date__date__gte=start_date)
    if end_date:
        query = query.filter(incident_date__date__lte=end_date)
    return await IncidentReport_Pydantic.from_queryset(query.offset(skip).limit(limit))

@router.put("/incidents/{incident_id}", response_model=IncidentReport_Pydantic)
async def update_incident_report(incident_id: int, incident: IncidentReportIn_Pydantic):
    incident_obj = await IncidentReport.get_or_none(id=incident_id)
    if not incident_obj:
        raise HTTPException(status_code=404, detail="Incident report not found")
    await incident_obj.update_from_dict(incident.dict(exclude_unset=True)).save()
    return await IncidentReport_Pydantic.from_tortoise_orm(incident_obj)

# Additional utility endpoints
@router.get("/compliance/overdue", response_model=List[ComplianceRecord_Pydantic])
async def get_overdue_compliance_records():
    today = datetime.now().date()
    return await ComplianceRecord_Pydantic.from_queryset(
        ComplianceRecord.filter(
            due_date__lt=today,
            status__in=[ComplianceStatus.PENDING_REVIEW, ComplianceStatus.NEEDS_ACTION]
        )
    )

@router.get("/incidents/active", response_model=List[IncidentReport_Pydantic])
async def get_active_incidents():
    return await IncidentReport_Pydantic.from_queryset(
        IncidentReport.filter(
            status__in=[
                IncidentStatus.REPORTED,
                IncidentStatus.UNDER_INVESTIGATION,
                IncidentStatus.REOPENED
            ]
        )
    )

@router.get("/logs/user/{user_id}", response_model=List[AuditLog_Pydantic])
async def get_user_audit_logs(user_id: int):
    return await AuditLog_Pydantic.from_queryset(
        AuditLog.filter(user_id=user_id)
    ) 