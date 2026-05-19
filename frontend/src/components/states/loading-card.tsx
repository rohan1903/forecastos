export function LoadingCard() {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-slate-950/30">
      <div className="space-y-4">
        <div className="h-4 w-32 animate-pulse rounded-full bg-slate-700" />
        <div className="h-12 w-48 animate-pulse rounded-2xl bg-slate-700" />
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="h-20 animate-pulse rounded-2xl bg-slate-800" />
          <div className="h-20 animate-pulse rounded-2xl bg-slate-800" />
          <div className="h-20 animate-pulse rounded-2xl bg-slate-800" />
        </div>
      </div>
    </div>
  );
}
