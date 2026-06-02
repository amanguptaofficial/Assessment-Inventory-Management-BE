"""FastAPI application factory and global wiring."""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.router import api_router
from app.core.config import settings
from app.core.database import Base, engine
from app.core.exceptions import AppError

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("app")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on boot. For a larger system this would be Alembic
    # migrations; create_all keeps the assessment self-contained.
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables ensured. Environment=%s", settings.ENVIRONMENT)
    yield


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version="1.0.0",
        debug=settings.DEBUG,
        docs_url="/docs",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Map every domain error to a clean JSON envelope + correct status code.
    @app.exception_handler(AppError)
    async def handle_app_error(request: Request, exc: AppError):  # noqa: ARG001
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.message})

    @app.get("/health", tags=["Health"])
    def health() -> dict:
        return {"status": "ok", "environment": settings.ENVIRONMENT}

    @app.get("/", tags=["Health"])
    def root() -> dict:
        return {"service": settings.PROJECT_NAME, "docs": "/docs"}

    app.include_router(api_router, prefix=settings.API_V1_PREFIX)
    return app


app = create_app()
