import type { Review, Visit, WishlistItem } from "./types";
import { REGIONS, type RegionKey } from "./places";

export interface Quest {
  id: string;
  title: string;
  description: string;
  target: number;
  progress: (d: QuestData) => number;
  badge: string;
}

export interface QuestData {
  visits: Visit[];
  reviews: Review[];
  wishlist: WishlistItem[];
}

/** Unique cafés with at least one recorded visit. */
export function stampedCafes(visits: Visit[]) {
  const seen = new Map<string, Visit>();
  for (const v of [...visits].sort((a, b) => a.visitedOn.localeCompare(b.visitedOn))) {
    if (!seen.has(v.cafe.id)) seen.set(v.cafe.id, v);
  }
  return [...seen.values()];
}

const uniq = (d: QuestData, pred: (v: Visit) => boolean) => stampedCafes(d.visits).filter(pred).length;

export const QUESTS: Quest[] = [
  { id: "first-sip", title: "First sip", description: "Record your first café visit.", target: 1, badge: "Sprout", progress: (d) => stampedCafes(d.visits).length },
  { id: "matcha-trail", title: "Matcha trail", description: "Visit three cafés that serve matcha or tea.", target: 3, badge: "Whisk", progress: (d) => uniq(d, (v) => v.cafe.amenities.includes("matcha")) },
  { id: "indie-five", title: "Indie five", description: "Visit five independent coffee shops.", target: 5, badge: "Lantern", progress: (d) => uniq(d, (v) => v.cafe.independent === true) },
  { id: "study-buddy", title: "Study buddy", description: "Find three study-friendly nooks.", target: 3, badge: "Bookmark", progress: (d) => uniq(d, (v) => v.cafe.moods.includes("study") || v.cafe.amenities.includes("study")) },
  { id: "garden-wanderer", title: "Garden wanderer", description: "Sip your way through two garden cafés.", target: 2, badge: "Fern", progress: (d) => uniq(d, (v) => v.cafe.moods.includes("garden")) },
  { id: "island-hopper", title: "Island hopper", description: "Collect stamps in three different regions.", target: 3, badge: "Paper boat", progress: (d) => new Set(stampedCafes(d.visits).map((v) => v.cafe.region).filter(Boolean)).size },
  { id: "storyteller", title: "Storyteller", description: "Write three café reviews.", target: 3, badge: "Quill", progress: (d) => d.reviews.filter((r) => !r.sample).length },
  { id: "daydreamer", title: "Daydreamer", description: "Save five cafés to your wishlist.", target: 5, badge: "Cloud", progress: (d) => d.wishlist.length },
];

export function regionProgress(visits: Visit[]) {
  const stamped = stampedCafes(visits);
  return (Object.keys(REGIONS) as RegionKey[]).map((k) => ({
    key: k,
    ...REGIONS[k],
    count: stamped.filter((v) => v.cafe.region === k).length,
    target: 3,
  }));
}

export function todayLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
