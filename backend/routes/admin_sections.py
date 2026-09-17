"""
routes/admin_sections.py — Admin Section Configuration API routes.

All routes require a valid admin JWT Bearer token.
Endpoints:
  PUT  /api/admin/sections/{section_id}  — Upsert a section's ordered media IDs
  GET  /api/admin/sections/{section_id}  — Get section config with joined media items
"""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from auth import verify_admin_token
from models import MediaLibrary, SectionConfig
from schemas import MediaItem, SectionResponse, SectionUpdate

router = APIRouter(
    tags=["Section Configuration"],
)


def _build_section_response(section: SectionConfig, db: Session) -> SectionResponse:
    """Join SectionConfig with MediaLibrary to build a full SectionResponse."""
    media_map: dict[str, MediaLibrary] = {}
    for mid in (section.array_of_media_ids or []):
        record = db.get(MediaLibrary, mid)
        if record:
            media_map[mid] = record

    # Preserve the configured display order
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


# ──────────────────────────────────────────────────────────────────────────────
# PUT /api/admin/sections/{section_id} and /api/sections/{section_id}
# ──────────────────────────────────────────────────────────────────────────────

@router.put("/api/admin/sections/{section_id}", response_model=SectionResponse)
@router.put("/api/sections/{section_id}", response_model=SectionResponse)
def update_section(
    section_id: str,
    body: SectionUpdate,
    payload: dict = Depends(verify_admin_token),
    db: Session = Depends(get_db),
):
    """
    Update a specific section with an array of selected media IDs.
    Creates the section record if it doesn't exist (upsert).
    """
    section = db.get(SectionConfig, section_id)

    if section:
        section.array_of_media_ids = body.media_ids
        section.updated_at = datetime.now(timezone.utc)
    else:
        section = SectionConfig(
            section_id=section_id,
            array_of_media_ids=body.media_ids,
            updated_at=datetime.now(timezone.utc),
        )
        db.add(section)

    db.commit()
    db.refresh(section)
    return _build_section_response(section, db)


# ──────────────────────────────────────────────────────────────────────────────
# GET /api/admin/sections/{section_id} and /api/sections/{section_id}
# ──────────────────────────────────────────────────────────────────────────────

@router.get("/api/admin/sections/{section_id}", response_model=SectionResponse)
@router.get("/api/sections/{section_id}", response_model=SectionResponse)
def get_section(
    section_id: str,
    payload: dict = Depends(verify_admin_token),
    db: Session = Depends(get_db),
):
    """
    Get configuration and joined media items for a specific section.
    """
    section = db.get(SectionConfig, section_id)
    if not section:
        raise HTTPException(
            status_code=404,
            detail=f"Section '{section_id}' not configured",
        )
    return _build_section_response(section, db)
