from fastapi import APIRouter, HTTPException, Depends
from typing import List
from backend.models.tortoise_models import User, User_Pydantic, UserIn_Pydantic, UserRole, UserCreate
from passlib.context import CryptContext

router = APIRouter(
    prefix="/users",
    tags=["users"],
    responses={404: {"description": "Not found"}},
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

@router.post("/", response_model=User_Pydantic)
async def create_user(user: UserCreate):
    # Check if user with email already exists
    if await User.filter(email=user.email).exists():
        raise HTTPException(status_code=400, detail="Email already registered")
    user_dict = user.dict(exclude_unset=True)
    user_dict["password_hash"] = get_password_hash(user_dict.pop("password"))
    user_obj = await User.create(**user_dict)
    return await User_Pydantic.from_tortoise_orm(user_obj)

@router.get("/{user_id}", response_model=User_Pydantic)
async def get_user(user_id: int):
    user = await User.get_or_none(id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return await User_Pydantic.from_tortoise_orm(user)

@router.get("/", response_model=List[User_Pydantic])
async def get_users():
    return await User_Pydantic.from_queryset(User.all())

@router.put("/{user_id}", response_model=User_Pydantic)
async def update_user(user_id: int, user: UserIn_Pydantic):
    user_obj = await User.get_or_none(id=user_id)
    if not user_obj:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update user data
    user_dict = user.dict(exclude_unset=True)
    if "password" in user_dict:
        user_dict["password_hash"] = get_password_hash(user_dict.pop("password"))
    
    await user_obj.update_from_dict(user_dict).save()
    return await User_Pydantic.from_tortoise_orm(user_obj)

@router.delete("/{user_id}")
async def delete_user(user_id: int):
    deleted_count = await User.filter(id=user_id).delete()
    if not deleted_count:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}

@router.get("/role/{role}", response_model=List[User_Pydantic])
async def get_users_by_role(role: UserRole):
    return await User_Pydantic.from_queryset(User.filter(role=role)) 