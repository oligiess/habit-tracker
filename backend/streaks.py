from collections import defaultdict
from datetime import date, timedelta


def compute_streaks(completed_dates: set[date], today: date) -> tuple[int, int]:
    """Return (current_streak, longest_streak) in days for a set of completed dates.

    Current streak counts backward from today; if today isn't completed yet
    but yesterday was, the streak is still considered alive (counted from
    yesterday) rather than broken.
    """
    current_streak = 0
    cursor = today if today in completed_dates else today - timedelta(days=1)
    while cursor in completed_dates:
        current_streak += 1
        cursor -= timedelta(days=1)

    longest_streak = 0
    run_length = 0
    previous_day = None
    for day in sorted(completed_dates):
        if previous_day is not None and day == previous_day + timedelta(days=1):
            run_length += 1
        else:
            run_length = 1
        longest_streak = max(longest_streak, run_length)
        previous_day = day

    return current_streak, longest_streak


def compute_perfect_day_streaks(
    dates_by_habit: dict[int, set[date]], today: date
) -> tuple[int, int]:
    """Return (active_streak, best_streak) in days across multiple habits.

    A day is "perfect" if every habit id key in dates_by_habit has that date
    in its completion set. Uses the same grace-day rule as compute_streaks:
    today not yet being perfect doesn't break an otherwise-perfect streak
    ending yesterday.

    Known simplification (deliberate, not a bug to fix later): "every
    habit" means every currently active, daily-cadence habit, applied
    retroactively across all history -- this does not reconstruct which
    habits existed or were active on each past calendar day. Adding a new
    habit today can retroactively turn old perfect days into imperfect ones
    the next time this is recomputed.

    Callers must pass one entry per currently-active, daily-cadence habit,
    including an empty set() for habits with zero completions ever --
    omitting a habit's key entirely (rather than passing an empty set)
    silently excludes it from the "every habit" requirement.
    """
    if not dates_by_habit:
        return 0, 0

    habit_ids = list(dates_by_habit.keys())

    def is_perfect(day: date) -> bool:
        return all(day in dates_by_habit[habit_id] for habit_id in habit_ids)

    active_streak = 0
    cursor = today if is_perfect(today) else today - timedelta(days=1)
    while is_perfect(cursor):
        active_streak += 1
        cursor -= timedelta(days=1)

    all_dates: set[date] = set()
    for dates in dates_by_habit.values():
        all_dates |= dates

    best_streak = 0
    run_length = 0
    previous_day = None
    for day in sorted(all_dates):
        if not is_perfect(day):
            continue
        if previous_day is not None and day == previous_day + timedelta(days=1):
            run_length += 1
        else:
            run_length = 1
        best_streak = max(best_streak, run_length)
        previous_day = day

    return active_streak, best_streak


def compute_weekly_streak(
    completed_dates: set[date], target_per_week: int, today: date
) -> tuple[int, int]:
    """Return (current_streak, longest_streak) in weeks for a habit with a
    target_per_week cadence. A Mon-Sun week counts if it has at least
    target_per_week completions in it. Same grace rule as compute_streaks,
    applied at week granularity: the current in-progress week not yet
    meeting target doesn't break a streak built from prior complete weeks.
    """
    counts: dict[date, int] = defaultdict(int)
    for day in completed_dates:
        week_start = day - timedelta(days=day.weekday())
        counts[week_start] += 1

    def week_met(week_start: date) -> bool:
        return counts.get(week_start, 0) >= target_per_week

    today_week_start = today - timedelta(days=today.weekday())

    current_streak = 0
    cursor = today_week_start
    if not week_met(cursor):
        cursor -= timedelta(weeks=1)
    while week_met(cursor):
        current_streak += 1
        cursor -= timedelta(weeks=1)

    longest_streak = 0
    run_length = 0
    previous_week = None
    for week_start in sorted(w for w in counts if week_met(w)):
        if previous_week is not None and week_start == previous_week + timedelta(weeks=1):
            run_length += 1
        else:
            run_length = 1
        longest_streak = max(longest_streak, run_length)
        previous_week = week_start

    return current_streak, longest_streak
