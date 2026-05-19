"use client";

import { FormEvent, useState } from "react";
import { Search } from "lucide-react";

type SearchPanelProps = {
  onSearch: (query: string) => void;
  isLoading: boolean;
};

export function SearchPanel({ onSearch, isLoading }: SearchPanelProps) {
  const [query, setQuery] = useState("Mumbai, IN");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      onSearch(trimmed);
    }
  }

  return (
    <section className="rounded-xl border border-cyan-200/10 bg-[#111b27] shadow-lg shadow-black/20">
      <form className="flex flex-col gap-3 sm:flex-row sm:items-center" onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="location-query">
          Location
        </label>
        <div className="flex min-h-12 flex-1 items-center gap-3 px-4">
          <Search className="h-4 w-4 text-cyan-300/70" />
          <input
            id="location-query"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
            placeholder="Search for cities"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="m-1 inline-flex min-h-10 items-center justify-center rounded-lg bg-amber-300 px-5 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Searching" : "Search"}
        </button>
      </form>
    </section>
  );
}
