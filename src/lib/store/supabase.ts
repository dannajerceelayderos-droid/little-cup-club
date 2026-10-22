import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "../config";
import type { CafeSnapshot, Profile, Review, Submission, Visit } from "../types";
import { AuthRequiredError, type Backend, DuplicateVisitError, compressImage, uid } from "./backend";

/**
 * Supabase backend. Uses only the public anon key; every table is protected by
 * Row Level Security (see supabase/migrations), so the browser can never read or
 * write another member's private data even if this code were modified.
 */
let client: SupabaseClient | null = null;
export function supabase() {
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { flowType: "pkce", persistSession: true, detectSessionInUrl: true },
    });
  }
  return client;
}

async function userId() {
  const { data } = await supabase().auth.getUser();
  if (!data.user) throw new AuthRequiredError();
  return data.user.id;
}

function fail(error: { message: string; code?: string } | null) {
  if (error) throw new Error(error.message);
}

const PHOTO_BUCKET = "review-photos";

function photoUrl(path?: string | null) {
  if (!path) return undefined;
  return supabase().storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapReview(r: any): Review {
  return {
    id: r.id,
    cafeId: r.cafe_ref,
    cafeName: r.cafe_name,
    cafeCity: r.cafe_city ?? undefined,
    authorId: r.user_id,
    authorName: r.profiles?.display_name ?? "Member",
    avatar: r.profiles?.avatar ?? 0,
    rating: r.rating,
    body: r.body,
    createdAt: r.created_at,
    photo: photoUrl(r.photo_path),
  };
}

export const supabaseBackend: Backend = {
  mode: "supabase",

  async getProfile(): Promise<Profile | null> {
    const { data: u } = await supabase().auth.getUser();
    if (!u.user) return null;
    const { data, error } = await supabase()
      .from("profiles")
      .select("id, display_name, avatar, bio, home_city")
      .eq("id", u.user.id)
      .maybeSingle();
    fail(error);
    if (!data) return { id: u.user.id, displayName: u.user.email?.split("@")[0] ?? "Member", avatar: 0 };
    return { id: data.id, displayName: data.display_name, avatar: data.avatar, bio: data.bio ?? undefined, homeCity: data.home_city ?? undefined };
  },

  onAuthChange(cb) {
    const { data } = supabase().auth.onAuthStateChange(() => cb());
    return () => data.subscription.unsubscribe();
  },

  async signIn(email) {
    const { error } = await supabase().auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    fail(error);
  },

  async signOut() {
    await supabase().auth.signOut();
  },

  async loadMine() {
    const { data: u } = await supabase().auth.getUser();
    if (!u.user) return { wishlist: [], visits: [], myReviews: [], submissions: [], reports: [] };
    const id = u.user.id;
    const sb = supabase();
    const [w, v, r, s] = await Promise.all([
      sb.from("wishlists").select("cafe_snapshot, created_at").eq("user_id", id).order("created_at", { ascending: false }),
      sb.from("visits").select("id, cafe_snapshot, visited_on, note, created_at").eq("user_id", id).order("visited_on", { ascending: false }),
      sb.from("reviews").select("*, profiles(display_name, avatar)").eq("user_id", id).order("created_at", { ascending: false }),
      sb.from("cafe_submissions").select("*").eq("user_id", id).order("created_at", { ascending: false }),
    ]);
    [w, v, r, s].forEach((x) => fail(x.error));
    return {
      wishlist: (w.data ?? []).map((x: any) => ({ cafe: x.cafe_snapshot as CafeSnapshot, createdAt: x.created_at })),
      visits: (v.data ?? []).map(
        (x: any): Visit => ({ id: x.id, cafe: x.cafe_snapshot, visitedOn: x.visited_on, note: x.note ?? undefined, createdAt: x.created_at }),
      ),
      myReviews: (r.data ?? []).map(mapReview),
      submissions: (s.data ?? []).map(
        (x: any): Submission => ({
          id: x.id, name: x.name, city: x.city, address: x.address, lat: x.lat ?? undefined, lng: x.lng ?? undefined,
          website: x.website ?? undefined, amenities: x.amenities ?? [], notes: x.notes ?? undefined, status: x.status, createdAt: x.created_at,
        }),
      ),
      reports: [],
    };
  },

  async setWishlist(cafe, on) {
    const id = await userId();
    if (on) {
      const { error } = await supabase()
        .from("wishlists")
        .upsert({ user_id: id, cafe_ref: cafe.id, cafe_snapshot: cafe }, { onConflict: "user_id,cafe_ref" });
      fail(error);
    } else {
      const { error } = await supabase().from("wishlists").delete().eq("user_id", id).eq("cafe_ref", cafe.id);
      fail(error);
    }
  },

  async addVisit(cafe, visitedOn, note) {
    const id = await userId();
    const { data, error } = await supabase()
      .from("visits")
      .insert({ user_id: id, cafe_ref: cafe.id, cafe_snapshot: cafe, visited_on: visitedOn, note: note || null })
      .select("id, created_at")
      .single();
    if (error?.code === "23505") throw new DuplicateVisitError();
    fail(error);
    return { id: data!.id, cafe, visitedOn, note, createdAt: data!.created_at };
  },

  async addReview({ cafe, rating, body, photo }) {
    const id = await userId();
    let photo_path: string | undefined;
    if (photo) {
      const blob = await compressImage(photo);
      photo_path = `${id}/${uid()}.jpg`;
      const up = await supabase().storage.from(PHOTO_BUCKET).upload(photo_path, blob, { contentType: "image/jpeg", upsert: false });
      fail(up.error);
    }
    const row: Record<string, unknown> = { user_id: id, cafe_ref: cafe.id, cafe_name: cafe.name, cafe_city: cafe.city ?? null, rating, body };
    if (photo_path) row.photo_path = photo_path;
    const { data, error } = await supabase()
      .from("reviews")
      .upsert(row, { onConflict: "user_id,cafe_ref" })
      .select("*, profiles(display_name, avatar)")
      .single();
    fail(error);
    return mapReview(data);
  },

  async deleteReview(reviewId) {
    const { error } = await supabase().from("reviews").delete().eq("id", reviewId);
    fail(error);
  },

  async listReviews({ cafeId, limit = 20 }) {
    let q = supabase()
      .from("reviews")
      .select("*, profiles(display_name, avatar)")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (cafeId) q = q.eq("cafe_ref", cafeId);
    const { data, error } = await q;
    fail(error);
    return (data ?? []).map(mapReview);
  },

  async listRatings() {
    const { data, error } = await supabase().from("cafe_ratings").select("cafe_ref, avg_rating, review_count");
    fail(error);
    const out: Record<string, { avg: number; count: number }> = {};
    for (const r of data ?? []) out[r.cafe_ref] = { avg: Number(r.avg_rating), count: r.review_count };
    return out;
  },

  async report(r) {
    const id = await userId();
    const { error } = await supabase()
      .from("reports")
      .insert({ reporter_id: id, target_type: r.targetType, target_ref: r.targetId, reason: r.reason, details: r.details || null });
    fail(error);
  },

  async submitCafe(s) {
    const id = await userId();
    const { data, error } = await supabase()
      .from("cafe_submissions")
      .insert({
        user_id: id, name: s.name, city: s.city, address: s.address, lat: s.lat ?? null, lng: s.lng ?? null,
        website: s.website || null, amenities: s.amenities, notes: s.notes || null,
      })
      .select("id, created_at, status")
      .single();
    fail(error);
    return { ...s, id: data!.id, createdAt: data!.created_at, status: data!.status };
  },

  async updateProfile(p) {
    const id = await userId();
    const { error } = await supabase()
      .from("profiles")
      .update({ display_name: p.displayName, avatar: p.avatar, bio: p.bio || null, home_city: p.homeCity || null })
      .eq("id", id);
    fail(error);
    return { id, ...p };
  },
};
