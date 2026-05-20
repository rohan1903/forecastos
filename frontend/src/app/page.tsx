"use client";

import { useRef, useState } from "react";
import { Bookmark } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { ErrorState } from "@/components/states/error-state";
import { LoadingCard } from "@/components/states/loading-card";
import { SaveSearchDialog } from "@/components/weather/save-search-dialog";
import { CurrentWeatherCard } from "@/components/weather/current-weather-card";
import { FiveDayForecast } from "@/components/weather/five-day-forecast";
import { ForecastGrid } from "@/components/weather/forecast-grid";
import { RiskScoreCard } from "@/components/weather/risk-score-card";
import { SearchPanel } from "@/components/weather/search-panel";
import { WeatherConditionsCard } from "@/components/weather/weather-conditions-card";
import { useGeolocation } from "@/hooks/use-geolocation";
import { ApiClientError, searchWeather } from "@/lib/api-client";
import type { WeatherSearchRequest, WeatherSearchResponse } from "@/lib/types";

export default function Home() {
  const [weather, setWeather] = useState<WeatherSearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const lastSearchPayload = useRef<WeatherSearchRequest | null>(null);
  const searchGeneration = useRef(0);
  const {
    isLocating,
    error: geoError,
    clearError: clearGeoError,
    getCurrentPosition,
  } = useGeolocation();

  async function runSearch(
    payload: WeatherSearchRequest,
    options?: { clearSaveMessage?: boolean },
  ): Promise<boolean> {
    const generation = ++searchGeneration.current;

    setIsLoading(true);
    setError(null);
    if (options?.clearSaveMessage !== false) {
      setSaveMessage(null);
    }

    try {
      const result = await searchWeather(payload);
      if (generation !== searchGeneration.current) {
        return false;
      }

      setWeather(result);
      lastSearchPayload.current = { ...payload, save: false };
      clearGeoError();
      return true;
    } catch (err) {
      if (generation !== searchGeneration.current) {
        return false;
      }

      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Unexpected error while searching weather data.");
      }
      return false;
    } finally {
      if (generation === searchGeneration.current) {
        setIsLoading(false);
      }
    }
  }

  async function handleSearch(query: string) {
    clearGeoError();
    await runSearch({ input_type: "query", query, save: false });
  }

  async function handleCurrentLocation() {
    setError(null);
    clearGeoError();

    try {
      const position = await getCurrentPosition();
      await runSearch({
        input_type: "coordinates",
        latitude: position.latitude,
        longitude: position.longitude,
        save: false,
      });
    } catch {
      // Geolocation errors are exposed via geoError from useGeolocation.
    }
  }

  async function handleConfirmSave(label: string, notes: string) {
    if (!lastSearchPayload.current) {
      setError("Run a search before saving.");
      setSaveDialogOpen(false);
      return;
    }

    setIsSaving(true);
    setError(null);

    const saved = await runSearch(
      {
        ...lastSearchPayload.current,
        save: true,
        label: label || undefined,
        notes: notes || undefined,
      },
      { clearSaveMessage: false },
    );

    setIsSaving(false);

    if (saved) {
      setSaveMessage("Search saved");
      setSaveDialogOpen(false);
    }
  }

  const displayError = error ?? (geoError && !isLoading ? geoError : null);
  const canSave = Boolean(weather && lastSearchPayload.current);

  return (
    <AppShell>
      <div className="space-y-4">
        <SearchPanel
          onSearch={handleSearch}
          onUseCurrentLocation={handleCurrentLocation}
          isLoading={isLoading}
          isLocating={isLocating}
        />

        {saveMessage ? (
          <p className="rounded-lg border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
            {saveMessage}
          </p>
        ) : null}

        {displayError ? <ErrorState message={displayError} /> : null}
        {isLoading ? <LoadingCard /> : null}

        {!weather && !isLoading ? (
          <section className="rounded-2xl border border-white/10 bg-[#111b27] p-8 shadow-xl shadow-black/20">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-slate-400">
              Ready for launch
            </p>
            <h2 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight text-slate-100 sm:text-5xl">
              Search a city to generate the first weather intelligence report.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400">
              ForecastOS routes every request through the FastAPI backend, resolves the
              location, pulls current weather, forecast, and AQI, then returns a typed
              product-ready response. Use Save after a search to store it in SQLite.
            </p>
          </section>
        ) : null}

        {weather ? (
          <>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setSaveDialogOpen(true)}
                disabled={!canSave || isLoading || isSaving}
                className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/25 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-100 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Bookmark className="h-4 w-4" />
                Save
              </button>
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
              <div className="space-y-4">
                <CurrentWeatherCard
                  location={weather.location}
                  current={weather.current}
                />
                <ForecastGrid forecast={weather.forecast} />
              </div>

              <FiveDayForecast forecast={weather.forecast} />

              <div className="lg:col-span-2 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <WeatherConditionsCard
                  current={weather.current}
                  airQuality={weather.air_quality}
                />
                <RiskScoreCard intelligence={weather.intelligence} />
              </div>
            </div>
          </>
        ) : null}
      </div>

      <SaveSearchDialog
        open={saveDialogOpen}
        locationName={
          weather?.location.name
            ? `${weather.location.name}${weather.location.country ? `, ${weather.location.country}` : ""}`
            : "Current search"
        }
        isSaving={isSaving}
        onClose={() => setSaveDialogOpen(false)}
        onConfirm={handleConfirmSave}
      />
    </AppShell>
  );
}
