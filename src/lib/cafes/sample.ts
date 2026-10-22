import type { Cafe, CafeArt, Review } from "../types";

/**
 * DEMO SEED DATA — every café below is FICTIONAL.
 * They are placed near real town centres so the map has something to show, but they are
 * not real businesses, and the UI labels each one "Sample café" everywhere it appears.
 * No ratings, opening hours, phone numbers or photos are invented for them.
 */

const AWNINGS = ["#DFAE91", "#C9D9BD", "#F6E7A9", "#EFD3C6", "#A9C09A", "#B9805F"];
const WALLS = ["#FFF9EE", "#FBF2CF", "#E3ECDB", "#F8EEDC", "#F0D5C4"];

function art(i: number): CafeArt {
  return {
    awning: AWNINGS[i % AWNINGS.length],
    wall: WALLS[(i * 3) % WALLS.length],
    roof: (i % 3) as 0 | 1 | 2,
    plant: ((i * 2) % 3) as 0 | 1 | 2,
  };
}

type Seed = Omit<Cafe, "id" | "source" | "art" | "verified" | "attribution">;

const seeds: Seed[] = [


  {
    name: "Mossy Mug Garden Café",
    description: "Tables tucked between ferns and orchids, with a resident ginger cat who naps by the register.",
    lat: 14.1735, lng: 121.2412, city: "Los Baños", region: "laguna", price: 2,
    amenities: ["coffee", "matcha", "garden", "outdoor", "pets"], moods: ["garden", "date", "cozy"], ambiance: ["rustic", "romantic"],
    menuHighlights: ["Iced matcha latte", "Calamansi muffin"], independent: true,
  },
  {
    name: "Thesis & Toast",
    description: "Long communal tables, plenty of outlets and a quiet upstairs loft for deadline season.",
    lat: 14.1668, lng: 121.2465, city: "Los Baños", region: "laguna", price: 1,
    amenities: ["coffee", "wifi", "outlets", "study", "aircon", "pastries"], moods: ["study"], ambiance: ["quiet"],
    menuHighlights: ["Bottomless drip", "Pandesal toast"], independent: true,
  },
  {
    name: "Hot Spring Brew Bar",
    description: "A tiny counter café with a pour-over bar and a shaded porch.",
    lat: 14.2151, lng: 121.1612, city: "Calamba", region: "laguna", price: 2,
    amenities: ["coffee", "outdoor", "wifi"], moods: ["hidden", "cozy"], ambiance: ["cozy"],
    menuHighlights: ["Single-origin pour-over"], independent: true,
  },
  {
    name: "Taal Ridge Teahouse",
    description: "Floor-to-ceiling windows, blankets on every chair and a ceremonial matcha flight.",
    lat: 14.1101, lng: 120.9488, city: "Tagaytay", region: "ridge", price: 3,
    amenities: ["matcha", "coffee", "pastries", "outdoor"], moods: ["matcha", "date", "cozy"], ambiance: ["romantic", "airy"],
    menuHighlights: ["Matcha flight", "Hojicha cream puff"], independent: true,
  },
  {
    name: "Pine & Pandan",
    description: "A garden café with hammock seats and pandan-everything pastries.",
    lat: 14.1196, lng: 120.9735, city: "Tagaytay", region: "ridge", price: 2,
    amenities: ["coffee", "garden", "outdoor", "pets", "pastries"], moods: ["garden", "date"], ambiance: ["rustic", "airy"],
    menuHighlights: ["Pandan latte", "Ube cheese pandesal"], independent: true,
  },
  {
    name: "Barako Lantern",
    description: "Lamplit evenings, strong Batangas coffee and acoustic sets on Fridays.",
    lat: 13.9446, lng: 121.1597, city: "Lipa", region: "ridge", price: 1,
    amenities: ["coffee", "wifi", "outlets"], moods: ["cozy", "hidden"], ambiance: ["lively", "cozy"],
    menuHighlights: ["Kapeng barako", "Bibingka"], independent: true,
  },
  {
    name: "Paper Moon Coffee",
    description: "A narrow shophouse café with a reading wall and a vinyl corner.",
    lat: 14.5651, lng: 121.0297, city: "Makati", region: "manila", price: 3,
    amenities: ["coffee", "wifi", "outlets", "study", "aircon"], moods: ["study", "cozy", "hidden"], ambiance: ["quiet", "cozy"],
    menuHighlights: ["Spanish latte", "Sea-salt cookie"], independent: true,
  },
  {
    name: "Ube & Oat",
    description: "Plant-based treats, purple-hued lattes and a small dog-friendly terrace.",
    lat: 14.6432, lng: 121.0614, city: "Quezon City", region: "manila", price: 2,
    amenities: ["coffee", "matcha", "pets", "outdoor", "pastries"], moods: ["matcha", "date"], ambiance: ["lively", "airy"],
    menuHighlights: ["Ube oat latte", "Matcha-ube swirl"], independent: true,
  },
  {
    name: "Sampaguita Study Room",
    description: "Booth seats, desk lamps and a strict-but-kind quiet hour every afternoon.",
    lat: 14.6511, lng: 121.0577, city: "Quezon City", region: "manila", price: 1,
    amenities: ["coffee", "wifi", "outlets", "study", "aircon"], moods: ["study"], ambiance: ["quiet"],
    menuHighlights: ["Iced americano", "Chicken pandesal"], independent: true,
  },
  {
    name: "Kapitolyo Courtyard",
    description: "A leafy courtyard café behind an old house, strung with warm lights.",
    lat: 14.5713, lng: 121.0628, city: "Pasig", region: "manila", price: 3,
    amenities: ["coffee", "garden", "outdoor", "pets"], moods: ["garden", "date", "hidden"], ambiance: ["romantic", "rustic"],
    menuHighlights: ["Cortado", "Banana bread"], independent: true,
  },
  {
    name: "Intramuros Ink & Bean",
    description: "Stone walls, calligraphy workshops and a single long marble bar.",
    lat: 14.5893, lng: 120.9757, city: "Manila", region: "manila", price: 2,
    amenities: ["coffee", "matcha", "aircon"], moods: ["cozy", "hidden"], ambiance: ["quiet", "rustic"],
    menuHighlights: ["Hojicha latte", "Polvoron affogato"], independent: true,
  },
  {
    name: "Fog & Firewood",
    description: "A pine-cabin café with a crackling stove, strawberry taho and highland beans.",
    lat: 16.4109, lng: 120.5994, city: "Baguio", region: "cordillera", price: 2,
    amenities: ["coffee", "pastries", "outdoor"], moods: ["cozy", "date"], ambiance: ["rustic", "cozy"],
    menuHighlights: ["Benguet pour-over", "Strawberry taho"], independent: true,
  },
  {
    name: "Cloud Terrace Matcha",
    description: "Terraced seating above the pines, whisked matcha and mochi.",
    lat: 16.4161, lng: 120.5911, city: "Baguio", region: "cordillera", price: 2,
    amenities: ["matcha", "outdoor", "garden", "wifi"], moods: ["matcha", "garden"], ambiance: ["airy", "quiet"],
    menuHighlights: ["Usucha", "Matcha mochi"], independent: true,
  },
  {
    name: "Echo Valley Roastery",
    description: "A small-batch roaster with a window counter and mountain-trail maps.",
    lat: 17.0861, lng: 120.9031, city: "Sagada", region: "cordillera", price: 2,
    amenities: ["coffee", "outdoor"], moods: ["hidden", "cozy"], ambiance: ["rustic"],
    menuHighlights: ["Sagada arabica", "Lemon pie"], independent: true,
  },
  {
    name: "Mango Lane Coffee",
    description: "Island light, ceiling fans and dried-mango cheesecake.",
    lat: 10.3178, lng: 123.8912, city: "Cebu City", region: "visayas", price: 2,
    amenities: ["coffee", "wifi", "outlets", "study", "aircon"], moods: ["study", "cozy"], ambiance: ["airy", "lively"],
    menuHighlights: ["Coconut cold brew", "Mango cheesecake"], independent: true,
  },
  {
    name: "Boulevard Breeze",
    description: "A seaside kiosk café made for sunset walks and silvanas.",
    lat: 9.3091, lng: 123.3091, city: "Dumaguete", region: "visayas", price: 1,
    amenities: ["coffee", "outdoor", "pets", "pastries"], moods: ["date", "hidden"], ambiance: ["airy", "lively"],
    menuHighlights: ["Silvanas", "Iced barako"], independent: true,
  },
  {
    name: "Molo Mansion Tea Room",
    description: "Tea service on lace tablecloths in a restored ancestral house.",
    lat: 10.7169, lng: 122.5455, city: "Iloilo City", region: "visayas", price: 3,
    amenities: ["matcha", "coffee", "garden", "pastries"], moods: ["matcha", "date", "garden"], ambiance: ["romantic", "quiet"],
    menuHighlights: ["Matcha butterscotch", "Biscocho"], independent: true,
  },
  {
    name: "Cacao Kubo",
    description: "Tree-to-cup tablea drinks and a reading hut in the back garden.",
    lat: 7.0759, lng: 125.6094, city: "Davao City", region: "mindanao", price: 2,
    amenities: ["coffee", "garden", "outdoor", "wifi", "study"], moods: ["garden", "study", "cozy"], ambiance: ["rustic", "quiet"],
    menuHighlights: ["Tablea mocha", "Durian pastillas"], independent: true,
  },
  {
    name: "Saltwater Sundays",
    description: "Surfboards on the wall, smoothie bowls and an easygoing matcha bar.",
    lat: 9.7868, lng: 126.1587, city: "General Luna (Siargao)", region: "mindanao", price: 2,
    amenities: ["coffee", "matcha", "outdoor", "pets", "wifi"], moods: ["matcha", "hidden", "date"], ambiance: ["lively", "airy"],
    menuHighlights: ["Coconut matcha", "Banana bread"], independent: true,
  },
];

