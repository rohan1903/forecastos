<div align="center">

# ForecastOS

A full-stack weather intelligence dashboard — real-time conditions, forecasts, air quality, and planning insights for travel and daily decisions.

[Live Demo](https://forecastos-seven.vercel.app) • [Getting Started](#getting-started) • [Deployment](#deployment) • [API Docs](https://forecastos-api.onrender.com/docs)

<br />

<img alt="Python 3.11" src="https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python&logoColor=white" />
<img alt="FastAPI" src="https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white" />
<img alt="TypeScript 5" src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" />
<img alt="Next.js 16" src="https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=next.js&logoColor=white" />
<img alt="React 19" src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" />
<img alt="Tailwind CSS 4" src="https://img.shields.io/badge/Tailwind-4-38B2AC?style=flat-square&logo=tailwindcss&logoColor=white" />
<img alt="SQLite" src="https://img.shields.io/badge/SQLite-003B57?style=flat-square&logo=sqlite&logoColor=white" />
<img alt="OpenWeatherMap" src="https://img.shields.io/badge/OpenWeather-API-EB6F2E?style=flat-square&logo=openweathermap&logoColor=white" />

</div>

---

## Live application

| Resource | URL |
|----------|-----|
| **Web app** | [forecastos-seven.vercel.app](https://forecastos-seven.vercel.app) |
| **REST API** | [forecastos-api.onrender.com/api/v1](https://forecastos-api.onrender.com/api/v1) |
| **Interactive API docs** | [forecastos-api.onrender.com/docs](https://forecastos-api.onrender.com/docs) |
| **Health check** | [GET /api/v1/health](https://forecastos-api.onrender.com/api/v1/health) |

> **Note:** The API runs on Render’s free tier and may **cold-start** after idle periods (first request can take 30–60s). Saved records use SQLite on ephemeral disk and may not persist across redeploys — fine for demos; see [Deployment](#deployment).

---

## Overview

ForecastOS is a portfolio full-stack application built for the **PM Accelerator AI Engineer Intern** assessment. It covers both **frontend** and **backend** tracks in a single product: a weather dashboard that goes beyond lookup to support **decision-making** — risk scoring, AQI context, saved searches, and multi-format exports.

**Try it:** search `London, UK` or `Goa, IN`, save a result, then open **Saved Records** to edit, export, or delete.

---

## Features

| Area | Capabilities |
|------|----------------|
| **Search** | Cities, states/regions, autocomplete, browser geolocation |
| **Weather** | Current conditions, 5-day forecast, air quality (OpenWeatherMap) |
| **Intelligence** | Risk score, recommendations, clothing hints, anomaly notes |
| **Persistence** | Save searches with label and notes (SQLite + SQLAlchemy) |
| **Records** | List, edit metadata, delete — `/records` |
| **Export** | JSON, CSV, and Markdown (bulk or per record) |
| **Security** | API keys server-side only; typed Pydantic + TypeScript contracts |

---

## Tech stack

| Layer | Stack |
|-------|--------|
| **Frontend** | Next.js 16 · React 19 · TypeScript 5 · Tailwind CSS 4 · Lucide · Zod |
| **Backend** | FastAPI · Pydantic · SQLAlchemy · httpx · Uvicorn |
| **Database** | SQLite (`backend/forecastos.db`, auto-created, gitignored) |
| **External APIs** | OpenWeatherMap · OpenStreetMap Nominatim (states/regions) |
| **Hosting** | Vercel (frontend) · Render (backend) |

**Monorepo layout**

```text
forecastos/
├── backend/     FastAPI services, models, SQLite
├── frontend/    Next.js App Router dashboard
└── docs/        Deployment guide
```

---

## Architecture

```text
Browser (Next.js on Vercel)
    → typed API client (NEXT_PUBLIC_API_BASE_URL)
    → FastAPI /api/v1 (Render)
        → WeatherService
        → OpenWeatherClient + NominatimClient
        → IntelligenceService + RecordService
        → SQLite
    → Dashboard UI (cards, records, exports)
```

**Search flow:** location resolve → parallel weather/forecast/AQI fetch → risk & recommendations → optional save → UI render.

---

## Getting started

### Prerequisites

- Python **3.11+**
- Node.js **18+**
- [OpenWeatherMap API key](https://home.openweathermap.org/api_keys)

### Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
```

Edit `backend/.env`:

```env
OPENWEATHER_API_KEY=your_openweather_api_key
DATABASE_URL=sqlite:///./forecastos.db
BACKEND_CORS_ORIGINS=http://localhost:3000
```

```powershell
uvicorn app.main:app --reload --port 8000
```

### Frontend

```powershell
cd frontend
copy .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

### Smoke test

1. Search `London, UK` or `Goa, IN`
2. **Save** with a label → confirm success
3. **Saved Records** → edit, export (JSON/CSV/Markdown), delete
4. **Use current location** (allow browser permission)

---

## API reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Service health |
| `POST` | `/weather/search` | Search; `"save": true` to persist |
| `GET` | `/weather/suggestions?q=` | Autocomplete |
| `GET` | `/records` | List saved records |
| `GET` | `/records/{id}` | Single record |
| `PATCH` | `/records/{id}` | Update label, notes, dates |
| `DELETE` | `/records/{id}` | Delete record |
| `GET` | `/export?format=json\|csv\|markdown` | Export all |

**Example search body**

```json
{
  "query": "London, UK",
  "input_type": "query",
  "save": true,
  "label": "Weekend trip",
  "notes": "Check rain and AQI"
}
```

Full interactive documentation: [forecastos-api.onrender.com/docs](https://forecastos-api.onrender.com/docs)

---

## Environment variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `OPENWEATHER_API_KEY` | `backend/.env` | Weather provider auth |
| `DATABASE_URL` | `backend/.env` | DB connection string |
| `BACKEND_CORS_ORIGINS` | `backend/.env` | Allowed frontend origins (comma-separated) |
| `NEXT_PUBLIC_API_BASE_URL` | `frontend/.env.local` | Backend API base URL |

Never commit `.env` or `.env.local`. Use `.env.example` files as templates.

**Production (hosted)**

| Variable | Platform |
|----------|----------|
| `OPENWEATHER_API_KEY`, `DATABASE_URL`, `BACKEND_CORS_ORIGINS` | Render |
| `NEXT_PUBLIC_API_BASE_URL` | Vercel |

---

## Deployment

Step-by-step guide: **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)**

| Service | Role |
|---------|------|
| [Vercel](https://vercel.com) | Next.js frontend (`frontend/`) |
| [Render](https://render.com) | FastAPI backend (`backend/`) |

Config in repo: `render.yaml`, `frontend/vercel.json`, `backend/Procfile`, `backend/railway.toml`.

**SQLite on free hosting:** saved records may reset after redeploy or restart. Weather search still works. For durable data, switch `DATABASE_URL` to PostgreSQL — SQLAlchemy already supports it.

---

## Engineering highlights

- **Service-layer API** — thin routes; logic in dedicated services
- **Dual geocoding** — OpenWeather (cities) + Nominatim (states/regions)
- **Normalized + raw storage** — fast lists plus full provider payloads in JSON columns
- **Rule-based intelligence** — risk and recommendations without a paid LLM
- **Independent deploys** — frontend and backend scale and ship separately

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Invalid API key | Verify at [openweathermap.org/api_keys](https://home.openweathermap.org/api_keys); new keys may take minutes to activate |
| CORS errors (production) | Set `BACKEND_CORS_ORIGINS` to include `https://forecastos-seven.vercel.app` |
| Frontend hits `localhost` | Set `NEXT_PUBLIC_API_BASE_URL` on Vercel and **redeploy** |
| Slow first API call | Render cold start — wait and retry |
| Records disappeared | Ephemeral SQLite on free tier after redeploy |

---

## PM Accelerator

Developed for the **PM Accelerator AI Engineer Intern** technical assessment — demonstrating full-stack delivery: UX, REST API design, third-party integrations, persistence, and export workflows.

---

## Author

**Rohan** — [GitHub @rohan1903](https://github.com/rohan1903)

---

## Roadmap

- [x] Production deployment (Vercel + Render)
- [ ] Demo video and README screenshots
- [ ] Trend charts (Recharts) and expanded tests
- [ ] PostgreSQL for durable production data
- [ ] Optional — auth, LLM summaries, location comparison

---

## License

Assessment / portfolio project. All rights reserved unless otherwise specified.
