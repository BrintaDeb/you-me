"""
auth.py — JWT-based admin authentication for YOU & ME Studio backend.

Passcodes (stored hashed in production; plaintext for demo/staging):
  Primary:  admin77
  Backup:   admin2026

The JWT secret should be rotated before production deployment.
"""

import os
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt

# ── Config ────────────────────────────────────────────────
SECRET_KEY = os.getenv(
    "JWT_SECRET_KEY",
    "youandme_studio_master_secret_key_change_in_production",
)
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "480"))  # 8 hours

# Studio passcodes — replace with hashed values in production
VALID_PASSCODES = {"admin77", "admin2026"}

bearer_scheme = HTTPBearer(auto_error=False)


# ── Token helpers ─────────────────────────────────────────

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a signed JWT with an optional custom expiry."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode["exp"] = expire
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def _decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return {}


# ── FastAPI dependency ────────────────────────────────────

def verify_admin_token(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> dict:
    """
    FastAPI dependency that validates the Bearer JWT token.
    Raises 401 if missing or invalid.
    Returns the decoded payload on success.
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin authentication required. Please log in with admin passcode.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = _decode_token(credentials.credentials)
    if payload.get("data") != "admin":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired admin token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return payload
