from datetime import date

from backend.streaks import (
    compute_perfect_day_streaks,
    compute_streaks,
    compute_weekly_streak,
)


def test_compute_streaks_grace_day_keeps_streak_alive():
    """Yesterday and the day before are completed, today isn't yet -- the
    streak should still read as current (2), not broken."""
    today = date(2026, 7, 15)
    completed = {date(2026, 7, 13), date(2026, 7, 14)}

    current, longest = compute_streaks(completed, today)

    assert current == 2
    assert longest == 2


def test_compute_streaks_today_completed_counts_today():
    today = date(2026, 7, 15)
    completed = {date(2026, 7, 14), date(2026, 7, 15)}

    current, longest = compute_streaks(completed, today)

    assert current == 2
    assert longest == 2


def test_compute_streaks_two_missed_days_breaks_streak():
    today = date(2026, 7, 15)
    completed = {date(2026, 7, 12)}  # 3 days ago -- streak is broken

    current, longest = compute_streaks(completed, today)

    assert current == 0
    assert longest == 1


def test_compute_streaks_longest_can_exceed_current():
    today = date(2026, 7, 15)
    completed = {
        date(2026, 7, 1),
        date(2026, 7, 2),
        date(2026, 7, 3),
        date(2026, 7, 4),
        date(2026, 7, 14),
    }

    current, longest = compute_streaks(completed, today)

    assert current == 1
    assert longest == 4


def test_compute_streaks_no_completions():
    assert compute_streaks(set(), date(2026, 7, 15)) == (0, 0)


def test_compute_perfect_day_streaks_requires_every_habit():
    today = date(2026, 7, 15)
    dates_by_habit = {
        1: {date(2026, 7, 14), date(2026, 7, 15)},
        2: {date(2026, 7, 14)},  # missing today -- yesterday was still perfect
    }

    active, best = compute_perfect_day_streaks(dates_by_habit, today)

    assert active == 1
    assert best == 1


def test_compute_perfect_day_streaks_empty_set_required_not_omitted():
    """A habit with zero completions must still be passed as an empty set --
    omitting its key entirely would silently exclude it from the
    'every habit' requirement, per the function's own docstring."""
    today = date(2026, 7, 15)
    dates_by_habit = {
        1: {date(2026, 7, 15)},
        2: set(),
    }

    active, best = compute_perfect_day_streaks(dates_by_habit, today)

    assert active == 0
    assert best == 0


def test_compute_perfect_day_streaks_no_habits():
    assert compute_perfect_day_streaks({}, date(2026, 7, 15)) == (0, 0)


def test_compute_weekly_streak_current_week_in_progress_does_not_break_streak():
    # Wednesday 2026-07-15; last week (Jul 6-12) met target of 3, this week
    # only has 1 completion so far -- shouldn't break the streak.
    today = date(2026, 7, 15)
    completed = {
        date(2026, 7, 6),
        date(2026, 7, 8),
        date(2026, 7, 10),
        date(2026, 7, 14),
    }

    current, longest = compute_weekly_streak(completed, target_per_week=3, today=today)

    assert current == 1
    assert longest == 1


def test_compute_weekly_streak_week_missing_target_breaks_streak():
    today = date(2026, 7, 15)
    completed = {date(2026, 6, 29), date(2026, 6, 30)}  # only 2, target is 3

    current, longest = compute_weekly_streak(completed, target_per_week=3, today=today)

    assert current == 0
    assert longest == 0
