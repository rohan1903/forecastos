# ForecastOS - Assessment Reference

## 1. Assessment Interpretation

This project should be submitted as a full-stack weather intelligence platform that completes both the frontend and backend tracks of the AI Engineer Intern technical assessment.

The assessment expects a weather app that:

- Accepts user-input locations such as city, country, zip/postal code, landmarks, GPS coordinates, or current location.
- Retrieves real weather data from external APIs.
- Shows current weather clearly.
- Includes a 5-day forecast.
- Handles invalid input, empty results, API failures, and failed geolocation gracefully.
- Persists user searches and retrieved weather data in a database.
- Supports CRUD operations on stored weather/location records.
- Exports persisted records in at least one useful format.
- Includes a public GitHub repository, setup instructions, requirements files, and a short demo video.
- Includes the developer's name and an informational description of PM Accelerator.

The strongest submission should go beyond a tutorial-style weather app by showing backend architecture, API integration, validation, persistence, clean UI, typed contracts, and thoughtful product features.

## 2. Product Positioning

Project name: **ForecastOS**

One-line pitch:

> A full-stack weather intelligence dashboard that turns real-time weather, forecast, and air-quality data into actionable travel and daily-planning insights.

Positioning:

- Not just "weather lookup".
- A decision-support tool for people checking current conditions, planning travel, or comparing saved locations.
- Backend-first, API-driven architecture with a polished dashboard frontend.
- Portfolio-quality MVP that demonstrates practical full-stack engineering.

Primary user stories:

- As a user, I can search for weather by city, country, zip code, coordinates, or my current location.
- As a user, I can view current weather, air quality, and a 5-day forecast.
- As a user, I can save a weather search with labels and notes.
- As a user, I can review, update, and delete previous weather records.
- As a user, I can export saved weather records to JSON, CSV, or Markdown.
- As a user, I can understand risks, recommendations, and unusual conditions without manually interpreting raw metrics.

## 3. Recommended Tech Stack

### Frontend

- Next.js with App Router
- TypeScript
- TailwindCSS
- shadcn/ui
- Recharts
- Lucide React icons
- Zod for frontend validation
- Simple typed API client first; TanStack Query only if server-state complexity grows

Rationale:

- Next.js and TypeScript satisfy the frontend assessment without using Python or Java frameworks for the frontend.
- shadcn/ui gives a modern, professional dashboard feel without designing every primitive from scratch.
- Recharts is straightforward for trend visualizations.
- A lightweight API client is enough for fast execution and avoids unnecessary frontend state architecture.

### Backend

- FastAPI
- Python 3.11+
- Pydantic settings and schemas
- SQLAlchemy ORM
- httpx for external API calls
- Uvicorn

Rationale:

- FastAPI fits the user's Python/backend strengths.
- Automatic OpenAPI docs help demonstrate REST API design.
- Pydantic creates clear validation and typed API responses.
- Service-layer structure keeps external API calls, validation, and persistence separate.
- SQLAlchemy keeps the data layer portable without adding a heavy repository pattern too early.

### Database

Initial default:

- SQLite

Later upgrade path:

- PostgreSQL

Rationale:

- SQLite is the right first choice for speed, reliability, and evaluator-friendly setup.
- SQLAlchemy preserves a clean path to PostgreSQL if the project needs deployment or more realistic infrastructure later.
- Avoid Docker during initial development unless PostgreSQL deployment becomes necessary.
- The engineering signal should come from API design, validation, orchestration, persistence, exports, and documentation, not from infrastructure complexity.

### External APIs

Required:

- OpenWeatherMap Current Weather API
- OpenWeatherMap 5 Day / 3 Hour Forecast API
- OpenWeatherMap Geocoding API
- OpenWeatherMap Air Pollution API

Optional enrichment:

- OpenStreetMap/Nominatim for fallback geocoding
- YouTube Data API for location videos, only if time allows

### Stack Constraints

- Do not introduce Docker for the MVP path.
- Do not add authentication unless all required assessment features are complete.
- Do not add background workers, message queues, generic base classes, or microservice patterns.
- Keep the codebase understandable enough that an evaluator can scan it quickly and see the architecture.

