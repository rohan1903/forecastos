import Link from "next/link";
import { ExternalLink } from "lucide-react";

const PMA_LINKEDIN_URL = "https://www.linkedin.com/company/pm-accelerator/";

export function PmAcceleratorFooter() {
  return (
    <footer className="mt-auto border-t border-white/10 pt-6">
      <section className="rounded-2xl border border-sky-200/10 bg-slate-900/50 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-100/80">
          PM Accelerator
        </p>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
          ForecastOS was developed for the{" "}
          <span className="text-slate-300">PM Accelerator AI Engineer Intern</span>{" "}
          technical assessment — demonstrating full-stack delivery across frontend UX,
          REST API design, third-party integrations, persistence, and export workflows.
        </p>
        <p className="mt-2 text-sm text-slate-500">
          PM Accelerator supports emerging product and engineering talent through structured
          assessments and real-world project expectations.
        </p>
        <Link
          href={PMA_LINKEDIN_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-sky-300 transition hover:text-sky-200"
        >
          PM Accelerator on LinkedIn
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </section>
    </footer>
  );
}
