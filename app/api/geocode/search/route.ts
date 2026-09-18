import { NextRequest, NextResponse } from "next/server";
import { geocodingProvider } from "@/lib/location/geocoding";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (query.length < 3) {
    return NextResponse.json({ results: [] });
  }

  try {
    const results = await geocodingProvider.search(query);
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json(
      { error: "Search is temporarily unavailable. Please try again." },
      { status: 502 },
    );
  }
}