## 4. High-Level Architecture

```text
ForecastOS/
  frontend/
    Next.js app
    TypeScript UI components
    Typed API client
    Dashboard, search, records, export views

  backend/
    FastAPI app
    REST routes
    Service layer
    External API clients
    Database models
    Pydantic schemas
    Export utilities

  docs/
    Assessment reference
    API notes
    Demo script

  README.md
```

Request flow:

```text
User input
  -> Next.js form validation
  -> FastAPI REST endpoint
  -> backend location resolver
  -> external weather/geocoding/AQI APIs
  -> risk and recommendation service
  -> persisted database record
  -> typed JSON response
  -> dashboard cards, charts, saved records, exports
```

Key architectural decisions:

- Frontend and backend are separate apps to clearly demonstrate full-stack capability.
- Backend owns external API integration so API keys are never exposed to the browser.
- Backend stores both normalized location fields and raw weather response snapshots.
- Frontend stays focused on interaction, presentation, loading states, and error states.
- Weather intelligence logic lives in small backend service modules for testability and reuse.
- CRUD can live in clear service functions using SQLAlchemy sessions directly; a repository layer is optional and should not be added until it removes real duplication.
- Coherence over complexity: every folder should have an obvious purpose.

## 5. Folder Structure

```text
ForecastOS/
  README.md
  .gitignore
  .env.example

  docs/
    ASSESSMENT_REFERENCE.md
    DEMO_SCRIPT.md
    API_CONTRACT.md

  backend/
    README.md
    requirements.txt
    .env.example
    app/
      main.py
      core/
        config.py
        database.py
        errors.py
      api/
        routes/
          health.py
          weather.py
          records.py
          export.py
      models/
        weather_record.py
      schemas/
        weather.py
        records.py
        export.py
        common.py
      services/
        weather_service.py
        record_service.py
        intelligence_service.py
        export_service.py
      clients/
        openweather_client.py
      utils/
        validators.py
    tests/
      test_weather_routes.py
      test_record_crud.py
      test_export_service.py

  frontend/
    README.md
    package.json
    next.config.ts
    tsconfig.json
    postcss.config.mjs
    tailwind.config.ts
    .env.example
    src/
      app/
        layout.tsx
        page.tsx
        records/
          page.tsx
      components/
        layout/
          app-shell.tsx
          header.tsx
        weather/
          search-panel.tsx
          current-weather-card.tsx
          forecast-grid.tsx
          weather-metrics.tsx
          risk-score-card.tsx
          recommendations-card.tsx
          aqi-card.tsx
          trend-chart.tsx
        records/
          records-table.tsx
          record-editor.tsx
          export-actions.tsx
        states/
          loading-card.tsx
          empty-state.tsx
          error-state.tsx
        ui/
          shadcn components
      lib/
        api-client.ts
        types.ts
        validators.ts
        formatters.ts
      hooks/
        use-geolocation.ts
        use-weather-search.ts
```

Keep this structure intentionally small. If a file becomes difficult to scan, split by feature responsibility. Do not split just to imitate enterprise architecture.

## 6. API Architecture

Base backend URL:

```text
http://localhost:8000/api/v1
```

### Health

```http
GET /health
```

Returns service status and basic dependency health.

### Weather Search

```http
POST /weather/search
```

Purpose:

- Accepts flexible location input.
- Resolves the location.
- Fetches current weather, forecast, and AQI.
- Computes product intelligence.
- Optionally persists the result.

Request:

```json
{
  "query": "Mumbai, IN",
  "input_type": "city",
  "date_start": "2026-05-19",
  "date_end": "2026-05-23",
  "save": true,
  "label": "Trip to Mumbai",
  "notes": "Check humidity and air quality"
}
```

For coordinates:

```json
{
  "latitude": 19.076,
  "longitude": 72.8777,
  "input_type": "coordinates",
  "save": true
}
```

Response:

