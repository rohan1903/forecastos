"use client";

import { Download } from "lucide-react";

import { exportRecords } from "@/lib/api-client";
import type { ExportFormat } from "@/lib/types";

type ExportActionsProps = {
  recordId?: number;
  onError?: (message: string) => void;
};

const formats: { format: ExportFormat; label: string }[] = [
  { format: "json", label: "JSON" },
  { format: "csv", label: "CSV" },
  { format: "markdown", label: "Markdown" },
];

export function ExportActions({ recordId, onError }: ExportActionsProps) {
  async function handleExport(format: ExportFormat) {
    try {
      await exportRecords(format, recordId);
    } catch (err) {
      onError?.(
        err instanceof Error ? err.message : "Could not export records.",
      );
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {formats.map(({ format, label }) => (
        <button
          key={format}
          type="button"
          onClick={() => handleExport(format)}
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-slate-800/80 px-3 py-2 text-xs font-medium text-slate-200 transition hover:border-cyan-300/30 hover:text-cyan-100"
        >
          <Download className="h-3.5 w-3.5" />
          {label}
        </button>
      ))}
    </div>
  );
}
