import { HealthcareProviderError } from "../provider";
import type { HealthcarePlacesProvider, HealthcarePlacesResult } from "../provider";
import type { NearbyHealthcareQuery } from "../types";

// Google Places provider skeleton. See ../README.md for setup: which
// Google API to enable, where the key belongs, billing, and how to switch
// providers. This module intentionally makes NO live network request yet —
// see the TODO below. It only validates configuration and reports a clear,
// typed state so the rest of the app can distinguish "not configured" /
// "not implemented" from a real upstream failure.

function isConfigured(): boolean {
  return Boolean(process.env.GOOGLE_MAPS_SERVER_API_KEY?.trim());
}

export const googlePlacesHealthcareProvider: HealthcarePlacesProvider = {
  async findNearby(_query: NearbyHealthcareQuery): Promise<HealthcarePlacesResult> {
    if (!isConfigured()) {
      console.warn(
        "[healthcare/google-places] provider selected but GOOGLE_MAPS_SERVER_API_KEY is not set",
      );
      throw new HealthcareProviderError(
        "unconfigured",
        "Google Places provider selected but no server-side API key is configured.",
      );
    }

    // TODO: implement the live request once this integration is approved
    // and billing is confirmed. It should:
    //   1. POST to https://places.googleapis.com/v1/places:searchNearby
    //      with `includedTypes` covering hospital/pharmacy/doctor/dentist/
    //      veterinary_care/etc., `locationRestriction` built from `_query`
    //      (latitude/longitude/radiusMetres), and the API key sent only in
    //      the `X-Goog-Api-Key` request header — never in the URL, never
    //      sent to or read from the browser.
    //   2. Normalize each returned place into `NearbyHealthcarePlace`,
    //      reusing the same category/address/distance conventions as the
    //      Overpass provider (see ../providers/overpass.ts) so the two
    //      providers stay interchangeable to the rest of the app.
    //   3. Set `source: "google_places"` and use the Google place id as
    //      `sourceId`.
    // Until that exists, this provider must never claim to have real
    // results — no fabricated places, no silent fallback to fake data.
    console.warn(
      "[healthcare/google-places] provider is configured but the live request is not implemented yet",
    );
    throw new HealthcareProviderError(
      "not_implemented",
      "The Google Places provider is configured but not yet implemented.",
    );
  },
};