```json
{
  "record_id": 1,
  "location": {
    "name": "Mumbai",
    "country": "IN",
    "latitude": 19.076,
    "longitude": 72.8777
  },
  "current": {
    "temperature_c": 31.2,
    "feels_like_c": 36.1,
    "humidity": 78,
    "pressure": 1008,
    "wind_speed": 5.4,
    "visibility": 6000,
    "condition": "Clouds",
    "description": "scattered clouds",
    "sunrise": "2026-05-19T06:02:00+05:30",
    "sunset": "2026-05-19T19:06:00+05:30"
  },
  "air_quality": {
    "aqi": 3,
    "label": "Moderate"
  },
  "forecast": [],
  "intelligence": {
    "risk_score": 62,
    "risk_level": "moderate",
    "summary": "Warm, humid conditions with moderate air quality.",
    "recommendations": [
      "Carry water and plan shaded breaks.",
      "Sensitive groups should monitor outdoor exposure."
    ],
    "clothing": "Light breathable clothing",
    "anomalies": []
  }
}
```

### Current Location Weather

The browser gets coordinates using the Geolocation API, then calls:

```http
POST /weather/search
```

with `input_type: "coordinates"`.

### Saved Records CRUD

```http
GET /records
```

List previous weather records with pagination and optional filtering.

```http
GET /records/{record_id}
```

Read a single saved record.

```http
POST /records
```

Create a manual saved record if needed. In the MVP, record creation mostly happens through `/weather/search`.

```http
PATCH /records/{record_id}
```

Update editable fields:

- label
- notes
- preference tags
- date range

Do not manually edit trusted API measurements by default. If the assessment expects update behavior on weather information, allow updating metadata and user-provided notes while preserving API snapshots.

```http
DELETE /records/{record_id}
```

Delete a saved record.

### Export

```http
GET /export?format=json
GET /export?format=csv
GET /export?format=markdown
GET /records/{record_id}/export?format=markdown
```

Supported formats:

- JSON
- CSV
- Markdown

MVP priority:

1. JSON
2. CSV
3. Markdown

## 7. Database Schema

Primary table: `weather_records`

```sql
CREATE TABLE weather_records (
  id INTEGER PRIMARY KEY,
  query TEXT NOT NULL,
  input_type TEXT NOT NULL,
  resolved_name TEXT NOT NULL,
  country TEXT,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  date_start DATE,
  date_end DATE,
  label TEXT,
  notes TEXT,
  temperature_c REAL,
  feels_like_c REAL,
  humidity INTEGER,
  pressure INTEGER,
  wind_speed REAL,
  visibility INTEGER,
  condition TEXT,
  description TEXT,
  sunrise TIMESTAMP,
  sunset TIMESTAMP,
  aqi INTEGER,
  aqi_label TEXT,
  risk_score INTEGER,
  risk_level TEXT,
  summary TEXT,
  recommendations_json JSON,
  forecast_json JSON,
  raw_weather_json JSON,
  raw_forecast_json JSON,
  raw_aqi_json JSON,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

SQLite is the initial implementation target. If the project later moves to PostgreSQL:

- `SERIAL` or identity columns for `id`
- `JSONB` for JSON fields
- timezone-aware timestamps where possible

Why store both normalized and raw data:

- Normalized fields make list views, sorting, filtering, and exports easy.
- Raw snapshots preserve API evidence and allow later feature expansion.
- This demonstrates good backend/data thinking without overengineering.

## 8. Backend Route Breakdown

```text
app/api/routes/health.py
  GET /api/v1/health

app/api/routes/weather.py
  POST /api/v1/weather/search
  GET  /api/v1/weather/suggestions

app/api/routes/records.py
  GET    /api/v1/records
  GET    /api/v1/records/{record_id}
  POST   /api/v1/records
  PATCH  /api/v1/records/{record_id}
  DELETE /api/v1/records/{record_id}

app/api/routes/export.py
  GET /api/v1/export
  GET /api/v1/records/{record_id}/export
```

Optional autocomplete:

```http
GET /weather/suggestions?q=del
```

Use OpenWeatherMap Geocoding API with a small limit.

## 9. Backend Service Breakdown

```text
OpenWeatherClient
  - current_weather_by_coordinates()
  - forecast_by_coordinates()
  - air_quality_by_coordinates()
  - geocode_query()
  - reverse_geocode()

