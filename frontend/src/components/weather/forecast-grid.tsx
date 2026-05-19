import type { ForecastPointResponse } from "@/lib/types";
import { WeatherIcon } from "@/components/weather/weather-icon";

type ForecastGridProps = {
  forecast: ForecastPointResponse[];
};

function formatForecastTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
    hour: "numeric",
  }).format(new Date(value));
}

export function ForecastGrid({ forecast }: ForecastGridProps) {
  const today = forecast.slice(0, 8);

  return (
    <section className="rounded-2xl border border-cyan-200/10 bg-[#111b27] p-5 shadow-xl shadow-black/20">
      <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-cyan-100/80">
        Today&apos;s Forecast
      </h2>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
        {today.map((point, index) => (
          <article
            key={point.forecast_at}
            className={`rounded-xl border p-4 text-center ${
              index === 0
                ? "border-amber-200/25 bg-amber-300/12"
                : "border-white/10 bg-transparent"
            }`}
          >
            <p className="text-xs font-semibold text-slate-400">
              {formatForecastTime(point.forecast_at)}
            </p>
            <div className="mt-3 flex justify-center">
              <WeatherIcon condition={point.condition} className="h-10 w-10" />
            </div>
            <p className="mt-3 text-sm font-bold text-amber-100">
              {Math.round(point.temperature_c)}°
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
