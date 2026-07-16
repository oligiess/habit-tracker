def test_mark_habit_done_is_idempotent(client, auth_user):
    habit = client.post("/api/habits", json={"name": "Stretch"}).json()

    first = client.post(f"/api/habits/{habit['id']}/completions")
    second = client.post(f"/api/habits/{habit['id']}/completions")

    assert first.status_code == 200
    assert second.status_code == 200
    assert first.json()["id"] == second.json()["id"]

    habit_after = client.get("/api/habits").json()[0]
    assert habit_after["current_streak"] == 1


def test_unmark_habit_done_removes_todays_completion(client, auth_user):
    habit = client.post("/api/habits", json={"name": "Stretch"}).json()
    client.post(f"/api/habits/{habit['id']}/completions")

    resp = client.delete(f"/api/habits/{habit['id']}/completions")
    assert resp.status_code == 204

    habit_after = client.get("/api/habits").json()[0]
    assert habit_after["current_streak"] == 0


def test_unmark_habit_done_is_idempotent_noop(client, auth_user):
    habit = client.post("/api/habits", json={"name": "Stretch"}).json()

    resp = client.delete(f"/api/habits/{habit['id']}/completions")

    assert resp.status_code == 204


def test_mark_habit_done_404s_for_archived_habit(client, auth_user):
    habit = client.post("/api/habits", json={"name": "Stretch"}).json()
    client.patch(f"/api/habits/{habit['id']}", json={"archived": True})

    resp = client.post(f"/api/habits/{habit['id']}/completions")

    assert resp.status_code == 404


def test_mark_habit_done_404s_for_missing_habit(client, auth_user):
    resp = client.post("/api/habits/999999/completions")
    assert resp.status_code == 404
