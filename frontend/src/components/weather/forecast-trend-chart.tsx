"use client";

import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { ForecastPointResponse } from "@/lib/types";

type ForecastTrendChartProps = {
  forecast: ForecastPointResponse[];
};

type ChartRow = {
  time: string;
  label: string;
  temperature: number;
  feelsLike: number;
  precip: number;
};

function formatTooltipTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
  }).format(new Date(value));
}

function formatAxisLabel(value: string) {
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
    hour: "numeric",
  }).format(new Date(value));
}

function toChartRows(forecast: ForecastPointResponse[]): ChartRow[] {
  return forecast.slice(0, 24).map((point) => ({
    time: point.forecast_at,
    label: formatAxisLabel(point.forecast_at),
    temperature: Math.round(point.temperature_c),
    feelsLike: Math.round(point.feels_like_c),
    precip: Math.round((point.precipitation_probability ?? 0) * 100),
  }));
}

export function ForecastTrendChart({ forecast }: ForecastTrendChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (forecast.length === 0) {
    return null;
  }

  const data = toChartRows(forecast);

  return (
    <section className="h-full rounded-2xl border border-sky-200/10 bg-[#111b27] p-5 shadow-xl shadow-black/20">
      <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-sky-100/80">
        Forecast Trends
      </h2>
      <p className="mt-1 text-xs text-slate-500">
        Temperature and feels-like over the next ~3 days (3-hour intervals)
      </p>

      <div className="mt-5 h-64 min-h-64 min-w-0 w-full sm:h-72">
        {mounted ? (
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={256}>
          <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
            <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" strokeDasharray="4 4" />
            <XAxis
              dataKey="label"
              tick={{ fill: "#94a3b8", fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: "rgba(148, 163, 184, 0.2)" }}
              interval="preserveStartEnd"
              minTickGap={24}
            />
            <YAxis
              tick={{ fill: "#94a3b8", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              unit="°"
              width={36}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                border: "1px solid rgba(148, 163, 184, 0.2)",
                borderRadius: "0.75rem",
                color: "#e2e8f0",
                fontSize: "12px",
              }}
              labelFormatter={(_, payload) => {
                const row = payload?.[0]?.payload as ChartRow | undefined;
                return row ? formatTooltipTime(row.time) : "";
              }}
              formatter={(value, name) => {
                const label =
                  name === "temperature"
                    ? "Temperature"
                    : name === "feelsLike"
                      ? "Feels like"
                      : "Precip chance";
                const suffix = name === "precip" ? "%" : "°C";
                return [`${value}${suffix}`, label];
              }}
            />
            <Line
              type="monotone"
              dataKey="temperature"
              name="temperature"
              stroke="#fbbf24"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#fbbf24" }}
            />
            <Line
              type="monotone"
              dataKey="feelsLike"
              name="feelsLike"
              stroke="#64748b"
              strokeWidth={2}
              strokeDasharray="6 4"
              dot={false}
              activeDot={{ r: 4, fill: "#64748b" }}
            />
          </LineChart>
        </ResponsiveContainer>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
        <span className="inline-flex items-center gap-2">
          <span className="h-0.5 w-6 rounded bg-amber-300" />
          Temperature
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-0.5 w-6 rounded border border-dashed border-slate-500 bg-slate-500" />
          Feels like
        </span>
      </div>
    </section>
  );
}
