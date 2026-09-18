import { nominatimProvider } from "./providers/nominatim";
import type { GeocodingProvider } from "./provider";

// Swap the active geocoding provider here without touching the API routes
// or the assessment UI that consume it.
export const geocodingProvider: GeocodingProvider = nominatimProvider;
