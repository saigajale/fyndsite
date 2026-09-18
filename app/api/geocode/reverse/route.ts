import { NextRequest, NextResponse } from "next/server";
import { geocodingProvider } from "@/lib/location/geocoding";

export async function GET(request: NextRequest) {
  const latParam = request.nextUrl.searchParams.get("lat");
  const lonParam = request.nextUrl.searchParams.get("lon");
  const latitude = latParam ? Number(latParam) : NaN;
  const longitude = lonParam ? Number(lonParam) : NaN;

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return NextResponse.json(
      { error: "A valid lat and lon are required." },
      { status: 400 },
    );
  }

  try {
    const result = await geocodingProvider.reverse(latitude, longitude);
    return NextResponse.json({ result });
  } catch {
    return NextResponse.json(
      { error: "Could not resolve an address for this point." },
      { status: 502 },
    );
  }
}
