import httpx


def test_delete_account_removes_habits_and_calls_supabase_delete(
    client, auth_user, monkeypatch
):
    calls = []
    monkeypatch.setattr(
        "backend.main.delete_supabase_user", lambda user_id: calls.append(user_id)
    )
    client.post("/api/habits", json={"name": "Read"})

    resp = client.delete("/api/account")

    assert resp.status_code == 204
    assert calls == [auth_user]
    assert client.get("/api/habits").json() == []


def test_delete_account_leaves_data_untouched_on_supabase_failure(
    client, auth_user, monkeypatch
):
    def raise_error(user_id):
        raise httpx.HTTPError("boom")

    monkeypatch.setattr("backend.main.delete_supabase_user", raise_error)
    client.post("/api/habits", json={"name": "Read"})

    resp = client.delete("/api/account")

    assert resp.status_code == 502
    # habit must survive -- deletion only proceeds after Supabase succeeds
    assert len(client.get("/api/habits").json()) == 1
