"""
migrate_all_data.py — Master Data & Media Migration Engine for YOU & ME Studio.

Shifts all static media assets (videos, posters, team photos, brand assets) and
data files (couples stories, photo galleries, business info, FAQs, team roster)
from the frontend codebase into the centralized backend storage and database.

Works natively with SQLite (local test backend) and MySQL (Hostinger production).
"""

import os
import shutil
import json
import mimetypes
import uuid
from pathlib import Path
from datetime import datetime, timezone
import sys

# Ensure backend root is on sys.path so models & database can be imported
BACKEND_DIR = Path(__file__).parent.parent.resolve()
sys.path.insert(0, str(BACKEND_DIR))

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

from database import engine, SessionLocal, Base
from models import MediaLibrary, SectionConfig, WeddingStoryModel, StudioConfigModel

PROJECT_ROOT = BACKEND_DIR.parent
PUBLIC_ASSETS_DIR = PROJECT_ROOT / "public" / "assets"
MEDIA_STORAGE_DIR = BACKEND_DIR / "storage" / "media"


def _now():
    return datetime.now(timezone.utc)


def _get_mime(filepath: Path) -> str:
    mime, _ = mimetypes.guess_type(str(filepath))
    if mime:
        return mime
    ext = filepath.suffix.lower()
    if ext == ".mp4":
        return "video/mp4"
    if ext in (".jpg", ".jpeg"):
        return "image/jpeg"
    if ext == ".png":
        return "image/png"
    if ext == ".webp":
        return "image/webp"
    return "application/octet-stream"


def migrate_media_files(db):
    """Copy media files to backend/storage/media and register in MediaLibrary."""
    print("📁 Migrating media assets to backend/storage/media/ ...")

    subdirs = ["videos", "posters", "team", "brand", "mockups"]
    for s in subdirs:
        (MEDIA_STORAGE_DIR / s).mkdir(parents=True, exist_ok=True)

    copied_count = 0
    registered_count = 0

    # 1. Videos
    videos_src = PUBLIC_ASSETS_DIR / "videos"
    if videos_src.exists():
        for vid in videos_src.glob("*.mp4"):
            dest = MEDIA_STORAGE_DIR / "videos" / vid.name
            if not dest.exists() or dest.stat().st_size != vid.stat().st_size:
                shutil.copy2(vid, dest)
                copied_count += 1

            rel_url = f"/media/videos/{vid.name}"
            # Register in MediaLibrary
            existing = db.query(MediaLibrary).filter(MediaLibrary.url == rel_url).first()
            if not existing:
                title = vid.stem.replace("_", " ").title() + " Wedding Film"
                item = MediaLibrary(
                    id=f"media-vid-{vid.stem.replace('_', '-')}",
                    url=rel_url,
                    filename=vid.name,
                    type="video",
                    title=title,
                    alt_text=f"{title} cinematic highlight",
                    file_size=dest.stat().st_size,
                    mime_type="video/mp4",
                    upload_date=_now(),
                )
                db.add(item)
                registered_count += 1

    # 2. Posters
    posters_src = PUBLIC_ASSETS_DIR / "posters"
    if posters_src.exists():
        for post in posters_src.glob("*.*"):
            dest = MEDIA_STORAGE_DIR / "posters" / post.name
            if not dest.exists() or dest.stat().st_size != post.stat().st_size:
                shutil.copy2(post, dest)
                copied_count += 1

            rel_url = f"/media/posters/{post.name}"
            existing = db.query(MediaLibrary).filter(MediaLibrary.url == rel_url).first()
            if not existing:
                title = post.stem.replace("_", " ").title()
                item = MediaLibrary(
                    id=f"media-poster-{post.stem.replace('_', '-')}",
                    url=rel_url,
                    filename=post.name,
                    type="image",
                    title=title,
                    alt_text=f"{title} wedding celebration portrait",
                    file_size=dest.stat().st_size,
                    mime_type=_get_mime(dest),
                    upload_date=_now(),
                )
                db.add(item)
                registered_count += 1

    # 3. Team
    team_src = PUBLIC_ASSETS_DIR / "team"
    if team_src.exists():
        for t in team_src.glob("*.*"):
            dest = MEDIA_STORAGE_DIR / "team" / t.name
            if not dest.exists() or dest.stat().st_size != t.stat().st_size:
                shutil.copy2(t, dest)
                copied_count += 1

            rel_url = f"/media/team/{t.name}"
            existing = db.query(MediaLibrary).filter(MediaLibrary.url == rel_url).first()
            if not existing:
                title = t.stem.replace("_", " ").title()
                item = MediaLibrary(
                    id=f"media-team-{t.stem.replace('_', '-')}",
                    url=rel_url,
                    filename=t.name,
                    type="image",
                    title=title,
                    alt_text=f"{title} profile portrait",
                    file_size=dest.stat().st_size,
                    mime_type=_get_mime(dest),
                    upload_date=_now(),
                )
                db.add(item)
                registered_count += 1

    # 4. Brand
    brand_src = PUBLIC_ASSETS_DIR / "brand"
    if brand_src.exists():
        for b in brand_src.glob("*.*"):
            dest = MEDIA_STORAGE_DIR / "brand" / b.name
            if not dest.exists() or dest.stat().st_size != b.stat().st_size:
                shutil.copy2(b, dest)
                copied_count += 1

            rel_url = f"/media/brand/{b.name}"
            existing = db.query(MediaLibrary).filter(MediaLibrary.url == rel_url).first()
            if not existing:
                item = MediaLibrary(
                    id=f"media-brand-{b.stem.replace('_', '-')}",
                    url=rel_url,
                    filename=b.name,
                    type="image",
                    title=f"Brand Asset: {b.stem}",
                    alt_text=f"YOU & ME Studio Brand Asset {b.name}",
                    file_size=dest.stat().st_size,
                    mime_type=_get_mime(dest),
                    upload_date=_now(),
                )
                db.add(item)
                registered_count += 1

    # 5. Featured Master Wedding Photographs (Pure Photography for Hero & Storyboard)
    featured_photos = [
        ("media-photo-paraj", "https://static.wixstatic.com/media/62230b_019e6537a70840b5b7ed80f4e77bad72~mv2.jpg", "Paraj & Mrinmoyee — Calcutta Classical", "Paraj & Mrinmoyee documentary wedding photography frame", "paraj_mrinmoyee_hero.jpg"),
        ("media-photo-urmi", "https://static.wixstatic.com/media/62230b_669876f3c423429a86a5811c0658ecb1~mv2.jpg", "Jasraj & Urmi — Ceremonial Splendor", "Jasraj & Urmi royal celebration photography frame", "urmi_jasraj_hero.jpg"),
        ("media-photo-avik", "https://static.wixstatic.com/media/62230b_7f2c09302c3b404eacc7c85a95aff72e~mv2.jpg", "Avik & Binita — Joyful Day Ceremony", "Avik & Binita wedding photography frame", "avik_binita_hero.jpg"),
        ("media-photo-ankita", "https://static.wixstatic.com/media/62230b_ea8e74edd8f04eb7920b4d2b3b425611~mv2.jpg", "Subhadeep & Ankita — Sacred Bengali Rituals", "Subhadeep & Ankita wedding rituals frame", "ankita_subhadeep_hero.jpg"),
        ("media-photo-suchi", "https://static.wixstatic.com/media/62230b_85222df8c6dc4d72931d5f6693fbbafe~mv2.jpg", "Hira & Suchi — Grand Heritage Palace", "Hira & Suchi timeless wedding reception frame", "suchi_hira_hero.jpg"),
    ]
    for pid, purl, ptitle, palt, pfname in featured_photos:
        existing = db.query(MediaLibrary).filter(MediaLibrary.id == pid).first()
        if not existing:
            item = MediaLibrary(
                id=pid,
                url=purl,
                filename=pfname,
                type="image",
                title=ptitle,
                alt_text=palt,
                file_size=450000,
                mime_type="image/jpeg",
                upload_date=_now(),
            )
            db.add(item)
            registered_count += 1

    db.commit()
    print(f"✅ Media migration: {copied_count} files copied, {registered_count} newly registered in MediaLibrary.")


