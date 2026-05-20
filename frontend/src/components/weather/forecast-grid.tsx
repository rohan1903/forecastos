import type { ForecastPointResponse } from "@/lib/types";
import { WeatherIcon } from "@/components/weather/weather-icon";

type ForecastGridProps = {
  forecast: ForecastPointResponse[];
};

function formatForecastSlot(value: string) {
  const date = new Date(value);
  return {
    weekday: new Intl.DateTimeFormat("en", { weekday: "short" }).format(date),
    time: new Intl.DateTimeFormat("en", { hour: "numeric" }).format(date),
  };
}

export function ForecastGrid({ forecast }: ForecastGridProps) {
  const today = forecast.slice(0, 8);

  return (
    <section className="rounded-2xl border border-cyan-200/10 bg-[#111b27] p-5 shadow-xl shadow-black/20">
      <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-cyan-100/80">
        Today&apos;s Forecast
      </h2>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
        {today.map((point, index) => {
          const slot = formatForecastSlot(point.forecast_at);

          return (
            <article
              key={point.forecast_at}
              className={`flex min-h-[8.5rem] flex-col items-center justify-between rounded-xl border px-2 py-3 ${
                index === 0
                  ? "border-amber-200/25 bg-amber-300/12"
                  : "border-white/10 bg-transparent"
              }`}
            >
              <div className="flex h-10 w-full flex-col items-center justify-center gap-0.5 text-center">
                <span className="w-full font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400 tabular-nums">
                  {slot.weekday}
                </span>
                <span className="w-full font-mono text-xs font-semibold leading-none text-slate-300 tabular-nums">
                  {slot.time}
                </span>
              </div>

              <div className="flex h-11 shrink-0 items-center justify-center">
                <WeatherIcon condition={point.condition} className="h-9 w-9" />
              </div>

              <p className="flex h-7 items-center justify-center font-mono text-base font-bold leading-none tabular-nums text-amber-100">
                {Math.round(point.temperature_c)}°
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
