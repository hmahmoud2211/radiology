from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from backend.models.tortoise_models import ImageAnnotation_Pydantic, ImageAnnotationIn_Pydantic
from backend.crud import image_annotation as annotation_crud

router = APIRouter(
    prefix="/annotations",
    tags=["annotations"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=ImageAnnotation_Pydantic)
async def create_annotation(annotation: ImageAnnotationIn_Pydantic):
    return await annotation_crud.create_annotation(annotation)

@router.get("/{annotation_id}", response_model=ImageAnnotation_Pydantic)
async def read_annotation(annotation_id: int):
    annotation = await annotation_crud.get_annotation(annotation_id)
    if annotation is None:
        raise HTTPException(status_code=404, detail="Annotation not found")
    return annotation

@router.get("/", response_model=List[ImageAnnotation_Pydantic])
async def read_annotations(
    skip: int = 0,
    limit: int = 100,
    study_id: Optional[int] = None,
    created_by: Optional[int] = None,
    type: Optional[str] = None,
    status: Optional[str] = None,
    is_ai_generated: Optional[bool] = None
):
    return await annotation_crud.get_all_annotations(
        skip, limit, study_id, created_by, type, status, is_ai_generated
    )

@router.put("/{annotation_id}", response_model=ImageAnnotation_Pydantic)
async def update_annotation(annotation_id: int, annotation: ImageAnnotationIn_Pydantic):
    updated_annotation = await annotation_crud.update_annotation(annotation_id, annotation)
    if updated_annotation is None:
        raise HTTPException(status_code=404, detail="Annotation not found")
    return updated_annotation

@router.delete("/{annotation_id}")
async def delete_annotation(annotation_id: int):
    success = await annotation_crud.delete_annotation(annotation_id)
    if not success:
        raise HTTPException(status_code=404, detail="Annotation not found")
    return {"message": "Annotation deleted successfully"}

@router.get("/study/{study_id}", response_model=List[ImageAnnotation_Pydantic])
async def read_study_annotations(study_id: int):
    return await annotation_crud.get_study_annotations(study_id)

@router.get("/user/{user_id}", response_model=List[ImageAnnotation_Pydantic])
async def read_user_annotations(user_id: int):
    return await annotation_crud.get_user_annotations(user_id)

@router.get("/type/{type}", response_model=List[ImageAnnotation_Pydantic])
async def read_annotations_by_type(type: str):
    return await annotation_crud.get_annotations_by_type(type)

@router.get("/status/{status}", response_model=List[ImageAnnotation_Pydantic])
async def read_annotations_by_status(status: str):
    return await annotation_crud.get_annotations_by_status(status)

@router.post("/{annotation_id}/review")
async def review_annotation(
    annotation_id: int,
    reviewer_id: int,
    status: str,
    notes: Optional[str] = None
):
    annotation = await annotation_crud.review_annotation(
        annotation_id, reviewer_id, status, notes
    )
    if annotation is None:
        raise HTTPException(status_code=404, detail="Annotation not found")
    return {"message": "Annotation reviewed successfully"}

@router.get("/ai-generated/", response_model=List[ImageAnnotation_Pydantic])
async def read_ai_generated_annotations():
    return await annotation_crud.get_ai_generated_annotations() 