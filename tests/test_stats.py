from datetime import date

from backend.main import app, get_client_today

FIXED_TODAY = date(2026, 7, 15)  # Wednesday


def _with_fixed_today(client, fn):
    app.dependency_overrides[get_client_today] = lambda: FIXED_TODAY
    try:
        return fn()
    finally:
        app.dependency_overrides.pop(get_client_today, None)


def test_weekly_stats_reflects_completion_for_today(client, auth_user):
    habit = client.post("/api/habits", json={"name": "Read"}).json()

    def do():
        client.post(f"/api/habits/{habit['id']}/completions")
        return client.get("/api/stats/weekly")

    resp = _with_fixed_today(client, do)

    assert resp.status_code == 200
    entries = resp.json()
    wednesday = next(e for e in entries if e["date"] == FIXED_TODAY.isoformat())
    assert wednesday["completed"] == 1
    assert wednesday["total"] == 1
    assert wednesday["completed_habit_ids"] == [habit["id"]]


def test_weekly_stats_excludes_weekly_cadence_habits(client, auth_user):
    client.post("/api/habits", json={"name": "Gym", "target_per_week": 3})

    resp = _with_fixed_today(
        client, lambda: client.get("/api/stats/weekly")
    )

    entries = resp.json()
    assert all(e["total"] == 0 for e in entries)


def test_heatmap_rejects_malformed_month(client, auth_user):
    resp = client.get("/api/stats/heatmap", params={"month": "not-a-month"})
    assert resp.status_code == 400


def test_heatmap_rejects_future_month(client, auth_user):
    resp = _with_fixed_today(
        client,
        lambda: client.get("/api/stats/heatmap", params={"month": "2026-08"}),
    )
    assert resp.status_code == 400


def test_calendar_includes_weekly_cadence_habits(client, auth_user):
    client.post("/api/habits", json={"name": "Gym", "target_per_week": 3})

    resp = _with_fixed_today(
        client,
        lambda: client.get("/api/stats/calendar", params={"month": "2026-07"}),
    )

    assert resp.status_code == 200
    today_entry = next(
        e for e in resp.json() if e["date"] == FIXED_TODAY.isoformat()
    )
    assert today_entry["total_habits"] == 1


def test_stats_summary_zero_habits(client, auth_user):
    resp = client.get("/api/stats/summary")

    assert resp.status_code == 200
    body = resp.json()
    assert body == {
        "active_streak": 0,
        "best_streak": 0,
        "month_completion_pct": 0.0,
    }


def test_stats_summary_counts_perfect_days(client, auth_user):
    habit = client.post("/api/habits", json={"name": "Read"}).json()

    def do():
        client.post(f"/api/habits/{habit['id']}/completions")
        return client.get("/api/stats/summary")

    resp = _with_fixed_today(client, do)

    assert resp.status_code == 200
    assert resp.json()["active_streak"] == 1
