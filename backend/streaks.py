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
