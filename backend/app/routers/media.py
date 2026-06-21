import os
import uuid
import aiofiles
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.user import User
from ..models.payment import MediaFile
from ..schemas.payment import MediaFileResponse
from ..auth import get_current_user

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

router = APIRouter()

VIDEO_EXTENSIONS = {"mp4", "mov", "avi", "mkv", "webm"}


@router.post("/upload", response_model=MediaFileResponse)
async def upload_media(
    file: UploadFile = File(...),
    caption: str = Form(default=""),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ext = (file.filename or "upload.jpg").rsplit(".", 1)[-1].lower()
    file_type = "video" if ext in VIDEO_EXTENSIONS else "image"
    filename = f"{uuid.uuid4()}.{ext}"
    path = os.path.join(UPLOAD_DIR, filename)

    async with aiofiles.open(path, "wb") as f:
        content = await file.read()
        await f.write(content)

    media = MediaFile(
        user_id=current_user.id,
        file_url=f"/media/files/{filename}",
        file_type=file_type,
        caption=caption,
    )
    db.add(media)
    db.commit()
    db.refresh(media)
    return media


@router.get("/my", response_model=List[MediaFileResponse])
def get_my_media(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(MediaFile).filter(MediaFile.user_id == current_user.id).all()


@router.delete("/{media_id}")
def delete_media(
    media_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    media = db.query(MediaFile).filter(
        MediaFile.id == media_id,
        MediaFile.user_id == current_user.id,
    ).first()
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")
    db.delete(media)
    db.commit()
    return {"message": "Deleted"}
