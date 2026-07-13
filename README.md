# HabitDeck

A simple web app for tracking daily habits: create habits, mark them
done each day, and watch your streaks build over time. Built solo as an
end-to-end practice project: frontend, backend, database, and deployment, kept
deliberately simple rather than feature-heavy.

## Live Demo
- App: https://habit-tracker-og111.vercel.app/
- API: https://habit-tracker-api-2lkb.onrender.com/api/health

> Note: the backend runs on Render's free tier, which spins down after ~15
> minutes of inactivity. The first request after idle can take 30-50 seconds
> to wake back up — if the app looks stuck on load, give it a moment.

## Screenshot
![HabitDeck screenshot](docs/screenshot.png)

## Features
- Create habits to track
- Mark a habit done for today (idempotent — repeat clicks the same day are a no-op)
- Current streak and longest streak per habit, computed server-side
- 7-day dot strip + 30-day history per habit
- Light/dark theme toggle
- No login/accounts — single-user by design

## Tech Stack
- Frontend: HTML / CSS / JavaScript (no framework, no build step)
- Backend: Python, FastAPI
- Database: Postgres via Supabase, accessed with SQLAlchemy 2.0
- Deployment: [Vercel](https://habit-tracker-og111.vercel.app/) (frontend) + [Render](https://habit-tracker-api-2lkb.onrender.com) (backend)

## How to Run Locally

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

## License
MIT — see [LICENSE](LICENSE).
