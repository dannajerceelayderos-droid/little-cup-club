"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Amenity, Cafe, Mood } from "@/lib/types";
import { FEATURED_CAFES, fetchCafes, PROVIDERS, type BBox, type ProviderKey } from "@/lib/cafes/provider";
import { applyFilters, countActive, EMPTY_FILTERS, MIN_RATINGS_FOR_SORT, MOOD_LABELS, sortCafes, type Filters, type SortKey } from "@/lib/filters";
import { distanceKm, formatDistance, PH_VIEW, type Place } from "@/lib/places";
import { CafeMap, type MapFocus } from "./CafeMap";
import { CafeCard, CafePreview, CardSkeleton, EmptyState } from "./cafe-bits";
import { FilterPanel } from "./Filters";
import { Icon } from "./Icon";
import { SearchBox } from "./SearchBox";
import { useStore } from "./StoreProvider";

const OSM_MIN_ZOOM = 12;
const MOODS: Mood[] = ["cozy", "matcha", "study", "garden", "date", "hidden"];

function filtersFromParams(p: URLSearchParams): Filters {
  return {
    ...EMPTY_FILTERS,
    q: p.get("q") ?? "",
    region: p.get("region") ?? "all",
    moods: (p.get("mood")?.split(",").filter(Boolean) as Mood[]) ?? [],
    amenities: (p.get("amenity")?.split(",").filter(Boolean) as Amenity[]) ?? [],
  };
}

