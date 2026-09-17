import { distanceInMetres } from "@/lib/geo/distance";
import {
  HealthcareProviderError,
  type HealthcarePlacesProvider,
  type HealthcarePlacesResult,
} from "../provider";
import type {
  HealthcareCategory,
  NearbyHealthcarePlace,
  NearbyHealthcareQuery,
} from "../types";

// Ordered list of Overpass endpoints to try. The public overpass-api.de
// instance is known to intermittently reject requests from some networks
// (406) or rate-limit (429); mirrors give this provider a real chance of
// succeeding without the caller ever seeing the failure. Configurable via
// OVERPASS_ENDPOINTS (comma-separated) for deployments that need a private
// mirror, but no environment variable is required for local development.
const DEFAULT_OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
];

function resolveEndpoints(): string[] {
  const fromEnv = process.env.OVERPASS_ENDPOINTS;
  if (!fromEnv) return DEFAULT_OVERPASS_ENDPOINTS;

  const parsed = fromEnv
    .split(",")
    .map((url) => url.trim())
    .filter((url) => url.length > 0);

  return parsed.length > 0 ? parsed : DEFAULT_OVERPASS_ENDPOINTS;
}

const REQUEST_TIMEOUT_MS = 15000;
const OVERPASS_QUERY_TIMEOUT_S = 25;

type EndpointFailureReason = number | "timeout" | "network_error";

class OverpassEndpointError extends Error {
  readonly endpoint: string;
  readonly reason: EndpointFailureReason;

  constructor(endpoint: string, reason: EndpointFailureReason) {
    super(`Overpass endpoint failed: ${endpoint} (${reason})`);
    this.name = "OverpassEndpointError";
    this.endpoint = endpoint;
    this.reason = reason;
  }
}

// Only these failures are worth trying the next mirror for. Any other
// non-OK status (e.g. 400 from a malformed query) would fail identically on
// every endpoint, so we stop immediately instead of retrying pointlessly.
function isRetryableFailure(reason: EndpointFailureReason): boolean {
  if (reason === "timeout" || reason === "network_error") return true;
  if (reason === 406 || reason === 429) return true;
  return typeof reason === "number" && reason >= 500;
}

function endpointHost(endpoint: string): string {
  try {
    return new URL(endpoint).host;
  } catch {
    return "unknown-endpoint";
  }
}

type TagCondition = { key: string; value?: string };

// Each inner array is a set of tag conditions AND'd into one Overpass clause;
// the outer array is unioned into a single query so Overpass returns every
// matching element exactly once (no manual de-duplication needed for an
// object that happens to match more than one clause).
const HEALTHCARE_FILTERS: TagCondition[][] = [
  [{ key: "amenity", value: "hospital" }],
  [{ key: "amenity", value: "clinic" }],
  [{ key: "amenity", value: "doctors" }],
  [{ key: "amenity", value: "pharmacy" }],
  [{ key: "amenity", value: "dentist" }],
  [{ key: "amenity", value: "veterinary" }],
  [{ key: "amenity", value: "nursing_home" }],
  [
    { key: "amenity", value: "social_facility" },
    { key: "social_facility", value: "nursing_home" },
  ],
  [{ key: "healthcare" }],
  [{ key: "emergency", value: "ambulance_station" }],
  [{ key: "emergency", value: "ambulance" }],
];

function buildQuery(latitude: number, longitude: number, radiusMetres: number): string {
  const around = `around:${radiusMetres},${latitude},${longitude}`;
  const clauses = HEALTHCARE_FILTERS.flatMap((conditions) => {
    const tagExpr = conditions
      .map((condition) =>
        condition.value
          ? `["${condition.key}"="${condition.value}"]`
          : `["${condition.key}"]`,
      )
      .join("");
    return [`node${tagExpr}(${around});`, `way${tagExpr}(${around});`];
  }).join("");

  return `[out:json][timeout:${OVERPASS_QUERY_TIMEOUT_S}];(${clauses});out center tags;`;
}

