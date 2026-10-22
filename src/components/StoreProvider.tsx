"use client";

import { AnimatePresence, motion } from "framer-motion";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { isSupabaseConfigured } from "@/lib/config";
import type { Backend, MyData, NewReview } from "@/lib/store/backend";
import { localBackend } from "@/lib/store/local";
import type { CafeSnapshot, Profile, Report, Review, Submission, Visit } from "@/lib/types";
import { todayLocal } from "@/lib/quests";
import { Icon } from "./Icon";

type ToastTone = "success" | "error" | "info";
interface Toast { id: number; text: string; tone: ToastTone }

interface StoreCtx {
  mode: "demo" | "supabase";
  ready: boolean;
  profile: Profile | null;
  signedIn: boolean;
  data: MyData;
  ratings: Record<string, { avg: number; count: number }>;
  isSaved: (cafeId: string) => boolean;
  toggleSaved: (cafe: CafeSnapshot) => Promise<void>;
  recordVisit: (cafe: CafeSnapshot, note?: string) => Promise<{ visit: Visit; newStamp: boolean } | null>;
  addReview: (r: NewReview) => Promise<Review | null>;
  deleteReview: (id: string) => Promise<void>;
  listReviews: Backend["listReviews"];
  report: (r: Omit<Report, "id" | "createdAt">) => Promise<boolean>;
  submitCafe: (s: Omit<Submission, "id" | "createdAt" | "status">) => Promise<Submission | null>;
  updateProfile: (p: Omit<Profile, "id">) => Promise<boolean>;
  signIn: (email: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  toast: (text: string, tone?: ToastTone) => void;
}

const EMPTY: MyData = { wishlist: [], visits: [], myReviews: [], submissions: [], reports: [] };
const Ctx = createContext<StoreCtx | null>(null);

export function useStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useStore must be used inside <StoreProvider>");
  return c;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [backend, setBackend] = useState<Backend>(localBackend);
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [data, setData] = useState<MyData>(EMPTY);
  const [ratings, setRatings] = useState<StoreCtx["ratings"]>({});
  const [toasts, setToasts] = useState<Toast[]>([]);
  const tid = useRef(0);

  const toast = useCallback((text: string, tone: ToastTone = "success") => {
    const id = ++tid.current;
    setToasts((t) => [...t, { id, text, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  // Pick the backend once on the client (Supabase code is only loaded when configured).
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    import("@/lib/store/supabase").then((m) => setBackend(m.supabaseBackend));
  }, []);

  const refresh = useCallback(async () => {
    try {
      const [p, mine, r] = await Promise.all([backend.getProfile(), backend.loadMine(), backend.listRatings()]);
      setProfile(p);
      setData(mine);
      setRatings(r);
    } catch (e) {
      console.error(e);
      toast("We couldn't load your passport. Check your connection.", "error");
    } finally {
      setReady(true);
    }
  }, [backend, toast]);

  useEffect(() => {
    if (isSupabaseConfigured && backend.mode === "demo") return; // wait for supabase backend to load
    refresh();
    return backend.onAuthChange(() => refresh());
  }, [backend, refresh]);

  const signedIn = backend.mode === "demo" || !!profile;

  const guard = useCallback(() => {
    if (!signedIn) {
      toast("Sign in to save this to your passport.", "info");
      return false;
    }
    return true;
  }, [signedIn, toast]);

  const run = useCallback(
    async <T,>(fn: () => Promise<T>, okMsg?: string): Promise<T | null> => {
      try {
        const out = await fn();
        if (okMsg) toast(okMsg);
        return out;
      } catch (e) {
        toast(e instanceof Error ? e.message : "Something went wrong.", "error");
        return null;
      }
    },
    [toast],
  );

  const value = useMemo<StoreCtx>(
    () => ({
      mode: backend.mode,
      ready,
      profile,
      signedIn,
      data,
      ratings,
      isSaved: (id) => data.wishlist.some((w) => w.cafe.id === id),
      async toggleSaved(cafe) {
        if (!guard()) return;
        const on = !data.wishlist.some((w) => w.cafe.id === cafe.id);
        // optimistic
        setData((d) => ({
          ...d,
          wishlist: on
            ? [{ cafe, createdAt: new Date().toISOString() }, ...d.wishlist]
            : d.wishlist.filter((w) => w.cafe.id !== cafe.id),
        }));
        const ok = await run(() => backend.setWishlist(cafe, on), on ? `Saved ${cafe.name} to your wishlist` : "Removed from wishlist");
        if (ok === null) refresh();
      },
      async recordVisit(cafe, note) {
        if (!guard()) return null;
        const newStamp = !data.visits.some((v) => v.cafe.id === cafe.id);
        const visit = await run(() => backend.addVisit(cafe, todayLocal(), note));
        if (!visit) return null;
        setData((d) => ({ ...d, visits: [visit, ...d.visits] }));
        return { visit, newStamp };
      },
      async addReview(r) {
        if (!guard()) return null;
        const review = await run(() => backend.addReview(r), "Thanks! Your review is posted.");
        if (review) {
          setData((d) => ({ ...d, myReviews: [review, ...d.myReviews.filter((x) => x.id !== review.id)] }));
          backend.listRatings().then(setRatings).catch(() => {});
        }
        return review;
      },
      async deleteReview(id) {
        const ok = await run(() => backend.deleteReview(id), "Review deleted");
        if (ok !== null) {
          setData((d) => ({ ...d, myReviews: d.myReviews.filter((x) => x.id !== id) }));
          backend.listRatings().then(setRatings).catch(() => {});
        }
      },
      listReviews: (o) => backend.listReviews(o),
      async report(r) {
        if (!guard()) return false;
        const ok = await run(() => backend.report(r), "Thanks — our moderators will take a look.");
        if (ok !== null) setData((d) => ({ ...d, reports: [{ ...r, id: "tmp", createdAt: new Date().toISOString() }, ...d.reports] }));
        return ok !== null;
      },
      async submitCafe(s) {
        if (!guard()) return null;
        const sub = await run(() => backend.submitCafe(s), "Café submitted for review. Salamat!");
        if (sub) setData((d) => ({ ...d, submissions: [sub, ...d.submissions] }));
        return sub;
      },
      async updateProfile(p) {
        const out = await run(() => backend.updateProfile(p), "Profile updated");
        if (out) {
          setProfile(out);
          refresh();
        }
        return !!out;
      },
      async signIn(email) {
        const ok = await run(() => backend.signIn(email));
        return ok !== null;
      },
      async signOut() {
        await backend.signOut();
        setProfile(null);
        setData(EMPTY);
        toast("Signed out", "info");
      },
      toast,
    }),
    [backend, ready, profile, signedIn, data, ratings, guard, run, refresh, toast],
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-[80] flex flex-col items-center gap-2 px-4">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8 }}
              role={t.tone === "error" ? "alert" : "status"}
              className={`pointer-events-auto flex max-w-md items-center gap-2.5 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-lift ${
                t.tone === "error"
                  ? "border-biscuit-deep/40 bg-blush text-ink"
                  : t.tone === "info"
                    ? "border-ink/15 bg-butter text-ink"
                    : "border-olive/30 bg-sage text-ink"
              }`}
            >
              <Icon name={t.tone === "error" ? "info" : t.tone === "info" ? "sparkle" : "check"} size={18} />
              {t.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}
