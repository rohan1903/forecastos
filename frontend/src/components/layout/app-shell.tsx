import type { ReactNode } from "react";
import Link from "next/link";
import { Activity, CloudSun } from "lucide-react";

import { PmAcceleratorFooter } from "@/components/layout/pm-accelerator-footer";

type AppShellProps = { children: ReactNode };

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/records", label: "Saved Records" },
];

export function AppShell({ children }: AppShellProps) {
  return (
    <main className="min-h-screen bg-[#0b121b] text-slate-100">
      <div className="absolute inset-0 -z-0 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.12),transparent_24rem),radial-gradient(circle_at_bottom_right,rgba(20,184,166,0.10),transparent_26rem),linear-gradient(135deg,#0b121b_0%,#0f1b29_48%,#0b121b_100%)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-300/12 text-amber-200 ring-1 ring-amber-200/20">
              <CloudSun className="h-5 w-5" />
            </div>
            <span className="text-sm font-semibold text-white">
              Forecast<span className="text-amber-200">OS</span>
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <nav className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/60 p-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <span className="hidden items-center gap-2 rounded-full bg-slate-800 px-3 py-2 text-xs text-emerald-300 ring-1 ring-white/10 sm:flex">
              <Activity className="h-4 w-4" />
              Live API
            </span>
          </div>
        </header>
        {children}
        <PmAcceleratorFooter />
      </div>
    </main>
  );
}
