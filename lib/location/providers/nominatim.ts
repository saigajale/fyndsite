import type { GeocodingProvider } from "../provider";
import type { GeocodeResult } from "../types";

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org";

// Nominatim's usage policy requires a descriptive User-Agent identifying the
// application. See https://operations.osmfoundation.org/policies/nominatim/
const USER_AGENT = "FyndSite-Assessment/0.1 (Fyndsol Location Intelligence)";

type NominatimPlace = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  name?: string;
  address?: Record<string, string>;
};

function toGeocodeResult(place: NominatimPlace): GeocodeResult {
  const name =
    place.name ||
    place.address?.amenity ||
    place.address?.building ||
    place.address?.road ||
    place.display_name.split(",")[0].trim();

  return {
    providerPlaceId: String(place.place_id),
    name,
    formattedAddress: place.display_name,
    latitude: Number(place.lat),
    longitude: Number(place.lon),
  };
}

async function nominatimFetch(path: string, params: Record<string, string>) {
  const url = new URL(`${NOMINATIM_BASE_URL}${path}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      "Accept-Language": "en",
    },
  });

  if (!response.ok) {
    throw new Error(`Nominatim request failed with status ${response.status}`);
  }

  return response.json();
}

export const nominatimProvider: GeocodingProvider = {
  async search(query: string): Promise<GeocodeResult[]> {
    const results = (await nominatimFetch("/search", {
      q: query,
      format: "jsonv2",
      addressdetails: "1",
      limit: "6",
      countrycodes: "in",
    })) as NominatimPlace[];

    return results.map(toGeocodeResult);
  },

  async reverse(latitude: number, longitude: number): Promise<GeocodeResult | null> {
    const result = (await nominatimFetch("/reverse", {
      lat: String(latitude),
      lon: String(longitude),
      format: "jsonv2",
      addressdetails: "1",
    })) as NominatimPlace | { error?: string };

    if (!result || "error" in result) {
      return null;
    }

    return toGeocodeResult(result as NominatimPlace);
  },
};