WeatherService
  - resolve city/country/zip/coordinate inputs
  - validate real locations through geocoding
  - orchestrate current weather, forecast, AQI, and persistence
  - shape API response

RecordService
  - create saved record
  - list saved records
  - get saved record
  - update label, notes, and date metadata
  - delete saved record

IntelligenceService
  - risk score
  - travel recommendations
  - clothing suggestions
  - anomaly indicators
  - human-readable summary

ExportService
  - export JSON
  - export CSV
  - export Markdown
```

Keep service modules direct and readable. A separate repository layer is not required for the MVP because it adds indirection without much payoff at this size. If database logic starts repeating across routes, extract focused helpers instead of creating generic abstractions.

## 10. Product Intelligence Features

### Risk Score

Score from 0 to 100 based on:

- Extreme heat or cold
- High wind
- High humidity
- Low visibility
- Poor AQI
- Severe weather keywords
- Heavy rain or storm conditions

Risk levels:

- `low`: 0-34
- `moderate`: 35-69
- `high`: 70-100

### Recommendations

Generate deterministic rule-based recommendations for MVP:

- Hot weather: hydrate, avoid peak afternoon heat.
- Cold weather: wear layers.
- Rain: carry umbrella, check commute delays.
- Poor AQI: reduce prolonged outdoor activity.
- Low visibility: drive carefully.
- Strong wind: avoid loose outdoor items.

This is "AI/data-aware thinking" without requiring a paid LLM. If time allows, add an optional LLM-generated natural-language summary later.

### Anomaly Indicators

Simple MVP indicators:

- "Feels-like temperature is significantly higher than actual temperature."
- "AQI is elevated for sensitive groups."
- "Wind speed is higher than typical comfort threshold."
- "Visibility is reduced."

## 11. Frontend UI Breakdown

Primary layout:

- Left/top search panel
- Main current weather summary
- Forecast cards
- Charts section
- Intelligence panel
- Saved records section

Pages:

```text
/
  Main dashboard
  Search
  Current weather
  Forecast
  AQI
  Risk score
  Recommendations
  Saved recent records preview

/records
  Full CRUD table
  Record details
  Edit labels/notes
  Delete records
  Export actions
```

Core components:

- `AppShell`
- `SearchPanel`
- `CurrentWeatherCard`
- `WeatherMetrics`
- `AQICard`
- `ForecastGrid`
- `TrendChart`
- `RiskScoreCard`
- `RecommendationsCard`
- `RecordsTable`
- `RecordEditor`
- `ExportActions`
- `LoadingCard`
- `EmptyState`
- `ErrorState`

UI states to implement:

- Initial empty state: invite user to search or use current location.
- Loading state: skeleton cards during API calls.
- Error state: clear message with retry action.
- Empty records state: explain that saved searches will appear there.
- Success state: dashboard populated with weather intelligence.

## 12. Data Visualization

Use Recharts for:

- Temperature trend over forecast periods.
- Feels-like trend.
- AQI indicator or trend if multiple AQI snapshots are stored.
- Humidity and wind trend if time allows.

MVP chart:

- Line chart of forecast temperature over the next 5 days.

Nice-to-have:

- Dual-axis chart for temperature and humidity.
- AQI severity badge/chart.

## 13. Error Handling Strategy

Backend should return consistent error responses:

```json
{
  "error": {
    "code": "LOCATION_NOT_FOUND",
    "message": "Could not find a matching location.",
    "details": {
      "query": "invalid city"
    }
  }
}
```

Error cases:

- Invalid location
- Invalid coordinate range
- Invalid date range
- Missing query
- OpenWeatherMap API key missing
- External API timeout
- External API rate limit
- Database write failure
- Unsupported export format

Frontend should map these to user-friendly messages and actions.

## 14. Validation Rules

Location:

- Query must not be empty.
- Coordinates must be valid latitude/longitude.
- Zip searches should include country when possible.
- Geocoding must return at least one real result.

Date range:

- `date_start <= date_end`
- Forecast date range should not exceed what the chosen API supports.
- For OpenWeatherMap 5-day forecast, explain that future forecast data is limited to 5 days.

Update:

- Label max length, for example 80 characters.
- Notes max length, for example 500 characters.
- Empty labels allowed, but not invalid date ranges.

## 15. Recommended Dependencies

### Backend

```text
fastapi
uvicorn[standard]
sqlalchemy
pydantic-settings
httpx
python-dotenv
python-multipart
pytest
pytest-asyncio
```

Optional:

```text
aiosqlite
orjson
alembic
psycopg2-binary
```

### Frontend

```text
next
react
react-dom
typescript
tailwindcss
zod
lucide-react
recharts
class-variance-authority
clsx
tailwind-merge
@radix-ui/react-slot
```

Optional:

```text
@tanstack/react-query
```

shadcn/ui components:

- button
- card
- input
- textarea
- badge
- table
- dialog
- dropdown-menu
- select
- skeleton
- alert
- tabs
- separator

## 16. Initial Setup Commands

From repository root:

```powershell
mkdir ForecastOS
cd ForecastOS
mkdir backend frontend docs
```

Frontend:

```powershell
cd frontend
npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir --import-alias "@/*"
npx shadcn@latest init
npx shadcn@latest add button card input textarea badge table dialog dropdown-menu select skeleton alert tabs separator
npm install recharts lucide-react zod
```

Backend:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install fastapi "uvicorn[standard]" sqlalchemy pydantic-settings httpx python-dotenv python-multipart pytest pytest-asyncio
pip freeze > requirements.txt
```

