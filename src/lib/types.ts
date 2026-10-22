export type Amenity =
  | "coffee"
  | "matcha"
  | "wifi"
  | "outlets"
  | "study"
  | "outdoor"
  | "garden"
  | "pets"
  | "pastries"
  | "aircon";

export type Mood = "cozy" | "matcha" | "study" | "garden" | "date" | "hidden";

export type Ambiance = "quiet" | "lively" | "cozy" | "airy" | "romantic" | "rustic";

export type Price = 1 | 2 | 3 | 4;

/** Where a café record came from. Drives every "verified / sample" label in the UI. */
export type CafeSource = "sample" | "curated" | "osm" | "community";

export interface CafeHours {
  /** Raw hours text exactly as provided by the source. */
  raw: string;
  /** Only true when hours come from a verified source. Sample/OSM hours are never treated as verified. */
  verified: boolean;
  source: string;
}

export interface CafeArt {
  awning: string;
  wall: string;
  roof: 0 | 1 | 2;
  plant: 0 | 1 | 2;
}

export interface Cafe {
  /** Stable, provider-prefixed id, e.g. "sample-kapihan-sa-lawa" or "osm-node-123456". */
  id: string;
  source: CafeSource;
  name: string;
  description?: string;
  /** Where the description came from, when it isn't our own words. */
  descriptionSource?: string;
  /** OpenStreetMap element reference, e.g. "n123456". */
  osmRef?: string;
  lat: number;
  lng: number;
  address?: string;
  city?: string;
  /** Passport region key (see lib/places.ts). */
  region?: string;
  price?: Price;
  amenities: Amenity[];
  moods: Mood[];
  ambiance: Ambiance[];
  menuHighlights?: string[];
  hours?: CafeHours;
  phone?: string;
  website?: string;
  /** Not part of a chain, when known. */
  independent?: boolean;
  /** Deterministic seed for the generated storefront illustration (we never show fake photos). */
  art: CafeArt;
  /** Required attribution line for third-party data. */
  attribution?: string;
  /** True only when the business has been verified by a trusted source. Sample data is always false. */
  verified: boolean;
}

/** Lightweight copy of a café stored alongside wishlists/visits so OSM cafés still render offline. */
export type CafeSnapshot = Pick<
  Cafe,
  "id" | "source" | "name" | "lat" | "lng" | "city" | "region" | "amenities" | "moods" | "independent" | "art"
>;

export interface Review {
  id: string;
  cafeId: string;
  cafeName: string;
  cafeCity?: string;
  authorId: string;
  authorName: string;
  avatar: number;
  rating: 1 | 2 | 3 | 4 | 5;
  body: string;
  createdAt: string;
  /** Sample reviews ship with the demo and never count towards ratings. */
  sample?: boolean;
  photo?: string;
}

export interface Visit {
  id: string;
  cafe: CafeSnapshot;
  /** Local calendar date of the visit, YYYY-MM-DD. One recorded visit per café per day. */
  visitedOn: string;
  note?: string;
  createdAt: string;
}

export interface WishlistItem {
  cafe: CafeSnapshot;
  createdAt: string;
}

export interface Report {
  id: string;
  targetType: "cafe" | "review";
  targetId: string;
  reason: string;
  details?: string;
  createdAt: string;
}

export interface Submission {
  id: string;
  name: string;
  city: string;
  address: string;
  lat?: number;
  lng?: number;
  website?: string;
  amenities: Amenity[];
  notes?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface Profile {
  id: string;
  displayName: string;
  avatar: number;
  bio?: string;
  homeCity?: string;
}
