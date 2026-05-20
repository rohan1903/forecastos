"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { LocateFixed, Search } from "lucide-react";

import { fetchLocationSuggestions } from "@/lib/api-client";
import type { LocationSuggestion } from "@/lib/types";

type SearchPanelProps = {
  onSearch: (query: string) => void;
  onUseCurrentLocation: () => void;
  isLoading: boolean;
  isLocating: boolean;
};

export function SearchPanel({
  onSearch,
  onUseCurrentLocation,
  isLoading,
  isLocating,
}: SearchPanelProps) {
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const loadSuggestions = useCallback(async (value: string) => {
    const trimmed = value.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSuggesting(true);
    try {
      const response = await fetchLocationSuggestions(trimmed);
      const unique = response.suggestions.filter(
        (suggestion, index, list) =>
          list.findIndex(
            (item) => item.display_label === suggestion.display_label,
          ) === index,
      );
      setSuggestions(unique);
      setShowSuggestions(unique.length > 0);
      setActiveIndex(-1);
    } catch {
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsSuggesting(false);
    }
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = window.setTimeout(() => {
      void loadSuggestions(trimmed);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [query, loadSuggestions]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function submitQuery(value: string) {
    const trimmed = value.trim();
    if (trimmed) {
      setShowSuggestions(false);
      onSearch(trimmed);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      const selected = suggestions[activeIndex];
      setQuery(selected.display_label);
      submitQuery(selected.display_label);
      return;
    }
    submitQuery(query);
  }

  function handleSelectSuggestion(suggestion: LocationSuggestion) {
    setQuery(suggestion.display_label);
    setShowSuggestions(false);
    submitQuery(suggestion.display_label);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!showSuggestions || suggestions.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) =>
        prev <= 0 ? suggestions.length - 1 : prev - 1,
      );
    } else if (event.key === "Escape") {
      setShowSuggestions(false);
      setActiveIndex(-1);
    }
  }

  return (
    <section className="rounded-xl border border-cyan-200/10 bg-[#111b27] shadow-lg shadow-black/20">
      <form className="flex flex-col gap-3 p-3" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <div ref={containerRef} className="relative flex-1">
            <label className="sr-only" htmlFor="location-query">
              Location
            </label>
            <div className="flex min-h-12 items-center gap-3 rounded-lg border border-white/5 bg-[#0d1520] px-4">
              <Search className="h-4 w-4 shrink-0 text-cyan-300/70" />
              <input
                id="location-query"
                value={query}
                onChange={(event) => {
                  const next = event.target.value;
                  setQuery(next);
                  if (next.trim().length < 2) {
                    setSuggestions([]);
                    setShowSuggestions(false);
                    setActiveIndex(-1);
                  }
                }}
                onFocus={() => {
                  if (query.trim().length >= 2 && suggestions.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                onKeyDown={handleKeyDown}
                autoComplete="off"
                aria-autocomplete="list"
                aria-controls={listboxId}
                aria-expanded={showSuggestions && suggestions.length > 0}
                className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
                placeholder="Search for cities"
              />
            </div>

            {query.trim().length >= 2 &&
            showSuggestions &&
            (suggestions.length > 0 || isSuggesting) ? (
              <ul
                id={listboxId}
                role="listbox"
                className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-white/10 bg-[#0d1520] py-1 shadow-xl shadow-black/30"
              >
                {isSuggesting ? (
                  <li className="px-4 py-2 text-xs text-slate-400">Searching...</li>
                ) : null}
                {suggestions.map((suggestion, index) => (
                  <li key={`${suggestion.latitude}-${suggestion.longitude}-${index}`}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={activeIndex === index}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => handleSelectSuggestion(suggestion)}
                      className={`w-full px-4 py-2 text-left text-sm transition ${
                        activeIndex === index
                          ? "bg-cyan-500/15 text-cyan-100"
                          : "text-slate-200 hover:bg-slate-800/80"
                      }`}
                    >
                      {suggestion.display_label}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={isLoading || isLocating || !query.trim()}
            className="inline-flex min-h-10 items-center justify-center rounded-lg bg-amber-300 px-5 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Searching" : "Search"}
          </button>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onUseCurrentLocation}
            disabled={isLoading || isLocating}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-cyan-300/20 bg-cyan-500/10 px-4 text-sm font-medium text-cyan-100 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LocateFixed className="h-4 w-4" />
            {isLocating ? "Locating..." : "Use current location"}
          </button>
        </div>
      </form>
    </section>
  );
}
