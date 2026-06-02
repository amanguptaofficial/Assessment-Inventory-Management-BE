"""Database engine, session factory and declarative base.

`get_db` is a FastAPI dependency that yields a request-scoped session and
guarantees it is closed afterwards.
"""
from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import settings

# SQLite (used by the test suite) needs a special connect arg; Postgres does not.
_connect_args = (
    {"check_same_thread": False}
    if settings.sqlalchemy_database_uri.startswith("sqlite")
    else {}
)

engine = create_engine(
    settings.sqlalchemy_database_uri,
    pool_pre_ping=True,  # transparently recycle dropped connections
    connect_args=_connect_args,
    future=True,
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)


class Base(DeclarativeBase):
    """Declarative base shared by every ORM model."""


def get_db() -> Generator[Session, None, None]:
    """Yield a database session and ensure it is always closed."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
