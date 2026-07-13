from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class HabitCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    category: str | None = Field(default=None, max_length=100)
    target: str | None = Field(default=None, max_length=100)
    target_per_week: int | None = Field(default=None, ge=1, le=7)


class HabitPatch(BaseModel):
    """All fields optional; only keys present in the request body are
    applied (see main.py's use of model_dump(exclude_unset=True)) -- an
    explicit null clears a field, an absent key leaves it untouched.
    """

    name: str | None = Field(default=None, min_length=1, max_length=100)
    category: str | None = None
    target: str | None = None
    target_per_week: int | None = Field(default=None, ge=1, le=7)
    archived: bool | None = None


class WeekProgress(BaseModel):
    completed: int
    target: int
    current_streak: int
    longest_streak: int


class HabitOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    category: str | None
    target: str | None
    target_per_week: int | None
    archived: bool
    created_at: datetime
    current_streak: int
    longest_streak: int
    history: list[date]
    week_progress: WeekProgress | None = None


class CompletionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    habit_id: int
    completed_date: date


class WeeklyStatEntry(BaseModel):
    day: str
    date: date
    completed: int
    total: int


class HeatmapEntry(BaseModel):
    date: date
    level: int


class CalendarDayEntry(BaseModel):
    date: date
    completed_habit_ids: list[int]
    total_habit_ids: list[int]
    total_habits: int
    level: int


class StatsSummary(BaseModel):
    active_streak: int
    best_streak: int
    month_completion_pct: float
