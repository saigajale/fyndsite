import { randomUUID } from "node:crypto";
import { healthcarePlacesProvider } from "@/lib/healthcare/healthcare";
import { HealthcareProviderError } from "@/lib/healthcare/provider";
import type { NearbyHealthcarePlace } from "@/lib/healthcare/types";
import { accessibilityProvider } from "@/lib/accessibility/accessibility";
import type { AccessibilityEntity } from "@/lib/accessibility/types";
import { ProviderError, type ProviderErrorKind } from "@/lib/providers/types";
import type { CategoryResult, SiteAnalysisRequest, SiteAnalysisResponse } from "./types";

// Shared across both collectors for this milestone. Per-category or
// per-use-case radii belong to the use-case-profile design explicitly
// deferred to a later milestone.
const SITE_ANALYSIS_RADIUS_METRES = 2000;

function safeUnavailableMessage(reason: ProviderErrorKind, categoryLabel: string): string {
  switch (reason) {
    case "timeout":
      return `The ${categoryLabel} data source timed out. Please try again.`;
    case "unconfigured":
    case "not_implemented":
      return `The ${categoryLabel} data provider is not available right now.`;
    case "upstream":
    default:
      return `Nearby ${categoryLabel} data is temporarily unavailable. Please try again.`;
  }
}

async function runHealthcare(
  latitude: number,
  longitude: number,
): Promise<CategoryResult<NearbyHealthcarePlace>> {
  try {
    const { places, providerEndpoint } = await healthcarePlacesProvider.findNearby({
      latitude,
      longitude,
      radiusMetres: SITE_ANALYSIS_RADIUS_METRES,
    });
    return { status: "ok", data: places, providerEndpoint };
  } catch (error) {
    const reason = error instanceof HealthcareProviderError ? error.kind : "upstream";
    return {
      status: "unavailable",
      reason,
      message: safeUnavailableMessage(reason, "healthcare"),
    };
  }
}

async function runAccessibility(
  latitude: number,
  longitude: number,
): Promise<CategoryResult<AccessibilityEntity>> {
  try {
    const { places, providerEndpoint } = await accessibilityProvider.findNearby({
      latitude,
      longitude,
      radiusMetres: SITE_ANALYSIS_RADIUS_METRES,
    });
    return { status: "ok", data: places, providerEndpoint };
  } catch (error) {
    const reason = error instanceof ProviderError ? error.kind : "upstream";
    return {
      status: "unavailable",
      reason,
      message: safeUnavailableMessage(reason, "accessibility"),
    };
  }
}

// Fans out to every currently available collector and aggregates the
// results. Each collector call above catches its own provider errors and
// resolves to a CategoryResult rather than rejecting, so this never throws
// on a single category's failure — the two calls run concurrently and
// independently, matching the partial-tolerance goal from the architecture
// design (equivalent in effect to Promise.allSettled, but each branch is
// already typed as a resolved CategoryResult rather than a settled-promise
// wrapper that callers would have to unwrap).
export async function runSiteAnalysis(
  request: SiteAnalysisRequest,
): Promise<SiteAnalysisResponse> {
  const { latitude, longitude } = request.site;

  const [healthcare, accessibility] = await Promise.all([
    runHealthcare(latitude, longitude),
    runAccessibility(latitude, longitude),
  ]);

  return {
    requestId: randomUUID(),
    site: request.site,
    businessUseCase: request.businessUseCase,
    generatedAt: new Date().toISOString(),
    categories: { healthcare, accessibility },
  };
}
