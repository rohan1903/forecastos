"use client";

import { useEffect, useState } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { ExportActions } from "@/components/records/export-actions";
import { RecordEditor } from "@/components/records/record-editor";
import { RecordsTable } from "@/components/records/records-table";
import { ErrorState } from "@/components/states/error-state";
import { LoadingCard } from "@/components/states/loading-card";
import {
  ApiClientError,
  deleteRecord,
  listRecords,
  updateRecord,
} from "@/lib/api-client";
import type { RecordUpdateRequest, WeatherRecord } from "@/lib/types";

export default function RecordsPage() {
  const [records, setRecords] = useState<WeatherRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editingRecord, setEditingRecord] = useState<WeatherRecord | null>(null);

  async function fetchRecords(options?: { refresh?: boolean }) {
    const refresh = options?.refresh ?? false;

    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const response = await listRecords();
      setRecords(response.items);
      setTotal(response.total);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Could not load saved records.");
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await listRecords();
        if (!cancelled) {
          setRecords(response.items);
          setTotal(response.total);
        }
      } catch (err) {
        if (!cancelled) {
          if (err instanceof ApiClientError) {
            setError(err.message);
          } else {
            setError("Could not load saved records.");
          }
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleDelete(recordId: number) {
    if (!window.confirm("Delete this saved record?")) {
      return;
    }
    try {
      await deleteRecord(recordId);
      if (editingRecord?.id === recordId) {
        setEditingRecord(null);
      }
      await fetchRecords({ refresh: true });
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Could not delete the record.",
      );
    }
  }

  async function handleSave(
    recordId: number,
    payload: RecordUpdateRequest,
  ) {
    try {
      await updateRecord(recordId, payload);
      setEditingRecord(null);
      await fetchRecords({ refresh: true });
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Could not update the record.",
      );
    }
  }

  return (
    <AppShell>
      <div className="space-y-4">
        <section className="rounded-2xl border border-white/10 bg-[#111b27] p-6">
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-slate-400">
            Saved intelligence
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-100">Weather records</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Searches saved from the dashboard are stored in SQLite. Edit labels and
            notes, export your history, or remove records you no longer need.
          </p>
          <div className="mt-4">
            <ExportActions onError={setError} />
          </div>
        </section>

        {error ? <ErrorState message={error} /> : null}
        {isLoading ? <LoadingCard /> : null}
        {isRefreshing ? (
          <p className="text-sm text-slate-500">Refreshing records…</p>
        ) : null}

        {!isLoading && records.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-white/15 bg-[#111b27]/60 p-8 text-center">
            <h2 className="text-xl font-semibold text-slate-100">No saved records yet</h2>
            <p className="mt-2 text-sm text-slate-400">
              Run a search on the dashboard and enable &quot;Save this search&quot; to
              populate this page.
            </p>
          </section>
        ) : null}

        {!isLoading && records.length > 0 ? (
          <>
            <p className="text-sm text-slate-400">
              Showing {records.length} of {total} saved record{total === 1 ? "" : "s"}
            </p>
            {editingRecord ? (
              <RecordEditor
                record={editingRecord}
                onSave={(payload) => handleSave(editingRecord.id, payload)}
                onCancel={() => setEditingRecord(null)}
              />
            ) : null}
            <RecordsTable
              records={records}
              onEdit={setEditingRecord}
              onDelete={handleDelete}
            />
          </>
        ) : null}
      </div>
    </AppShell>
  );
}
