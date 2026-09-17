"""
main.py — FastAPI application factory for YOU & ME Studio.

YOU & ME Studio API
Dynamic Media Management and Homepage Configuration Engine
Version: 1.0.0
"""

import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from sqlalchemy import text
from auth import VALID_PASSCODES, create_access_token
from database import engine
from models import Base
from routes.admin_media import router as media_router
from routes.admin_sections import router as sections_router
from routes.public_sections import router as public_router
from routes.public_stories import router as stories_router
from schemas import AdminLoginRequest, AdminLoginResponse

# ── DB init on startup ────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables if they don't exist yet (idempotent)
    Base.metadata.create_all(bind=engine)
    # Ensure backward-compatible column migration for media_library
    try:
        with engine.connect() as conn:
            res = conn.execute(text("PRAGMA table_info(media_library)"))
            cols = [row[1] for row in res.fetchall()]
            if cols and "filename" not in cols:
                conn.execute(text("ALTER TABLE media_library ADD COLUMN filename VARCHAR(255) DEFAULT ''"))
                conn.commit()
    except Exception:
        pass
    yield


# ── App factory ───────────────────────────────────────────
app = FastAPI(
    title="YOU & ME Studio API",
    description="Dynamic Media Management and Homepage Configuration Engine",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite dev server
        "http://localhost:5174",
        "http://localhost:4173",   # Vite preview
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Static file mounts ────────────────────────────────────
# Use __file__-relative paths so the app works from any working directory
_BACKEND_DIR = Path(__file__).parent
_PROJECT_ROOT = _BACKEND_DIR.parent

UPLOADS_DIR = str(_BACKEND_DIR / "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

PUBLIC_ASSETS_DIR = str(_PROJECT_ROOT / "public" / "assets")
if os.path.isdir(PUBLIC_ASSETS_DIR):
    app.mount("/assets", StaticFiles(directory=PUBLIC_ASSETS_DIR), name="assets")

MEDIA_STORAGE_DIR = str(_BACKEND_DIR / "storage" / "media")
os.makedirs(MEDIA_STORAGE_DIR, exist_ok=True)
app.mount("/media", StaticFiles(directory=MEDIA_STORAGE_DIR), name="media")

# ── Routers ───────────────────────────────────────────────
app.include_router(media_router)
app.include_router(sections_router)
app.include_router(public_router)
app.include_router(stories_router)


# ── Auth endpoint ─────────────────────────────────────────
@app.post("/api/admin/login", response_model=AdminLoginResponse)
def admin_login(body: AdminLoginRequest):
    """Exchange studio passcode for a signed JWT bearer token."""
    if body.passcode not in VALID_PASSCODES:
        raise HTTPException(
            status_code=401,
            detail="Invalid admin passcode. Use studio passcode 'admin77'",
        )
    token = create_access_token({"data": "admin"})
    return AdminLoginResponse(token=token)


# ── Health check ──────────────────────────────────────────
@app.get("/api/health")
def health():
    return {"service": "youandme-atelier-backend", "status": "ok"}


# ── Dev entrypoint ────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
