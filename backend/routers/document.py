from fastapi import APIRouter, HTTPException, Query, UploadFile, File, Form
from typing import List, Optional
from datetime import date, datetime, timedelta
import os
from backend.models.tortoise_models import (
    Document, Document_Pydantic, DocumentIn_Pydantic,
    DocumentVersion, DocumentVersion_Pydantic, DocumentVersionIn_Pydantic,
    DocumentShare, DocumentShare_Pydantic, DocumentShareIn_Pydantic,
    DocumentCategory, DocumentStatus
)

router = APIRouter(
    prefix="/documents",
    tags=["documents"],
    responses={404: {"description": "Not found"}},
)

# Document endpoints
@router.post("/", response_model=Document_Pydantic)
async def create_document(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    category: DocumentCategory = Form(...),
    department_id: int = Form(...),
    created_by_id: int = Form(...),
    file: UploadFile = File(...),
    tags: Optional[str] = Form(None),
    is_public: bool = Form(False),
    parent_document_id: Optional[int] = Form(None)
):
    # Save the file
    file_path = f"uploads/documents/{file.filename}"
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    # Create document record
    document_data = {
        "title": title,
        "description": description,
        "category": category,
        "department_id": department_id,
        "created_by_id": created_by_id,
        "file_path": file_path,
        "file_type": file.content_type,
        "file_size": len(content),
        "tags": tags.split(",") if tags else None,
        "is_public": is_public,
        "parent_document_id": parent_document_id
    }
    
    document = await Document.create(**document_data)
    return await Document_Pydantic.from_tortoise_orm(document)

@router.get("/{document_id}", response_model=Document_Pydantic)
async def get_document(document_id: int):
    document = await Document.get_or_none(id=document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return await Document_Pydantic.from_tortoise_orm(document)

@router.get("/", response_model=List[Document_Pydantic])
async def get_documents(
    skip: int = 0,
    limit: int = 100,
    category: Optional[DocumentCategory] = None,
    status: Optional[DocumentStatus] = None,
    department_id: Optional[int] = None,
    created_by: Optional[int] = None,
    search: Optional[str] = None,
    tags: Optional[str] = None,
    is_public: Optional[bool] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
):
    query = Document.all()
    if category:
        query = query.filter(category=category)
    if status:
        query = query.filter(status=status)
    if department_id:
        query = query.filter(department_id=department_id)
    if created_by:
        query = query.filter(created_by_id=created_by)
    if search:
        query = query.filter(title__icontains=search)
    if tags:
        tag_list = tags.split(",")
        query = query.filter(tags__contains=tag_list)
    if is_public is not None:
        query = query.filter(is_public=is_public)
    if start_date:
        query = query.filter(created_at__date__gte=start_date)
    if end_date:
        query = query.filter(created_at__date__lte=end_date)
    return await Document_Pydantic.from_queryset(query.offset(skip).limit(limit))

@router.put("/{document_id}", response_model=Document_Pydantic)
async def update_document(document_id: int, document: DocumentIn_Pydantic):
    document_obj = await Document.get_or_none(id=document_id)
    if not document_obj:
        raise HTTPException(status_code=404, detail="Document not found")
    await document_obj.update_from_dict(document.dict(exclude_unset=True)).save()
    return await Document_Pydantic.from_tortoise_orm(document_obj)

@router.delete("/{document_id}")
async def delete_document(document_id: int):
    document = await Document.get_or_none(id=document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Delete the file
    if os.path.exists(document.file_path):
        os.remove(document.file_path)
    
    # Delete the document record
    await document.delete()
    return {"message": "Document deleted successfully"}

# Document Version endpoints
@router.post("/{document_id}/versions", response_model=DocumentVersion_Pydantic)
async def create_document_version(
    document_id: int,
    file: UploadFile = File(...),
    changes: Optional[str] = Form(None),
    created_by_id: int = Form(...)
):
    document = await Document.get_or_none(id=document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Save the new version file
    file_path = f"uploads/documents/versions/{file.filename}"
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    # Create version record
    version_data = {
        "document_id": document_id,
        "version_number": str(float(document.version) + 0.1),
        "file_path": file_path,
        "file_size": len(content),
        "changes": changes,
        "created_by_id": created_by_id
    }
    
    version = await DocumentVersion.create(**version_data)
    
    # Update document version
    document.version = version.version_number
    await document.save()
    
    return await DocumentVersion_Pydantic.from_tortoise_orm(version)

@router.get("/{document_id}/versions", response_model=List[DocumentVersion_Pydantic])
async def get_document_versions(document_id: int):
    return await DocumentVersion_Pydantic.from_queryset(
        DocumentVersion.filter(document_id=document_id)
    )

# Document Share endpoints
@router.post("/{document_id}/share", response_model=DocumentShare_Pydantic)
async def share_document(share: DocumentShareIn_Pydantic):
    share_obj = await DocumentShare.create(**share.dict(exclude_unset=True))
    return await DocumentShare_Pydantic.from_tortoise_orm(share_obj)

@router.get("/shared-with-me", response_model=List[Document_Pydantic])
async def get_shared_documents(user_id: int):
    shares = await DocumentShare.filter(shared_with_id=user_id, is_active=True)
    document_ids = [share.document_id for share in shares]
    return await Document_Pydantic.from_queryset(
        Document.filter(id__in=document_ids)
    )

@router.get("/shared-by-me", response_model=List[Document_Pydantic])
async def get_documents_shared_by_me(user_id: int):
    shares = await DocumentShare.filter(shared_by_id=user_id, is_active=True)
    document_ids = [share.document_id for share in shares]
    return await Document_Pydantic.from_queryset(
        Document.filter(id__in=document_ids)
    )

# Additional utility endpoints
@router.get("/category/{category}", response_model=List[Document_Pydantic])
async def get_documents_by_category(category: DocumentCategory):
    return await Document_Pydantic.from_queryset(
        Document.filter(category=category)
    )

@router.get("/department/{department_id}", response_model=List[Document_Pydantic])
async def get_department_documents(department_id: int):
    return await Document_Pydantic.from_queryset(
        Document.filter(department_id=department_id)
    )

@router.get("/expiring-soon", response_model=List[Document_Pydantic])
async def get_expiring_documents():
    thirty_days_from_now = datetime.now().date() + timedelta(days=30)
    return await Document_Pydantic.from_queryset(
        Document.filter(expiration_date__lte=thirty_days_from_now)
    ) 