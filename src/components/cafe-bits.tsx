"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Cafe, CafeSnapshot } from "@/lib/types";
import { AMENITY_LABELS, priceLabel } from "@/lib/filters";
import { toSnapshot } from "@/lib/cafes/provider";
import { Icon, AMENITY_ICONS } from "./Icon";
import { CafeStorefront, IllustrationNote } from "./illustrations";
import { useStore } from "./StoreProvider";

export function SourceBadge({ source, className = "" }: { source: Cafe["source"]; className?: string }) {
  if (source === "sample")
    return (
      <span className={`inline-flex items-center gap-1 rounded-full border border-dashed border-biscuit-deep/60 bg-butter-soft px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-[#8A5A3C] ${className}`}>
        Sample café · fictional
      </span>
    );
  if (source === "curated")
    return (
      <span className={`inline-flex items-center gap-1 rounded-full bg-sage px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-olive-deep ${className}`}>
        Real café
      </span>
    );
  if (source === "osm")
    return (
      <span className={`inline-flex items-center gap-1 rounded-full bg-pond px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-[#3F6158] ${className}`}>
        OpenStreetMap listing
      </span>
    );
  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-sage-soft px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-olive-deep ${className}`}>
      Community listing
    </span>
  );
}

export function RatingLine({ cafeId, compact = false }: { cafeId: string; compact?: boolean }) {
  const { ratings } = useStore();
  const r = ratings[cafeId];
  if (!r || r.count === 0)
    return <span className="text-xs font-semibold text-ink-faint">{compact ? "No ratings yet" : "No ratings yet — be the first"}</span>;
  return (
    <span className="inline-flex items-center gap-1 text-sm font-bold" aria-label={`Rated ${r.avg.toFixed(1)} out of 5 from ${r.count} review${r.count > 1 ? "s" : ""}`}>
      <Icon name="star" size={15} className="fill-butter text-[#B08A2E]" />
      {r.avg.toFixed(1)} <span className="font-semibold text-ink-faint">({r.count})</span>
    </span>
  );
}

export function AmenityChips({ cafe, max = 4 }: { cafe: Pick<Cafe, "amenities">; max?: number }) {
  const list = cafe.amenities.slice(0, max);
  const extra = cafe.amenities.length - list.length;
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Amenities">
      {list.map((a) => (
        <li key={a} className="tag">
          <Icon name={AMENITY_ICONS[a]} size={13} strokeWidth={2} /> {AMENITY_LABELS[a]}
        </li>
      ))}
      {extra > 0 && <li className="tag bg-cream-deep text-ink-soft">+{extra}</li>}
    </ul>
  );
}

export function SaveButton({ cafe, size = "md" }: { cafe: Cafe | CafeSnapshot; size?: "sm" | "md" }) {
  const { isSaved, toggleSaved } = useStore();
  const saved = isSaved(cafe.id);
  const snap = "description" in cafe || "ambiance" in cafe ? toSnapshot(cafe as Cafe) : (cafe as CafeSnapshot);
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.88 }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSaved(snap);
      }}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${cafe.name} from wishlist` : `Save ${cafe.name} to wishlist`}
      className={`grid place-items-center rounded-full border transition ${
        size === "sm" ? "h-9 w-9" : "h-11 w-11"
      } ${saved ? "border-biscuit-deep bg-biscuit-soft text-[#9C4E3A]" : "border-ink/15 bg-cream/95 text-ink hover:border-ink/40"}`}
    >
      <Icon name="heart" size={size === "sm" ? 17 : 20} className={saved ? "fill-[#D98C78]" : ""} />
    </motion.button>
  );
}

