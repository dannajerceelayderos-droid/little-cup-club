import { NextResponse } from "next/server";
import { osmCafesInBBox, osmCafeById, OSM_ATTRIBUTION } from "@/lib/cafes/osm";

export const revalidate = 43200;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  try {
    if (id) {
      const cafe = await osmCafeById(id);
      if (!cafe) return NextResponse.json({ error: "Café not found" }, { status: 404 });
      return NextResponse.json({ cafe, attribution: OSM_ATTRIBUTION });
    }
    const raw = url.searchParams.get("bbox") || "";
    const parts = raw.split(",").map(Number);
    if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n))) {
      return NextResponse.json({ error: "bbox must be south,west,north,east" }, { status: 400 });
    }
    const [s, w, n, e] = parts;
    if (n <= s || e <= w || n - s > 0.6 || e - w > 0.8) {
      return NextResponse.json({ error: "Zoom in a little closer to search real cafés." }, { status: 400 });
    }
    const cafes = await osmCafesInBBox([s, w, n, e]);
    return NextResponse.json(
      { cafes, attribution: OSM_ATTRIBUTION },
      { headers: { "Cache-Control": "public, s-maxage=43200, stale-while-revalidate=86400" } },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "OpenStreetMap's café service is busy right now. Try again in a moment." },
      { status: 502 },
    );
  }
}
