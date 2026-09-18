export type AccessibilityCategory =
  | "railway_station"
  | "bus_stop"
  | "major_road"
  | "road"
  | "other";

export type AccessibilityEntity = {
  id: string;
  name: string | null;
  category: AccessibilityCategory;
  latitude: number;
  longitude: number;
  address: string | null;
  // Original OSM `highway=*` value, only set for road/major_road entities.
  roadClass: string | null;
  distanceMetres: number;
  source: "openstreetmap";
  sourceId: string;
};

export type NearbyAccessibilityQuery = {
  latitude: number;
  longitude: number;
  radiusMetres: number;
};
