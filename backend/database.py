"""
database.py — SQLAlchemy engine, session factory, and Base for YOU & ME Studio.
Supports:
  - Local SQLite development / test backend: sqlite:///studio.db
  - Hostinger MySQL: mysql+pymysql://user:password@host:3306/dbname
  - Cloud PostgreSQL: postgresql://user:password@host:5432/dbname
"""

import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

_DEFAULT_DB_FILE = (Path(__file__).parent / "studio.db").resolve().as_posix()
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{_DEFAULT_DB_FILE}")

engine_kwargs = {
    "echo": False,
}

if DATABASE_URL.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    # Production MySQL / PostgreSQL pool stability (essential for Hostinger)
    engine_kwargs["pool_pre_ping"] = True
    engine_kwargs["pool_recycle"] = 3600
    engine_kwargs["pool_size"] = 10
    engine_kwargs["max_overflow"] = 20

engine = create_engine(DATABASE_URL, **engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    """FastAPI dependency: yields a DB session and closes it after the request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
