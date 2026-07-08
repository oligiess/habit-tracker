from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import Base, engine, get_db
from models import Habit
from schemas import HabitCreate, HabitOut


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(lifespan=lifespan)

# Frontend will be served from these origins during local dev.
# Both localhost and 127.0.0.1 are listed because browsers treat them
# as different origins for CORS purposes even though they resolve the same.
origins = [
    "http://localhost:5500",
    "http://127.0.0.1:5500",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "ok", "message": "Backend is alive"}


@app.post("/api/habits", response_model=HabitOut, status_code=201)
def create_habit(habit: HabitCreate, db: Session = Depends(get_db)):
    new_habit = Habit(name=habit.name)
    db.add(new_habit)
    db.commit()
    db.refresh(new_habit)
    return new_habit