Development:

```powershell
# backend
cd backend
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000

# frontend
cd frontend
npm run dev
```

## 17. Environment Variables

Root `.env.example`:

```text
OPENWEATHER_API_KEY=your_openweather_api_key
DATABASE_URL=sqlite:///./forecastos.db
BACKEND_CORS_ORIGINS=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

Backend `.env.example`:

```text
OPENWEATHER_API_KEY=your_openweather_api_key
DATABASE_URL=sqlite:///./forecastos.db
BACKEND_CORS_ORIGINS=http://localhost:3000
```

Frontend `.env.example`:

```text
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

## 18. Feature Roadmap

### Must Have

These features directly satisfy the assessment and should be completed before adding polish:

- Weather search by city/query and coordinates.
- Current weather from a real external API.
- 5-day forecast from a real external API.
- AQI integration.
- Current location support through browser geolocation.
- CRUD persistence with SQLite and SQLAlchemy.
- Export functionality for JSON, CSV, and Markdown.
- Error handling for invalid locations, bad coordinates, API failures, empty results, and unsupported export formats.
- Responsive dashboard with clear information hierarchy.
- Clean README with setup and architecture explanation.
- Short professional demo video.

### Should Have

These features make ForecastOS feel like a weather intelligence product:

- Risk scoring.
- Travel and daily-planning recommendations.
- Forecast trend charts.
- Weather intelligence summaries.
- Clothing suggestions and simple anomaly indicators.

### Optional/Stretch

Only add these after the must-have and should-have work is stable:

- Autocomplete suggestions.
- YouTube or travel/location enrichment.
- LLM-generated summaries.
- Advanced analytics and comparison views.
- Authentication.
- PostgreSQL and Docker deployment setup.

Avoid adding optional work if it risks the core submission. Execution reliability matters more than feature count.

## 19. Day-by-Day Implementation Plan

### Day 1 - Foundation and Real Weather Flow

Implementation goals:

- Scaffold `backend/` FastAPI app and `frontend/` Next.js app.
- Configure environment variables.
- Add backend health route.
- Add CORS for the frontend.
- Build OpenWeatherMap client.
- Implement location resolution for query and coordinates.
- Implement `POST /api/v1/weather/search`.
- Fetch current weather, 5-day forecast, and AQI.
- Return typed Pydantic response models.
- Build frontend dashboard shell and search panel.
- Render current weather, AQI, and forecast from real API data.

Expected output:

