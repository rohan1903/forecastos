"use client";

import { FormEvent, useEffect, useState } from "react";
import { X } from "lucide-react";

type SaveSearchDialogProps = {
  open: boolean;
  locationName: string;
  isSaving: boolean;
  onClose: () => void;
  onConfirm: (label: string, notes: string) => void;
};

export function SaveSearchDialog({
  open,
  locationName,
  isSaving,
  onClose,
  onConfirm,
}: SaveSearchDialogProps) {
  const [label, setLabel] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      setLabel("");
      setNotes("");
    }
  }, [open]);

  if (!open) {
    return null;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onConfirm(label.trim(), notes.trim());
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-labelledby="save-search-title"
        aria-modal="true"
        className="w-full max-w-md rounded-xl border border-cyan-200/15 bg-[#111b27] p-5 shadow-2xl shadow-black/40"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-200/80">
              Save search
            </p>
            <h2 id="save-search-title" className="mt-1 text-lg font-semibold text-slate-100">
              {locationName}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="save-label" className="mb-1 block text-xs text-slate-400">
              Label
            </label>
            <input
              id="save-label"
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              className="w-full min-h-10 rounded-lg border border-white/10 bg-[#0d1520] px-3 text-sm text-slate-100 outline-none focus:border-cyan-300/30"
              placeholder="e.g. Weekend trip"
              maxLength={80}
            />
          </div>
          <div>
            <label htmlFor="save-notes" className="mb-1 block text-xs text-slate-400">
              Notes
            </label>
            <textarea
              id="save-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="min-h-20 w-full rounded-lg border border-white/10 bg-[#0d1520] px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-300/30"
              placeholder="Optional planning notes"
              maxLength={500}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Confirm Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
