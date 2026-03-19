from __future__ import annotations

import os
from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker


DB_FILENAME = os.getenv("GIGSHIELD_DB_FILENAME", "gigshield.db")
DB_URL = os.getenv("GIGSHIELD_DB_URL", f"sqlite:///{DB_FILENAME}")

# SQLite needs special handling for multithreaded apps like APScheduler.
engine = create_engine(
    DB_URL,
    connect_args={"check_same_thread": False} if DB_URL.startswith("sqlite") else {},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

