import { ShieldAlert } from "lucide-react";

import type { WeatherIntelligenceResponse } from "@/lib/types";

type RiskScoreCardProps = {
  intelligence: WeatherIntelligenceResponse;
};

export function RiskScoreCard({ intelligence }: RiskScoreCardProps) {
  return (
    <section className="rounded-2xl border border-sky-200/10 bg-[#111b27] p-6 shadow-xl shadow-black/20">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-sky-100/80">
            ForecastOS Intelligence
          </p>
          <h2 className="mt-2 text-3xl font-bold text-slate-100">Planning Risk</h2>
        </div>
        <div className="rounded-2xl bg-sky-300/10 p-3 text-sky-300 ring-1 ring-sky-200/10">
          <ShieldAlert className="h-6 w-6" />
        </div>
      </div>

      <div className="flex items-end gap-3">
        <p className="text-5xl font-bold tracking-tight text-sky-100">
          {intelligence.risk_score}
        </p>
        <p className="pb-2 text-sm uppercase tracking-[0.18em] text-slate-500">
          {intelligence.risk_level}
        </p>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-400">{intelligence.summary}</p>

      <div className="mt-5 space-y-2">
        {intelligence.recommendations.slice(0, 3).map((recommendation) => (
          <p
            key={recommendation}
            className="rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-slate-300"
          >
            {recommendation}
          </p>
        ))}
      </div>
    </section>
  );
}
