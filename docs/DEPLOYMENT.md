# ForecastOS — Production Deployment Guide

Step-by-step instructions for first-time hosting. No secrets go in git — set all keys in each platform’s dashboard.

## Recommended hosting plan

| App | Service | Why |
|-----|---------|-----|
| **Frontend** (Next.js) | [Vercel](https://vercel.com) | Built for Next.js, free HTTPS, GitHub deploys, global CDN |
| **Backend** (FastAPI) | [Render](https://render.com) | Simple dashboard, free web service tier, monorepo `Root Directory`, health checks |

**Alternative backend:** [Railway](https://railway.app) — similar DX; use `backend/railway.toml` if you prefer Railway. Render is slightly easier for a first deploy (fewer CLI steps).

### SQLite on free hosting (read this)

Both Render’s and Railway’s **free** app disks are **ephemeral**:

- Saved weather records can **disappear** after a redeploy, restart, or platform maintenance.
- The DB file (`forecastos.db`) is **not** backed up automatically.
- **Weather search still works** — OpenWeather calls do not depend on SQLite.

**Fine for:** demos, recruiter links, assessment walkthroughs.

**Not fine for:** long-lived user data you must keep.

**When you need persistence:**

1. Add a managed **PostgreSQL** database (Render Postgres, Railway Postgres, or [Neon](https://neon.tech) free tier).
2. Set `DATABASE_URL` to the Postgres URL (example: `postgresql://user:pass@host/dbname`).
3. SQLAlchemy in this project already supports non-SQLite URLs; redeploy the backend once.

---

## What you will have when done

| Service | Example URL shape |
|---------|-------------------|
| Frontend | `https://forecastos.vercel.app` (or your custom name) |
| Backend API | `https://forecastos-api.onrender.com` |
| API base (for frontend env) | `https://forecastos-api.onrender.com/api/v1` |

Replace with your real URLs after deploy.

---

## Prerequisites

1. GitHub repo pushed: [github.com/rohan1903/forecastos](https://github.com/rohan1903/forecastos)
2. Accounts (free): [GitHub](https://github.com), [Vercel](https://vercel.com), [Render](https://render.com)
3. OpenWeather API key from [openweathermap.org/api_keys](https://home.openweathermap.org/api_keys)

---

## Part 1 — Deploy the backend (Render)

Do the backend **first** so you have the API URL for the frontend.

### 1. Create the web service

1. Log in to [dashboard.render.com](https://dashboard.render.com).
2. **New +** → **Web Service**.
3. Connect GitHub and select the **forecastos** repository.
4. Configure:

| Field | Value |
|-------|--------|
| **Name** | `forecastos-api` (or your choice) |
| **Region** | Closest to you / your users |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | Python 3 |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| **Instance type** | Free |

5. **Advanced** → **Health Check Path**: `/api/v1/health`

### 2. Environment variables (Render → Environment)

Add these in the Render dashboard (not in git):

| Key | Value (example — adjust URLs later) |
|-----|-------------------------------------|
| `OPENWEATHER_API_KEY` | Your real OpenWeather key |
| `DATABASE_URL` | `sqlite:///./forecastos.db` |
| `BACKEND_CORS_ORIGINS` | `http://localhost:3000` (add Vercel URL in step 4) |
| `PYTHON_VERSION` | `3.11.9` (optional but recommended) |

### 3. Deploy and copy the backend URL

1. Click **Create Web Service** and wait until status is **Live** (first build may take several minutes).
2. Copy the service URL, e.g. `https://forecastos-api.onrender.com`.
3. Smoke test in the browser or PowerShell:

```powershell
curl https://YOUR-BACKEND.onrender.com/api/v1/health
```

Expected: `{"status":"ok","service":"ForecastOS API"}`

4. Optional: open `https://YOUR-BACKEND.onrender.com/docs` for Swagger.

**Render free tier note:** The service **spins down after ~15 minutes of no traffic**. The first request after idle can take **30–60 seconds** (cold start). Normal for demos; mention it if showing live to recruiters.

### 4. Deploy the frontend (Vercel) — preview CORS

You will update CORS again after Vercel gives you the final URL. For now, continue to Part 2.

---

## Part 2 — Deploy the frontend (Vercel)

### 1. Import the project

1. Log in to [vercel.com](https://vercel.com) → **Add New…** → **Project**.
2. Import **forecastos** from GitHub.
3. Configure:

| Field | Value |
|-------|--------|
| **Framework Preset** | Next.js (auto-detected) |
| **Root Directory** | `frontend` (click Edit → set to `frontend`) |
| **Build Command** | `npm run build` (default) |
| **Output** | default |

### 2. Environment variables (Vercel → Settings → Environment Variables)

Add for **Production** (and Preview if you want preview deployments to work):

| Key | Value |
|-----|--------|
| `NEXT_PUBLIC_API_BASE_URL` | `https://YOUR-BACKEND.onrender.com/api/v1` |

Use your real Render URL from Part 1. No trailing slash after `v1`.

### 3. Deploy

1. Click **Deploy** and wait for the build to finish.
2. Copy the production URL, e.g. `https://forecastos.vercel.app`.

---

## Part 3 — Wire CORS and API URL (critical)

The browser only allows your frontend origin to call the backend if CORS matches.

### 1. Update backend CORS on Render

Render → **forecastos-api** → **Environment** → edit `BACKEND_CORS_ORIGINS`:

```env
http://localhost:3000,https://YOUR-VERCEL-APP.vercel.app
```

Rules:

- Use the **exact** Vercel production URL (scheme + host, no path).
- Multiple origins: **comma-separated, no spaces** (spaces are trimmed by the app, but avoid them).
- No trailing slash on origins.

If you use a **custom domain** on Vercel, add that origin too:

```env
http://localhost:3000,https://forecastos.vercel.app,https://yourdomain.com
```

Save → Render will **redeploy** automatically.

### 2. Confirm frontend API URL on Vercel

Vercel → Project → **Settings** → **Environment Variables**:

- `NEXT_PUBLIC_API_BASE_URL` = `https://YOUR-BACKEND.onrender.com/api/v1`

If you change it, **redeploy** (Deployments → … → Redeploy) so the build picks up the variable.

### 3. How the wiring works

```text
Browser (Vercel URL)
  → fetch(NEXT_PUBLIC_API_BASE_URL + "/weather/search")
  → Render backend
  → BACKEND_CORS_ORIGINS must include the Vercel origin
```

`NEXT_PUBLIC_*` is embedded at **build time**. Always redeploy the frontend after changing it.

---

## Part 4 — Post-deploy smoke test checklist

Run these on the **production** frontend URL.

| # | Test | Pass criteria |
|---|------|----------------|
| 1 | Health | `GET .../api/v1/health` returns `ok` |
| 2 | Search | Search `London, UK` — current weather and forecast load |
| 3 | State search | Search `Goa, IN` — results load (Nominatim) |
| 4 | Save | Save search with label → “Search saved” |
| 5 | Records | **Saved Records** lists the new row |
| 6 | Edit | Edit label/notes → saves |
| 7 | Export | Export JSON / CSV / Markdown downloads |
| 8 | Delete | Delete a record → removed from list |
| 9 | Geolocation | **Use current location** (browser may block non-HTTPS localhost; works on HTTPS Vercel) |
| 10 | Cold start | If API was idle, first search may be slow — retry once |

**If search fails:**

- Browser DevTools → **Network** → failed request URL should be your Render `/api/v1/...` URL, not `localhost`.
- **CORS error** → fix `BACKEND_CORS_ORIGINS` and redeploy backend.
- **401 / weather API** → check `OPENWEATHER_API_KEY` on Render.

---

## Production environment variable reference

### Backend (Render)

| Variable | Required | Example |
|----------|----------|---------|
| `OPENWEATHER_API_KEY` | Yes | `abc123...` |
| `DATABASE_URL` | Yes | `sqlite:///./forecastos.db` |
| `BACKEND_CORS_ORIGINS` | Yes | `http://localhost:3000,https://app.vercel.app` |
| `PYTHON_VERSION` | No | `3.11.9` |
| `NOMINATIM_USER_AGENT` | No | `ForecastOS/1.0 (your-email@example.com)` |

### Frontend (Vercel)

| Variable | Required | Example |
|----------|----------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Yes | `https://forecastos-api.onrender.com/api/v1` |

---

## Optional — Railway instead of Render

1. [railway.app](https://railway.app) → New Project → Deploy from GitHub → **forecastos**.
2. Add a service; set **Root Directory** / working directory to `backend`.
3. Start command (from `backend/railway.toml`):

   `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

4. Set the same env vars as the backend table above.
5. Generate a public domain in Railway → **Settings** → **Networking**.
6. Use that URL in Vercel as `NEXT_PUBLIC_API_BASE_URL` and in `BACKEND_CORS_ORIGINS`.

---

## Optional — custom domain

- **Vercel:** Project → Settings → Domains.
- **Render:** Service → Settings → Custom Domains.
- After adding domains, update `BACKEND_CORS_ORIGINS` and redeploy backend.

---

## Update README with live URLs

After both apps are live, add to the root `README.md` **Deployment** section:

```markdown
| App | URL |
|-----|-----|
| Live demo | https://YOUR-APP.vercel.app |
| API | https://YOUR-API.onrender.com/api/v1 |
| API docs | https://YOUR-API.onrender.com/docs |
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Frontend calls `localhost:8000` | Set `NEXT_PUBLIC_API_BASE_URL` on Vercel and **redeploy** |
| CORS blocked | Add exact Vercel URL to `BACKEND_CORS_ORIGINS`; redeploy Render |
| 502 / timeout on first request | Render cold start; wait and retry |
| Saved records vanished | Ephemeral SQLite on free tier; expected after redeploy |
| Invalid API key | Re-enter `OPENWEATHER_API_KEY` on Render; key can take minutes to activate |

---

## Local vs production quick reference

| | Local | Production |
|--|-------|------------|
| Frontend | `http://localhost:3000` | `https://*.vercel.app` |
| API | `http://localhost:8000/api/v1` | `https://*.onrender.com/api/v1` |
| Backend env file | `backend/.env` | Render dashboard |
| Frontend env file | `frontend/.env.local` | Vercel dashboard |