- Backend runs at `http://localhost:8000`.
- FastAPI docs show the health and weather routes.
- Frontend runs at `http://localhost:3000`.
- A user can search for a real city and see real weather data.

Files/components/routes to create:

- `backend/app/main.py`
- `backend/app/core/config.py`
- `backend/app/core/errors.py`
- `backend/app/api/routes/health.py`
- `backend/app/api/routes/weather.py`
- `backend/app/clients/openweather_client.py`
- `backend/app/schemas/weather.py`
- `backend/app/services/weather_service.py`
- `backend/app/services/intelligence_service.py`
- `frontend/src/app/page.tsx`
- `frontend/src/components/layout/app-shell.tsx`
- `frontend/src/components/weather/search-panel.tsx`
- `frontend/src/components/weather/current-weather-card.tsx`
- `frontend/src/components/weather/forecast-grid.tsx`
- `frontend/src/components/weather/aqi-card.tsx`
- `frontend/src/components/states/loading-card.tsx`
- `frontend/src/components/states/error-state.tsx`
- `frontend/src/lib/api-client.ts`
- `frontend/src/lib/types.ts`

Fully working before moving forward:

- Search works end-to-end with real data.
- API key stays backend-only.
- Invalid location returns a clean backend error and readable frontend message.
- Forecast cards render from API data, not fake/static values.

### Day 2 - Persistence, CRUD, Current Location, and Export

Implementation goals:

- Add SQLite database connection through SQLAlchemy.
- Add `WeatherRecord` model.
- Persist successful saved searches.
- Implement records CRUD routes.
- Add records page/table on the frontend.
- Support updating labels, notes, and date metadata.
- Support deleting saved records.
- Add browser current-location flow.
- Add export endpoints for JSON, CSV, and Markdown.
- Add frontend export actions.

Expected output:

- A user can search and save a record.
- A user can view previous records.
- A user can update notes/labels.
- A user can delete records.
- A user can export saved data.
- Current location search works or fails gracefully when permission is denied.

Files/components/routes to create:

- `backend/app/core/database.py`
- `backend/app/models/weather_record.py`
- `backend/app/schemas/records.py`
- `backend/app/schemas/export.py`
- `backend/app/api/routes/records.py`
- `backend/app/api/routes/export.py`
- `backend/app/services/record_service.py`
- `backend/app/services/export_service.py`
- `frontend/src/app/records/page.tsx`
- `frontend/src/components/records/records-table.tsx`
- `frontend/src/components/records/record-editor.tsx`
- `frontend/src/components/records/export-actions.tsx`
- `frontend/src/hooks/use-geolocation.ts`

Fully working before moving forward:

- CRUD can be demonstrated without touching the database manually.
- Exports download or display valid JSON, CSV, and Markdown.
- SQLite database is created automatically for local development.
- Date range and update validation prevent incoherent input.

### Day 3 - Intelligence, Polish, Documentation, and Submission

Implementation goals:

- Add risk scoring and weather intelligence summaries.
- Add deterministic recommendations and clothing suggestions.
- Add Recharts temperature trend chart.
- Improve dashboard visual hierarchy and responsive behavior.
- Add empty states and loading skeletons where missing.
- Add PM Accelerator information in the app and README.
- Write professional README.
- Add `.env.example` files.
- Add focused backend tests for validation, CRUD, and export.
- Create demo script and record demo video.

Expected output:

- ForecastOS feels like a real MVP, not a tutorial app.
- The backend demonstrates API orchestration, validation, persistence, typed responses, and clean errors.
- The frontend is clean, responsive, and easy to use.
- The repository is ready for evaluator review.

Files/components/routes to create or improve:

- `frontend/src/components/weather/risk-score-card.tsx`
- `frontend/src/components/weather/recommendations-card.tsx`
- `frontend/src/components/weather/trend-chart.tsx`
- `frontend/src/components/states/empty-state.tsx`
- `backend/tests/test_weather_routes.py`
- `backend/tests/test_record_crud.py`
- `backend/tests/test_export_service.py`
- `README.md`
- `docs/DEMO_SCRIPT.md`
- `.env.example`
- `backend/.env.example`
- `frontend/.env.example`

