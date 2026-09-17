"""
schemas.py — Pydantic v2 schemas for YOU & ME Studio API.
These define the request/response shapes for all media management endpoints.
"""

from __future__ import annotations
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


# ─────────────────────────────────────────────────────────
# Media Library
# ─────────────────────────────────────────────────────────

class MediaItem(BaseModel):
    """A single media file in the library."""
    model_config = ConfigDict(from_attributes=True)

    id: str
    url: str
    filename: Optional[str] = ""
    type: str          # "image" | "video"
    title: Optional[str] = ""
    alt_text: Optional[str] = ""
    file_size: Optional[int] = 0
    mime_type: Optional[str] = ""
    upload_date: datetime


class MediaListResponse(BaseModel):
    """Paginated list of media items."""
    items: list[MediaItem]
    total: int
    page: int
    page_size: int


# ─────────────────────────────────────────────────────────
# Section Config
# ─────────────────────────────────────────────────────────

class SectionUpdate(BaseModel):
    """Request body to update a section's media assignments."""
    media_ids: list[str]


class SectionResponse(BaseModel):
    """A section config with its fully-joined, ordered media items."""
    model_config = ConfigDict(from_attributes=True)

    section_id: str
    array_of_media_ids: list[str]
    media_items: list[MediaItem]
    updated_at: datetime


class PublicSectionsResponse(BaseModel):
    """Public homepage sections response — all sections with joined media."""
    sections: dict[str, list[MediaItem]]
    raw_configs: list[SectionResponse]


# ─────────────────────────────────────────────────────────
# Admin Auth
# ─────────────────────────────────────────────────────────

class AdminLoginRequest(BaseModel):
    """Admin login via studio passcode."""
    passcode: str


class AdminLoginResponse(BaseModel):
    """JWT bearer token returned on successful admin login."""
    token: str
    token_type: str = "bearer"
    authenticated: bool = True
    status: str = "admin"
