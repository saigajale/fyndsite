import type { GeocodeResult } from "./types";

export async function searchLocations(
  query: string,
  signal?: AbortSignal,
): Promise<GeocodeResult[]> {
  const response = await fetch(
    `/api/geocode/search?q=${encodeURIComponent(query)}`,
    { signal },
  );

  if (!response.ok) {
    throw new Error("search_failed");
  }

  const data = (await response.json()) as { results: GeocodeResult[] };
  return data.results;
}

export async function reverseGeocode(
  latitude: number,
  longitude: number,
  signal?: AbortSignal,
): Promise<GeocodeResult | null> {
  const response = await fetch(
    `/api/geocode/reverse?lat=${latitude}&lon=${longitude}`,
    { signal },
  );

  if (!response.ok) {
    throw new Error("reverse_failed");
  }

  const data = (await response.json()) as { result: GeocodeResult | null };
  return data.result;
}
