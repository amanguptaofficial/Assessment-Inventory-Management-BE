"""Pytest fixtures.

Tests run against an isolated in-memory SQLite database so they are fast and
need no external services. The `get_db` dependency is overridden to use the
test session.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.main import app


@pytest.fixture
def db_session():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,  # one shared in-memory DB for the connection
    )
    TestingSessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    # Note: TestClient is intentionally NOT used as a context manager so the
    # startup lifespan (which would create tables on the real Postgres engine)
    # does not run — the db_session fixture already created the test schema.
    test_client = TestClient(app)
    yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def product(client):
    resp = client.post(
        "/api/products",
        json={"name": "Wireless Mouse", "sku": "WM-001", "price": 19.99, "quantity_in_stock": 50},
    )
    assert resp.status_code == 201
    return resp.json()


@pytest.fixture
def customer(client):
    resp = client.post(
        "/api/customers",
        json={"full_name": "Jane Doe", "email": "jane@example.com", "phone": "+1-555-0100"},
    )
    assert resp.status_code == 201
    return resp.json()
