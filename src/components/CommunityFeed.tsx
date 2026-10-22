"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Review } from "@/lib/types";
import { getSampleCafe } from "@/lib/cafes/sample";
import { artFromId } from "@/lib/art";
import { Avatar, CafeStorefront } from "./illustrations";
import { Icon } from "./Icon";
import { useStore } from "./StoreProvider";
import { ReportButton } from "./ReportDialog";

export function Stars({ value, size = 15 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Icon key={i} name="star" size={size} className={i <= value ? "fill-butter text-[#B08A2E]" : "text-ink/25"} />
      ))}
    </span>
  );
}

export function ReviewCard({ review, showCafe = true, onDelete }: { review: Review; showCafe?: boolean; onDelete?: () => void }) {
  const { profile } = useStore();
  const art = getSampleCafe(review.cafeId)?.art ?? artFromId(review.cafeId);
  const mine = !review.sample && profile && review.authorId === profile.id;
  return (
    <article className="card flex h-full flex-col overflow-hidden">
      {showCafe && (
        <Link href={`/cafe/${review.cafeId}`} className="relative block h-32 border-b border-ink/10">
          {review.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={review.photo} alt={`Photo shared by ${review.authorName} at ${review.cafeName}`} className="h-full w-full object-cover" />
          ) : (
            <CafeStorefront art={art} name={review.cafeName} className="h-full w-full" label={false} />
          )}
        </Link>
      )}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center gap-3">
          <Avatar variant={review.avatar} size={38} label={`${review.authorName}'s avatar`} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-extrabold">{review.authorName}{mine ? " (you)" : ""}</p>
            <p className="text-xs text-ink-faint">
              {new Date(review.createdAt).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
            </p>
          </div>
          {review.sample ? (
            <span className="rounded-full border border-dashed border-biscuit-deep/60 bg-butter-soft px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-[#8A5A3C]">
              Sample review
            </span>
          ) : (
            <Stars value={review.rating} />
          )}
        </div>
        {review.sample && <Stars value={review.rating} />}
        <p className="flex-1 text-[0.95rem] leading-relaxed">“{review.body}”</p>
        <div className="flex items-center justify-between gap-2 text-xs">
          {showCafe ? (
            <Link href={`/cafe/${review.cafeId}`} className="inline-flex min-w-0 items-center gap-1 font-bold text-olive-deep hover:underline">
              <Icon name="pin" size={14} /> <span className="truncate">{review.cafeName}{review.cafeCity ? ` · ${review.cafeCity}` : ""}</span>
            </Link>
          ) : <span />}
          {mine && onDelete ? (
            <button className="inline-flex items-center gap-1 font-bold text-ink-soft hover:text-ink" onClick={onDelete}>
              <Icon name="trash" size={14} /> Delete
            </button>
          ) : !review.sample ? (
            <ReportButton targetType="review" targetId={review.id} label="Report" compact />
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function CommunityFeed({ limit = 6, cafeId, columns = 3 }: { limit?: number; cafeId?: string; columns?: 2 | 3 }) {
  const grid = columns === 2 ? "grid gap-4 sm:grid-cols-2" : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3";
  const { listReviews, ready, data, deleteReview } = useStore();
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!ready) return;
    let alive = true;
    listReviews({ cafeId, limit })
      .then((r) => alive && setReviews(r))
      .catch(() => alive && setError(true));
    return () => {
      alive = false;
    };
  }, [ready, listReviews, cafeId, limit, data.myReviews, data.reports]);

  if (error)
    return <p className="rounded-2xl bg-blush px-4 py-3 text-sm font-semibold">Couldn&apos;t load community reviews right now.</p>;
  if (!reviews)
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy>
        {Array.from({ length: Math.min(limit, 3) }).map((_, i) => (
          <div key={i} className="skeleton h-64 rounded-[22px]" />
        ))}
      </div>
    );
  if (reviews.length === 0)
    return <p className="text-sm text-ink-soft">No reviews yet. Be the first to share a story.</p>;
  return (
    <div className={grid}>
      {reviews.map((r) => (
        <ReviewCard key={r.id} review={r} showCafe={!cafeId} onDelete={() => deleteReview(r.id)} />
      ))}
    </div>
  );
}