function slug(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export const SAMPLE_CAFES: Cafe[] = seeds.map((s, i) => ({
  ...s,
  id: `sample-${slug(s.name)}`,
  source: "sample",
  art: art(i),
  verified: false,
  address: `Fictional address near ${s.city} town centre`,
}));

export function getSampleCafe(id: string) {
  return SAMPLE_CAFES.find((c) => c.id === id);
}

const AUTHORS = [
  { name: "Mika", avatar: 0 },
  { name: "Joaquin", avatar: 1 },
  { name: "Bea", avatar: 2 },
  { name: "Paolo", avatar: 3 },
  { name: "Lia", avatar: 4 },
  { name: "Andoy", avatar: 5 },
];

const sampleReviewSeeds: Array<[number, number, 1 | 2 | 3 | 4 | 5, string, number]> = [
  [0, 2, 5, "The cat picked my lap. That's a five-star review on its own.", 3],
  [3, 4, 4, "Gorgeous view, a bit chilly — bring a cardigan. The matcha flight was a lovely way to try three styles.", 5],
  [6, 1, 4, "Outlets at nearly every seat and a playlist that never gets in the way.", 6],
  [11, 3, 5, "Firewood smell, strawberry taho, foggy windows. Baguio in a cup.", 8],
  [8, 5, 4, "Quiet hour is real and I'm grateful for it.", 9],
  [17, 2, 5, "We stayed for the garden and ended up staying for three hours.", 11],
  [15, 4, 4, "Sunset, silvanas, sea breeze. Simple and perfect.", 13],
];

/** Clearly-labelled sample reviews. They are shown as examples and never affect ratings. */
export const SAMPLE_REVIEWS: Review[] = sampleReviewSeeds.map(([cafeIdx, authorIdx, rating, body, daysAgo], i) => {
  const cafe = SAMPLE_CAFES[cafeIdx];
  const author = AUTHORS[authorIdx];
  const d = new Date(Date.UTC(2026, 9, 20) - daysAgo * 86400000);
  return {
    id: `sample-review-${i}`,
    cafeId: cafe.id,
    cafeName: cafe.name,
    cafeCity: cafe.city,
    authorId: `sample-author-${authorIdx}`,
    authorName: author.name,
    avatar: author.avatar,
    rating,
    body,
    createdAt: d.toISOString(),
    sample: true,
  };
});
