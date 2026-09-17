"""
routes/public_sections.py — Public Homepage Sections API.

No authentication required — these endpoints power the live public homepage.
Endpoints:
  GET /api/public/sections          — All sections with joined, ordered media
  GET /api/public/homepage-config   — Alias for the same
"""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import MediaLibrary, SectionConfig
from schemas import MediaItem, PublicSectionsResponse, SectionResponse

router = APIRouter(
    prefix="/api/public",
    tags=["Public API"],
)

# Canonical homepage section IDs
HOMEPAGE_SECTIONS = ["hero", "storyboard", "films"]


def _build_section_response(section: SectionConfig, db: Session) -> SectionResponse:
    """Join a SectionConfig with its media items, preserving configured order."""
    media_map: dict[str, MediaLibrary] = {}
    for mid in (section.array_of_media_ids or []):
        record = db.get(MediaLibrary, mid)
        if record:
            media_map[mid] = record

    media_items = [
        MediaItem.model_validate(media_map[mid])
        for mid in section.array_of_media_ids
        if mid in media_map
    ]

    return SectionResponse(
        section_id=section.section_id,
        array_of_media_ids=section.array_of_media_ids or [],
        media_items=media_items,
        updated_at=section.updated_at,
    )


def _get_all_sections(db: Session) -> PublicSectionsResponse:
    """Fetch all homepage sections with their joined active media files."""
    all_sections = db.query(SectionConfig).all()

    # Build section_id → SectionResponse map
    section_map: dict[str, SectionResponse] = {}
    for section in all_sections:
        section_map[section.section_id] = _build_section_response(section, db)

    # Build the simplified dict[section_id → list[MediaItem]] for easy frontend consumption
    sections_dict: dict[str, list[MediaItem]] = {}
    for sid in HOMEPAGE_SECTIONS:
        if sid in section_map:
            sections_dict[sid] = section_map[sid].media_items
        else:
            sections_dict[sid] = []

    # Also include any non-standard sections that were configured
    for sid, resp in section_map.items():
        if sid not in sections_dict:
            sections_dict[sid] = resp.media_items

    return PublicSectionsResponse(
        sections=sections_dict,
        raw_configs=list(section_map.values()),
    )


# ──────────────────────────────────────────────────────────────────────────────
# GET /api/public/sections
# ──────────────────────────────────────────────────────────────────────────────

@router.get("/sections", response_model=PublicSectionsResponse)
def get_public_sections(db: Session = Depends(get_db)):
    """
    Public endpoint that fetches the homepage sections and their currently
    joined active media files, strictly sorted in the configured display order.
    """
    return _get_all_sections(db)


# ──────────────────────────────────────────────────────────────────────────────
# GET /api/public/homepage-config  (alias)
# ──────────────────────────────────────────────────────────────────────────────

@router.get("/homepage-config", response_model=PublicSectionsResponse)
def get_homepage_config(db: Session = Depends(get_db)):
    """Alias for /api/public/sections — same data, friendlier URL."""
    return _get_all_sections(db)
