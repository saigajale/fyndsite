import type { AccessibilityEntity, NearbyAccessibilityQuery } from "./types";

export type AccessibilityResult = {
  places: AccessibilityEntity[];
  providerEndpoint: "primary" | "fallback";
};

// Errors are the shared, category-agnostic ProviderError from
// lib/providers/types.ts — no accessibility-specific error class exists.
// Unlike healthcare (which wraps errors to preserve an already-shipped
// API contract), this module has no legacy consumer to preserve, so it
// uses the shared type directly.
export interface AccessibilityProvider {
  findNearby(query: NearbyAccessibilityQuery): Promise<AccessibilityResult>;
}
