import type { LocationSource } from "@/lib/location/types";
import type { BusinessUseCaseValue } from "@/lib/assessment/types";
import type { NearbyHealthcarePlace } from "@/lib/healthcare/types";
import type { AccessibilityEntity } from "@/lib/accessibility/types";
import type { ProviderErrorKind } from "@/lib/providers/types";

export type SiteAnalysisRequest = {
  site: {
    latitude: number;
    longitude: number;
    name: string;
    formattedAddress: string;
    source: LocationSource;
  };
  businessUseCase: BusinessUseCaseValue;
};

// One entry per collector currently wired into the orchestrator. Every
// category is independently either `ok` or `unavailable` — one collector
// failing never prevents the others from returning, and never fails the
// overall request. Which categories are relevant to a given business use
// case (use-case profiles) is deferred to a later milestone; for now both
// existing collectors are always run.
export type CategoryResult<TEntity> =
  | { status: "ok"; data: TEntity[]; providerEndpoint: "primary" | "fallback" }
  | { status: "unavailable"; reason: ProviderErrorKind; message: string };

export type SiteAnalysisResponse = {
  requestId: string;
  site: SiteAnalysisRequest["site"];
  businessUseCase: BusinessUseCaseValue;
  generatedAt: string;
  categories: {
    healthcare: CategoryResult<NearbyHealthcarePlace>;
    accessibility: CategoryResult<AccessibilityEntity>;
  };
};
