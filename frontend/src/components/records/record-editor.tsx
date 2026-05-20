"use client";

import { FormEvent, useState } from "react";

import type { RecordUpdateRequest, WeatherRecord } from "@/lib/types";

type RecordEditorProps = {
  record: WeatherRecord;
  onSave: (payload: RecordUpdateRequest) => Promise<void>;
  onCancel: () => void;
};

export function RecordEditor({ record, onSave, onCancel }: RecordEditorProps) {
  const [label, setLabel] = useState(record.label ?? "");
  const [notes, setNotes] = useState(record.notes ?? "");
  const [dateStart, setDateStart] = useState(record.date_start ?? "");
  const [dateEnd, setDateEnd] = useState(record.date_end ?? "");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    try {
      await onSave({
        label: label.trim() || null,
        notes: notes.trim() || null,
        date_start: dateStart || null,
        date_end: dateEnd || null,
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-cyan-200/15 bg-[#0d1520] p-4"
    >
      <p className="text-sm font-semibold text-slate-100">
        Edit {record.resolved_name}
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <input
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          className="min-h-10 rounded-lg border border-white/5 bg-[#111b27] px-3 text-sm text-slate-100 outline-none"
          placeholder="Label"
          maxLength={80}
        />
        <input
          value={dateStart}
          onChange={(event) => setDateStart(event.target.value)}
          type="date"
          className="min-h-10 rounded-lg border border-white/5 bg-[#111b27] px-3 text-sm text-slate-100 outline-none"
        />
        <input
          value={dateEnd}
          onChange={(event) => setDateEnd(event.target.value)}
          type="date"
          className="min-h-10 rounded-lg border border-white/5 bg-[#111b27] px-3 text-sm text-slate-100 outline-none"
        />
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className="min-h-20 rounded-lg border border-white/5 bg-[#111b27] px-3 py-2 text-sm text-slate-100 outline-none sm:col-span-2"
          placeholder="Notes"
          maxLength={500}
        />
      </div>
      <div className="mt-4 flex gap-2">
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-lg bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60"
        >
          {isSaving ? "Saving..." : "Save changes"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
