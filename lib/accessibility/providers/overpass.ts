import { distanceInMetres } from "@/lib/geo/distance";
import {
  runOverpassQuery,
  type OverpassElement,
  type OverpassResponse,
} from "@/lib/providers/overpass/client";
import type { AccessibilityProvider, AccessibilityResult } from "../provider";
import type {
  AccessibilityCategory,
  AccessibilityEntity,
  NearbyAccessibilityQuery,
} from "../types";

const OVERPASS_QUERY_TIMEOUT_S = 25;

type TagCondition = { key: string; value?: string };
type ElementType = "node" | "way";

// Each filter is a set of tag conditions AND'd into one Overpass clause,
// restricted to the element types that actually carry that tag combination
// in OSM (roads are always ways; stations/stops are usually nodes but are
// occasionally mapped as ways for station buildings/platforms).
type AccessibilityFilter = { conditions: TagCondition[]; elementTypes: ElementType[] };

// Major/high-capacity road classes vs. other drivable roads. Deliberately a
// curated list of `highway=*` values rather than the bare `highway` key,
// which would also match footways, cycleways, service roads, tracks, etc.
// and produce a very noisy, oversized query for an urban radius.
const MAJOR_ROAD_CLASSES = new Set([
  "motorway",
  "trunk",
  "primary",
  "secondary",
  "motorway_link",
  "trunk_link",
  "primary_link",
  "secondary_link",
]);

const OTHER_ROAD_CLASSES = ["tertiary", "tertiary_link", "residential", "unclassified"];

const ACCESSIBILITY_FILTERS: AccessibilityFilter[] = [
  { conditions: [{ key: "railway", value: "station" }], elementTypes: ["node", "way"] },
  { conditions: [{ key: "railway", value: "halt" }], elementTypes: ["node", "way"] },
  { conditions: [{ key: "railway", value: "tram_stop" }], elementTypes: ["node", "way"] },
  { conditions: [{ key: "highway", value: "bus_stop" }], elementTypes: ["node"] },
  // Bus platforms specifically — `public_transport=platform` alone also
  // matches tram/train platforms, which are already covered by the railway
  // filters above, so it's narrowed with the OSM `bus=yes` tag.
  {
    conditions: [
      { key: "public_transport", value: "platform" },
      { key: "bus", value: "yes" },
    ],
    elementTypes: ["node", "way"],
  },
  ...[...MAJOR_ROAD_CLASSES, ...OTHER_ROAD_CLASSES].map(
    (value): AccessibilityFilter => ({
      conditions: [{ key: "highway", value }],
      elementTypes: ["way"],
    }),
  ),
];

function buildQuery(latitude: number, longitude: number, radiusMetres: number): string {
  const around = `around:${radiusMetres},${latitude},${longitude}`;
  const clauses = ACCESSIBILITY_FILTERS.flatMap((filter) => {
    const tagExpr = filter.conditions
      .map((condition) =>
        condition.value
          ? `["${condition.key}"="${condition.value}"]`
          : `["${condition.key}"]`,
      )
      .join("");
    return filter.elementTypes.map((type) => `${type}${tagExpr}(${around});`);
  }).join("");

  return `[out:json][timeout:${OVERPASS_QUERY_TIMEOUT_S}];(${clauses});out center tags;`;
}

function classifyRoad(highwayValue: string): "major_road" | "road" {
  return MAJOR_ROAD_CLASSES.has(highwayValue) ? "major_road" : "road";
}

function categorize(tags: Record<string, string>): AccessibilityCategory {
  const railway = tags.railway;
  const highway = tags.highway;

  if (railway === "station" || railway === "halt" || railway === "tram_stop") {
    return "railway_station";
  }
  if (highway === "bus_stop" || (tags.public_transport === "platform" && tags.bus === "yes")) {
    return "bus_stop";
  }
  if (highway) {
    return classifyRoad(highway);
  }

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
): AccessibilityEntity | null {
  const latitude = element.lat ?? element.center?.lat;
  const longitude = element.lon ?? element.center?.lon;
  if (latitude === undefined || longitude === undefined) return null;

  const tags = element.tags ?? {};
  const name = tags.name ?? tags["name:en"] ?? null;
  const sourceId = `${element.type}/${element.id}`;
  const category = categorize(tags);
  const roadClass =
    category === "major_road" || category === "road" ? (tags.highway ?? null) : null;

  return {
    id: `osm:${sourceId}`,
    name,
    category,
    latitude,
    longitude,
    address: buildAddress(tags),
    roadClass,
    distanceMetres: Math.round(distanceInMetres(origin, { latitude, longitude })),
    source: "openstreetmap",
    sourceId,
  };
}

function normalizeElements(
  data: OverpassResponse,
  origin: { latitude: number; longitude: number },
): AccessibilityEntity[] {
  const seen = new Set<string>();
  const results: AccessibilityEntity[] = [];

  for (const element of data.elements ?? []) {
    const place = normalize(element, origin);
    if (!place) continue;
    // Dedupe strictly by stable OSM type/id identity — never by name, since
    // distinct OSM objects can share a name (e.g. two stops on the same
    // road called "Main Road").
    if (seen.has(place.sourceId)) continue;
    seen.add(place.sourceId);
    results.push(place);
  }

  results.sort((a, b) => a.distanceMetres - b.distanceMetres);
  return results;
}

export const overpassAccessibilityProvider: AccessibilityProvider = {
  async findNearby(query: NearbyAccessibilityQuery): Promise<AccessibilityResult> {
    const overpassQuery = buildQuery(query.latitude, query.longitude, query.radiusMetres);
    const origin = { latitude: query.latitude, longitude: query.longitude };

    // runOverpassQuery throws the shared ProviderError on failure — no
    // translation needed here since this module has no legacy error type
    // of its own to preserve; callers catch ProviderError directly.
    const { data, providerEndpoint } = await runOverpassQuery(
      overpassQuery,
      "accessibility/overpass",
    );

    return {
      places: normalizeElements(data, origin),
      providerEndpoint,
    };
  },
};
