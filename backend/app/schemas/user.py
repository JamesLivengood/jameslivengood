from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class UserCreate(BaseModel):
    email: EmailStr
    username: str
    full_name: str = ""
    password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    full_name: str
    bio: str
    avatar_url: str
    is_guest: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class GuestClaim(BaseModel):
    email: EmailStr
    username: str
    full_name: str = ""
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