export function ExploreView({ variant = "page" }: { variant?: "page" | "embed" }) {
  const params = useSearchParams();
  const router = useRouter();
  const { ratings } = useStore();
  const embed = variant === "embed";

  const [provider, setProvider] = useState<ProviderKey>(params.get("source") === "osm" ? "osm" : "sample");
  const [filters, setFilters] = useState<Filters>(() => (embed ? EMPTY_FILTERS : filtersFromParams(params)));
  const [query, setQuery] = useState(filters.q);
  const [sort, setSort] = useState<SortKey>("relevance");
  const [cafes, setCafes] = useState<Cafe[]>(provider === "sample" ? FEATURED_CAFES : []);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "zoom">(provider === "osm" ? "zoom" : "idle");
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "map">(embed ? "map" : "list");
  const [sheet, setSheet] = useState(false);
  const [focus, setFocus] = useState<MapFocus | null>(null);
  const [origin, setOrigin] = useState<{ lat: number; lng: number; label: string } | null>(null);
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [locMsg, setLocMsg] = useState("");
  const bboxRef = useRef<BBox | null>(null);
  const zoomRef = useRef(PH_VIEW.zoom);
  const abortRef = useRef<AbortController | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const focusKey = useRef(0);

  // keep URL in sync on the explore page (shareable searches)
  useEffect(() => {
    if (embed) return;
    const sp = new URLSearchParams();
    if (filters.q) sp.set("q", filters.q);
    if (filters.region !== "all") sp.set("region", filters.region);
    if (filters.moods.length) sp.set("mood", filters.moods.join(","));
    if (filters.amenities.length) sp.set("amenity", filters.amenities.join(","));
    if (provider === "osm") sp.set("source", "osm");
    const s = sp.toString();
    router.replace(s ? `/explore?${s}` : "/explore", { scroll: false });
  }, [filters, provider, embed, router]);

  const flyTo = useCallback((lat: number, lng: number, zoom: number) => {
    focusKey.current += 1;
    setFocus({ lat, lng, zoom, key: focusKey.current });
  }, []);

  const loadOsm = useCallback(async () => {
    const bbox = bboxRef.current;
    if (!bbox) return;
    if (zoomRef.current < OSM_MIN_ZOOM) {
      setStatus("zoom");
      return;
    }
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    setStatus("loading");
    try {
      const list = await fetchCafes("osm", bbox, ac.signal);
      setCafes(list);
      setStatus("idle");
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      setError((e as Error).message);
      setStatus("error");
    }
  }, []);

  const switchProvider = (p: ProviderKey) => {
    setProvider(p);
    setSelectedId(null);
    if (p === "sample") {
      abortRef.current?.abort();
      setCafes(FEATURED_CAFES);
      setStatus("idle");
    } else {
      setCafes([]);
      if (zoomRef.current < OSM_MIN_ZOOM) {
        setStatus("zoom");
      } else loadOsm();
    }
  };

  const onMove = useCallback(
    ({ bbox, center }: { bbox: BBox; center: { zoom: number } }) => {
      bboxRef.current = bbox;
      zoomRef.current = center.zoom;
      if (provider === "osm") {
        if (center.zoom < OSM_MIN_ZOOM) setStatus((s) => (s === "loading" ? s : "zoom"));
        else setStatus((s) => (s === "zoom" ? "idle" : s));
      }
    },
    [provider],
  );

  // auto-load OSM when the user stops moving at a good zoom
  const moveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const onMoveDebounced = useCallback(
    (v: { bbox: BBox; center: { lat: number; lng: number; zoom: number } }) => {
      onMove(v);
      if (provider !== "osm") return;
      clearTimeout(moveTimer.current);
      moveTimer.current = setTimeout(() => {
        if (v.center.zoom >= OSM_MIN_ZOOM) loadOsm();
      }, 700);
    },
    [onMove, provider, loadOsm],
  );

  const results = useMemo(() => {
    const f = applyFilters(cafes, { ...filters, q: filters.q });
    return sortCafes(f, sort, { origin: origin ?? userLoc ?? undefined, ratings, q: filters.q });
  }, [cafes, filters, sort, origin, userLoc, ratings]);

  const selected = results.find((c) => c.id === selectedId) ?? null;
  const distanceFrom = origin ?? userLoc;

  // scroll selected card into view
  useEffect(() => {
    if (!selectedId || !listRef.current) return;
    const card = listRef.current.querySelector<HTMLElement>(`[data-cafe-id="${CSS.escape(selectedId)}"]`);
    card?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selectedId]);

  const pickPlace = (p: Place) => {
    setOrigin({ lat: p.lat, lng: p.lng, label: p.name });
    setFilters((f) => ({ ...f, q: "" }));
    setQuery("");
    flyTo(p.lat, p.lng, provider === "osm" ? Math.max(p.zoom, OSM_MIN_ZOOM + 1) : p.zoom - 1);
    if (embed) setView("map");
  };

  const locate = () => {
    if (!("geolocation" in navigator)) {
      setLocMsg("Your browser doesn't support location. Search for a town instead.");
      return;
    }
    setLocMsg("Finding you…");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLoc(loc);
        setOrigin(null);
        setSort("distance");
        setLocMsg("");
        flyTo(loc.lat, loc.lng, 13.5);
      },
      (err) => {
        setLocMsg(
          err.code === err.PERMISSION_DENIED
            ? "Location is off — no worries. Search for a town to see cafés nearby."
            : "We couldn't get your location. Try searching for a town instead.",
        );
        if (sort === "distance") setSort("relevance");
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  };

  const toggleMood = (m: Mood) =>
    setFilters((f) => ({ ...f, moods: f.moods.includes(m) ? f.moods.filter((x) => x !== m) : [...f.moods, m] }));

  const ratedEnough = Object.values(ratings).some((r) => r.count >= MIN_RATINGS_FOR_SORT);
  const activeCount = countActive(filters);

  /* ---------------- pieces ---------------- */

  const providerSwitch = (
    <div className="flex flex-wrap items-center gap-2">
      <div role="radiogroup" aria-label="Café data source" className="inline-flex rounded-full border border-ink/15 bg-cream p-1 text-sm font-bold">
        {(["sample", "osm"] as ProviderKey[]).map((p) => (
          <button
            key={p}
            role="radio"
            aria-checked={provider === p}
            type="button"
            onClick={() => switchProvider(p)}
            className={`rounded-full px-3 py-1.5 transition ${provider === p ? "bg-ink text-cream" : "text-ink-soft hover:text-ink"}`}
          >
            {p === "sample" ? "Featured cafés" : "All cafés here (OSM)"}
          </button>
        ))}
      </div>
      <span className="text-xs text-ink-faint">{PROVIDERS[provider].note}</span>
    </div>
  );

  const resultsList = (
    <div ref={listRef} className="space-y-3">
      {status === "loading" && [0, 1, 2].map((i) => <CardSkeleton key={i} />)}
      {status === "zoom" && provider === "osm" && (
        <EmptyState
          title="Zoom in to find real cafés"
          body="OpenStreetMap listings load for the area you're looking at. Search for a town or zoom into a neighbourhood."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <button className="btn-soft text-sm" onClick={() => pickPlace({ name: "San Pablo City", province: "Laguna", region: "laguna", lat: 14.0697, lng: 121.3253, zoom: 14 })}>San Pablo City</button>
              <button className="btn-soft text-sm" onClick={() => pickPlace({ name: "Makati", province: "Metro Manila", region: "manila", lat: 14.5547, lng: 121.0244, zoom: 14 })}>Makati</button>
              <button className="btn-soft text-sm" onClick={() => pickPlace({ name: "Baguio", province: "Benguet", region: "cordillera", lat: 16.4023, lng: 120.596, zoom: 14 })}>Baguio</button>
            </div>
          }
        />
      )}
      {status === "error" && (
        <EmptyState
          title="The café service is taking a nap"
          body={error || "Something went wrong loading cafés."}
          action={<button className="btn-primary text-sm" onClick={loadOsm}>Try again</button>}
        />
      )}
      {status === "idle" && results.length === 0 && (
        <EmptyState
          title="No cafés match… yet"
          body={
            provider === "osm" && cafes.length === 0
              ? "OpenStreetMap doesn't list any named cafés in this area. Try moving the map or suggest one to the community."
              : "Try removing a filter or searching a different town."
          }
          action={
            activeCount || filters.q ? (
              <button className="btn-soft text-sm" onClick={() => { setFilters(EMPTY_FILTERS); setQuery(""); }}>Clear search &amp; filters</button>
            ) : (
              <Link href="/community/submit" className="btn-soft text-sm">Suggest a café</Link>
            )
          }
        />
      )}
      {status === "idle" &&
        results.map((c) => (
          <CafeCard
            key={c.id}
            cafe={c}
            selected={c.id === selectedId || c.id === hoverId}
            onHover={setHoverId}
            onSelect={setSelectedId}
            distance={distanceFrom ? formatDistance(distanceKm(distanceFrom.lat, distanceFrom.lng, c.lat, c.lng)) : undefined}
          />
        ))}
      {status === "idle" && provider === "osm" && results.length > 0 && (
        <p className="px-2 text-xs text-ink-faint">Café data © OpenStreetMap contributors, ODbL. Listings are community-edited and unverified.</p>
      )}
    </div>
  );

  const mapEl = (
    <div className="relative h-full w-full">
      <CafeMap
        cafes={status === "idle" ? results : provider === "sample" ? results : []}
        selectedId={selectedId}
        highlightId={hoverId}
        onSelect={setSelectedId}
        onMove={onMoveDebounced}
        initialView={embed ? { lat: 14.071, lng: 121.322, zoom: 13.2 } : PH_VIEW}
        focus={focus}
        userLocation={userLoc}
        className="h-full w-full"
        extraAttribution={provider === "osm" ? "Café data © OpenStreetMap contributors" : undefined}
      />
      <div className="pointer-events-none absolute left-3 top-3 z-[3] flex flex-col items-start gap-2">
        <button type="button" onClick={locate} className="btn-soft pointer-events-auto bg-cream/95 px-3.5 py-2 text-sm shadow-card">
          <Icon name="locate" size={17} /> Near me
        </button>
        {locMsg && <p className="pointer-events-auto max-w-[16rem] rounded-xl bg-cream/95 px-3 py-2 text-xs font-semibold shadow-card" role="status">{locMsg}</p>}
        {provider === "osm" && status === "zoom" && (
          <p className="rounded-xl bg-butter px-3 py-2 text-xs font-bold shadow-card">Zoom in to load real cafés</p>
        )}
        {provider === "osm" && status === "loading" && (
          <p className="rounded-xl bg-cream px-3 py-2 text-xs font-bold shadow-card" role="status">Loading cafés in this area…</p>
        )}
      </div>
      <div className="absolute inset-x-3 bottom-3 z-[3] sm:left-3 sm:right-auto sm:w-[340px]">
        <AnimatePresence>{selected && <CafePreview cafe={selected} onClose={() => setSelectedId(null)} />}</AnimatePresence>
      </div>
    </div>
  );

  const viewToggle = (
    <div role="radiogroup" aria-label="Show results as" className="inline-flex rounded-full border border-ink/15 bg-cream p-1 text-sm font-bold shadow-card">
      {(["list", "map"] as const).map((v) => (
        <button key={v} role="radio" aria-checked={view === v} type="button" onClick={() => setView(v)}
          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 transition ${view === v ? "bg-sage text-ink" : "text-ink-soft"}`}>
          <Icon name={v} size={16} /> {v === "list" ? "List" : "Map"}
        </button>
      ))}
    </div>
  );

  const sortSelect = (
    <label className="flex items-center gap-2 text-sm font-bold">
      <span className="text-ink-soft">Sort</span>
      <select className="w-[8.5rem] rounded-full border border-ink/20 bg-cream px-3 py-1.5 font-bold sm:w-auto" value={sort}
        onChange={(e) => {
          const v = e.target.value as SortKey;
          if (v === "distance" && !distanceFrom) locate();
          setSort(v);
        }}>
        <option value="relevance">Relevance</option>
        <option value="rating" disabled={!ratedEnough}>Rating{ratedEnough ? "" : " (needs more reviews)"}</option>
        <option value="distance">Distance{distanceFrom ? "" : " (uses location)"}</option>
      </select>
    </label>
  );

  /* ---------------- embed (homepage) ---------------- */
  if (embed) {
    return (
      <div className="card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-ink/10 p-4 sm:flex-row sm:items-center">
          <div className="flex-1">
            <SearchBox value={query} onChange={setQuery} cafes={cafes} onPickPlace={pickPlace}
              onPickCafe={(c) => { setSelectedId(c.id); flyTo(c.lat, c.lng, 14); setView("map"); }}
              onSubmit={(v) => setFilters((f) => ({ ...f, q: v }))} placeholder="Jump to a town or café…" buttonLabel="Go" />
          </div>
          {viewToggle}
        </div>
        <div className="flex gap-2 overflow-x-auto border-b border-ink/10 px-4 py-2.5 [scrollbar-width:none]">
          {MOODS.map((m) => (
            <button key={m} type="button" className="chip shrink-0 text-xs" aria-pressed={filters.moods.includes(m)} onClick={() => toggleMood(m)}>
              {MOOD_LABELS[m]}
            </button>
          ))}
        </div>
        <div className="relative h-[460px] sm:h-[520px]">
          <div className={view === "map" ? "absolute inset-0" : "pointer-events-none invisible absolute inset-0"} aria-hidden={view !== "map"}>{mapEl}</div>
          {view === "list" && <div className="absolute inset-0 overflow-y-auto p-4">{resultsList}</div>}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-ink/10 px-4 py-3 text-xs text-ink-faint">
          <span>Real San Pablo cafés (pins © OpenStreetMap) + fictional samples elsewhere · {results.length} on the map</span>
          <Link href="/explore" className="font-bold text-ink underline decoration-biscuit underline-offset-4">Open full explorer →</Link>
        </div>
      </div>
    );
  }

  /* ---------------- full page ---------------- */
  return (
    <div className="lg:grid lg:h-[calc(100vh-92px)] lg:grid-cols-[minmax(400px,480px)_1fr]">
      <section aria-label="Café results" className="flex min-h-0 flex-col border-ink/10 lg:border-r">
        <div className="space-y-3 border-b border-ink/10 bg-cream/95 px-4 pb-3 pt-4 sm:px-5">
          <h1 className="text-3xl font-semibold">Explore cafés</h1>
          <SearchBox value={query} onChange={setQuery} cafes={cafes} onPickPlace={pickPlace}
            onPickCafe={(c) => { setSelectedId(c.id); flyTo(c.lat, c.lng, 15); }}
            onSubmit={(v) => setFilters((f) => ({ ...f, q: v }))} />
          {providerSwitch}
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
            <button type="button" onClick={() => setSheet(true)} className="chip shrink-0" data-active={activeCount > 0}>
              <Icon name="filter" size={16} /> Filters{activeCount ? ` · ${activeCount}` : ""}
            </button>
            {MOODS.map((m) => (
              <button key={m} type="button" className="chip shrink-0" aria-pressed={filters.moods.includes(m)} onClick={() => toggleMood(m)}>
                {MOOD_LABELS[m]}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-bold text-ink-soft" aria-live="polite">
              {status === "loading" ? "Looking around…" : status === "idle" ? `${results.length} café${results.length === 1 ? "" : "s"}` : " "}
              {origin && <span className="font-semibold"> · near {origin.label} <button className="underline" onClick={() => setOrigin(null)}>clear</button></span>}
              {filters.q && <span className="font-semibold"> · “{filters.q}” <button className="underline" onClick={() => { setFilters((f) => ({ ...f, q: "" })); setQuery(""); }}>clear</button></span>}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {sortSelect}
              <div className="lg:hidden">{viewToggle}</div>
            </div>
          </div>
        </div>
        <div className={`min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5 ${view === "map" ? "hidden lg:block" : ""}`}>{resultsList}</div>
      </section>

      <section aria-label="Map" className={`${view === "list" ? "hidden lg:block" : "block"} h-[calc(100vh-260px)] min-h-[420px] lg:h-full`}>
        {mapEl}
      </section>

      {/* Filters sheet (mobile bottom sheet, desktop side drawer) */}
      <AnimatePresence>
        {sheet && (
          <>
            <motion.div className="fixed inset-0 z-[60] bg-ink/30" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSheet(false)} />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Filters"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              className="paper fixed inset-x-0 bottom-0 z-[61] max-h-[86vh] overflow-y-auto rounded-t-[28px] border-t border-ink/15 p-5 shadow-lift sm:inset-x-auto sm:bottom-auto sm:left-0 sm:top-0 sm:h-full sm:max-h-none sm:w-[420px] sm:rounded-none sm:rounded-r-[28px]"
              onKeyDown={(e) => e.key === "Escape" && setSheet(false)}
            >
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Filters</h2>
                <button className="btn-ghost p-2" onClick={() => setSheet(false)} aria-label="Close filters" autoFocus>
                  <Icon name="close" />
                </button>
              </div>
              <FilterPanel value={filters} onChange={setFilters} priceAvailable={provider === "sample"} ambianceAvailable={provider === "sample"} />
              <div className="sticky bottom-0 -mx-5 mt-6 border-t border-ink/10 bg-cream px-5 py-4">
                <button className="btn-primary w-full" onClick={() => setSheet(false)}>
                  Show {results.length} café{results.length === 1 ? "" : "s"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