def migrate_stories(db):
    """Parse couplesData.ts and store all stories into wedding_stories table."""
    print("📖 Migrating couples & wedding stories from couplesData.ts ...")
    couples_file = PROJECT_ROOT / "src" / "data" / "couplesData.ts"
    if not couples_file.exists():
        print("⚠️ couplesData.ts not found!")
        return

    text = couples_file.read_text(encoding="utf-8")
    marker = "export const couplesData"
    idx = text.find(marker)
    eq_idx = text.find("=", idx)
    start = text.find("[", eq_idx)
    end = text.find("];", start) + 1
    raw_couples = json.loads(text[start:end])

    upserted = 0
    for c in raw_couples:
        # Check if local video URL / poster URL can be remapped to /media/
        v_url = c.get("videoUrl") or ""
        v_post = c.get("videoPoster") or ""
        if v_url.startswith("/assets/videos/"):
            v_url = v_url.replace("/assets/videos/", "/media/videos/")
        if v_post.startswith("/assets/posters/"):
            v_post = v_post.replace("/assets/posters/", "/media/posters/")

        existing = db.get(WeddingStoryModel, c["id"])
        if existing:
            existing.slug = c["slug"]
            existing.title = c["title"]
            existing.legacy_url = c.get("legacyUrl", "")
            existing.category = c.get("category", "Wedding")
            existing.tagline = c.get("tagline", "")
            existing.cover_image = c.get("coverImage", "")
            existing.hero_image = c.get("heroImage", "")
            existing.is_featured = bool(c.get("isFeatured", False))
            existing.video_url = v_url
            existing.video_poster = v_post
            existing.location = c.get("location", "")
            existing.date = c.get("date", "")
            existing.image_count = c.get("imageCount", len(c.get("images", [])))
            existing.images = c.get("images", [])
            existing.updated_at = _now()
        else:
            story = WeddingStoryModel(
                id=c["id"],
                slug=c["slug"],
                title=c["title"],
                legacy_url=c.get("legacyUrl", ""),
                category=c.get("category", "Wedding"),
                tagline=c.get("tagline", ""),
                cover_image=c.get("coverImage", ""),
                hero_image=c.get("heroImage", ""),
                is_featured=bool(c.get("isFeatured", False)),
                video_url=v_url,
                video_poster=v_post,
                location=c.get("location", ""),
                date=c.get("date", ""),
                image_count=c.get("imageCount", len(c.get("images", []))),
                images=c.get("images", []),
                created_at=_now(),
                updated_at=_now(),
            )
            db.add(story)
        upserted += 1

    db.commit()
    print(f"✅ Stories migration: {upserted} couples successfully migrated to wedding_stories table.")


