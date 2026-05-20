# ForecastOS

ForecastOS is a full-stack weather intelligence MVP for the PM Accelerator AI Engineer Intern technical assessment.

## Day 1 Status

- FastAPI backend scaffolded with typed weather search responses.
- Next.js frontend scaffolded with a responsive weather dashboard.
- OpenWeatherMap integration is routed through the backend so API keys stay server-side.
- Current weather, 5-day forecast, AQI, and simple planning intelligence are wired into one endpoint.

## Day 2 Status

- SQLite persistence via SQLAlchemy (`backend/forecastos.db` is created automatically on startup).
- Save searches from the dashboard with optional label and notes (`save: true` on weather search).
- Records CRUD API and `/records` UI for list, edit metadata, and delete.
- Export saved records as JSON, CSV, or Markdown.
- Browser geolocation flow for current-location weather search.

## Local Setup

Backend:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000
```

Frontend:

```powershell
cd frontend
copy .env.example .env.local
npm install
npm run dev
```

Set `OPENWEATHER_API_KEY` in `backend/.env` before running real searches. After changing `.env`, restart `uvicorn` (or rely on code reload; settings are re-read each request).

`DATABASE_URL` defaults to `sqlite:///./forecastos.db` (file lives in the `backend/` folder when you run uvicorn from there). The database file is gitignored.

## Troubleshooting

- **Uvicorn showed `502` on `/weather/search`**: Previously an invalid OpenWeather key (their HTTP 401) was mapped to 502. It is now returned as **401** so logs match the real problem. If OpenWeather still says “Invalid API key”, verify the key on [openweathermap.org](https://home.openweathermap.org/api_keys), wait for activation, and test in the browser:  
  `https://api.openweathermap.org/data/2.5/weather?q=London&appid=YOUR_KEY&units=metric`
- **Other provider errors**: The JSON error body may include `details.provider_message` from OpenWeather.
- **Geolocation blocked**: Allow location permission for `http://localhost:3000` or search by city instead.

## API

- Backend base URL: `http://localhost:8000/api/v1`
- FastAPI docs: `http://localhost:8000/docs`
- Weather search: `POST /api/v1/weather/search` (set `"save": true` to persist)
- Records: `GET /api/v1/records`, `GET/PATCH/DELETE /api/v1/records/{id}`
- Export: `GET /api/v1/export?format=json|csv|markdown`, `GET /api/v1/records/{id}/export?format=...`

## Next Milestone

Day 3 adds trend charts, polish, PM Accelerator info, tests, and demo video.
