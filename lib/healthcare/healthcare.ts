import { overpassHealthcareProvider } from "./providers/overpass";
import { googlePlacesHealthcareProvider } from "./providers/google-places";
import type { HealthcarePlacesProvider } from "./provider";

export type HealthcareProviderName = "overpass" | "google";

const VALID_PROVIDER_NAMES: HealthcareProviderName[] = ["overpass", "google"];

// Public-facing label included in the API response's `meta.provider`.
export const HEALTHCARE_PROVIDER_LABEL: Record<HealthcareProviderName, string> = {
  overpass: "openstreetmap-overpass",
  google: "google-places",
};

const PROVIDERS: Record<HealthcareProviderName, HealthcarePlacesProvider> = {
  overpass: overpassHealthcareProvider,
  google: googlePlacesHealthcareProvider,
};

function resolveProviderName(): HealthcareProviderName {
  const raw = process.env.HEALTHCARE_PROVIDER?.trim().toLowerCase();
  if (raw && (VALID_PROVIDER_NAMES as string[]).includes(raw)) {
    return raw as HealthcareProviderName;
  }
  // Default to Overpass. Google is only ever selected by an explicit
  // HEALTHCARE_PROVIDER=google — never a silent switch.
  return "overpass";
}

export const activeHealthcareProviderName: HealthcareProviderName = resolveProviderName();

// Swap the active healthcare-places provider via HEALTHCARE_PROVIDER, or
// add a new one to PROVIDERS above, without touching the API route or any
// consuming component.
export const healthcarePlacesProvider: HealthcarePlacesProvider =
  PROVIDERS[activeHealthcareProviderName];
