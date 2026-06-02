# syntax=docker/dockerfile:1

###############################################################################
# Builder stage — install dependencies into an isolated prefix.
###############################################################################
FROM python:3.12-slim AS builder

ENV PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /install

# Build deps needed only to compile wheels (psycopg2). Kept out of final image.
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --prefix=/install/deps -r requirements.txt


###############################################################################
# Runtime stage — slim image with only what is needed to run.
###############################################################################
FROM python:3.12-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/install/deps/bin:$PATH" \
    PYTHONPATH="/install/deps/lib/python3.12/site-packages"

# libpq is the only runtime system dependency for psycopg2.
RUN apt-get update \
    && apt-get install -y --no-install-recommends libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Run as a non-root user for security.
RUN useradd --create-home --uid 1000 appuser
WORKDIR /app

COPY --from=builder /install/deps /install/deps
COPY . .

USER appuser
EXPOSE 8000

# Hosting platforms (Render/Railway/Fly) inject $PORT; default to 8000 locally.
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