type OverpassElement = {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

type OverpassResponse = { elements: OverpassElement[] };

// OSM has no single canonical "polyclinic" tag; mappers most often express
// it as a clinic/healthcare-centre with the word in the name, so we detect
// it by name as a normalization step (not inventing data — the name itself
// is unmodified, only the internal category bucket is inferred from it).
function categorize(tags: Record<string, string>, name: string | null): HealthcareCategory {
  if (name && /polyclinic/i.test(name)) return "polyclinic";

  const amenity = tags.amenity;
  const healthcare = tags.healthcare;
  const emergency = tags.emergency;

  if (amenity === "hospital" || healthcare === "hospital") return "hospital";
  if (amenity === "pharmacy" || healthcare === "pharmacy") return "pharmacy";
  if (amenity === "dentist" || healthcare === "dentist") return "dentist";
  if (amenity === "veterinary") return "veterinary";
  if (amenity === "doctors" || healthcare === "doctor") return "doctor";
  if (amenity === "clinic" || healthcare === "clinic") return "clinic";
  if (healthcare === "laboratory") return "diagnostic_lab";
  if (healthcare === "centre") return "healthcare_centre";
  if (
    amenity === "nursing_home" ||
    healthcare === "nursing_home" ||
    (amenity === "social_facility" && tags.social_facility === "nursing_home")
  ) {
    return "nursing_home";
  }
  if (emergency === "ambulance_station" || emergency === "ambulance") return "ambulance";

  return "other";
}

function buildAddress(tags: Record<string, string>): string | null {
  const streetLine =
    tags["addr:housenumber"] && tags["addr:street"]
      ? `${tags["addr:housenumber"]} ${tags["addr:street"]}`
      : (tags["addr:street"] ?? null);

  const parts = [
    streetLine,
    tags["addr:suburb"],
    tags["addr:city"] ?? tags["addr:town"] ?? tags["addr:village"],
    tags["addr:postcode"],
  ].filter((part): part is string => Boolean(part && part.trim().length > 0));

  return parts.length > 0 ? parts.join(", ") : null;
}

function normalize(
  element: OverpassElement,
  origin: { latitude: number; longitude: number },
): NearbyHealthcarePlace | null {
  const latitude = element.lat ?? element.center?.lat;
  const longitude = element.lon ?? element.center?.lon;
  if (latitude === undefined || longitude === undefined) return null;

  const tags = element.tags ?? {};
  const name = tags.name ?? tags["name:en"] ?? null;
  const sourceId = `${element.type}/${element.id}`;

  return {
    id: `osm:${sourceId}`,
    name,
    category: categorize(tags, name),
    latitude,
    longitude,
    address: buildAddress(tags),
    phone: tags.phone ?? tags["contact:phone"] ?? null,
    website: tags.website ?? tags["contact:website"] ?? null,
    openingHours: tags.opening_hours ?? null,
    speciality: tags["healthcare:speciality"] ?? null,
    distanceMetres: Math.round(distanceInMetres(origin, { latitude, longitude })),
    source: "openstreetmap",
    sourceId,
  };
}

async function fetchFromEndpoint(
  endpoint: string,
  overpassQuery: string,
): Promise<OverpassResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: overpassQuery,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new OverpassEndpointError(endpoint, response.status);
    }

    return (await response.json()) as OverpassResponse;
  } catch (error) {
    if (error instanceof OverpassEndpointError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new OverpassEndpointError(endpoint, "timeout");
    }
    throw new OverpassEndpointError(endpoint, "network_error");
  } finally {
    clearTimeout(timeout);
  }
}

function normalizeElements(
  data: OverpassResponse,
  origin: { latitude: number; longitude: number },
): NearbyHealthcarePlace[] {
  const seen = new Set<string>();
  const results: NearbyHealthcarePlace[] = [];

  for (const element of data.elements ?? []) {
    const place = normalize(element, origin);
    if (!place) continue;
    if (seen.has(place.sourceId)) continue;
    seen.add(place.sourceId);
    results.push(place);
  }

  results.sort((a, b) => a.distanceMetres - b.distanceMetres);
  return results;
}

export const overpassHealthcareProvider: HealthcarePlacesProvider = {
  async findNearby(query: NearbyHealthcareQuery): Promise<HealthcarePlacesResult> {
    const overpassQuery = buildQuery(query.latitude, query.longitude, query.radiusMetres);
    const origin = { latitude: query.latitude, longitude: query.longitude };
    const endpoints = resolveEndpoints();
    const failures: { endpoint: string; reason: EndpointFailureReason }[] = [];

    for (let index = 0; index < endpoints.length; index += 1) {
      const endpoint = endpoints[index];

      try {
        const data = await fetchFromEndpoint(endpoint, overpassQuery);
        return {
          places: normalizeElements(data, origin),
          providerEndpoint: index === 0 ? "primary" : "fallback",
        };
      } catch (error) {
        if (!(error instanceof OverpassEndpointError)) throw error;

        failures.push({ endpoint: error.endpoint, reason: error.reason });
        // Safe logging: endpoint host + failure reason only, no query
        // coordinates or other request data.
        console.warn(
          `[healthcare/overpass] endpoint failed: ${endpointHost(error.endpoint)} reason=${error.reason}`,
        );

        if (!isRetryableFailure(error.reason)) {
          throw new HealthcareProviderError(
            "upstream",
            `Overpass rejected the query at ${endpointHost(error.endpoint)} (${error.reason})`,
          );
        }
        // Otherwise fall through and try the next endpoint.
      }
    }

    const allTimedOut = failures.every((failure) => failure.reason === "timeout");
    console.error(
      `[healthcare/overpass] all endpoints failed: ${failures
        .map((failure) => `${endpointHost(failure.endpoint)}=${failure.reason}`)
        .join(", ")}`,
    );

    throw new HealthcareProviderError(
      allTimedOut ? "timeout" : "upstream",
      "All Overpass endpoints failed",
    );
  },
};
