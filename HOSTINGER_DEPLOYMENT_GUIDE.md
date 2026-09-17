# Hostinger Deployment & Database Migration Guide

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
