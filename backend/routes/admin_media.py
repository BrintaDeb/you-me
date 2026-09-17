"""
routes/admin_media.py — Admin Media Library API routes.

All routes require a valid admin JWT Bearer token.
Endpoints:
  POST   /api/admin/media/upload   — Upload one or more files to disk + MediaLibrary
  GET    /api/admin/media           — Paginated list with type/search filters
  DELETE /api/admin/media/{id}      — Delete a media item and remove from all sections
"""

import os
import uuid
import shutil
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session

from database import get_db
from auth import verify_admin_token
from models import MediaLibrary, SectionConfig
from schemas import MediaItem, MediaListResponse

router = APIRouter(
    tags=["Media Library"],
)

# Uploads directory — __file__-relative so it works from any CWD
UPLOADS_DIR = str(Path(__file__).parent.parent / "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)


def _media_type_from_mime(mime: str) -> str:
    if mime.startswith("video/"):
        return "video"
    return "image"


# ──────────────────────────────────────────────────────────────────────────────
# POST /api/admin/media/upload and /api/media/upload
# ──────────────────────────────────────────────────────────────────────────────

@router.post("/api/admin/media/upload", response_model=list[MediaItem], status_code=status.HTTP_201_CREATED)
@router.post("/api/media/upload", response_model=list[MediaItem], status_code=status.HTTP_201_CREATED)
async def upload_media(
    files: Optional[list[UploadFile]] = File(default=None),
    file: Optional[UploadFile] = File(default=None),
    title: Optional[str] = Form(default=""),
    alt_text: Optional[str] = Form(default=""),
    payload: dict = Depends(verify_admin_token),
    db: Session = Depends(get_db),
):
    """
    Handle single or multiple file uploads, save to local uploads directory,
    and register into MediaLibrary database model.
    Accepts form fields 'files' (multi) or 'file' (single).
    """
    upload_list: list[UploadFile] = []
    if files:
        upload_list.extend(files)
    if file:
        upload_list.append(file)

    if not upload_list:
        raise HTTPException(
            status_code=400,
            detail="No files uploaded. Provide 'files' or 'file' form data field.",
        )

    created_items: list[MediaItem] = []

    for upload_file in upload_list:
        # Generate a unique filename to avoid collisions
        ext = os.path.splitext(upload_file.filename or "file")[1].lower() or ".jpg"
        unique_name = f"{uuid.uuid4().hex[:12]}_{upload_file.filename or 'upload'}"
        unique_name = unique_name.replace(" ", "_")
        dest_path = os.path.join(UPLOADS_DIR, unique_name)

        # Save to disk
        with open(dest_path, "wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)

        # Determine file size
        file_size = os.path.getsize(dest_path)
        mime = upload_file.content_type or "image/jpeg"
        media_type = _media_type_from_mime(mime)

        # Auto-generate alt text if not provided
        auto_alt = alt_text or (
            f"{upload_file.filename} wedding photography frame"
            if not alt_text else alt_text
        )

        # Persist to DB
        record = MediaLibrary(
            id=str(uuid.uuid4()),
            filename=unique_name,
            url=f"/uploads/{unique_name}",
            type=media_type,
            title=title or unique_name,
            alt_text=auto_alt,
            file_size=file_size,
            mime_type=mime,
        )
        db.add(record)
        db.flush()  # get the generated id before commit

        created_items.append(MediaItem.model_validate(record))

    db.commit()
    return created_items


# ──────────────────────────────────────────────────────────────────────────────
# GET /api/admin/media and /api/media
# ──────────────────────────────────────────────────────────────────────────────

@router.get("/api/admin/media", response_model=MediaListResponse)
@router.get("/api/media", response_model=MediaListResponse)
def list_media(
    type: Optional[str] = Query(default=None, description="Filter by 'image' or 'video'"),
    search: Optional[str] = Query(default=None, description="Search in title or alt text"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=50, ge=1, le=200),
    payload: dict = Depends(verify_admin_token),
    db: Session = Depends(get_db),
):
    """
    Fetch all items from MediaLibrary (the master pool) with optional filtering and pagination.
    """
    query = db.query(MediaLibrary)

    if type in ("image", "video"):
        query = query.filter(MediaLibrary.type == type)

    if search:
        pattern = f"%{search}%"
        query = query.filter(
            (MediaLibrary.title.ilike(pattern)) | (MediaLibrary.alt_text.ilike(pattern))
        )

    total = query.count()
    items = (
        query
        .order_by(MediaLibrary.upload_date.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return MediaListResponse(
        items=[MediaItem.model_validate(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
    )


# ──────────────────────────────────────────────────────────────────────────────
# DELETE /api/admin/media/{media_id} and /api/media/{media_id}
# ──────────────────────────────────────────────────────────────────────────────

@router.delete("/api/admin/media/{media_id}", status_code=status.HTTP_200_OK)
@router.delete("/api/media/{media_id}", status_code=status.HTTP_200_OK)
def delete_media(
    media_id: str,
    payload: dict = Depends(verify_admin_token),
    db: Session = Depends(get_db),
):
    """
    Delete a media item from MediaLibrary and remove it from any SectionConfig mappings.
    """
    record = db.get(MediaLibrary, media_id)
    if not record:
        raise HTTPException(status_code=404, detail="Media item not found")

    # Remove the physical file from disk if it's in the uploads dir
    if record.url.startswith("/uploads/"):
        filepath = str(Path(__file__).parent.parent / "uploads" / record.filename)
        if os.path.exists(filepath):
            os.remove(filepath)

    # Purge from all SectionConfig arrays
    sections = db.query(SectionConfig).all()
    for section in sections:
        if media_id in (section.array_of_media_ids or []):
            section.array_of_media_ids = [
                mid for mid in section.array_of_media_ids if mid != media_id
            ]

    db.delete(record)
    db.commit()
    return {"deleted": media_id, "status": "ok"}
