export type HealthcareCategory =
  | "hospital"
  | "clinic"
  | "doctor"
  | "polyclinic"
  | "pharmacy"
  | "dentist"
  | "diagnostic_lab"
  | "healthcare_centre"
  | "nursing_home"
  | "veterinary"
  | "ambulance"
  | "other";

export type NearbyHealthcarePlace = {
  id: string;
  name: string | null;
  category: HealthcareCategory;
  latitude: number;
  longitude: number;
  address: string | null;
  phone: string | null;
  website: string | null;
  openingHours: string | null;
  speciality: string | null;
  distanceMetres: number;
  source: "openstreetmap" | "google_places";
  sourceId: string;
};

export type NearbyHealthcareQuery = {
  latitude: number;
  longitude: number;
  radiusMetres: number;
};
