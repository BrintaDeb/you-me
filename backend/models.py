"""
models.py — SQLAlchemy ORM models for YOU & ME Studio.
Designed for 100% cross-database compatibility (SQLite, MySQL, PostgreSQL).

Models:
  - MediaLibrary: Master pool of all uploaded media files (videos, photos, posters).
  - SectionConfig: Maps homepage sections to an ordered list of media IDs.
  - WeddingStoryModel: All couples' wedding stories, metadata, and photo galleries.
  - StudioConfigModel: Business information, FAQs, team members, and artistic tenets.
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Integer, Boolean, DateTime, JSON, Text
from sqlalchemy.orm import Mapped, mapped_column
from database import Base


def _now_utc() -> datetime:
    return datetime.now(timezone.utc)


def _new_uuid() -> str:
    return str(uuid.uuid4())


class MediaLibrary(Base):
    """
    Stores all uploaded & managed files — master media pool.
    Each row represents one image, poster, or video file.
    """
    __tablename__ = "media_library"

    id: Mapped[str] = mapped_column(
        String(64), primary_key=True, default=_new_uuid, index=True
    )
    url: Mapped[str] = mapped_column(String(1024), nullable=False)
    filename: Mapped[str] = mapped_column(String(255), nullable=True, default="")
    type: Mapped[str] = mapped_column(
        String(32), nullable=False, default="image"
    )  # "image" | "video"
    title: Mapped[str] = mapped_column(String(255), nullable=True, default="")
    alt_text: Mapped[str] = mapped_column(String(512), nullable=True, default="")
    file_size: Mapped[int] = mapped_column(Integer, nullable=True, default=0)
    mime_type: Mapped[str] = mapped_column(
        String(128), nullable=True, default="image/jpeg"
    )
    upload_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_now_utc, nullable=False
    )


class SectionConfig(Base):
    """
    Stores the active media assignment for a specific homepage UI section.
    section_id is a string key e.g. "hero", "storyboard", "films", "gallery".
    array_of_media_ids is a JSON array of MediaLibrary IDs in display order.
    """
    __tablename__ = "section_config"

    section_id: Mapped[str] = mapped_column(
        String(64), primary_key=True, index=True
    )
    array_of_media_ids: Mapped[list] = mapped_column(
        JSON, nullable=False, default=list
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_now_utc, onupdate=_now_utc, nullable=False
    )


class WeddingStoryModel(Base):
    """
    Stores client wedding stories and portfolios.
    Migrated from static couplesData.ts to full database representation.
    """
    __tablename__ = "wedding_stories"

    id: Mapped[str] = mapped_column(
        String(64), primary_key=True, default=_new_uuid, index=True
    )
    slug: Mapped[str] = mapped_column(
        String(128), unique=True, index=True, nullable=False
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    legacy_url: Mapped[str] = mapped_column(String(512), nullable=True, default="")
    category: Mapped[str] = mapped_column(String(128), nullable=True, default="Wedding")
    tagline: Mapped[str] = mapped_column(Text, nullable=True, default="")
    cover_image: Mapped[str] = mapped_column(String(1024), nullable=False)
    hero_image: Mapped[str] = mapped_column(String(1024), nullable=False)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    video_url: Mapped[str] = mapped_column(String(1024), nullable=True, default="")
    video_poster: Mapped[str] = mapped_column(String(1024), nullable=True, default="")
    location: Mapped[str] = mapped_column(String(255), nullable=True, default="")
    date: Mapped[str] = mapped_column(String(128), nullable=True, default="")
    image_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    images: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_now_utc, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_now_utc, onupdate=_now_utc, nullable=False
    )


class StudioConfigModel(Base):
    """
    Stores studio business metadata, FAQs, team roster, and artistic tenets.
    Allows changing copy and FAQs dynamically from backend.
    """
    __tablename__ = "studio_config"

    key: Mapped[str] = mapped_column(
        String(64), primary_key=True, index=True
    )
    value: Mapped[dict | list] = mapped_column(
        JSON, nullable=False, default=dict
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_now_utc, onupdate=_now_utc, nullable=False
    )
