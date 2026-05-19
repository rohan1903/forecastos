import { Cloud, Droplets, Eye, Gauge, Thermometer, Wind } from "lucide-react";

import type { AirQualityResponse, CurrentWeatherResponse } from "@/lib/types";

type WeatherConditionsCardProps = {
  current: CurrentWeatherResponse;
  airQuality: AirQualityResponse;
};

function formatVisibility(visibility?: number | null) {
  if (!visibility) return "Unknown";
  return `${(visibility / 1000).toFixed(0)} km`;
}

export function WeatherConditionsCard({
  current,
  airQuality,
}: WeatherConditionsCardProps) {
  const metrics = [
    {
      label: "Feels Like",
      value: `${Math.round(current.feels_like_c)}°`,
      Icon: Thermometer,
    },
    { label: "Condition", value: current.condition, Icon: Cloud },
    { label: "Wind Speed", value: `${current.wind_speed} m/s`, Icon: Wind },
    { label: "Humidity Level", value: `${current.humidity}%`, Icon: Droplets },
    { label: "Visibility", value: formatVisibility(current.visibility), Icon: Eye },
    { label: "AQI", value: `${airQuality.aqi} ${airQuality.label}`, Icon: Gauge },
  ];

  return (
    <section className="rounded-2xl border border-teal-200/10 bg-[#111b27] p-6 shadow-xl shadow-black/20">
      <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-teal-100/80">
        Weather Conditions
      </h2>

      <div className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map(({ label, value, Icon }) => (
          <div key={label} className="flex items-start gap-3">
            <Icon className="mt-1 h-4 w-4 text-teal-300/70" />
            <div>
              <p className="text-sm font-semibold text-slate-400">{label}</p>
              <p className="mt-1 text-xl font-bold text-slate-200">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
