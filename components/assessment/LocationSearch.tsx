"use client";

import { useEffect, useRef, useState } from "react";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import { searchLocations } from "@/lib/location/client";
import type { GeocodeResult } from "@/lib/location/types";
import { MapPinIcon } from "@/components/icons";

type LocationSearchProps = {
  onSelect: (result: GeocodeResult) => void;
};

type SearchStatus = "idle" | "loading" | "results" | "empty" | "error";

export default function LocationSearch({ onSelect }: LocationSearchProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<SearchStatus>("idle");
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const debouncedQuery = useDebouncedValue(query.trim(), 400);
  const abortRef = useRef<AbortController | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const effectiveStatus: SearchStatus =
    debouncedQuery.length < 3 ? "idle" : status;

  useEffect(() => {
    abortRef.current?.abort();

    if (debouncedQuery.length < 3) {
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;

    async function runSearch() {
      setStatus("loading");
      try {
        const found = await searchLocations(debouncedQuery, controller.signal);
        setResults(found);
        setStatus(found.length === 0 ? "empty" : "results");
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setStatus("error");
        setResults([]);
      }
    }

    runSearch();

    return () => controller.abort();
  }, [debouncedQuery]);

  function handleSelect(result: GeocodeResult) {
    setQuery(result.name);
    setShowDropdown(false);
    onSelect(result);
  }

  return (
    <div className="relative" ref={containerRef}>
      <label htmlFor="site-search" className="mb-2 block text-sm font-semibold text-brand-text">
        Search for an address, landmark or place
      </label>
      <div className="flex items-center gap-3 rounded-xl border border-brand-border bg-brand-bg px-4 py-3 focus-within:border-brand-green">
        <MapPinIcon className="h-5 w-5 flex-shrink-0 text-brand-green" />
        <input
          id="site-search"
          type="text"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          placeholder="e.g. Vasai Road Station, Vasai West"
          className="w-full bg-transparent text-sm font-medium text-brand-text outline-none placeholder:text-brand-muted"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls="site-search-results"
          autoComplete="off"
        />
      </div>

      {showDropdown && effectiveStatus !== "idle" && (
        <div
          id="site-search-results"
          role="listbox"
          className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-brand-border bg-brand-card shadow-card"
        >
          {effectiveStatus === "loading" && (
            <p className="px-4 py-3 text-sm text-brand-muted">Searching…</p>
          )}

          {effectiveStatus === "empty" && (
            <p className="px-4 py-3 text-sm text-brand-muted">
              No matches found. Try a more specific address or landmark.
            </p>
          )}

          {effectiveStatus === "error" && (
            <p className="px-4 py-3 text-sm text-brand-orange">
              Search is temporarily unavailable. Please try again.
            </p>
          )}

          {effectiveStatus === "results" &&
            results.map((result) => (
              <button
                key={result.providerPlaceId}
                type="button"
                role="option"
                aria-selected="false"
                onClick={() => handleSelect(result)}
                className="flex w-full flex-col items-start gap-0.5 border-b border-brand-border px-4 py-3 text-left last:border-b-0 hover:bg-brand-bg"
              >
                <span className="text-sm font-semibold text-brand-text">
                  {result.name}
                </span>
                <span className="text-xs text-brand-muted">
                  {result.formattedAddress}
                </span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
