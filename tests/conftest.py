import os

# Must run before any `backend.*` import -- database.py/auth.py call os.getenv
# at import time and raise RuntimeError if unset. Setting these here first
# means their own load_dotenv() calls (override=False by default) won't
# clobber them with the real repo-root .env's values.
#
# Local runs need a real Postgres reachable at this DATABASE_URL (CI uses a
# postgres:16 service container instead -- see .github/workflows/test.yml):
#   docker run --rm -d --name habitdeck-test-db -e POSTGRES_PASSWORD=postgres \
#     -e POSTGRES_DB=habitdeck_test -p 5432:5432 postgres:16
os.environ.setdefault(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/habitdeck_test",
)
os.environ.setdefault("SUPABASE_URL", "https://test.supabase.co")
os.environ.setdefault("SUPABASE_SERVICE_ROLE_KEY", "test-service-role-key")

import uuid

import pytest
from sqlalchemy import text
from starlette.testclient import TestClient

from backend.auth import get_current_user_id
from backend.database import engine
from backend.main import app

TEST_USER_ID = uuid.uuid4()


@pytest.fixture(scope="session")
def client():
    # Entering the context triggers FastAPI's lifespan, which runs
    # Base.metadata.create_all(bind=engine) -- the same schema-creation path
    # the real app uses.
    with TestClient(app) as c:
        yield c


@pytest.fixture(autouse=True)
def _clean_tables(client):
    yield
    with engine.begin() as conn:
        conn.execute(text("DELETE FROM completions"))
        conn.execute(text("DELETE FROM habits"))


@pytest.fixture(autouse=True)
def _mock_delete_supabase_user(monkeypatch):
    monkeypatch.setattr("backend.main.delete_supabase_user", lambda user_id: None)


@pytest.fixture
def auth_user(client):
    app.dependency_overrides[get_current_user_id] = lambda: TEST_USER_ID
    yield TEST_USER_ID
    app.dependency_overrides.pop(get_current_user_id, None)
