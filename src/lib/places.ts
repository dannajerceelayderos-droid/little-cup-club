/**
 * A small offline gazetteer of Philippine towns and cities used for location search,
 * "near X" labels and Coffee Passport regions. Coordinates are town/city centres
 * (public geographic data), not business locations.
 */
export interface Place {
  name: string;
  province: string;
  region: RegionKey;
  lat: number;
  lng: number;
  zoom: number;
}

export type RegionKey = "laguna" | "ridge" | "manila" | "cordillera" | "visayas" | "mindanao";

export const REGIONS: Record<RegionKey, { name: string; blurb: string; color: string }> = {
  laguna: { name: "Laguna Lakeside", blurb: "Seven lakes, coconut groves, slow mornings.", color: "#C9D9BD" },
  ridge: { name: "Tagaytay & Batangas Ridge", blurb: "Cool air, volcano views, barako coffee.", color: "#F6E7A9" },
  manila: { name: "Metro Manila", blurb: "Hidden nooks between busy streets.", color: "#DFAE91" },
  cordillera: { name: "Cordillera Highlands", blurb: "Pine trees, fog and mountain beans.", color: "#A9C09A" },
  visayas: { name: "Visayas Islands", blurb: "Seaside cups and island sweets.", color: "#CFE1DC" },
  mindanao: { name: "Mindanao", blurb: "Home of cacao, durian and surf breaks.", color: "#EFD3C6" },
};

export const PLACES: Place[] = [
  { name: "San Pablo City", province: "Laguna", region: "laguna", lat: 14.0697, lng: 121.3253, zoom: 13 },
  { name: "Los Baños", province: "Laguna", region: "laguna", lat: 14.1699, lng: 121.2441, zoom: 13 },
  { name: "Calamba", province: "Laguna", region: "laguna", lat: 14.2117, lng: 121.1653, zoom: 13 },
  { name: "Santa Cruz", province: "Laguna", region: "laguna", lat: 14.2814, lng: 121.4161, zoom: 13 },
  { name: "Tagaytay", province: "Cavite", region: "ridge", lat: 14.1153, lng: 120.9621, zoom: 13 },
  { name: "Lipa", province: "Batangas", region: "ridge", lat: 13.9411, lng: 121.1631, zoom: 13 },
  { name: "Batangas City", province: "Batangas", region: "ridge", lat: 13.7565, lng: 121.0583, zoom: 13 },
  { name: "Lucena", province: "Quezon", region: "ridge", lat: 13.9373, lng: 121.6170, zoom: 13 },
  { name: "Makati", province: "Metro Manila", region: "manila", lat: 14.5547, lng: 121.0244, zoom: 14 },
  { name: "Quezon City", province: "Metro Manila", region: "manila", lat: 14.6488, lng: 121.0509, zoom: 13 },
  { name: "Taguig (BGC)", province: "Metro Manila", region: "manila", lat: 14.5509, lng: 121.0503, zoom: 14 },
  { name: "Manila", province: "Metro Manila", region: "manila", lat: 14.5995, lng: 120.9842, zoom: 14 },
  { name: "Pasig", province: "Metro Manila", region: "manila", lat: 14.5764, lng: 121.0851, zoom: 14 },
  { name: "Marikina", province: "Metro Manila", region: "manila", lat: 14.6507, lng: 121.1029, zoom: 14 },
  { name: "Baguio", province: "Benguet", region: "cordillera", lat: 16.4023, lng: 120.5960, zoom: 14 },
  { name: "Sagada", province: "Mountain Province", region: "cordillera", lat: 17.0844, lng: 120.9010, zoom: 14 },
  { name: "Cebu City", province: "Cebu", region: "visayas", lat: 10.3157, lng: 123.8854, zoom: 13 },
  { name: "Dumaguete", province: "Negros Oriental", region: "visayas", lat: 9.3068, lng: 123.3054, zoom: 14 },
  { name: "Iloilo City", province: "Iloilo", region: "visayas", lat: 10.7202, lng: 122.5621, zoom: 13 },
  { name: "Bacolod", province: "Negros Occidental", region: "visayas", lat: 10.6765, lng: 122.9509, zoom: 13 },
  { name: "Tagbilaran", province: "Bohol", region: "visayas", lat: 9.6475, lng: 123.8556, zoom: 14 },
  { name: "Davao City", province: "Davao del Sur", region: "mindanao", lat: 7.0731, lng: 125.6128, zoom: 13 },
  { name: "Cagayan de Oro", province: "Misamis Oriental", region: "mindanao", lat: 8.4542, lng: 124.6319, zoom: 13 },
  { name: "General Luna (Siargao)", province: "Surigao del Norte", region: "mindanao", lat: 9.7896, lng: 126.1569, zoom: 14 },
  { name: "Zamboanga City", province: "Zamboanga del Sur", region: "mindanao", lat: 6.9214, lng: 122.079, zoom: 13 },
];

export const PH_VIEW = { lat: 12.3, lng: 122.6, zoom: 5.1 };

export function searchPlaces(q: string, limit = 6): Place[] {
  const s = q.trim().toLowerCase();
  if (!s) return [];
  return PLACES.filter(
    (p) => p.name.toLowerCase().includes(s) || p.province.toLowerCase().includes(s),
  ).slice(0, limit);
}

export function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export function nearestPlace(lat: number, lng: number, maxKm = 80): Place | undefined {
  let best: Place | undefined;
  let bestD = Infinity;
  for (const p of PLACES) {
    const d = distanceKm(lat, lng, p.lat, p.lng);
    if (d < bestD) {
      bestD = d;
      best = p;
    }
  }
  return bestD <= maxKm ? best : undefined;
}

export function formatDistance(km: number) {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}
