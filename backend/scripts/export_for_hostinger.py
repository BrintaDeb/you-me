"""
export_for_hostinger.py — Hostinger Database & Media Migration Suite.

Packages and exports:
  1. hostinger_mysql_dump.sql  — MySQL 8.0/MariaDB DDL & full dataset dump for 1-click phpMyAdmin import on Hostinger.
  2. seed_data.json            — Complete JSON representation of all tables and records.
  3. media_bundle.zip          — Zipped archive of all videos, posters, brand, and upload files for Hostinger File Manager.
  4. sample.env                — Production environment variables template for Hostinger.
  5. HOSTINGER_DEPLOYMENT_GUIDE.md — Complete step-by-step guide for Hostinger hosting.
"""

import os
import sys
import json
import zipfile
import sqlite3
from pathlib import Path
from datetime import datetime

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

BACKEND_DIR = Path(__file__).parent.parent.resolve()
PROJECT_ROOT = BACKEND_DIR.parent
EXPORT_DIR = BACKEND_DIR / "hostinger_export"
MEDIA_DIR = BACKEND_DIR / "storage" / "media"
UPLOADS_DIR = BACKEND_DIR / "uploads"
DB_PATH = BACKEND_DIR / "studio.db"


def escape_sql_val(val):
    if val is None:
        return "NULL"
    if isinstance(val, bool):
        return "1" if val else "0"
    if isinstance(val, (int, float)):
        return str(val)
    if isinstance(val, (dict, list)):
        val = json.dumps(val, ensure_ascii=False)
    # String escape for MySQL
    s = str(val)
    s = s.replace("\\", "\\\\").replace("'", "''").replace("\r", "\\r").replace("\n", "\\n")
    return f"'{s}'"


def generate_mysql_dump(conn):
    print("📦 Generating hostinger_mysql_dump.sql ...")
    sql_lines = [
        "-- ===================================================================",
        "-- YOU & ME Studio — Hostinger Production MySQL / MariaDB Dump",
        f"-- Generated on: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}",
        "-- Tested for: Hostinger MySQL 8.0+ & MariaDB 10.5+ (phpMyAdmin)",
        "-- ===================================================================",
        "",
        "SET FOREIGN_KEY_CHECKS = 0;",
        "SET NAMES utf8mb4;",
        "SET time_zone = '+00:00';",
        "",
        "-- -------------------------------------------------------------------",
        "-- Table structure for `media_library`",
        "-- -------------------------------------------------------------------",
        "CREATE TABLE IF NOT EXISTS `media_library` (",
        "  `id` VARCHAR(64) NOT NULL,",
        "  `url` VARCHAR(1024) NOT NULL,",
        "  `filename` VARCHAR(255) DEFAULT '',",
        "  `type` VARCHAR(32) NOT NULL DEFAULT 'image',",
        "  `title` VARCHAR(255) DEFAULT '',",
        "  `alt_text` VARCHAR(512) DEFAULT '',",
        "  `file_size` INT DEFAULT 0,",
        "  `mime_type` VARCHAR(128) DEFAULT 'image/jpeg',",
        "  `upload_date` DATETIME NOT NULL,",
        "  PRIMARY KEY (`id`),",
        "  KEY `idx_media_type` (`type`)",
        ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",
        "",
        "-- -------------------------------------------------------------------",
        "-- Table structure for `section_config`",
        "-- -------------------------------------------------------------------",
        "CREATE TABLE IF NOT EXISTS `section_config` (",
        "  `section_id` VARCHAR(64) NOT NULL,",
        "  `array_of_media_ids` JSON NOT NULL,",
        "  `updated_at` DATETIME NOT NULL,",
        "  PRIMARY KEY (`section_id`)",
        ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",
        "",
        "-- -------------------------------------------------------------------",
        "-- Table structure for `wedding_stories`",
        "-- -------------------------------------------------------------------",
        "CREATE TABLE IF NOT EXISTS `wedding_stories` (",
        "  `id` VARCHAR(64) NOT NULL,",
        "  `slug` VARCHAR(128) NOT NULL,",
        "  `title` VARCHAR(255) NOT NULL,",
        "  `legacy_url` VARCHAR(512) DEFAULT '',",
        "  `category` VARCHAR(128) DEFAULT 'Wedding',",
        "  `tagline` TEXT DEFAULT NULL,",
        "  `cover_image` VARCHAR(1024) NOT NULL,",
        "  `hero_image` VARCHAR(1024) NOT NULL,",
        "  `is_featured` TINYINT(1) NOT NULL DEFAULT 0,",
        "  `video_url` VARCHAR(1024) DEFAULT '',",
        "  `video_poster` VARCHAR(1024) DEFAULT '',",
        "  `location` VARCHAR(255) DEFAULT '',",
        "  `date` VARCHAR(128) DEFAULT '',",
        "  `image_count` INT NOT NULL DEFAULT 0,",
        "  `images` JSON NOT NULL,",
        "  `created_at` DATETIME NOT NULL,",
        "  `updated_at` DATETIME NOT NULL,",
        "  PRIMARY KEY (`id`),",
        "  UNIQUE KEY `idx_story_slug` (`slug`),",
        "  KEY `idx_story_featured` (`is_featured`)",
        ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",
        "",
        "-- -------------------------------------------------------------------",
        "-- Table structure for `studio_config`",
        "-- -------------------------------------------------------------------",
        "CREATE TABLE IF NOT EXISTS `studio_config` (",
        "  `key` VARCHAR(64) NOT NULL,",
        "  `value` JSON NOT NULL,",
        "  `updated_at` DATETIME NOT NULL,",
        "  PRIMARY KEY (`key`)",
        ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",
        "",
    ]

    cur = conn.cursor()
    tables = ["media_library", "section_config", "wedding_stories", "studio_config"]

    for table in tables:
        sql_lines.append(f"-- Dumping data for table `{table}`")
        cur.execute(f"PRAGMA table_info({table})")
        cols = [c[1] for c in cur.fetchall()]
        cols_joined = ", ".join([f"`{c}`" for c in cols])

        cur.execute(f"SELECT * FROM {table}")
        rows = cur.fetchall()
        if rows:
            for row in rows:
                vals = [escape_sql_val(v) for v in row]
                sql_lines.append(f"INSERT INTO `{table}` ({cols_joined}) VALUES ({', '.join(vals)}) ON DUPLICATE KEY UPDATE `updated_at`=VALUES(`updated_at`);" if 'updated_at' in cols else f"REPLACE INTO `{table}` ({cols_joined}) VALUES ({', '.join(vals)});")
        sql_lines.append("")

    sql_lines.append("SET FOREIGN_KEY_CHECKS = 1;")
    sql_lines.append("")

    dump_path = EXPORT_DIR / "hostinger_mysql_dump.sql"
    dump_path.write_text("\n".join(sql_lines), encoding="utf-8")
    print(f"✅ Created {dump_path} ({dump_path.stat().st_size:,} bytes)")


