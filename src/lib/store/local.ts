import { SAMPLE_REVIEWS } from "../cafes/sample";
import type { Profile, Report, Review, Submission, Visit, WishlistItem } from "../types";
import { type Backend, DuplicateVisitError, compressImage, uid } from "./backend";

/**
 * Demo backend: everything lives in this browser's localStorage.
 * Used automatically when Supabase isn't configured. Nothing leaves the device.
 */
const KEY = "lcc:demo:v1";

interface LocalDB {
  profile: Profile;
  wishlist: WishlistItem[];
  visits: Visit[];
  reviews: Review[];
  submissions: Submission[];
  reports: Report[];
}

function fresh(): LocalDB {
  return {
    profile: { id: "local-guest", displayName: "Guest sipper", avatar: 0 },
    wishlist: [], visits: [], reviews: [], submissions: [], reports: [],
  };
}

function read(): LocalDB {
  if (typeof window === "undefined") return fresh();
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? { ...fresh(), ...JSON.parse(raw) } : fresh();
  } catch {
    return fresh();
  }
}

function write(db: LocalDB) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(db));
  } catch {
    throw new Error("Your browser storage is full — try removing a photo or two.");
  }
}

const blobToDataUrl = (b: Blob) =>
  new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.onerror = () => rej(r.error);
    r.readAsDataURL(b);
  });

export const localBackend: Backend = {
  mode: "demo",
  async getProfile() {
    return read().profile;
  },
  onAuthChange() {
    return () => {};
  },
  async signIn() {},
  async signOut() {},
  async loadMine() {
    const db = read();
    return { wishlist: db.wishlist, visits: db.visits, myReviews: db.reviews, submissions: db.submissions, reports: db.reports };
  },
  async setWishlist(cafe, on) {
    const db = read();
    db.wishlist = db.wishlist.filter((w) => w.cafe.id !== cafe.id);
    if (on) db.wishlist.unshift({ cafe, createdAt: new Date().toISOString() });
    write(db);
  },
  async addVisit(cafe, visitedOn, note) {
    const db = read();
    if (db.visits.some((v) => v.cafe.id === cafe.id && v.visitedOn === visitedOn)) throw new DuplicateVisitError();
    const v: Visit = { id: uid(), cafe, visitedOn, note, createdAt: new Date().toISOString() };
    db.visits.unshift(v);
    write(db);
    return v;
  },
  async addReview({ cafe, rating, body, photo }) {
    const db = read();
    const existing = db.reviews.find((r) => r.cafeId === cafe.id);
    const photoUrl = photo ? await blobToDataUrl(await compressImage(photo, 900, 0.75)) : existing?.photo;
    const r: Review = {
      id: existing?.id ?? uid(),
      cafeId: cafe.id,
      cafeName: cafe.name,
      cafeCity: cafe.city,
      authorId: db.profile.id,
      authorName: db.profile.displayName,
      avatar: db.profile.avatar,
      rating,
      body,
      createdAt: new Date().toISOString(),
      photo: photoUrl,
    };
    db.reviews = [r, ...db.reviews.filter((x) => x.id !== r.id)];
    write(db);
    return r;
  },
  async deleteReview(id) {
    const db = read();
    db.reviews = db.reviews.filter((r) => r.id !== id);
    write(db);
  },
  async listReviews({ cafeId, limit = 20 }) {
    const db = read();
    const hiddenIds = new Set(db.reports.filter((r) => r.targetType === "review").map((r) => r.targetId));
    const all = [...db.reviews, ...SAMPLE_REVIEWS]
      .filter((r) => !cafeId || r.cafeId === cafeId)
      .filter((r) => !hiddenIds.has(r.id))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return all.slice(0, limit);
  },
  async listRatings() {
    const out: Record<string, { avg: number; count: number }> = {};
    for (const r of read().reviews) {
      const x = (out[r.cafeId] ??= { avg: 0, count: 0 });
      x.avg = (x.avg * x.count + r.rating) / (x.count + 1);
      x.count += 1;
    }
    return out;
  },
  async report(r) {
    const db = read();
    db.reports.unshift({ ...r, id: uid(), createdAt: new Date().toISOString() });
    write(db);
  },
  async submitCafe(s) {
    const db = read();
    const sub: Submission = { ...s, id: uid(), status: "pending", createdAt: new Date().toISOString() };
    db.submissions.unshift(sub);
    write(db);
    return sub;
  },
  async updateProfile(p) {
    const db = read();
    db.profile = { ...db.profile, ...p };
    db.reviews = db.reviews.map((r) => ({ ...r, authorName: db.profile.displayName, avatar: db.profile.avatar }));
    write(db);
    return db.profile;
  },
};
