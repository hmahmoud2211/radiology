from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from backend.models.tortoise_models import Room, Room_Pydantic, RoomIn_Pydantic

router = APIRouter(
    prefix="/rooms",
    tags=["rooms"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=Room_Pydantic)
async def create_room(room: RoomIn_Pydantic):
    room_obj = await Room.create(**room.dict(exclude_unset=True))
    return await Room_Pydantic.from_tortoise_orm(room_obj)

@router.get("/{room_id}", response_model=Room_Pydantic)
async def get_room(room_id: int):
    room = await Room.get_or_none(id=room_id).prefetch_related("department")
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return await Room_Pydantic.from_tortoise_orm(room)

@router.get("/", response_model=List[Room_Pydantic])
async def get_rooms(
    department_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None)
):
    query = Room.all()
    if department_id is not None:
        query = query.filter(department_id=department_id)
    if status is not None:
        query = query.filter(status=status)
    return await Room_Pydantic.from_queryset(query)

@router.put("/{room_id}", response_model=Room_Pydantic)
async def update_room(room_id: int, room: RoomIn_Pydantic):
    room_obj = await Room.get_or_none(id=room_id)
    if not room_obj:
        raise HTTPException(status_code=404, detail="Room not found")
    await room_obj.update_from_dict(room.dict(exclude_unset=True)).save()
    return await Room_Pydantic.from_tortoise_orm(room_obj)

@router.delete("/{room_id}")
async def delete_room(room_id: int):
    deleted_count = await Room.filter(id=room_id).delete()
    if not deleted_count:
        raise HTTPException(status_code=404, detail="Room not found")
    return {"message": "Room deleted successfully"} 