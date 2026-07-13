import logging
import os
import uuid
from collections import defaultdict
from contextlib import asynccontextmanager
from datetime import date, datetime, timedelta, timezone

from fastapi import Depends, FastAPI, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from .auth import get_current_user_id
from .database import Base, engine, get_db
from .models import Completion, Habit
from .schemas import (
    CalendarDayEntry,
    CompletionOut,
    HabitCreate,
    HabitOut,
    HabitPatch,
    HeatmapEntry,
    StatsSummary,
    WeeklyStatEntry,
    WeekProgress,
)
from .streaks import compute_perfect_day_streaks, compute_streaks, compute_weekly_streak

HISTORY_WINDOW_DAYS = 30
WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(lifespan=lifespan, title="HabitDeck API")


@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    logger.exception("Database error on %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=500,
        content={"detail": "Something went wrong. Please try again."},
    )


def get_allowed_origins() -> list[str]:
    # ALLOWED_ORIGINS is a comma-separated list, set in production (e.g. Render)
    # to add the deployed frontend's origin. Both localhost and 127.0.0.1 are
    # listed as the default because browsers treat them as different origins
    # for CORS purposes even though they resolve the same.
    raw = os.getenv("ALLOWED_ORIGINS")
    if not raw:
        return ["http://localhost:5500", "http://127.0.0.1:5500"]
    return [origin.strip() for origin in raw.split(",") if origin.strip()]


origins = get_allowed_origins()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_client_today(x_client_date: str | None = Header(default=None)) -> date:
    # The frontend sends its browser-local date so "today" lines up with what
    # the user sees, instead of the server process's UTC date (Vercel runs
    # UTC) -- see date.fromisoformat below for the expected YYYY-MM-DD shape.
    if x_client_date:
        try:
            return date.fromisoformat(x_client_date)
        except ValueError:
            pass
    return date.today()


def _week_bounds(today: date) -> tuple[date, date]:
    """Return (monday, sunday) of the Mon-Sun week containing today."""
    monday = today - timedelta(days=today.weekday())
    return monday, monday + timedelta(days=6)


def _build_habit_out(habit: Habit, completed_dates: set[date], today: date) -> HabitOut:
    current_streak, longest_streak = compute_streaks(completed_dates, today)
    window_start = today - timedelta(days=HISTORY_WINDOW_DAYS - 1)
    history = sorted(d for d in completed_dates if d >= window_start)

    week_progress = None
    if habit.target_per_week is not None:
        monday, sunday = _week_bounds(today)
        week_completed = sum(1 for d in completed_dates if monday <= d <= sunday)
        week_current, week_longest = compute_weekly_streak(
            completed_dates, habit.target_per_week, today
        )
        week_progress = WeekProgress(
            completed=week_completed,
            target=habit.target_per_week,
            current_streak=week_current,
            longest_streak=week_longest,
        )

    return HabitOut(
        id=habit.id,
        name=habit.name,
        category=habit.category,
        target=habit.target,
        target_per_week=habit.target_per_week,
        archived=habit.archived_at is not None,
        created_at=habit.created_at,
        current_streak=current_streak,
        longest_streak=longest_streak,
        history=history,
        week_progress=week_progress,
    )


@app.get("/api/health")
def health():
    return {"status": "ok", "message": "Backend is alive"}


@app.post("/api/habits", response_model=HabitOut, status_code=201)
def create_habit(
    habit: HabitCreate,
    db: Session = Depends(get_db),
    user_id: uuid.UUID = Depends(get_current_user_id),
    today: date = Depends(get_client_today),
):
    new_habit = Habit(
        name=habit.name,
        user_id=user_id,
        category=habit.category,
        target=habit.target,
        target_per_week=habit.target_per_week,
    )
    db.add(new_habit)
    db.commit()
    db.refresh(new_habit)
    return _build_habit_out(new_habit, set(), today)


@app.get("/api/habits", response_model=list[HabitOut])
def list_habits(
    include_archived: bool = False,
    db: Session = Depends(get_db),
    user_id: uuid.UUID = Depends(get_current_user_id),
    today: date = Depends(get_client_today),
):
    query = db.query(Habit).filter(Habit.user_id == user_id)
    if not include_archived:
        query = query.filter(Habit.archived_at.is_(None))
    habits = query.order_by(Habit.created_at).all()
    if not habits:
        return []

    habit_ids = [habit.id for habit in habits]
    completions = (
        db.query(Completion).filter(Completion.habit_id.in_(habit_ids)).all()
    )

    dates_by_habit: dict[int, set[date]] = defaultdict(set)
    for completion in completions:
        dates_by_habit[completion.habit_id].add(completion.completed_date)

    return [_build_habit_out(habit, dates_by_habit[habit.id], today) for habit in habits]


