import type { CurrentWeatherResponse, LocationResponse } from "@/lib/types";
import { WeatherIcon } from "@/components/weather/weather-icon";

type CurrentWeatherCardProps = {
  location: LocationResponse;
  current: CurrentWeatherResponse;
};

export function CurrentWeatherCard({ location, current }: CurrentWeatherCardProps) {
  const region = [location.state, location.country].filter(Boolean).join(", ");

  return (
    <section className="relative overflow-hidden rounded-2xl border border-amber-200/15 bg-[#111b27] p-8 shadow-xl shadow-black/20">
      <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-amber-300/10 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-amber-300/40 to-transparent" />
      <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_15rem] md:items-center">
        <div>
          <h2 className="text-4xl font-bold tracking-tight text-slate-100">
            {location.name}
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            {region ? region : "Live weather intelligence"}
          </p>
          <p className="mt-9 text-6xl font-bold tracking-tight text-amber-100">
            {Math.round(current.temperature_c)}°
          </p>
          <p className="mt-2 text-sm capitalize text-cyan-100/75">
            {current.description}
          </p>
        </div>

        <div className="flex justify-center md:justify-end">
          <div className="flex h-44 w-44 items-center justify-center rounded-full bg-amber-300/5 ring-1 ring-amber-200/10">
            <WeatherIcon condition={current.condition} className="h-36 w-36" />
          </div>
        </div>
      </div>
    </section>
  );
}
