import type { Amenity, Cafe, Mood } from "../types";
import { artFromId } from "../art";
import { nearestPlace } from "../places";

/**
 * OpenStreetMap café provider (via the Overpass API).
 *
 * Licence: OSM data is © OpenStreetMap contributors, available under the Open Database
 * Licence (ODbL). We may display and cache it as long as we show attribution and keep
 * derived databases under ODbL. We only display it; we never present it as verified.
 * Overpass is a shared, free service — keep queries small (bbox + limit) and cached.
 */

export const OSM_ATTRIBUTION = "Café data © OpenStreetMap contributors (ODbL)";
const OVERPASS_URLS = (
  process.env.OVERPASS_URL ||
  "https://overpass-api.de/api/interpreter,https://overpass.kumi.systems/api/interpreter,https://overpass.private.coffee/api/interpreter"
).split(",");

interface OsmElement {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

const yes = (v?: string) => !!v && v !== "no";

export function mapOsmElement(el: OsmElement): Cafe | null {
  const t = el.tags || {};
  const lat = el.lat ?? el.center?.lat;
  const lng = el.lon ?? el.center?.lon;
  if (!t.name || lat == null || lng == null) return null;

  const id = `osm-${el.type[0]}${el.id}`;
  const text = `${t.name} ${t.cuisine || ""} ${t.description || ""}`.toLowerCase();
  const amenities = new Set<Amenity>();
  if (/coffee|kape|espresso|roast/.test(text) || !/tea|matcha/.test(text)) amenities.add("coffee");
  if (/matcha|tea|hojicha/.test(text)) amenities.add("matcha");
  if (t.internet_access && t.internet_access !== "no") amenities.add("wifi");
  if (yes(t.outdoor_seating)) amenities.add("outdoor");
  if (yes(t.garden) || t.leisure === "garden") amenities.add("garden");
  if (t.dog === "yes" || t.dog === "leashed") amenities.add("pets");
  if (yes(t.air_conditioning)) amenities.add("aircon");
  if (Object.keys(t).some((k) => k.startsWith("socket:")) || yes(t.power_supply)) amenities.add("outlets");

  const moods = new Set<Mood>();
  if (amenities.has("matcha")) moods.add("matcha");
  if (amenities.has("garden") || amenities.has("outdoor")) moods.add("garden");
  if (amenities.has("wifi") && amenities.has("outlets")) moods.add("study");

  const street = [t["addr:housenumber"], t["addr:street"]].filter(Boolean).join(" ");
  const near = nearestPlace(lat, lng);
  const city = t["addr:city"] || near?.name;
  const address = [street, t["addr:barangay"] || t["addr:suburb"], t["addr:city"]].filter(Boolean).join(", ");

  return {
    id,
    source: "osm",
    name: t.name,
    description: t.description,
    lat,
    lng,
    address: address || undefined,
    city,
    region: near?.region,
    amenities: [...amenities],
    moods: [...moods],
    ambiance: [],
    hours: t.opening_hours
      ? { raw: t.opening_hours, verified: false, source: "OpenStreetMap (community-edited, may be outdated)" }
      : undefined,
    phone: t.phone || t["contact:phone"],
    website: t.website || t["contact:website"],
    independent: !t.brand && !t["brand:wikidata"],
    art: artFromId(id),
    attribution: OSM_ATTRIBUTION,
    verified: false,
  };
}

async function overpass(query: string): Promise<OsmElement[]> {
  let lastErr: unknown;
  // Try each public Overpass instance in turn; they are shared, so one may be busy.
  for (const url of OVERPASS_URLS) {
    try {
      const res = await fetch(url.trim(), {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
          "User-Agent": "LittleCupClub/0.1 (cafe discovery prototype; https://github.com/)",
        },
        body: "data=" + encodeURIComponent(query),
        signal: AbortSignal.timeout(20000),
        next: { revalidate: 60 * 60 * 12 },
      });
      if (!res.ok) throw new Error(`Overpass ${url} responded ${res.status}`);
      const json = (await res.json()) as { elements: OsmElement[] };
      return json.elements || [];
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("Overpass unavailable");
}

export type BBox = [south: number, west: number, north: number, east: number];

export async function osmCafesInBBox(bbox: BBox, limit = 200): Promise<Cafe[]> {
  const [s, w, n, e] = bbox.map((v) => Number(v.toFixed(4)));
  const q = `[out:json][timeout:20];nwr["amenity"="cafe"]["name"](${s},${w},${n},${e});out center ${limit};`;
  const els = await overpass(q);
  return els.map(mapOsmElement).filter((c): c is Cafe => !!c);
}

export async function osmCafeById(id: string): Promise<Cafe | null> {
  const m = /^osm-([nwr])(\d+)$/.exec(id);
  if (!m) return null;
  const type = m[1] === "n" ? "node" : m[1] === "w" ? "way" : "relation";
  const els = await overpass(`[out:json][timeout:15];${type}(${m[2]});out center 1;`);
  return els[0] ? mapOsmElement(els[0]) : null;
}