@app.patch("/api/habits/{habit_id}", response_model=HabitOut)
def update_habit(
    habit_id: int,
    patch: HabitPatch,
    db: Session = Depends(get_db),
    user_id: uuid.UUID = Depends(get_current_user_id),
    today: date = Depends(get_client_today),
):
    habit = (
        db.query(Habit)
        .filter(Habit.id == habit_id, Habit.user_id == user_id)
        .first()
    )
    if habit is None:
        raise HTTPException(status_code=404, detail="Habit not found")

    updates = patch.model_dump(exclude_unset=True)
    archived = updates.pop("archived", None)
    for field, value in updates.items():
        setattr(habit, field, value)

    if archived is True:
        habit.archived_at = datetime.now(timezone.utc)
    elif archived is False:
        habit.archived_at = None

    db.commit()
    db.refresh(habit)

    completed_dates = {
        completion.completed_date
        for completion in db.query(Completion)
        .filter(Completion.habit_id == habit.id)
        .all()
    }
    return _build_habit_out(habit, completed_dates, today)


@app.delete("/api/habits/{habit_id}", status_code=204)
def delete_habit(
    habit_id: int,
    db: Session = Depends(get_db),
    user_id: uuid.UUID = Depends(get_current_user_id),
):
    habit = (
        db.query(Habit)
        .filter(Habit.id == habit_id, Habit.user_id == user_id)
        .first()
    )
    if habit is None:
        raise HTTPException(status_code=404, detail="Habit not found")

    db.delete(habit)
    db.commit()


@app.post("/api/habits/{habit_id}/completions", response_model=CompletionOut)
def mark_habit_done(
    habit_id: int,
    db: Session = Depends(get_db),
    user_id: uuid.UUID = Depends(get_current_user_id),
    today: date = Depends(get_client_today),
):
    habit = (
        db.query(Habit)
        .filter(Habit.id == habit_id, Habit.user_id == user_id)
        .first()
    )
    if habit is None or habit.archived_at is not None:
        raise HTTPException(status_code=404, detail="Habit not found")

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


@app.delete("/api/habits/{habit_id}/completions", status_code=204)
def unmark_habit_done(
    habit_id: int,
    db: Session = Depends(get_db),
    user_id: uuid.UUID = Depends(get_current_user_id),
    today: date = Depends(get_client_today),
):
    habit = (
        db.query(Habit)
        .filter(Habit.id == habit_id, Habit.user_id == user_id)
        .first()
    )
    if habit is None or habit.archived_at is not None:
        raise HTTPException(status_code=404, detail="Habit not found")

    db.query(Completion).filter(
        Completion.habit_id == habit_id, Completion.completed_date == today
    ).delete()
    db.commit()


def _active_daily_habits(db: Session, user_id: uuid.UUID) -> list[Habit]:
    return (
        db.query(Habit)
        .filter(
            Habit.user_id == user_id,
            Habit.archived_at.is_(None),
            Habit.target_per_week.is_(None),
        )
        .all()
    )


def _active_habits(db: Session, user_id: uuid.UUID) -> list[Habit]:
    # Same as _active_daily_habits but includes weekly-cadence habits too --
    # used by the calendar view, which shades by "was this habit completed
    # that day" rather than the dashboard's daily-only aggregate.
    return (
        db.query(Habit)
        .filter(
            Habit.user_id == user_id,
            Habit.archived_at.is_(None),
        )
        .all()
    )


@app.get("/api/stats/weekly", response_model=list[WeeklyStatEntry])
def weekly_stats(
    db: Session = Depends(get_db),
    user_id: uuid.UUID = Depends(get_current_user_id),
    today: date = Depends(get_client_today),
):
    monday, sunday = _week_bounds(today)

    habits = _active_daily_habits(db, user_id)
    total = len(habits)

    counts_by_date: dict[date, int] = defaultdict(int)
    if total > 0:
        habit_ids = [habit.id for habit in habits]
        completions = (
            db.query(Completion)
            .filter(
                Completion.habit_id.in_(habit_ids),
                Completion.completed_date >= monday,
                Completion.completed_date <= sunday,
            )
            .all()
        )
        for completion in completions:
            counts_by_date[completion.completed_date] += 1

    return [
        WeeklyStatEntry(
            day=WEEKDAY_LABELS[i],
            date=monday + timedelta(days=i),
            completed=counts_by_date.get(monday + timedelta(days=i), 0),
            total=total,
        )
        for i in range(7)
    ]


