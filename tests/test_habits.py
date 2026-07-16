import uuid

from backend.auth import get_current_user_id
from backend.main import app


def test_create_habit(client, auth_user):
    resp = client.post(
        "/api/habits",
        json={"name": "Read", "category": "Learning", "target": "20 min"},
    )

    assert resp.status_code == 201
    body = resp.json()
    assert body["name"] == "Read"
    assert body["category"] == "Learning"
    assert body["archived"] is False
    assert body["current_streak"] == 0
    assert body["week_progress"] is None


def test_list_habits_401s_without_auth(client):
    # No auth_user fixture engaged, no override installed -- proves the real
    # get_current_user_id dependency (not a masked override) still runs.
    assert get_current_user_id not in app.dependency_overrides
    resp = client.get("/api/habits")
    assert resp.status_code == 401


def test_create_habit_rejects_blank_name(client, auth_user):
    resp = client.post("/api/habits", json={"name": ""})
    assert resp.status_code == 422


def test_list_habits_excludes_archived_by_default(client, auth_user):
    active = client.post("/api/habits", json={"name": "Stretch"}).json()
    archived = client.post("/api/habits", json={"name": "Old habit"}).json()
    client.patch(f"/api/habits/{archived['id']}", json={"archived": True})

    resp = client.get("/api/habits")

    assert resp.status_code == 200
    names = [h["name"] for h in resp.json()]
    assert names == ["Stretch"]

    resp_all = client.get("/api/habits", params={"include_archived": True})
    names_all = sorted(h["name"] for h in resp_all.json())
    assert names_all == ["Old habit", "Stretch"]

    # cleanup so this test doesn't leak into others relying on empty state
    client.delete(f"/api/habits/{active['id']}")
    client.delete(f"/api/habits/{archived['id']}")


def test_habits_are_scoped_to_authenticated_user(client, auth_user):
    client.post("/api/habits", json={"name": "Meditate"})

    other_user_id = uuid.uuid4()
    app.dependency_overrides[get_current_user_id] = lambda: other_user_id
    try:
        resp = client.get("/api/habits")
        assert resp.status_code == 200
        assert resp.json() == []
    finally:
        app.dependency_overrides[get_current_user_id] = lambda: auth_user


def test_update_habit_partial_patch_only_touches_provided_fields(client, auth_user):
    habit = client.post(
        "/api/habits", json={"name": "Run", "category": "Fitness"}
    ).json()

    resp = client.patch(f"/api/habits/{habit['id']}", json={"name": "Run 5k"})

    assert resp.status_code == 200
    body = resp.json()
    assert body["name"] == "Run 5k"
    assert body["category"] == "Fitness"  # untouched


def test_update_habit_explicit_null_clears_field(client, auth_user):
    habit = client.post(
        "/api/habits", json={"name": "Run", "category": "Fitness"}
    ).json()

    resp = client.patch(f"/api/habits/{habit['id']}", json={"category": None})

    assert resp.status_code == 200
    assert resp.json()["category"] is None


def test_update_habit_archive_and_unarchive(client, auth_user):
    habit = client.post("/api/habits", json={"name": "Run"}).json()

    archived = client.patch(f"/api/habits/{habit['id']}", json={"archived": True})
    assert archived.json()["archived"] is True

    unarchived = client.patch(f"/api/habits/{habit['id']}", json={"archived": False})
    assert unarchived.json()["archived"] is False


def test_update_habit_404_for_missing_habit(client, auth_user):
    resp = client.patch("/api/habits/999999", json={"name": "Nope"})
    assert resp.status_code == 404


def test_delete_habit(client, auth_user):
    habit = client.post("/api/habits", json={"name": "Temp"}).json()

    resp = client.delete(f"/api/habits/{habit['id']}")
    assert resp.status_code == 204

    resp = client.get("/api/habits")
    assert resp.json() == []


def test_delete_habit_404_for_other_users_habit(client, auth_user):
    habit = client.post("/api/habits", json={"name": "Mine"}).json()

    other_user_id = uuid.uuid4()
    app.dependency_overrides[get_current_user_id] = lambda: other_user_id
    try:
        resp = client.delete(f"/api/habits/{habit['id']}")
        assert resp.status_code == 404
    finally:
        app.dependency_overrides[get_current_user_id] = lambda: auth_user
