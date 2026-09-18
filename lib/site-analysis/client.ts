import type { SiteAnalysisRequest, SiteAnalysisResponse } from "./types";

export async function runSiteAnalysis(
  request: SiteAnalysisRequest,
  signal?: AbortSignal,
): Promise<SiteAnalysisResponse> {
  const response = await fetch("/api/site-analysis", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
    signal,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      typeof data.error === "string" ? data.error : "Site analysis is temporarily unavailable.",
    );
  }

  return data as SiteAnalysisResponse;
}
