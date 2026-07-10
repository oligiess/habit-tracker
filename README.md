# Habit Tracker

A simple habit tracking web app — a solo project to practice a full end-to-end
build: frontend, backend, database, and deployment.

> Status: early scaffold / hello-world stage. This README will be expanded with
> a description, screenshots, and live link once the app is feature-complete.

## Tech Stack
- Frontend: HTML / CSS / JavaScript (no framework, no build step)
- Backend: Python, FastAPI
- Database: Postgres via Supabase, accessed with SQLAlchemy
- Deployment: [Vercel](https://habit-tracker-og111.vercel.app/) (frontend) + [Render](https://habit-tracker-api-2lkb.onrender.com) (backend)

## Local Development (current state)

### Backend
```
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1   # Windows PowerShell
pip install -r requirements.txt
copy .env.example .env       # then fill in DATABASE_URL with your Supabase connection string
uvicorn main:app --reload --port 8000
```
Runs at http://localhost:8000 — check http://localhost:8000/api/health

### Frontend
```
cd frontend
python -m http.server 5500
```
Open http://localhost:5500 in a browser.

## Project Status
- [x] Repo scaffold
- [x] Backend + frontend hello-world loop
- [x] Database schema + connection
- [x] Habit CRUD (create, list, mark done today, delete — wired up in both backend and frontend)
- [x] Streak logic
- [x] Styling pass
- [x] Deployment
- [ ] Final README polish (screenshot, live link)