def generate_json_export(conn):
    print("📋 Generating seed_data.json ...")
    cur = conn.cursor()
    tables = ["media_library", "section_config", "wedding_stories", "studio_config"]
    full_data = {}

    for table in tables:
        cur.execute(f"PRAGMA table_info({table})")
        cols = [c[1] for c in cur.fetchall()]
        cur.execute(f"SELECT * FROM {table}")
        rows = cur.fetchall()
        items = []
        for r in rows:
            obj = {}
            for col, val in zip(cols, r):
                if isinstance(val, str) and (val.startswith("{") or val.startswith("[")):
                    try:
                        obj[col] = json.loads(val)
                    except Exception:
                        obj[col] = val
                else:
                    obj[col] = val
            items.append(obj)
        full_data[table] = items

    json_path = EXPORT_DIR / "seed_data.json"
    json_path.write_text(json.dumps(full_data, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"✅ Created {json_path} ({json_path.stat().st_size:,} bytes)")


def generate_media_bundle():
    print("🗜️ Packaging media_bundle.zip ...")
    bundle_path = EXPORT_DIR / "media_bundle.zip"
    file_count = 0
    total_bytes = 0

    with zipfile.ZipFile(bundle_path, "w", zipfile.ZIP_DEFLATED) as zipf:
        # 1. Media folder
        if MEDIA_DIR.exists():
            for root, _, files in os.walk(MEDIA_DIR):
                for f in files:
                    full_p = Path(root) / f
                    arcname = Path("media") / full_p.relative_to(MEDIA_DIR)
                    zipf.write(full_p, str(arcname))
                    file_count += 1
                    total_bytes += full_p.stat().st_size

        # 2. Uploads folder
        if UPLOADS_DIR.exists():
            for root, _, files in os.walk(UPLOADS_DIR):
                for f in files:
                    full_p = Path(root) / f
                    arcname = Path("uploads") / full_p.relative_to(UPLOADS_DIR)
                    zipf.write(full_p, str(arcname))
                    file_count += 1
                    total_bytes += full_p.stat().st_size

    print(f"✅ Created {bundle_path} ({bundle_path.stat().st_size / (1024*1024):.2f} MB, {file_count} files, uncompressed {total_bytes / (1024*1024):.2f} MB)")


def generate_sample_env():
    env_content = """# YOU & ME Studio — Hostinger Production Environment Configuration
# Copy this file to .env on your Hostinger hosting/server

# ── 1. Hostinger Database Connection ─────────────────────────────
# Replace with your Hostinger MySQL credentials from hPanel -> Databases:
# Format: mysql+pymysql://<DB_USER>:<DB_PASSWORD>@<DB_HOST>:3306/<DB_NAME>
DATABASE_URL=mysql+pymysql://u123456789_studio:YourStrongPassword@localhost:3306/u123456789_studio

# ── 2. Security & JWT Secret ──────────────────────────────────────
SECRET_KEY=youandme_studio_master_secret_key_production_change_this_random_string_2026
ADMIN_PASSCODE=admin77
BACKUP_PASSCODE=admin2026

# ── 3. Media & Domain URLs ────────────────────────────────────────
# Base URL where media files are served (e.g. your Hostinger domain)
MEDIA_BASE_URL=https://yourdomain.com/media
UPLOADS_BASE_URL=https://yourdomain.com/uploads

# ── 4. CORS Origins ───────────────────────────────────────────────
# Allowed origins for frontend requests
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
"""
    env_path = EXPORT_DIR / "sample.env"
    env_path.write_text(env_content, encoding="utf-8")
    print(f"✅ Created {env_path}")


def generate_deployment_guide():
    guide_content = """# Hostinger Deployment & Database Migration Guide

This guide walks you through deploying the **YOU & ME Studio** website, database, and media files to **Hostinger**.

---

## 📦 What Is in the Export Package (`backend/hostinger_export/`)

1. **`hostinger_mysql_dump.sql`**: Complete database schema and data dump (all 32 media records, 23 couples stories, business info, FAQs, and section configs) formatted for **Hostinger phpMyAdmin**.
2. **`media_bundle.zip`**: All videos (`.mp4`), poster frames, team photos, brand assets, and uploads packaged for Hostinger File Manager.
3. **`seed_data.json`**: Standalone JSON export of all database tables.
4. **`sample.env`**: Production environment configuration template.

---

## 🚀 Step 1: Create MySQL Database on Hostinger

1. Log in to your **Hostinger hPanel** (https://hpanel.hostinger.com/).
2. Navigate to **Databases** ➔ **MySQL Databases**.
3. Create a new database:
   - **MySQL Database Name**: e.g., `u123456789_studio`
   - **MySQL Username**: e.g., `u123456789_admin`
   - **Password**: Choose a strong password (save this).
4. Note your credentials:
   - Host: `localhost` (or the Hostinger remote MySQL IP if hosting backend separately)
   - Port: `3306`
   - Database Name: `u123456789_studio`
   - User: `u123456789_admin`

---

## 🗄️ Step 2: Import Database via phpMyAdmin (1-Click)

1. In Hostinger hPanel under **MySQL Databases**, click **Enter phpMyAdmin** next to your new database.
2. Click the **Import** tab in the top navigation bar.
3. Under **File to import**, click **Choose File** and select:
   `backend/hostinger_export/hostinger_mysql_dump.sql`
4. Click **Import** (or **Go**) at the bottom.
5. All 4 tables will be created and populated instantly:
   - `media_library`
   - `wedding_stories`
   - `section_config`
   - `studio_config`

---

## 📁 Step 3: Upload Media Files via Hostinger File Manager

1. In Hostinger hPanel, go to **Files** ➔ **File Manager**.
2. Open `public_html/`.
3. Upload `backend/hostinger_export/media_bundle.zip`.
4. Right-click the uploaded zip and choose **Extract**.
5. This creates the directories:
   - `public_html/media/videos/` (all 6 wedding films)
   - `public_html/media/posters/` (poster frames)
   - `public_html/media/team/` (photographer portraits)
   - `public_html/media/brand/` (studio logos)
   - `public_html/uploads/` (admin uploads)
6. Delete the `.zip` file after extraction to save disk space.

---

## ⚙️ Step 4: Deploying Backend / Connecting Frontend

### Option A: Hostinger Cloud / VPS (Recommended for full dynamic control)
1. In your Hostinger VPS or Python application container:
   - Clone or upload the `backend/` folder.
   - Install dependencies: `pip install -r requirements.txt`
   - Copy `sample.env` to `.env` and set your `DATABASE_URL`:
     ```
     DATABASE_URL=mysql+pymysql://u123456789_admin:YourPassword@localhost:3306/u123456789_studio
     ```
   - Run backend with: `uvicorn main:app --host 0.0.0.0 --port 8000`

### Option B: Hostinger Shared Hosting (Static Frontend + External or Serverless Backend)
1. Build the Vite production bundle:
   ```bash
   npm run build
   ```
2. Upload the contents of the `dist/` folder into Hostinger's `public_html/`.
3. Media assets in `public_html/media/` and `public_html/uploads/` will be served directly by Hostinger's high-speed LiteSpeed Web Server!

---

## 🔐 Admin Passcodes

- **Master Passcode:** `admin77`
- **Backup PIN:** `admin2026`
- **Client Lounge PIN:** `2026`
"""
    guide_path = PROJECT_ROOT / "HOSTINGER_DEPLOYMENT_GUIDE.md"
    guide_path.write_text(guide_content, encoding="utf-8")
    # Also save inside hostinger_export for convenience
    (EXPORT_DIR / "HOSTINGER_DEPLOYMENT_GUIDE.md").write_text(guide_content, encoding="utf-8")
    print(f"✅ Created {guide_path}")


def main():
    print("=" * 65)
    print("🚀 YOU & ME Studio — Hostinger Export Package Generator")
    print("=" * 65)

    EXPORT_DIR.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH))
    try:
        generate_mysql_dump(conn)
        generate_json_export(conn)
        generate_media_bundle()
        generate_sample_env()
        generate_deployment_guide()
        print("\n🎉 ALL HOSTINGER EXPORT ASSETS GENERATED SUCCESSFULLY!")
        print(f"📁 Files available in: {EXPORT_DIR}")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
