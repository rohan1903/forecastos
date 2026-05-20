"use client";

import { Pencil, Trash2 } from "lucide-react";

import type { WeatherRecord } from "@/lib/types";

type RecordsTableProps = {
  records: WeatherRecord[];
  onEdit: (record: WeatherRecord) => void;
  onDelete: (recordId: number) => void;
};

export function RecordsTable({ records, onEdit, onDelete }: RecordsTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#111b27]">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-400">
          <tr>
            <th className="px-4 py-3">Location</th>
            <th className="px-4 py-3">Label</th>
            <th className="px-4 py-3">Condition</th>
            <th className="px-4 py-3">Risk</th>
            <th className="px-4 py-3">Saved</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id} className="border-b border-white/5 text-slate-200">
              <td className="px-4 py-3">
                <p className="font-medium text-slate-100">{record.resolved_name}</p>
                <p className="text-xs text-slate-400">{record.query}</p>
              </td>
              <td className="px-4 py-3">{record.label || "—"}</td>
              <td className="px-4 py-3">
                {record.temperature_c}°C · {record.condition}
              </td>
              <td className="px-4 py-3">
                <span className="rounded-full bg-slate-800 px-2 py-1 text-xs capitalize">
                  {record.risk_level ?? "—"}
                </span>
              </td>
              <td className="px-4 py-3 text-xs text-slate-400">
                {new Date(record.created_at).toLocaleString()}
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(record)}
                    className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1 text-xs hover:border-cyan-300/30"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(record.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-400/20 px-2 py-1 text-xs text-red-200 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