@app.get("/api/stats/heatmap", response_model=list[HeatmapEntry])
def heatmap_stats(
    month: str | None = None,
    db: Session = Depends(get_db),
    user_id: uuid.UUID = Depends(get_current_user_id),
    today: date = Depends(get_client_today),
):
    if month is None:
        year, month_num = today.year, today.month
    else:
        try:
            year_str, month_str = month.split("-")
            year, month_num = int(year_str), int(month_str)
            date(year, month_num, 1)
        except (ValueError, IndexError):
            raise HTTPException(status_code=400, detail="month must be in YYYY-MM format")

    month_start = date(year, month_num, 1)
    if month_start > today:
        raise HTTPException(status_code=400, detail="month cannot be in the future")

    next_month_start = date(year + (month_num == 12), (month_num % 12) + 1, 1)
    month_end_exclusive = min(next_month_start, today + timedelta(days=1))

    habits = _active_daily_habits(db, user_id)
    total = len(habits)

    counts_by_date: dict[date, int] = defaultdict(int)
    if total > 0:
        habit_ids = [habit.id for habit in habits]
        completions = (
            db.query(Completion)
            .filter(
                Completion.habit_id.in_(habit_ids),
                Completion.completed_date >= month_start,
                Completion.completed_date < month_end_exclusive,
            )
            .all()
        )
        for completion in completions:
            counts_by_date[completion.completed_date] += 1

    result = []
    cursor = month_start
    while cursor < month_end_exclusive:
        completed = counts_by_date.get(cursor, 0)
        level = round(completed / total * 4) if total > 0 else 0
        result.append(HeatmapEntry(date=cursor, level=level))
        cursor += timedelta(days=1)
    return result


@app.get("/api/stats/calendar", response_model=list[CalendarDayEntry])
def calendar_stats(
    month: str | None = None,
    db: Session = Depends(get_db),
    user_id: uuid.UUID = Depends(get_current_user_id),
    today: date = Depends(get_client_today),
):
    if month is None:
        year, month_num = today.year, today.month
    else:
        try:
            year_str, month_str = month.split("-")
            year, month_num = int(year_str), int(month_str)
            date(year, month_num, 1)
        except (ValueError, IndexError):
            raise HTTPException(status_code=400, detail="month must be in YYYY-MM format")

    month_start = date(year, month_num, 1)
    if month_start > today:
        raise HTTPException(status_code=400, detail="month cannot be in the future")

    next_month_start = date(year + (month_num == 12), (month_num % 12) + 1, 1)
    month_end_exclusive = min(next_month_start, today + timedelta(days=1))

    habits = _active_habits(db, user_id)
    total = len(habits)
    habit_ids = [habit.id for habit in habits]

    habit_ids_by_date: dict[date, list[int]] = defaultdict(list)
    if total > 0:
        completions = (
            db.query(Completion)
            .filter(
                Completion.habit_id.in_(habit_ids),
                Completion.completed_date >= month_start,
                Completion.completed_date < month_end_exclusive,
            )
            .all()
        )
        for completion in completions:
            habit_ids_by_date[completion.completed_date].append(completion.habit_id)

    result = []
    cursor = month_start
    while cursor < month_end_exclusive:
        completed_habit_ids = habit_ids_by_date.get(cursor, [])
        level = round(len(completed_habit_ids) / total * 4) if total > 0 else 0
        result.append(
            CalendarDayEntry(
                date=cursor,
                completed_habit_ids=completed_habit_ids,
                total_habit_ids=habit_ids,
                total_habits=total,
                level=level,
            )
        )
        cursor += timedelta(days=1)
    return result


@app.get("/api/stats/summary", response_model=StatsSummary)
def stats_summary(
    db: Session = Depends(get_db),
    user_id: uuid.UUID = Depends(get_current_user_id),
    today: date = Depends(get_client_today),
):
    habits = _active_daily_habits(db, user_id)
    if not habits:
        return StatsSummary(active_streak=0, best_streak=0, month_completion_pct=0.0)

    habit_ids = [habit.id for habit in habits]
    completions = (
        db.query(Completion).filter(Completion.habit_id.in_(habit_ids)).all()
    )
    dates_by_habit: dict[int, set[date]] = defaultdict(set)
    for completion in completions:
        dates_by_habit[completion.habit_id].add(completion.completed_date)
    for habit_id in habit_ids:
        dates_by_habit.setdefault(habit_id, set())

    active_streak, best_streak = compute_perfect_day_streaks(dates_by_habit, today)

    # Only count days that have fully finished -- today is still in progress,
    # so it's excluded from both the possible-completions denominator and the
    # completed-this-month numerator (a day-1-of-month lands on 0/0 -> 0.0%).
    month_start = today.replace(day=1)
    days_elapsed = (today - month_start).days
    possible = days_elapsed * len(habit_ids)
    completed_this_month = sum(
        1 for dates in dates_by_habit.values() for d in dates if month_start <= d < today
    )
    month_completion_pct = (
        round(completed_this_month / possible * 100, 1) if possible else 0.0
    )

    return StatsSummary(
        active_streak=active_streak,
        best_streak=best_streak,
        month_completion_pct=month_completion_pct,
    )
