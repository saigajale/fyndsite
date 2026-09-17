import { distanceInMetres } from "@/lib/geo/distance";
import {
  runOverpassQuery,
  type OverpassElement,
  type OverpassResponse,
} from "@/lib/providers/overpass/client";
import { ProviderError } from "@/lib/providers/types";
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

// HTTP transport, endpoint fallback, timeout/abort handling, and retry
// decisions live in the shared lib/providers/overpass/client.ts runner.
// This file only owns the healthcare-specific query, tag categorization,
// and normalization.
const OVERPASS_QUERY_TIMEOUT_S = 25;

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

    try {
      const { data, providerEndpoint } = await runOverpassQuery(
        overpassQuery,
        "healthcare/overpass",
      );
      return {
        places: normalizeElements(data, origin),
        providerEndpoint,
      };
    } catch (error) {
      // Translate the shared, category-agnostic ProviderError into this
      // module's HealthcareProviderError (same `kind`, same message) so the
      // API route's existing `instanceof HealthcareProviderError` handling
      // keeps working unchanged.
      if (error instanceof ProviderError) {
        throw new HealthcareProviderError(error.kind, error.message);
      }
      throw error;
    }
  },
};
