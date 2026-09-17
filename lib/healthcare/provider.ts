import type { NearbyHealthcarePlace, NearbyHealthcareQuery } from "./types";

export type HealthcareProviderErrorKind =
  | "timeout"
  | "upstream"
  | "unconfigured"
  | "not_implemented";

// Thrown when a provider cannot produce results — an upstream request
// failed/timed out, or the selected provider is missing configuration
// (e.g. an API key) or isn't wired up to a live request yet. The route
// maps `kind` to an HTTP status without ever forwarding the raw upstream
// error, or any secret, to the client.
export class HealthcareProviderError extends Error {
  readonly kind: HealthcareProviderErrorKind;

  constructor(kind: HealthcareProviderErrorKind, message: string) {
    super(message);
    this.name = "HealthcareProviderError";
    this.kind = kind;
  }
}

export type HealthcarePlacesResult = {
  places: NearbyHealthcarePlace[];
  // Which endpoint tier produced this result — useful, non-sensitive
  // metadata for the API response; never the raw endpoint URL.
  providerEndpoint: "primary" | "fallback";
};

export interface HealthcarePlacesProvider {
  findNearby(query: NearbyHealthcareQuery): Promise<HealthcarePlacesResult>;
}
