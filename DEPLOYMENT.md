# Deployment Guide

This project deploys cleanly on free tiers: **backend on Render/Railway/Fly.io**,
**frontend on Vercel/Netlify**, and the **backend image on Docker Hub**.

---

## 1. Database (managed PostgreSQL)

Create a free PostgreSQL instance (Render PostgreSQL, Railway Postgres, Neon,
or Supabase). Copy its connection string — you'll set it as `DATABASE_URL` on
the backend. `postgres://…` URLs are automatically normalised to
`postgresql://…` by the app.

---

## 2. Backend → Render (example)

1. Push this repo to GitHub.
2. Render → **New → Web Service** → connect the repo.
3. Settings:
   - **Root Directory:** `backend`
   - **Runtime:** Docker (it picks up `backend/Dockerfile`)
   - **Environment variables:**
     | Key | Value |
     | --- | --- |
     | `DATABASE_URL` | _your managed Postgres URL_ |
     | `ENVIRONMENT` | `production` |
     | `DEBUG` | `false` |
     | `BACKEND_CORS_ORIGINS` | `https://<your-frontend>.vercel.app` |
4. Deploy. Render injects `$PORT`; the container already binds to it.
5. Verify: `https://<your-backend>.onrender.com/health` → `{"status":"ok"}`.

> Railway / Fly.io are equivalent: point them at `backend/Dockerfile`, set the
> same env vars. Fly uses `fly launch` from the `backend/` directory.

---

## 3. Frontend → Vercel (example)

1. Vercel → **New Project** → import the repo.
2. Settings:
   - **Root Directory:** `frontend`
   - **Framework preset:** Vite
   - **Build command:** `npm run build` · **Output:** `dist`
   - **Environment variable:** `VITE_API_BASE_URL = https://<your-backend>.onrender.com/api`
3. Deploy → you get `https://<your-frontend>.vercel.app`.
4. Go back to the backend and ensure `BACKEND_CORS_ORIGINS` contains this URL,
   then redeploy the backend.

**Netlify:** same build settings; add a `_redirects` file containing
`/* /index.html 200` for SPA routing, and set `VITE_API_BASE_URL` in the env.

---

## 4. Publish the backend image to Docker Hub

```bash
cd backend
docker build -t <dockerhub-username>/inventory-backend:1.0.0 \
             -t <dockerhub-username>/inventory-backend:latest .
docker login
docker push <dockerhub-username>/inventory-backend:1.0.0
docker push <dockerhub-username>/inventory-backend:latest
```

Image link: `https://hub.docker.com/r/<dockerhub-username>/inventory-backend`

(For multi-arch: `docker buildx build --platform linux/amd64,linux/arm64 --push -t <user>/inventory-backend:latest .`)

---

## 5. Submission checklist

- [ ] GitHub repository link (frontend + backend)
- [ ] Docker Hub image link for the backend
- [ ] Live frontend URL (Vercel/Netlify)
- [ ] Live backend API URL (e.g. `…/docs` and `…/health` reachable)
- [ ] Frontend `VITE_API_BASE_URL` points at the live backend `/api`
- [ ] Backend `BACKEND_CORS_ORIGINS` includes the live frontend origin
