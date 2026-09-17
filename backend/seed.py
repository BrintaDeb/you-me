"""
seed.py — One-time database initializer for YOU & ME Studio.
Creates all tables defined in models.py if they don't already exist.
Safe to run multiple times (idempotent — uses CREATE TABLE IF NOT EXISTS).
"""

from database import engine, Base

# Import all models so SQLAlchemy metadata is populated
import models  # noqa: F401


def init_db() -> None:
    """Create all tables. Existing tables and data are preserved."""
    print("🗄️  Initializing YOU & ME Studio database...")
    Base.metadata.create_all(bind=engine)
    print("✅  Tables created (or already exist):")
    for table_name in Base.metadata.tables:
        print(f"    • {table_name}")


if __name__ == "__main__":
    init_db()