export function CafeCard({
  cafe,
  selected,
  onHover,
  onSelect,
  distance,
}: {
  cafe: Cafe;
  selected?: boolean;
  onHover?: (id: string | null) => void;
  onSelect?: (id: string) => void;
  distance?: string;
}) {
  return (
    <motion.article
      layout="position"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onMouseEnter={() => onHover?.(cafe.id)}
      onMouseLeave={() => onHover?.(null)}
      className={`group relative flex gap-4 rounded-[22px] border bg-cream p-3 transition sm:p-3.5 ${
        selected ? "border-olive-deep shadow-lift ring-2 ring-olive/25" : "border-ink/12 shadow-card hover:-translate-y-0.5 hover:shadow-lift"
      }`}
      data-cafe-id={cafe.id}
    >
      <div className="relative h-28 w-32 shrink-0 overflow-hidden rounded-2xl border border-ink/10 sm:h-32 sm:w-40">
        <CafeStorefront art={cafe.art} name={cafe.name} className="h-full w-full" label={false} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <SourceBadge source={cafe.source} />
            <h3 className="mt-1 truncate text-lg font-semibold leading-tight">
              <Link
                href={`/cafe/${cafe.id}`}
                className="after:absolute after:inset-0 after:rounded-[22px] focus-visible:outline-none"
                onFocus={() => onSelect?.(cafe.id)}
                onClick={() => onSelect?.(cafe.id)}
              >
                {cafe.name}
              </Link>
            </h3>
          </div>
          <div className="relative z-10">
            <SaveButton cafe={cafe} size="sm" />
          </div>
        </div>
        <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-ink-soft">
          <span className="inline-flex items-center gap-1"><Icon name="pin" size={14} /> {cafe.city ?? "Location on map"}</span>
          {priceLabel(cafe.price) ? <span aria-label={`Price range ${cafe.price} of 4`}>· {priceLabel(cafe.price)}</span> : null}
          {distance ? <span>· {distance}</span> : null}
        </p>
        <RatingLine cafeId={cafe.id} compact />
        <div className="mt-auto">
          <AmenityChips cafe={cafe} max={3} />
        </div>
      </div>
    </motion.article>
  );
}

export function CafePreview({ cafe, onClose }: { cafe: Cafe; onClose: () => void }) {
  return (
    <motion.div
      key={cafe.id}
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
      className="card relative w-full overflow-hidden"
      role="dialog"
      aria-label={`${cafe.name} preview`}
    >
      <div className="relative h-32 border-b border-ink/10">
        <CafeStorefront art={cafe.art} name={cafe.name} className="h-full w-full" />
        <IllustrationNote />
        <div className="absolute right-2 top-2 flex gap-2">
          <SaveButton cafe={cafe} size="sm" />
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full border border-ink/15 bg-cream/95 hover:border-ink/40" aria-label="Close preview">
            <Icon name="close" size={17} />
          </button>
        </div>
      </div>
      <div className="space-y-2 p-4">
        <SourceBadge source={cafe.source} />
        <h3 className="text-xl font-semibold leading-tight">{cafe.name}</h3>
        <p className="flex flex-wrap items-center gap-2 text-sm text-ink-soft">
          <span className="inline-flex items-center gap-1"><Icon name="pin" size={14} /> {cafe.city ?? "See map"}</span>
          {priceLabel(cafe.price) && <span>· {priceLabel(cafe.price)}</span>}
        </p>
        <RatingLine cafeId={cafe.id} />
        <AmenityChips cafe={cafe} max={4} />
        <Link href={`/cafe/${cafe.id}`} className="btn-primary mt-2 w-full">
          Open café page <Icon name="arrowRight" size={18} />
        </Link>
      </div>
    </motion.div>
  );
}

export function CardSkeleton() {
  return (
    <div className="flex gap-4 rounded-[22px] border border-ink/10 bg-cream p-3.5" aria-hidden>
      <div className="skeleton h-28 w-32 rounded-2xl sm:h-32 sm:w-40" />
      <div className="flex-1 space-y-2 py-1">
        <div className="skeleton h-3 w-24 rounded-full" />
        <div className="skeleton h-5 w-3/4 rounded-full" />
        <div className="skeleton h-3 w-1/2 rounded-full" />
        <div className="skeleton mt-4 h-5 w-2/3 rounded-full" />
      </div>
    </div>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[26px] border border-dashed border-ink/25 bg-cream/80 px-6 py-10 text-center">
      <svg viewBox="0 0 120 80" className="h-20 w-28" aria-hidden>
        <g stroke="#493D2E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" filter="url(#lcc-wobble)">
          <ellipse cx="60" cy="70" rx="40" ry="6" fill="#C9D9BD" />
          <path d="M34 34h44v16a16 16 0 0 1-16 16H50a16 16 0 0 1-16-16z" fill="#FFF9EE" />
          <path d="M78 38h4a7 7 0 0 1 0 14h-5" fill="none" />
          <path d="M48 26c-2-3 2-5 0-8M58 26c-2-3 2-5 0-8" fill="none" />
          <path d="M46 46q3 3 6 0M60 46q3 3 6 0" fill="none" />
        </g>
      </svg>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="max-w-sm text-sm text-ink-soft">{body}</p>
      {action}
    </div>
  );
}
