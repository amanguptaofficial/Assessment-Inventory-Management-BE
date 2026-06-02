# Backend — Inventory & Order Management API

Python **FastAPI** service backed by **PostgreSQL** via **SQLAlchemy 2**.

## Tech & layout

```
app/
├── main.py                 # app factory, CORS, exception handler, lifespan
├── core/
│   ├── config.py           # env-based settings (pydantic-settings)
│   ├── database.py         # engine, session, get_db dependency
│   └── exceptions.py       # domain errors → HTTP status codes
├── models/                 # SQLAlchemy ORM (Product, Customer, Order, OrderItem)
├── schemas/                # Pydantic request/response models
├── services/               # business logic (stock, totals, uniqueness)
├── api/routes/             # HTTP handlers per resource
└── seed.py                 # optional sample-data loader
tests/                      # pytest suite (SQLite in-memory)
```

The handler → service → model separation keeps business rules reusable and unit-testable.

## Configuration (environment variables)

Copy `.env.example` to `.env`. All values have sensible defaults.

| Variable | Default | Description |
| --- | --- | --- |
| `DATABASE_URL` | _(unset)_ | Full SQLAlchemy URL. If set, overrides the parts below. Render/Railway provide this. |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` | `postgres` | DB credentials (used to assemble the URL). |
| `POSTGRES_HOST` / `POSTGRES_PORT` | `db` / `5432` | DB location. |
| `POSTGRES_DB` | `inventory` | Database name. |
| `BACKEND_CORS_ORIGINS` | `*` | Comma-separated allowed browser origins. |
| `ENVIRONMENT` / `DEBUG` | `development` / `false` | Runtime flags. |
| `LOW_STOCK_THRESHOLD` | `10` | Products at or below this are "low stock". |

> `postgres://` URLs from hosting providers are auto-normalised to `postgresql://`.

## Run locally

```bash
python3.12 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# point at a local Postgres, or set DATABASE_URL
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/inventory

uvicorn app.main:app --reload
```

- Swagger UI: http://localhost:8000/docs
- Health: http://localhost:8000/health
- Load demo data: `python -m app.seed`

## Run with Docker

```bash
docker build -t inventory-backend .
docker run -p 8000:8000 --env-file .env inventory-backend
```

The image is multi-stage and slim (`python:3.12-slim`), runs as a non-root user,
and respects the `$PORT` injected by Render/Railway/Fly.

## Tests

```bash
pytest
```

Tests use an in-memory SQLite database (no external services needed) and cover
every business rule: unique SKU/email, non-negative stock, insufficient-stock
rejection, automatic stock decrement/restock, and server-side totals.

## API reference

Base path: `/api`

### Products
| Method | Path | Body | Success |
| --- | --- | --- | --- |
| `GET` | `/products` | — | `200` list |
| `POST` | `/products` | `{name, sku, price, quantity_in_stock}` | `201` |
| `GET` | `/products/{id}` | — | `200` |
| `PUT` | `/products/{id}` | partial product | `200` |
| `DELETE` | `/products/{id}` | — | `204` |

### Customers
| Method | Path | Body | Success |
| --- | --- | --- | --- |
| `GET` | `/customers` | — | `200` |
| `POST` | `/customers` | `{full_name, email, phone}` | `201` |
| `GET` | `/customers/{id}` | — | `200` |
| `DELETE` | `/customers/{id}` | — | `204` |

### Orders
| Method | Path | Body | Success |
| --- | --- | --- | --- |
| `GET` | `/orders` | — | `200` |
| `POST` | `/orders` | `{customer_id, items:[{product_id, quantity}]}` | `201` |
| `GET` | `/orders/{id}` | — | `200` |
| `DELETE` | `/orders/{id}` | — | `204` (restocks) |

### Dashboard
| Method | Path | Success |
| --- | --- | --- |
| `GET` | `/dashboard/summary` | `200` totals + low-stock list |

### Error codes
`400` bad request · `404` not found · `409` conflict (duplicate / insufficient
stock) · `422` validation error.
