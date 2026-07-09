from collections import defaultdict
from contextlib import asynccontextmanager
from datetime import date, timedelta

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import Base, engine, get_db
from models import Completion, Habit
from schemas import CompletionOut, HabitCreate, HabitOut
from streaks import compute_streaks

HISTORY_WINDOW_DAYS = 30


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(lifespan=lifespan)

# Frontend will be served from these origins during local dev.
# Both localhost and 127.0.0.1 are listed because browsers treat them
# as different origins for CORS purposes even though they resolve the same.
origins = [
    "http://localhost:5500",
    "http://127.0.0.1:5500",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "ok", "message": "Backend is alive"}


@app.post("/api/habits", response_model=HabitOut, status_code=201)
def create_habit(habit: HabitCreate, db: Session = Depends(get_db)):
    new_habit = Habit(name=habit.name)
    db.add(new_habit)
    db.commit()
    db.refresh(new_habit)
    return HabitOut(
        id=new_habit.id,
        name=new_habit.name,
        created_at=new_habit.created_at,
        current_streak=0,
        longest_streak=0,
        history=[],
    )


@app.get("/api/habits", response_model=list[HabitOut])
def list_habits(db: Session = Depends(get_db)):
    habits = db.query(Habit).order_by(Habit.created_at).all()
    if not habits:
        return []

    habit_ids = [habit.id for habit in habits]
    completions = (
        db.query(Completion).filter(Completion.habit_id.in_(habit_ids)).all()
    )

    dates_by_habit: dict[int, set[date]] = defaultdict(set)
    for completion in completions:
        dates_by_habit[completion.habit_id].add(completion.completed_date)

    today = date.today()
    window_start = today - timedelta(days=HISTORY_WINDOW_DAYS - 1)

    result = []
    for habit in habits:
        completed_dates = dates_by_habit[habit.id]
        current_streak, longest_streak = compute_streaks(completed_dates, today)
        history = sorted(d for d in completed_dates if d >= window_start)
        result.append(
            HabitOut(
                id=habit.id,
                name=habit.name,
                created_at=habit.created_at,
                current_streak=current_streak,
                longest_streak=longest_streak,
                history=history,
            )
        )
    return result


@app.delete("/api/habits/{habit_id}", status_code=204)
def delete_habit(habit_id: int, db: Session = Depends(get_db)):
    habit = db.get(Habit, habit_id)
    if habit is None:
        raise HTTPException(status_code=404, detail="Habit not found")

    db.delete(habit)
    db.commit()


@app.post("/api/habits/{habit_id}/completions", response_model=CompletionOut)
def mark_habit_done(habit_id: int, db: Session = Depends(get_db)):
    habit = db.get(Habit, habit_id)
    if habit is None:
        raise HTTPException(status_code=404, detail="Habit not found")

    today = date.today()
    existing = (
        db.query(Completion)
        .filter(Completion.habit_id == habit_id, Completion.completed_date == today)
        .first()
    )
    if existing is not None:
        return existing

    completion = Completion(habit_id=habit_id, completed_date=today)
    db.add(completion)
    db.commit()
    db.refresh(completion)
    return completion