Fully working before submission:

- Must-have features are complete.
- Should-have features are visible enough to differentiate the project.
- README setup works from a fresh clone.
- Demo video clearly shows frontend, backend docs, CRUD, export, and architecture.

## 20. Cursor AI Workflow Strategy

Build incrementally and keep each step reviewable:

- Implement one vertical slice at a time: backend route, service logic, frontend API call, UI rendering, and error state.
- Keep files small. If a file grows past roughly 250 to 300 lines, split by responsibility.
- Use consistent naming: `WeatherSearchRequest`, `WeatherSearchResponse`, `WeatherRecord`, `weather_service`, `record_service`, `apiClient`.
- Keep API response shapes centralized in backend Pydantic schemas and mirrored in `frontend/src/lib/types.ts`.
- Do not duplicate weather mapping logic between routes and services. Route files should parse input, call services, and return responses.
- Do not duplicate fetch logic across components. Use `frontend/src/lib/api-client.ts`.
- Avoid generating multiple competing components for the same purpose. Prefer improving the existing component.
- Add features in this order: backend contract, backend implementation, frontend type, frontend API call, frontend component, user state handling.
- After each feature, run the smallest useful verification before moving on.

Coding style priorities:

- Clear names over clever abstractions.
- Explicit validation over silent fallbacks.
- Small service functions over generic frameworks.
- Typed request/response models over loose dictionaries.
- Practical comments only where they clarify non-obvious logic.

## 21. Frontend Priority

The frontend should look modern and credible, but early development should prioritize function and clarity.

Prioritize:

- Search usability.
- Clear current weather summary.
- Forecast readability.
- AQI and risk visibility.
- Responsive desktop-first dashboard layout.
- Loading, error, and empty states.
- Consistent spacing, cards, badges, and typography.

Avoid early:

- Animation-heavy UI.
- Complex theme systems.
- Decorative effects that do not improve comprehension.
- Multi-page polish before the main dashboard works.

Design direction:

- Minimal startup dashboard.
- Strong information hierarchy.
- Neutral technical palette with weather/AQI accent colors.
- Desktop-first layout that still works on tablets and phones.

## 22. Backend Priority

The backend should be the strongest engineering signal in ForecastOS.

Emphasize:

- Clean REST API design.
- Pydantic validation and typed response models.
- External API orchestration through a dedicated client and service layer.
- SQLite persistence through SQLAlchemy.
- Clear error mapping from external failures to user-safe API errors.
- Export utilities that transform persisted records into useful formats.
- Small focused tests for validation, CRUD, and export behavior.

Avoid:

- Generic base repositories.
- Dependency injection frameworks beyond FastAPI's normal dependencies.
- Premature PostgreSQL/Docker setup.
- Hidden magic in route handlers.
- Large route files with mixed validation, API calls, database writes, and formatting.

The evaluator should be able to open the backend and quickly understand:

- Where requests enter.
- Where external APIs are called.
- Where data is validated.
- Where records are persisted.
- Where exports are generated.
- How errors are handled.

## 23. README Strategy

The README should be written for recruiters and technical evaluators who need to understand the project quickly.

Recommended structure:

```text
# ForecastOS - Weather Intelligence Platform

## Overview
Product pitch, assessment context, and what problem the app solves.

## Completed Assessment Tracks
- Tech Assessment #1: Frontend
- Tech Assessment #2: Backend

## Feature Highlights
Real weather search, forecast, AQI, current location, CRUD, exports, intelligence summaries.

## Why ForecastOS Is More Than a Basic Weather App
Explain API orchestration, persistence, data snapshots, risk scoring, and user decision support.

## Architecture
Frontend/backend separation, request flow, backend service structure, SQLite with SQLAlchemy.

## Engineering Decisions
SQLite-first for fast setup, backend-owned API keys, typed contracts, service-based architecture, practical exports.

## Tech Stack
Next.js, TypeScript, TailwindCSS, shadcn/ui, FastAPI, SQLAlchemy, SQLite, OpenWeatherMap.

## Screenshots
Dashboard, search result, records CRUD, export output, FastAPI docs.

## API Documentation
Base URL, FastAPI docs URL, key route summary.

## Database Schema
Explain saved weather records, normalized fields, and raw API snapshots.

## Setup Instructions
Prerequisites, environment variables, backend setup, frontend setup.

## Running Locally
Exact commands for backend and frontend.

## Export Formats
JSON, CSV, Markdown examples.

## Error Handling
Examples: invalid location, API failure, denied geolocation, invalid date range.

## PM Accelerator Information
Required company description and link/reference.

## Demo Video
Viewable demo URL.

## Future Improvements
PostgreSQL, auth, autocomplete, LLM summaries, deployment.
```

