from typing import List, Optional
from backend.models.tortoise_models import ImageAnnotation, ImageAnnotation_Pydantic, ImageAnnotationIn_Pydantic
from tortoise.exceptions import DoesNotExist
from datetime import datetime

async def create_annotation(annotation: ImageAnnotationIn_Pydantic) -> ImageAnnotation_Pydantic:
    annotation_obj = await ImageAnnotation.create(**annotation.dict(exclude_unset=True))
    return await ImageAnnotation_Pydantic.from_tortoise_orm(annotation_obj)

async def get_annotation(annotation_id: int) -> Optional[ImageAnnotation_Pydantic]:
    try:
        annotation = await ImageAnnotation.get(id=annotation_id)
        return await ImageAnnotation_Pydantic.from_tortoise_orm(annotation)
    except DoesNotExist:
        return None

async def get_all_annotations(
    skip: int = 0,
    limit: int = 100,
    study_id: Optional[int] = None,
    created_by: Optional[int] = None,
    type: Optional[str] = None,
    status: Optional[str] = None,
    is_ai_generated: Optional[bool] = None
) -> List[ImageAnnotation_Pydantic]:
    query = ImageAnnotation.all()
    
    if study_id:
        query = query.filter(study_id=study_id)
    if created_by:
        query = query.filter(created_by_id=created_by)
    if type:
        query = query.filter(type=type)
    if status:
        query = query.filter(status=status)
    if is_ai_generated is not None:
        query = query.filter(is_ai_generated=is_ai_generated)
    
    annotations = await query.offset(skip).limit(limit)
    return [await ImageAnnotation_Pydantic.from_tortoise_orm(a) for a in annotations]

async def update_annotation(annotation_id: int, annotation: ImageAnnotationIn_Pydantic) -> Optional[ImageAnnotation_Pydantic]:
    try:
        # Increment version number
        current = await ImageAnnotation.get(id=annotation_id)
        version = current.version + 1
        
        await ImageAnnotation.filter(id=annotation_id).update(
            **annotation.dict(exclude_unset=True),
            version=version
        )
        return await get_annotation(annotation_id)
    except DoesNotExist:
        return None

async def delete_annotation(annotation_id: int) -> bool:
    try:
        await ImageAnnotation.filter(id=annotation_id).delete()
        return True
    except DoesNotExist:
        return False

async def get_study_annotations(study_id: int) -> List[ImageAnnotation_Pydantic]:
    annotations = await ImageAnnotation.filter(study_id=study_id).order_by('-created_at')
    return [await ImageAnnotation_Pydantic.from_tortoise_orm(a) for a in annotations]

async def get_user_annotations(user_id: int) -> List[ImageAnnotation_Pydantic]:
    annotations = await ImageAnnotation.filter(created_by_id=user_id).order_by('-created_at')
    return [await ImageAnnotation_Pydantic.from_tortoise_orm(a) for a in annotations]

async def get_annotations_by_type(type: str) -> List[ImageAnnotation_Pydantic]:
    annotations = await ImageAnnotation.filter(type=type).order_by('-created_at')
    return [await ImageAnnotation_Pydantic.from_tortoise_orm(a) for a in annotations]

async def get_annotations_by_status(status: str) -> List[ImageAnnotation_Pydantic]:
    annotations = await ImageAnnotation.filter(status=status).order_by('-created_at')
    return [await ImageAnnotation_Pydantic.from_tortoise_orm(a) for a in annotations]

async def review_annotation(
    annotation_id: int,
    reviewer_id: int,
    status: str,
    notes: Optional[str] = None
) -> Optional[ImageAnnotation_Pydantic]:
    try:
        await ImageAnnotation.filter(id=annotation_id).update(
            status=status,
            reviewed_by_id=reviewer_id,
            reviewed_at=datetime.now(),
            notes=notes
        )
        return await get_annotation(annotation_id)
    except DoesNotExist:
        return None

async def get_ai_generated_annotations() -> List[ImageAnnotation_Pydantic]:
    annotations = await ImageAnnotation.filter(is_ai_generated=True).order_by('-created_at')
    return [await ImageAnnotation_Pydantic.from_tortoise_orm(a) for a in annotations] 