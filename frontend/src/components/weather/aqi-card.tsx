import { Leaf } from "lucide-react";

import type { AirQualityResponse } from "@/lib/types";

type AqiCardProps = {
  airQuality: AirQualityResponse;
};

export function AqiCard({ airQuality }: AqiCardProps) {
  const severityClass =
    airQuality.aqi >= 4
      ? "border-red-100/30 bg-red-400/18 text-white"
      : airQuality.aqi === 3
        ? "border-amber-100/30 bg-amber-300/18 text-white"
        : "border-emerald-100/30 bg-emerald-300/18 text-white";

  return (
    <section className={`rounded-[2rem] border p-5 shadow-2xl shadow-sky-900/10 backdrop-blur-xl ${severityClass}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.24em] opacity-70">
            Air Quality
          </p>
          <h2 className="mt-3 text-4xl font-semibold">AQI {airQuality.aqi}</h2>
          <p className="mt-1 text-lg">{airQuality.label}</p>
        </div>
        <div className="rounded-2xl bg-white/5 p-3">
          <Leaf className="h-6 w-6" />
        </div>
      </div>
    </section>
  );
}
