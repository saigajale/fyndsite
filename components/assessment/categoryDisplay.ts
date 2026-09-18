import type { CategoryResult, SiteAnalysisResponse } from "@/lib/site-analysis/types";

// Lifecycle of the one POST /api/site-analysis request the UI makes.
export type SiteAnalysisState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; response: SiteAnalysisResponse };

// What a single category's results panel should render. "error" means the
// request itself failed (network/validation); "unavailable" means the
// request succeeded but this specific category's provider failed — the
// distinction the partial-tolerant SiteAnalysisResponse makes possible.
export type CategoryDisplayState<TEntity> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ok"; data: TEntity[] }
  | { status: "unavailable"; message: string };

export function toCategoryDisplayState<TEntity>(
  analysis: SiteAnalysisState,
  select: (response: SiteAnalysisResponse) => CategoryResult<TEntity>,
): CategoryDisplayState<TEntity> {
  if (analysis.status === "idle") return { status: "idle" };
  if (analysis.status === "loading") return { status: "loading" };
  if (analysis.status === "error") return { status: "error", message: analysis.message };

  const category = select(analysis.response);
  if (category.status === "ok") return { status: "ok", data: category.data };
  return { status: "unavailable", message: category.message };
}
