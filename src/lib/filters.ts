import type { Amenity, Ambiance, Cafe, Mood, Price } from "./types";
import { distanceKm } from "./places";

export interface Filters {
  q: string;
  region: string | "all";
  prices: Price[];
  amenities: Amenity[];
  moods: Mood[];
  ambiance: Ambiance[];
}

export type SortKey = "relevance" | "rating" | "distance";

export const EMPTY_FILTERS: Filters = { q: "", region: "all", prices: [], amenities: [], moods: [], ambiance: [] };

export const AMENITY_LABELS: Record<Amenity, string> = {
  coffee: "Coffee",
  matcha: "Matcha & tea",
  wifi: "Wi-Fi",
  outlets: "Power outlets",
  study: "Study-friendly",
  outdoor: "Outdoor seating",
  garden: "Garden",
  pets: "Pet-friendly",
  pastries: "Pastries",
  aircon: "Air-conditioned",
};

export const MOOD_LABELS: Record<Mood, string> = {
  cozy: "Cozy corners",
  matcha: "Matcha stops",
  study: "Study nooks",
  garden: "Garden cafés",
  date: "Date spots",
  hidden: "Hidden gems",
};

export const AMBIANCE_LABELS: Record<Ambiance, string> = {
  quiet: "Quiet",
  lively: "Lively",
  cozy: "Cozy",
  airy: "Bright & airy",
  romantic: "Romantic",
  rustic: "Rustic",
};

export function priceLabel(p?: Price) {
  return p ? "₱".repeat(p) : undefined;
}

export function countActive(f: Filters) {
  return (f.region !== "all" ? 1 : 0) + f.prices.length + f.amenities.length + f.moods.length + f.ambiance.length;
}

export function applyFilters(cafes: Cafe[], f: Filters) {
  const q = f.q.trim().toLowerCase();
  return cafes.filter((c) => {
    if (q) {
      const hay = `${c.name} ${c.city ?? ""} ${c.description ?? ""} ${(c.menuHighlights ?? []).join(" ")}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (f.region !== "all" && c.region !== f.region) return false;
    if (f.prices.length && (!c.price || !f.prices.includes(c.price))) return false;
    if (f.amenities.some((a) => !c.amenities.includes(a))) return false;
    if (f.moods.some((m) => !c.moods.includes(m))) return false;
    if (f.ambiance.length && !f.ambiance.some((a) => c.ambiance.includes(a))) return false;
    return true;
  });
}

export interface RatingInfo { avg: number; count: number }
export const MIN_RATINGS_FOR_SORT = 3;

export function sortCafes(
  cafes: Cafe[],
  sort: SortKey,
  opts: { origin?: { lat: number; lng: number }; ratings?: Record<string, RatingInfo>; q?: string },
) {
  const list = [...cafes];
  if (sort === "distance" && opts.origin) {
    const o = opts.origin;
    return list.sort((a, b) => distanceKm(o.lat, o.lng, a.lat, a.lng) - distanceKm(o.lat, o.lng, b.lat, b.lng));
  }
  if (sort === "rating" && opts.ratings) {
    const r = opts.ratings;
    const score = (c: Cafe) => {
      const x = r[c.id];
      return x && x.count >= MIN_RATINGS_FOR_SORT ? x.avg : -1;
    };
    return list.sort((a, b) => score(b) - score(a));
  }
  // relevance: name matches first, then richer listings
  const q = (opts.q ?? "").trim().toLowerCase();
  const rel = (c: Cafe) =>
    (c.source === "sample" ? 0 : 20) +
    (q && c.name.toLowerCase().startsWith(q) ? 10 : 0) +
    (q && c.name.toLowerCase().includes(q) ? 5 : 0) +
    c.amenities.length * 0.2 + (c.description ? 0.5 : 0);
  return list.sort((a, b) => rel(b) - rel(a));
}
