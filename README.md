# Inventory & Order Management System

A production-ready, fully containerized full-stack application for managing
**products, customers, orders and inventory**. Built with a Python (FastAPI)
backend, a React frontend, and a PostgreSQL database — orchestrated with Docker
Compose.

| Layer    | Technology                                  |
| -------- | ------------------------------------------- |
| Frontend | React 18 (JavaScript) + Vite + Tailwind CSS v4 + React Router |
| Backend  | Python 3.12 + FastAPI + SQLAlchemy 2        |
| Database | PostgreSQL 16                               |
| Infra    | Docker, Docker Compose, nginx               |

---

## ✨ Features

**Products** — create, list, view, update, delete · unique SKU · non-negative stock
**Customers** — create, list, view, delete · unique email
**Orders** — multi-product orders · automatic stock checks & decrement · server-side total · cancel restores stock
**Dashboard** — totals for products / customers / orders + low-stock list

### Business rules enforced by the backend
- Product SKU is unique; customer email is unique.
- Product quantity can never go negative (validated **and** DB constraint).
- Orders are rejected when inventory is insufficient (`409`).
- Creating an order **automatically reduces stock**; deleting one restores it.
- Order totals are **always computed server-side** — never trusted from the client.
- Consistent validation (`422`) and error envelopes with correct HTTP status codes.

---

## 🏗 Architecture

```
                ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
  Browser  ───▶ │  Frontend    │ ───▶ │  Backend     │ ───▶ │  PostgreSQL  │
                │  React+nginx │ HTTP │  FastAPI     │ SQL  │              │
                │  :8080       │      │  :8000 /api  │      │  :5432       │
                └──────────────┘      └──────────────┘      └──────────────┘
```

The backend is layered for testability and reuse:

```
api/routes  →  thin HTTP handlers (status codes, request/response models)
services    →  business logic & rules (stock, totals, uniqueness)
models      →  SQLAlchemy ORM
schemas     →  Pydantic validation (request/response)
core        →  config (env), database, domain exceptions
```

---

## 🚀 Quick start (Docker — recommended)

Prerequisites: Docker + Docker Compose.

```bash
cp .env.example .env          # tweak values if you wish
docker compose up --build
```

Then open:

| Service          | URL                              |
| ---------------- | -------------------------------- |
| Frontend (app)   | http://localhost:8080            |
| Backend API      | http://localhost:8000/api        |
| API docs (Swagger) | http://localhost:8000/docs     |
| Health check     | http://localhost:8000/health     |

Optional — load sample data:

```bash
docker compose exec backend python -m app.seed
```

Stop everything (data persists in the `iom_postgres_data` named volume):

```bash
docker compose down
```

---

## 🧑‍💻 Local development (without Docker)

Run the two apps separately — see each sub-README for details:

- **Backend:** [`backend/README.md`](backend/README.md)
- **Frontend:** [`frontend/README.md`](frontend/README.md)

---

## ✅ Tests

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
pytest
```

17 tests cover products, customers, orders (stock/total logic) and the dashboard.

---

## ☁️ Deployment

The app is designed for free hosting tiers:

- **Backend** → Render / Railway / Fly.io (uses the backend `Dockerfile`; reads `DATABASE_URL`).
- **Frontend** → Vercel / Netlify (set `VITE_API_BASE_URL` to the live backend `/api` URL).

Full step-by-step instructions, environment variables and the Docker Hub
publishing flow are in [`DEPLOYMENT.md`](DEPLOYMENT.md).

---

## 📁 Repository structure

```
.
├── docker-compose.yml        # full-stack orchestration
├── .env.example              # root compose env
├── DEPLOYMENT.md             # hosting + Docker Hub guide
├── backend/                  # FastAPI service (see backend/README.md)
│   ├── app/                  # config, models, schemas, services, api
│   ├── tests/                # pytest suite
│   └── Dockerfile
└── frontend/                 # React app (see frontend/README.md)
    ├── src/                  # api, components, pages, hooks, context
    ├── nginx.conf
    └── Dockerfile
```