def migrate_business_config(db):
    """Extract business info, team members, and FAQs into studio_config table."""
    print("💼 Migrating business data from businessData.ts ...")
    biz_file = PROJECT_ROOT / "src" / "data" / "businessData.ts"
    if not biz_file.exists():
        print("⚠️ businessData.ts not found!")
        return

    text = biz_file.read_text(encoding="utf-8")

    # Helper to extract JS object/array literal and convert to JSON
    import re

    def extract_literal(marker_str, is_array=True):
        idx = text.find(marker_str)
        if idx == -1:
            return None
        eq_idx = text.find("=", idx)
        open_char = "[" if is_array else "{"
        close_seq = "];" if is_array else "};"
        start = text.find(open_char, eq_idx)
        end = text.find(close_seq, start) + (1 if is_array else 1)
        chunk = text[start:end]

        # 1. Quote unquoted keys: e.g. { value: "..." } -> { "value": "..." }
        clean = re.sub(r'([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:', r'\1"\2":', chunk)
        # 2. Fix single-quoted strings to double-quoted strings if any
        clean = re.sub(r":\s*'([^']*)'", r': "\1"', clean)
        # 3. Strip trailing commas
        clean = re.sub(r',\s*([}\]])', r'\1', clean)

        try:
            return json.loads(clean)
        except Exception:
            return None

    configs = {
        "studio_metrics": extract_literal("export const studioMetrics", is_array=True),
        "dynamic_about_photos": extract_literal("export const dynamicAboutPhotos", is_array=True),
        "studio_pillars": extract_literal("export const studioPillars", is_array=True),
        "team_members": extract_literal("export const teamMembers", is_array=True),
        "faqs": extract_literal("export const faqs", is_array=True),
    }

    count = 0
    for key, val in configs.items():
        if val is not None:
            existing = db.get(StudioConfigModel, key)
            if existing:
                existing.value = val
                existing.updated_at = _now()
            else:
                cfg = StudioConfigModel(
                    key=key,
                    value=val,
                    updated_at=_now(),
                )
                db.add(cfg)
            count += 1

    db.commit()
    print(f"✅ Business data migration: {count} configuration sections saved to studio_config table.")


def verify_default_sections(db):
    """Ensure sections hero, storyboard, films, gallery have valid media assignments."""
    print("⚙️ Verifying section configurations...")
    media_items = db.query(MediaLibrary).all()
    media_ids = [m.id for m in media_items]

    # Separate pure photographs, posters, and videos
    pure_photos = [
        m for m in media_items
        if m.type == "image"
        and not any(p in m.url.lower() for p in ["/posters/", "screenshot", "/brand/", "/team/"])
    ]
    pure_photo_ids = [m.id for m in pure_photos]
    poster_ids = [m.id for m in media_items if m.url.startswith("/media/posters/") or m.url.startswith("/assets/posters/")]
    video_ids = [m.id for m in media_items if m.type == "video"]
    image_ids = [m.id for m in media_items if m.type == "image"]

    defaults = {
        "hero": pure_photo_ids[:5] if pure_photo_ids else image_ids[:5],
        "storyboard": pure_photo_ids[:5] if pure_photo_ids else image_ids[:5],
        "films": poster_ids[:4] if poster_ids else video_ids[:4],
        "gallery": pure_photo_ids[:8] if pure_photo_ids else image_ids[:8],
    }

    for sid, default_ids in defaults.items():
        sec = db.get(SectionConfig, sid)
        if not sec:
            sec = SectionConfig(
                section_id=sid,
                array_of_media_ids=default_ids,
                updated_at=_now(),
            )
            db.add(sec)
        elif not sec.array_of_media_ids and default_ids:
            sec.array_of_media_ids = default_ids
            sec.updated_at = _now()

    db.commit()
    print("✅ Sections verified.")


def run():
    print("=" * 65)
    print("🚀 YOU & ME Studio — Master Data & Media Migration Engine")
    print("=" * 65)

    # 1. Create tables if needed
    Base.metadata.create_all(bind=engine)

    # 2. Run migrations
    db = SessionLocal()
    try:
        migrate_media_files(db)
        migrate_stories(db)
        migrate_business_config(db)
        verify_default_sections(db)
        print("\n🎉 MASTER MIGRATION COMPLETE! All data is now in backend database.")
    finally:
        db.close()


if __name__ == "__main__":
    run()
