from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import date
from backend.models.tortoise_models import Report_Pydantic, ReportIn_Pydantic
from backend.crud import report as report_crud

router = APIRouter(
    prefix="/reports",
    tags=["reports"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=Report_Pydantic)
async def create_report(report: ReportIn_Pydantic):
    return await report_crud.create_report(report)

@router.get("/{report_id}", response_model=Report_Pydantic)
async def read_report(report_id: int):
    report = await report_crud.get_report(report_id)
    if report is None:
        raise HTTPException(status_code=404, detail="Report not found")
    return report

@router.get("/", response_model=List[Report_Pydantic])
async def read_reports(
    skip: int = 0,
    limit: int = 100,
    study_id: Optional[int] = None,
    patient_id: Optional[int] = None,
    radiologist_id: Optional[int] = None,
    status: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
):
    return await report_crud.get_all_reports(
        skip, limit, study_id, patient_id, radiologist_id, status, start_date, end_date
    )

@router.put("/{report_id}", response_model=Report_Pydantic)
async def update_report(report_id: int, report: ReportIn_Pydantic):
    updated_report = await report_crud.update_report(report_id, report)
    if updated_report is None:
        raise HTTPException(status_code=404, detail="Report not found")
    return updated_report

@router.delete("/{report_id}")
async def delete_report(report_id: int):
    success = await report_crud.delete_report(report_id)
    if not success:
        raise HTTPException(status_code=404, detail="Report not found")
    return {"message": "Report deleted successfully"}

@router.get("/study/{study_id}", response_model=Report_Pydantic)
async def read_study_report(study_id: int):
    report = await report_crud.get_study_report(study_id)
    if report is None:
        raise HTTPException(status_code=404, detail="Report not found for this study")
    return report

@router.get("/patient/{patient_id}", response_model=List[Report_Pydantic])
async def read_patient_reports(patient_id: int):
    return await report_crud.get_patient_reports(patient_id)

@router.get("/radiologist/{radiologist_id}", response_model=List[Report_Pydantic])
async def read_radiologist_reports(radiologist_id: int):
    return await report_crud.get_radiologist_reports(radiologist_id)

@router.get("/status/{status}", response_model=List[Report_Pydantic])
async def read_reports_by_status(status: str):
    return await report_crud.get_reports_by_status(status)

@router.get("/critical-findings/", response_model=List[Report_Pydantic])
async def read_critical_findings_reports():
    return await report_crud.get_critical_findings_reports()

@router.post("/{report_id}/sign")
async def sign_report(report_id: int, signed_by: str):
    report = await report_crud.sign_report(report_id, signed_by)
    if report is None:
        raise HTTPException(status_code=404, detail="Report not found")
    return {"message": "Report signed successfully"} 