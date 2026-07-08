# Habit Tracker

A simple habit tracking web app — a solo project to practice a full end-to-end
build: frontend, backend, database, and deployment.

> Status: early scaffold / hello-world stage. This README will be expanded with
> a description, screenshots, and live link once the app is feature-complete.

## Tech Stack
- Frontend: HTML / CSS / JavaScript (no framework, no build step)
- Backend: Python, FastAPI
- Database: Postgres via Supabase/Railway (not yet connected)
- Deployment: Vercel (frontend) + Railway/Render (backend) — planned, not yet done

## Local Development (current state)

### Backend
```
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1   # Windows PowerShell
pip install -r requirements.txt
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
- [ ] Database schema + connection
- [ ] Habit CRUD
- [ ] Streak logic
- [ ] Styling pass
- [ ] Deployment
- [ ] Final README polish (screenshot, live link)
