import type { Cafe } from "../types";
import { artFromId } from "../art";

/**
 * REAL cafés in San Pablo City, Laguna — the first curated city.
 *
 * Name, pin and street come from OpenStreetMap (© OpenStreetMap contributors, ODbL),
 * with OSM node ids kept for reference. Descriptions are only added where a published
 * guide describes the café (source noted). Everything else is intentionally left blank
 * until it's confirmed — no invented prices, ratings, menus or photos.
 * Opening hours are copied raw from OSM and shown as unverified.
 */

const ATTR = "Location © OpenStreetMap contributors (ODbL)";

type Seed = {
  slug: string;
  osm: string;
  name: string;
  lat: number;
  lng: number;
  street?: string;
  hours?: string;
  description?: string;
  descriptionSource?: string;
  amenities?: Cafe["amenities"];
  moods?: Cafe["moods"];
};

const seeds: Seed[] = [
  {
    slug: "cafe-mealia", osm: "n13752247604", name: "Café Mealia", lat: 14.08356, lng: 121.32889, street: "Dagatan Boulevard",
    description: "A cozy café on the shore of Sampaloc Lake, mixing rustic and modern touches — visitors come for the coffee and the lake view.",
    descriptionSource: "Trip.com traveller reviews",
  },
  { slug: "cafe-lago", osm: "n482984926", name: "Cafe Lago", lat: 14.07616, lng: 121.32534, street: "Dagatan Boulevard" },
  { slug: "mi-cafe-padres", osm: "n5350732582", name: "Mi Café Padres", lat: 14.07186, lng: 121.31844, street: "Manuel Quezon Avenue", hours: "Mo-Su 07:00-21:00" },
  { slug: "espresso-de-kaldi", osm: "n5644228431", name: "Espresso de Kaldi", lat: 14.06953, lng: 121.31216, street: "Maharlika Highway" },
  { slug: "eight-cafe", osm: "n519652087", name: "Eight Cafe", lat: 14.07112, lng: 121.32862, street: "Werner P. Schetelig Avenue", hours: "Mo-Su 10:00-22:00" },
  { slug: "si-christina-gateau-sans-rival", osm: "n1781472252", name: "Si Christina Gateau Sans Rival", lat: 14.07028, lng: 121.32557, street: "6 Rizal Avenue", hours: "Mo-Su 07:00-21:00", amenities: ["coffee", "pastries"] },
  { slug: "laugh-tale-cafe", osm: "n5525620585", name: "Laugh Tale Cafe", lat: 14.06885, lng: 121.32626, street: "Marcos Paulino Avenue", hours: "Mo-Th 09:00-21:00; Fr-Su 09:00-22:00" },
  { slug: "cafe-de-casia", osm: "n6172820560", name: "Cafe de Casia", lat: 14.07073, lng: 121.32472, street: "Colonel Lauro Dizon Street" },
  { slug: "summer-olives-cafe", osm: "n4753029374", name: "Summer Olives Cafe", lat: 14.07123, lng: 121.32481, street: "Colonel Lauro Dizon Street" },
  { slug: "the-corner-cafe", osm: "n4753029376", name: "The Corner Cafe", lat: 14.07112, lng: 121.32475, street: "Colonel Lauro Dizon Street" },
  { slug: "11-18-home-cafe", osm: "n9167432098", name: "11’18 Home Café", lat: 14.07199, lng: 121.32704, street: "Barleta Street" },
  { slug: "anakula-coffee", osm: "n9197590324", name: "Anakula Coffee", lat: 14.05997, lng: 121.34466, street: "F. Amante Drive" },
  { slug: "ferns-cafe", osm: "n8303485449", name: "Ferns Café", lat: 14.04927, lng: 121.34013, street: "Maharlika Highway" },
  { slug: "kapenings-cafe", osm: "n4866554653", name: "Kapening's Cafe", lat: 14.06278, lng: 121.32464, street: "Maharlika Highway" },
];

export const SAN_PABLO_CAFES: Cafe[] = seeds.map((s) => {
  const id = `sp-${s.slug}`;
  return {
    id,
    source: "curated",
    name: s.name,
    description: s.description,
    descriptionSource: s.descriptionSource,
    lat: s.lat,
    lng: s.lng,
    address: [s.street, "San Pablo City, Laguna"].filter(Boolean).join(", "),
    city: "San Pablo City",
    region: "laguna",
    amenities: s.amenities ?? ["coffee"],
    moods: s.moods ?? [],
    ambiance: [],
    hours: s.hours ? { raw: s.hours, verified: false, source: "OpenStreetMap (community-edited, may be outdated)" } : undefined,
    art: artFromId(id),
    attribution: `${ATTR} · node ${s.osm}`,
    osmRef: s.osm,
    verified: false,
  };
});

/**
 * Well-known San Pablo cafés mentioned in published guides that aren't pinned on
 * OpenStreetMap yet. Shown in a "not on the map yet" list — never given a guessed pin.
 */
export const SAN_PABLO_UNPINNED: { name: string; area: string; note?: string; source: string; url: string }[] = [
  {
    name: "Sulyap Gallery Café",
    area: "Cocoland Compound, Brgy. Del Remedio",
    note: "Café, museum and B&B in restored ancestral houses — barako and native dishes.",
    source: "Klook",
    url: "https://www.klook.com/en-PH/blog/laguna-cafes/",
  },
  {
    name: "EhKape",
    area: "Apo Building, Dagatan Blvd",
    note: "Eco-conscious café with barako and a view of Sampaloc Lake.",
    source: "Klook",
    url: "https://www.klook.com/en-PH/blog/laguna-cafes/",
  },
  {
    name: "Casa San Pablo",
    area: "Brgy. San Roque",
    source: "Crown Asia",
    url: "https://www.crownasia.com.ph/lifestyle-blog/budding-local-cafes-in-laguna-to-satisfy-your-caffeine-fix/",
  },
  {
    name: "CIBO & BELLA",
    area: "71 Col. Lauro Dizon St",
    source: "BestTime",
    url: "https://besttime.app/app/Philippines/San-Pablo/cafe",
  },
];

export function getSanPabloCafe(id: string) {
  return SAN_PABLO_CAFES.find((c) => c.id === id);
}
