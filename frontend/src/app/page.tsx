"use client";

import { useState } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { ErrorState } from "@/components/states/error-state";
import { LoadingCard } from "@/components/states/loading-card";
import { CurrentWeatherCard } from "@/components/weather/current-weather-card";
import { FiveDayForecast } from "@/components/weather/five-day-forecast";
import { ForecastGrid } from "@/components/weather/forecast-grid";
import { RiskScoreCard } from "@/components/weather/risk-score-card";
import { SearchPanel } from "@/components/weather/search-panel";
import { WeatherConditionsCard } from "@/components/weather/weather-conditions-card";
import { ApiClientError, searchWeather } from "@/lib/api-client";
import type { WeatherSearchResponse } from "@/lib/types";

export default function Home() {
  const [weather, setWeather] = useState<WeatherSearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSearch(query: string) {
    setIsLoading(true);
    setError(null);

    try {
      const result = await searchWeather({
        input_type: "query",
        query,
        save: false,
      });
      setWeather(result);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Unexpected error while searching weather data.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="space-y-4">
        <SearchPanel onSearch={handleSearch} isLoading={isLoading} />

        {error ? <ErrorState message={error} /> : null}
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
              product-ready response.
            </p>
          </section>
        ) : null}

        {weather ? (
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
        ) : null}
      </div>
    </AppShell>
  );
}
