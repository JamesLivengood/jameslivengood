import os
import uuid
import aiofiles
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..schemas.user import UserResponse, UserUpdate
from ..auth import get_current_user

UPLOAD_DIR = "uploads"

router = APIRouter()


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserResponse)
def update_me(
    update_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    for field, value in update_data.model_dump(exclude_none=True).items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/me/avatar", response_model=UserResponse)
async def upload_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ext = (file.filename or "avatar.jpg").rsplit(".", 1)[-1].lower() or "jpg"
    filename = f"avatar_{uuid.uuid4()}.{ext}"
    path = os.path.join(UPLOAD_DIR, filename)
    async with aiofiles.open(path, "wb") as f:
        await f.write(await file.read())
    current_user.avatar_url = f"/media/files/{filename}"
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/{username}", response_model=UserResponse)
def get_user(username: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
