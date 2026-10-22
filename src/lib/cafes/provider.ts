import type { Cafe, CafeSnapshot } from "../types";
import { SAMPLE_CAFES, getSampleCafe } from "./sample";
import { SAN_PABLO_CAFES, getSanPabloCafe } from "./sanpablo";

/** Real curated cafés first, then clearly-labelled fictional samples. */
export const FEATURED_CAFES: Cafe[] = [...SAN_PABLO_CAFES, ...SAMPLE_CAFES];

/**
 * Café data provider abstraction. The UI only talks to these functions, so a
 * licensed places API (Mapbox Search, Foursquare, a curated Supabase table, …)
 * can be swapped in later without touching components.
 */
export type ProviderKey = "sample" | "osm";

export const PROVIDERS: Record<ProviderKey, { label: string; short: string; note: string }> = {
  sample: {
    label: "Featured cafés",
    short: "Featured",
    note: "Real San Pablo cafés, plus clearly-labelled fictional samples elsewhere.",
  },
  osm: {
    label: "Real cafés · OpenStreetMap",
    short: "OpenStreetMap",
    note: "Community-mapped cafés from OpenStreetMap. Details can be incomplete or outdated.",
  },
};

export type BBox = [number, number, number, number]; // south, west, north, east

export async function fetchCafes(provider: ProviderKey, bbox?: BBox, signal?: AbortSignal): Promise<Cafe[]> {
  if (provider === "sample") {
    if (!bbox) return FEATURED_CAFES;
    const [s, w, n, e] = bbox;
    return FEATURED_CAFES.filter((c) => c.lat >= s && c.lat <= n && c.lng >= w && c.lng <= e);
  }
  if (!bbox) return [];
  const res = await fetch(`/api/cafes?bbox=${bbox.map((v) => v.toFixed(4)).join(",")}`, { signal });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "Couldn't reach the café data service.");
  return json.cafes as Cafe[];
}

export { getSampleCafe, getSanPabloCafe };

export function toSnapshot(c: Cafe): CafeSnapshot {
  return {
    id: c.id, source: c.source, name: c.name, lat: c.lat, lng: c.lng, city: c.city,
    region: c.region, amenities: c.amenities, moods: c.moods, independent: c.independent, art: c.art,
  };
}
