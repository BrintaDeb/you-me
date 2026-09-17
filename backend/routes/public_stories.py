"""
routes/public_stories.py — Public API endpoints for client wedding stories and studio config.

Unauthenticated public endpoints for the live website:
  GET /api/public/stories        — List all wedding stories with optional category/featured filters
  GET /api/public/stories/{slug} — Fetch a single story with full photograph collection by slug
  GET /api/public/studio-config  — Fetch studio metrics, FAQs, and team members
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database import get_db
from models import WeddingStoryModel, StudioConfigModel

router = APIRouter(
    prefix="/api/public",
    tags=["Public Stories & Studio Config"],
)


@router.get("/stories")
def list_stories(
    category: Optional[str] = Query(default=None, description="Filter stories by wedding category"),
    featured: Optional[bool] = Query(default=None, description="Filter only featured stories"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Fetch paginated list of wedding stories."""
    query = db.query(WeddingStoryModel)

    if category and category.lower() != "all":
        query = query.filter(WeddingStoryModel.category.ilike(f"%{category}%"))

    if featured is not None:
        query = query.filter(WeddingStoryModel.is_featured == featured)

    total = query.count()
    stories = (
        query
        .order_by(WeddingStoryModel.created_at.asc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return {
        "items": [
            {
                "id": s.id,
                "slug": s.slug,
                "title": s.title,
                "legacy_url": s.legacy_url,
                "category": s.category,
                "tagline": s.tagline,
                "cover_image": s.cover_image,
                "hero_image": s.hero_image,
                "is_featured": s.is_featured,
                "video_url": s.video_url,
                "video_poster": s.video_poster,
                "location": s.location,
                "date": s.date,
                "image_count": s.image_count,
                "images": s.images,
            }
            for s in stories
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.get("/stories/{slug}")
def get_story_by_slug(slug: str, db: Session = Depends(get_db)):
    """Fetch a single wedding story with full gallery by slug or id."""
    story = (
        db.query(WeddingStoryModel)
        .filter((WeddingStoryModel.slug == slug) | (WeddingStoryModel.id == slug))
        .first()
    )
    if not story:
        raise HTTPException(status_code=404, detail=f"Story with slug '{slug}' not found")

    return {
        "id": story.id,
        "slug": story.slug,
        "title": story.title,
        "legacy_url": story.legacy_url,
        "category": story.category,
        "tagline": story.tagline,
        "cover_image": story.cover_image,
        "hero_image": story.hero_image,
        "is_featured": story.is_featured,
        "video_url": story.video_url,
        "video_poster": story.video_poster,
        "location": story.location,
        "date": story.date,
        "image_count": story.image_count,
        "images": story.images,
    }


@router.get("/studio-config")
def get_studio_config(db: Session = Depends(get_db)):
    """Fetch studio configurations, FAQs, and team members."""
    configs = db.query(StudioConfigModel).all()
    return {c.key: c.value for c in configs}
