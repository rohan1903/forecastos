import type { ForecastPointResponse } from "@/lib/types";
import { WeatherIcon } from "@/components/weather/weather-icon";

type FiveDayForecastProps = {
  forecast: ForecastPointResponse[];
};

function dayName(value: string) {
  return new Intl.DateTimeFormat("en", { weekday: "short" }).format(new Date(value));
}

function buildDailyForecast(forecast: ForecastPointResponse[]) {
  const byDay = new Map<string, ForecastPointResponse[]>();

  for (const point of forecast) {
    const key = new Date(point.forecast_at).toISOString().slice(0, 10);
    byDay.set(key, [...(byDay.get(key) ?? []), point]);
  }

  return Array.from(byDay.entries()).slice(0, 5).map(([date, points], index) => {
    const temps = points.map((point) => point.temperature_c);
    const representative = points[Math.min(2, points.length - 1)];

    return {
      date,
      label: index === 0 ? "Today" : dayName(representative.forecast_at),
      condition: representative.condition,
      description: representative.description,
      high: Math.round(Math.max(...temps)),
      low: Math.round(Math.min(...temps)),
    };
  });
}

export function FiveDayForecast({ forecast }: FiveDayForecastProps) {
  const dailyForecast = buildDailyForecast(forecast);

  return (
    <section className="h-full rounded-2xl border border-cyan-200/10 bg-[#111b27] p-5 shadow-xl shadow-black/20">
      <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-cyan-100/80">
        5-Day Forecast
      </h2>

      <div className="mt-5 space-y-1">
        {dailyForecast.map((day) => (
          <article
            key={day.date}
            className="grid grid-cols-[4rem_3.5rem_1fr_auto] items-center gap-3 border-b border-white/10 py-4 transition last:border-b-0 hover:border-amber-200/20"
          >
            <p className="text-sm font-semibold text-slate-400">{day.label}</p>
            <WeatherIcon condition={day.condition} className="h-10 w-10" />
            <p className="truncate text-sm font-semibold capitalize text-slate-300">
              {day.description}
            </p>
            <p className="font-mono text-sm font-bold tabular-nums text-amber-100">
              {day.high}° / <span className="text-slate-500">{day.low}°</span>
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