README quality bar:

- Setup should be copy-paste friendly.
- Screenshots should appear near the top after the feature list.
- Architecture should be concise but specific.
- Mention that SQLite was chosen intentionally for assessment reliability and fast local evaluation.
- Avoid vague claims like "scalable" unless tied to concrete design decisions.

## 24. Demo Video Structure

Target length:

- 1 to 2 minutes, as requested.

Suggested flow:

1. Introduce ForecastOS and say it completes both frontend and backend assessment tracks.
2. Search a real city from the dashboard.
3. Show current weather, AQI, 5-day forecast, and trend chart.
4. Point out risk score or recommendations as product intelligence.
5. Use current location or explain permission fallback if the browser blocks it.
6. Open saved records and demonstrate read/update/delete.
7. Export records to one or more formats.
8. Show FastAPI docs and briefly explain backend route/service structure.
9. Close with the engineering decisions: API keys stay backend-only, data is persisted, responses are typed, and SQLite keeps setup simple.

Code explanation points:

- Backend service modules separate external API calls, orchestration, persistence, intelligence, and exports.
- Frontend uses reusable dashboard components and typed API calls.
- External API keys stay server-side.
- Database stores normalized fields plus raw API snapshots for auditability and future features.

## 25. Definition of Done

Functional:

- User can search real weather by location.
- User can use browser geolocation.
- Current weather, forecast, and AQI render correctly.
- Records are persisted in SQLite.
- CRUD operations work from the UI.
- Export works for JSON, CSV, and Markdown.
- Errors are handled gracefully.

Engineering:

- Frontend and backend run with documented commands.
- Environment variables are documented.
- Backend has modular route/service/client/model/schema structure.
- Frontend has reusable components and a centralized API client.
- API responses are typed.
- README is clear enough for evaluators to run the app quickly.

Portfolio:

- UI looks like a clean startup MVP.
- Backend design is easy to explain in an interview.
- Product intelligence features are visible.
- Demo video is concise and professional.
- Repository is public or shared with required accounts.

## 26. Submission Optimization

What matters most to evaluators:

- Real external API data, not static examples.
- CRUD functionality that is visible and easy to test.
- Clear REST API design.
- Good validation and error handling.
- A frontend that works smoothly across desktop and smaller screens.
- A README that makes setup and evaluation simple.
- A demo video that proves the project works.

How to avoid looking like a tutorial project:

- Lead with ForecastOS as a weather intelligence dashboard, not just a weather app.
- Show persisted records, exports, AQI, and recommendations.
- Explain backend orchestration and data modeling.
- Include thoughtful empty/error/loading states.
- Store raw API snapshots plus normalized fields.
- Keep the UI clean and product-like without spending too much time on decoration.

How to make the repo feel production-oriented:

- Keep secrets in `.env` and provide `.env.example`.
- Use typed schemas and consistent error responses.
- Keep route handlers thin.
- Keep external API calls isolated in a client module.
- Include a clear project structure and setup guide.
- Add a few focused tests rather than broad low-value test scaffolding.
- Keep commit history and naming professional.

Professional demo structure:

- Start with the user value.
- Demonstrate the full happy path.
- Demonstrate one error state.
- Demonstrate CRUD and export.
- Show the backend docs briefly.
- End with engineering decisions and future improvements.

Final principle:

> Coherence over complexity. Execution over perfection. Engineering clarity over feature count.

ForecastOS should feel like a strong startup-style engineering MVP built by a systems-minded full-stack engineer.

