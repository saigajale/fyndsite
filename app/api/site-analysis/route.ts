import { NextRequest, NextResponse } from "next/server";
import { runSiteAnalysis } from "@/lib/site-analysis/service";
import { BUSINESS_USE_CASES } from "@/lib/assessment/types";
import type { BusinessUseCaseValue } from "@/lib/assessment/types";
import type { LocationSource } from "@/lib/location/types";

const VALID_SOURCES: LocationSource[] = ["search", "map_pin", "current_location"];
const VALID_USE_CASES = BUSINESS_USE_CASES.map((useCase) => useCase.value);

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Request body must be a JSON object." }, { status: 400 });
  }

  const { site, businessUseCase } = body as Record<string, unknown>;

  if (typeof site !== "object" || site === null) {
    return NextResponse.json(
      { error: "'site' is required and must be an object." },
      { status: 400 },
    );
  }

  const { latitude, longitude, name, formattedAddress, source } = site as Record<
    string,
    unknown
  >;

  if (!isFiniteNumber(latitude) || latitude < -90 || latitude > 90) {
    return NextResponse.json(
      { error: "'site.latitude' must be a number between -90 and 90." },
      { status: 400 },
    );
  }

  if (!isFiniteNumber(longitude) || longitude < -180 || longitude > 180) {
    return NextResponse.json(
      { error: "'site.longitude' must be a number between -180 and 180." },
      { status: 400 },
    );
  }

  if (!isNonEmptyString(name)) {
    return NextResponse.json({ error: "'site.name' is required." }, { status: 400 });
  }

  if (!isNonEmptyString(formattedAddress)) {
    return NextResponse.json(
      { error: "'site.formattedAddress' is required." },
      { status: 400 },
    );
  }

  if (typeof source !== "string" || !VALID_SOURCES.includes(source as LocationSource)) {
    return NextResponse.json(
      { error: `'site.source' must be one of: ${VALID_SOURCES.join(", ")}.` },
      { status: 400 },
    );
  }

  if (
    typeof businessUseCase !== "string" ||
    !VALID_USE_CASES.includes(businessUseCase as BusinessUseCaseValue)
  ) {
    return NextResponse.json(
      { error: `'businessUseCase' must be one of: ${VALID_USE_CASES.join(", ")}.` },
      { status: 400 },
    );
  }

  // runSiteAnalysis never throws: each collector's provider errors are
  // already caught and reflected as an "unavailable" category in the
  // response body, so a request that validates successfully always gets a
  // 200 — a category being unavailable is data, not an HTTP-level error.
  const analysis = await runSiteAnalysis({
    site: {
      latitude,
      longitude,
      name,
      formattedAddress,
      source: source as LocationSource,
    },
    businessUseCase: businessUseCase as BusinessUseCaseValue,
  });

  return NextResponse.json(analysis);
}
