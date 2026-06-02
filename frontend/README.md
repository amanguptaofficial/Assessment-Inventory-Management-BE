# Frontend — Inventory & Order Management

Responsive **React 18** single-page app (JavaScript) built with **Vite**,
talking to the FastAPI backend.

## Layout

```
src/
├── main.jsx                # entry: router + toast provider
├── App.jsx                 # routes
├── api/
│   ├── client.js           # axios instance (env base URL) + error normaliser
│   └── resources.js        # products/customers/orders/dashboard API wrappers
├── components/             # Layout, Modal, ConfirmDialog, Field, StateViews
├── context/ToastContext.jsx# global success/error toasts
├── hooks/useFetch.js       # reusable loading/error/refetch data hook
├── pages/                  # Dashboard, Products, Customers, Orders
└── styles/index.css        # design system (responsive)
```

### Highlights
- **Reusable building blocks** — one `Modal`, `ConfirmDialog`, `Field`, and a
  `useFetch` hook power every page, so screens stay small and consistent.
- **Clear feedback** — inline form validation, plus global success/error toasts.
- **Backend-driven errors** — FastAPI validation and conflict messages are
  surfaced verbatim to the user (e.g. "A product with SKU 'X' already exists").
- **Responsive** — works on desktop and mobile (CSS grid + breakpoints).

## Configuration

Single environment variable, read at **build time** by Vite:

| Variable | Example | Description |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `http://localhost:8000/api` | Backend API base URL. |

Copy `.env.example` to `.env` for local dev. In production (Vercel/Netlify) set
it in the project's environment settings to the live backend `/api` URL.

## Run locally

```bash
npm install
cp .env.example .env        # adjust VITE_API_BASE_URL if needed
npm run dev                 # http://localhost:5173
```

Make sure the backend is running and its `BACKEND_CORS_ORIGINS` includes
`http://localhost:5173`.

## Build for production

```bash
npm run build               # outputs to dist/
npm run preview             # serve the build locally
```

## Run with Docker

The image builds the app and serves it with nginx (SPA fallback included):

```bash
docker build --build-arg VITE_API_BASE_URL=http://localhost:8000/api -t inventory-frontend .
docker run -p 8080:80 inventory-frontend   # http://localhost:8080
```

## Deploy (Vercel / Netlify)

- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Environment variable:** `VITE_API_BASE_URL = https://<your-backend>/api`

A SPA rewrite (all routes → `/index.html`) is needed; on Netlify add a
`_redirects` file with `/* /index.html 200`, on Vercel it is automatic.
