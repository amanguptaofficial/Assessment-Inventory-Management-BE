"""Application configuration.

All settings are loaded from environment variables (12-factor style) so the same
image can run unchanged across local, staging and production. A local `.env` file
is read automatically for developer convenience but never required.
"""
from functools import lru_cache
from typing import Annotated, List

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


class Settings(BaseSettings):
    """Strongly-typed application settings sourced from the environment."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # --- Application -------------------------------------------------------
    PROJECT_NAME: str = "Inventory & Order Management API"
    API_V1_PREFIX: str = "/api"
    ENVIRONMENT: str = "development"
    DEBUG: bool = False

    # --- Database ---------------------------------------------------------
    # Full SQLAlchemy URL. When absent it is assembled from the parts below,
    # which is how docker-compose wires the service together.
    DATABASE_URL: str | None = None
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_HOST: str = "db"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "inventory"

    # --- CORS -------------------------------------------------------------
    # Comma-separated list of allowed origins for the browser frontend.
    # `NoDecode` stops pydantic-settings from JSON-parsing the env value so our
    # comma-splitting validator below receives the raw string.
    BACKEND_CORS_ORIGINS: Annotated[List[str], NoDecode] = Field(
        default_factory=lambda: ["*"]
    )

    # --- Business rules ---------------------------------------------------
    LOW_STOCK_THRESHOLD: int = 10

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def _split_origins(cls, value):
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value

    @property
    def sqlalchemy_database_uri(self) -> str:
        if self.DATABASE_URL:
            # Render/Railway hand out `postgres://`; SQLAlchemy needs `postgresql://`.
            return self.DATABASE_URL.replace("postgres://", "postgresql://", 1)
        return (
            f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )


@lru_cache
def get_settings() -> Settings:
    """Return a cached Settings instance (read the environment only once)."""
    return Settings()


settings = get_settings()
