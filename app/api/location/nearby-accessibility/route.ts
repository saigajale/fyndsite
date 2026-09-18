import { NextRequest, NextResponse } from "next/server";
import { accessibilityProvider } from "@/lib/accessibility/accessibility";
import { ProviderError } from "@/lib/providers/types";

const MIN_RADIUS_METRES = 50;
const MAX_RADIUS_METRES = 10000;
const DEFAULT_RADIUS_METRES = 2000;

function parseNumber(value: string | null): number | null {
  if (value === null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const latitude = parseNumber(params.get("lat"));
  const longitude = parseNumber(params.get("lng"));
  const radiusMetres = parseNumber(params.get("radius")) ?? DEFAULT_RADIUS_METRES;

  if (latitude === null || latitude < -90 || latitude > 90) {
    return NextResponse.json(
      { error: "A valid 'lat' between -90 and 90 is required." },
      { status: 400 },
    );
  }

  if (longitude === null || longitude < -180 || longitude > 180) {
    return NextResponse.json(
      { error: "A valid 'lng' between -180 and 180 is required." },
      { status: 400 },
    );
  }

  if (radiusMetres < MIN_RADIUS_METRES || radiusMetres > MAX_RADIUS_METRES) {
    return NextResponse.json(
      {
        error: `'radius' must be between ${MIN_RADIUS_METRES} and ${MAX_RADIUS_METRES} metres.`,
      },
      { status: 400 },
    );
  }

  try {
    const { places, providerEndpoint } = await accessibilityProvider.findNearby({
      latitude,
      longitude,
      radiusMetres,
    });

    return NextResponse.json({
      results: places,
      meta: {
        total: places.length,
        latitude,
        longitude,
        radiusMetres,
        provider: "openstreetmap-overpass",
        providerEndpoint,
      },
    });
  } catch (error) {
    if (error instanceof ProviderError) {
      if (error.kind === "timeout") {
        return NextResponse.json(
          { error: "The accessibility data source timed out. Please try again." },
          { status: 504 },
        );
      }

      if (error.kind === "unconfigured" || error.kind === "not_implemented") {
        return NextResponse.json(
          {
            error: "The selected accessibility data provider is not available right now.",
          },
          { status: 503 },
        );
      }
    }

    return NextResponse.json(
      {
        error: "Nearby accessibility data is temporarily unavailable. Please try again.",
      },
      { status: 502 },
    );
  }
}
