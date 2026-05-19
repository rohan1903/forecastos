# ForecastOS

ForecastOS is a full-stack weather intelligence MVP for the PM Accelerator AI Engineer Intern technical assessment.

## Day 1 Status

- FastAPI backend scaffolded with typed weather search responses.
- Next.js frontend scaffolded with a responsive weather dashboard.
- OpenWeatherMap integration is routed through the backend so API keys stay server-side.
- Current weather, 5-day forecast, AQI, and simple planning intelligence are wired into one endpoint.

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

## Troubleshooting

- **Uvicorn showed `502` on `/weather/search`**: Previously an invalid OpenWeather key (their HTTP 401) was mapped to 502. It is now returned as **401** so logs match the real problem. If OpenWeather still says “Invalid API key”, verify the key on [openweathermap.org](https://home.openweathermap.org/api_keys), wait for activation, and test in the browser:  
  `https://api.openweathermap.org/data/2.5/weather?q=London&appid=YOUR_KEY&units=metric`
- **Other provider errors**: The JSON error body may include `details.provider_message` from OpenWeather.

## API

- Backend base URL: `http://localhost:8000/api/v1`
- FastAPI docs: `http://localhost:8000/docs`
- Weather search: `POST /api/v1/weather/search`

## Next Milestone

Day 2 adds SQLite persistence, CRUD records, current-location flow, and export support.
