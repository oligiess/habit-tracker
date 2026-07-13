# HabitDeck

A simple web app for tracking daily habits: create habits, mark them
done each day, and watch your streaks build over time. Built solo as an
end-to-end practice project: frontend, backend, database, and deployment, kept
deliberately simple rather than feature-heavy.

## Live Demo
- App: https://habit-tracker-og111.vercel.app/
- API: https://habit-tracker-og111.vercel.app/api/health

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
- Deployment: [Vercel](https://habit-tracker-og111.vercel.app/) — frontend
  (static, served from `public/`) and backend (FastAPI as a Python
  serverless function) as one project.

## How to Run Locally
Requires the [Vercel CLI](https://vercel.com/docs/cli) (`npm i -g vercel`).
One-time setup: `vercel login`, then `vercel link` to connect this repo to
the Vercel project.

```
python -m venv .venv
.venv\Scripts\Activate.ps1   # Windows PowerShell
pip install -r requirements.txt
copy .env.example .env       # then fill in DATABASE_URL with your Supabase connection string
vercel dev
```
Runs the frontend and backend together on one local origin — open the URL
`vercel dev` prints (typically http://localhost:3000) and check
`/api/health`.

## License
MIT — see [LICENSE](LICENSE).
