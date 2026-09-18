import type { GeocodeResult } from "./types";

export interface GeocodingProvider {
  search(query: string): Promise<GeocodeResult[]>;
  reverse(latitude: number, longitude: number): Promise<GeocodeResult | null>;
}
