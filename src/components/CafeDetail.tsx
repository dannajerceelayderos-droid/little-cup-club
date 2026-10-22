"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import type { Cafe, Review } from "@/lib/types";
import { AMBIANCE_LABELS, AMENITY_LABELS, MOOD_LABELS, priceLabel } from "@/lib/filters";
import { toSnapshot } from "@/lib/cafes/provider";
import { REGIONS, type RegionKey } from "@/lib/places";
import { todayLocal } from "@/lib/quests";
import { ACCEPTED_IMAGE_TYPES, MAX_UPLOAD_BYTES, fieldErrors, reviewSchema, visitSchema } from "@/lib/validation";
import { CafeMap } from "./CafeMap";
import { RatingLine, SaveButton, SourceBadge } from "./cafe-bits";
import { CommunityFeed, Stars } from "./CommunityFeed";
import { Icon, AMENITY_ICONS } from "./Icon";
import { CafeStorefront, IllustrationNote, Stamp } from "./illustrations";
import { Modal, ReportButton } from "./ReportDialog";
import { useStore } from "./StoreProvider";

function InfoRow({ icon, label, children }: { icon: Parameters<typeof Icon>[0]["name"]; label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 border-b border-dashed border-ink/15 py-3 last:border-0">
      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sage-soft text-olive-deep">
        <Icon name={icon} size={17} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-extrabold uppercase tracking-wider text-ink-faint">{label}</p>
        <div className="text-[0.95rem]">{children}</div>
      </div>
    </div>
  );
}

const Unavailable = ({ children }: { children: React.ReactNode }) => (
  <span className="italic text-ink-faint">{children}</span>
);

export function CafeDetail({ cafe }: { cafe: Cafe }) {
  const { data, recordVisit, ratings } = useStore();
  const [visitOpen, setVisitOpen] = useState(false);
  const [note, setNote] = useState("");
  const [noteErr, setNoteErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [stampShow, setStampShow] = useState<null | { first: boolean }>(null);
  const snap = useMemo(() => toSnapshot(cafe), [cafe]);

  const visits = data.visits.filter((v) => v.cafe.id === cafe.id);
  const visitedToday = visits.some((v) => v.visitedOn === todayLocal());
  const hasStamp = visits.length > 0;
  const rating = ratings[cafe.id];
  const isSample = cafe.source === "sample";
  const region = cafe.region ? REGIONS[cafe.region as RegionKey] : undefined;

  const doVisit = async () => {
    const parsed = visitSchema.safeParse({ note: note || undefined });
    if (!parsed.success) return setNoteErr(parsed.error.issues[0].message);
    setBusy(true);
    const res = await recordVisit(snap, parsed.data.note);
    setBusy(false);
    if (res) {
      setVisitOpen(false);
      setNote("");
      setStampShow({ first: res.newStamp });
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6">
      <Link href="/explore" className="btn-ghost -ml-3 mb-4 text-sm">
        <Icon name="arrowLeft" size={17} /> Back to explore
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        {/* LEFT */}
        <div className="space-y-8">
          <div className="card overflow-hidden">
            <div className="relative aspect-[16/9] border-b border-ink/10">
              <CafeStorefront art={cafe.art} name={cafe.name} className="h-full w-full" />
              <IllustrationNote />
            </div>
            <div className="space-y-4 p-5 sm:p-7">
              <div className="flex flex-wrap items-center gap-2">
                <SourceBadge source={cafe.source} />
                {!cafe.verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-cream-deep px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-ink-soft">
                    <Icon name="info" size={12} /> {isSample ? "Not a real business" : cafe.source === "curated" ? "Hours & details not yet verified" : "Unverified listing"}
                  </span>
                )}
                {region && <span className="tag">{region.name}</span>}
              </div>
              <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">{cafe.name}</h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-ink-soft">
                <span className="inline-flex items-center gap-1.5"><Icon name="pin" size={17} /> {cafe.city ?? "Philippines"}</span>
                {priceLabel(cafe.price) && <span aria-label={`Price ${cafe.price} of 4`}>{priceLabel(cafe.price)}</span>}
                <RatingLine cafeId={cafe.id} />
              </div>
              {cafe.description ? (
                <p className="text-lg leading-relaxed">
                  {cafe.description}
                  {cafe.descriptionSource && <span className="mt-1 block text-xs text-ink-faint">Based on {cafe.descriptionSource}</span>}
                </p>
              ) : (
                <p className="text-ink-faint">No description yet. Visited? Share what it&apos;s like in a review.</p>
              )}
              {isSample && (
                <p className="rounded-2xl border border-dashed border-biscuit-deep/50 bg-butter-soft px-4 py-3 text-sm">
                  <b>This is a fictional sample café</b> created to demonstrate Little Cup Club. Its pin sits near a real
                  town centre, but there is no business at that spot.
                </p>
              )}

              <div className="flex flex-wrap gap-2 pt-1">
                <SaveButton cafe={cafe} />
                <button className="btn-primary" onClick={() => setVisitOpen(true)} disabled={visitedToday}>
                  <Icon name="stamp" size={18} />
                  {visitedToday ? "Visit recorded today" : hasStamp ? "Record another visit" : "Mark as visited · collect stamp"}
                </button>
                <ReportButton targetType="cafe" targetId={cafe.id} />
              </div>
              {hasStamp && (
                <p className="text-sm font-semibold text-olive-deep">
                  <Icon name="check" size={15} className="inline" /> Stamp collected · {visits.length} recorded visit{visits.length > 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>

          {/* Vibe */}
          <section className="card p-5 sm:p-7" aria-labelledby="vibe-h">
            <h2 id="vibe-h" className="mb-4 text-2xl font-semibold">Amenities &amp; atmosphere</h2>
            {cafe.amenities.length ? (
              <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {cafe.amenities.map((a) => (
                  <li key={a} className="flex items-center gap-2 rounded-2xl bg-sage-soft/70 px-3 py-2.5 text-sm font-bold">
                    <Icon name={AMENITY_ICONS[a]} size={18} /> {AMENITY_LABELS[a]}
                  </li>
                ))}
              </ul>
            ) : (
              <Unavailable>No amenities listed by this source yet.</Unavailable>
            )}
            {(cafe.moods.length > 0 || cafe.ambiance.length > 0) && (
              <div className="mt-4 flex flex-wrap gap-2">
                {cafe.moods.map((m) => <span key={m} className="chip pointer-events-none">{MOOD_LABELS[m]}</span>)}
                {cafe.ambiance.map((a) => <span key={a} className="chip pointer-events-none bg-butter-soft">{AMBIANCE_LABELS[a]}</span>)}
              </div>
            )}
            {cafe.source === "osm" && (
              <p className="mt-4 text-xs text-ink-faint">Amenities are read from OpenStreetMap tags and may be incomplete.</p>
            )}
          </section>

          {/* Reviews */}
          <section aria-labelledby="reviews-h" className="space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 id="reviews-h" className="text-2xl font-semibold">Stories from visitors</h2>
                <p className="text-sm text-ink-soft">
                  {rating?.count ? (
                    <>Average <b>{rating.avg.toFixed(1)}</b> from {rating.count} member review{rating.count > 1 ? "s" : ""}.</>
                  ) : (
                    "No member ratings yet. Sample reviews don't count towards ratings."
                  )}
                </p>
              </div>
            </div>
            <ReviewForm cafe={cafe} />
            <CommunityFeed cafeId={cafe.id} limit={20} columns={2} />
          </section>
        </div>

        {/* RIGHT */}
        <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <div className="card overflow-hidden">
            <CafeMap
              cafes={[cafe]}
              selectedId={cafe.id}
              initialView={{ lat: cafe.lat, lng: cafe.lng, zoom: 15 }}
              className="h-64"
              label={`Map showing ${cafe.name}`}
              extraAttribution={cafe.source === "osm" ? "Café data © OpenStreetMap contributors" : undefined}
            />
            <div className="p-5">
              <InfoRow icon="pin" label="Address">
                {cafe.address ? (
                  <>
                    {cafe.address}
                    {isSample && <span className="block text-xs text-ink-faint">Fictional — for demo only</span>}
                  </>
                ) : (
                  <Unavailable>Street address not listed</Unavailable>
                )}
                <span className="mt-0.5 block font-mono text-xs text-ink-faint">
                  {cafe.lat.toFixed(5)}, {cafe.lng.toFixed(5)}
                </span>
              </InfoRow>
              <InfoRow icon="clock" label="Opening hours">
                {cafe.hours ? (
                  <>
                    <span className="font-mono text-sm">{cafe.hours.raw}</span>
                    <span className="block text-xs text-ink-faint">{cafe.hours.verified ? "Verified" : `Unverified · ${cafe.hours.source}`}</span>
                  </>
                ) : (
                  <Unavailable>Not verified yet — check with the café before visiting</Unavailable>
                )}
              </InfoRow>
              <InfoRow icon="phone" label="Contact">
                {cafe.phone || cafe.website ? (
                  <span className="space-y-1">
                    {cafe.phone && <a className="block font-semibold underline" href={`tel:${cafe.phone.replace(/\s/g, "")}`}>{cafe.phone}</a>}
                    {cafe.website && (
                      <a className="inline-flex items-center gap-1 font-semibold underline" href={cafe.website} target="_blank" rel="noopener noreferrer nofollow">
                        Website <Icon name="external" size={14} />
                      </a>
                    )}
                    <span className="block text-xs text-ink-faint">From OpenStreetMap · unverified</span>
                  </span>
                ) : (
                  <Unavailable>No verified contact details</Unavailable>
                )}
              </InfoRow>
              <InfoRow icon="cup" label="Menu highlights">
                {cafe.menuHighlights?.length ? (
                  <>
                    {cafe.menuHighlights.join(" · ")}
                    {isSample && <span className="block text-xs text-ink-faint">Sample menu</span>}
                  </>
                ) : (
                  <Unavailable>Not available yet</Unavailable>
                )}
              </InfoRow>
              <div className="pt-3">
                {isSample ? (
                  <p className="rounded-2xl bg-cream-deep px-3 py-2.5 text-sm text-ink-soft">
                    Directions are turned off for fictional sample cafés.
                  </p>
                ) : (
                  <a
                    className="btn-soft w-full"
                    href={`https://www.openstreetmap.org/directions?to=${cafe.lat}%2C${cafe.lng}#map=17/${cafe.lat}/${cafe.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon name="directions" size={18} /> Get directions
                  </a>
                )}
              </div>
              {cafe.attribution && <p className="mt-3 text-xs text-ink-faint">{cafe.attribution}</p>}
            </div>
          </div>
        </aside>
      </div>

      {/* Visit dialog */}
      <Modal open={visitOpen} onClose={() => setVisitOpen(false)} title="Record your visit">
        <div className="space-y-4">
          <div className="rounded-2xl bg-sage-soft p-4 text-sm leading-relaxed">
            <p className="font-bold">What counts as a recorded visit?</p>
            <p className="mt-1 text-ink-soft">
              It&apos;s your own check-in, on your honour. We don&apos;t track or verify your location. You can record one
              visit per café per day; your first visit to a café adds its stamp to your passport.
            </p>
          </div>
          <div>
            <label htmlFor="visit-note" className="label">A little note <span className="font-normal text-ink-faint">(optional, only you see it)</span></label>
            <textarea id="visit-note" className="field min-h-[90px]" maxLength={280} value={note}
              onChange={(e) => { setNote(e.target.value); setNoteErr(""); }} placeholder="Had the barako and a slice of buko pie…" />
            <p className={`mt-1 text-xs ${noteErr ? "font-bold text-[#9C4E3A]" : "text-ink-faint"}`}>{noteErr || `${note.length}/280`}</p>
          </div>
          <div className="flex justify-end gap-2">
            <button className="btn-soft" onClick={() => setVisitOpen(false)}>Cancel</button>
            <button className="btn-primary" onClick={doVisit} disabled={busy}>{busy ? "Stamping…" : "I visited today"}</button>
          </div>
        </div>
      </Modal>

      {/* Stamp celebration */}
      <Modal open={!!stampShow} onClose={() => setStampShow(null)} title={stampShow?.first ? "New stamp collected!" : "Visit recorded"}>
        <div className="flex flex-col items-center gap-4 text-center">
          <motion.div
            initial={{ scale: 1.8, rotate: -25, opacity: 0 }}
            animate={{ scale: 1, rotate: -6, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.1 }}
          >
            <Stamp name={cafe.name} city={cafe.city} art={cafe.art} size={170}
              date={new Date().toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })} />
          </motion.div>
          <p className="text-ink-soft">
            {stampShow?.first
              ? `${cafe.name} is now in your Coffee Passport.`
              : "Another visit added to your history. Each café gives one stamp, but every visit counts towards your story."}
          </p>
          <div className="flex gap-2">
            <button className="btn-soft" onClick={() => setStampShow(null)}>Keep exploring</button>
            <Link href="/passport" className="btn-primary">Open passport</Link>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function ReviewForm({ cafe }: { cafe: Cafe }) {
  const { addReview, data, signedIn, mode } = useStore();
  const existing: Review | undefined = data.myReviews.find((r) => r.cafeId === cafe.id);
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (existing && open) {
      setRating(existing.rating);
      setBody(existing.body);
    }
  }, [existing, open]);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  if (mode === "supabase" && !signedIn)
    return (
      <div className="card flex flex-wrap items-center justify-between gap-3 p-4">
        <p className="text-sm font-semibold">Sign in to rate this café and share your story.</p>
        <Link href="/signin" className="btn-primary text-sm">Sign in</Link>
      </div>
    );

  if (!open)
    return (
      <button className="card flex w-full items-center gap-3 p-4 text-left transition hover:shadow-lift" onClick={() => setOpen(true)}>
        <span className="grid h-10 w-10 place-items-center rounded-full bg-butter"><Icon name="plus" /></span>
        <span className="font-bold">{existing ? "Edit your review" : "Write a review"}</span>
      </button>
    );

  const onFile = (f: File | null) => {
    setErrors((e) => ({ ...e, photo: "" }));
    if (!f) { setFile(null); setPreview(null); return; }
    if (!ACCEPTED_IMAGE_TYPES.includes(f.type)) return setErrors((e) => ({ ...e, photo: "Please choose a JPG, PNG or WebP image." }));
    if (f.size > MAX_UPLOAD_BYTES) return setErrors((e) => ({ ...e, photo: "That photo is over 5 MB — try a smaller one." }));
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = reviewSchema.safeParse({ rating, body });
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    setErrors({});
    setBusy(true);
    const r = await addReview({ cafe: toSnapshot(cafe), rating: parsed.data.rating as Review["rating"], body: parsed.data.body, photo: file ?? undefined });
    setBusy(false);
    if (r) {
      setOpen(false);
      setFile(null);
      setPreview(null);
    }
  };

  return (
    <form onSubmit={submit} className="card space-y-4 p-5" noValidate aria-label="Write a review">
      <fieldset>
        <legend className="label">Your rating</legend>
        <div className="flex gap-1" role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((i) => (
            <button key={i} type="button" role="radio" aria-checked={rating === i} aria-label={`${i} star${i > 1 ? "s" : ""}`}
              onClick={() => setRating(i)} className="rounded-lg p-1 transition hover:scale-110">
              <Icon name="star" size={28} className={i <= rating ? "fill-butter text-[#B08A2E]" : "text-ink/30"} />
            </button>
          ))}
        </div>
        {errors.rating && <p className="mt-1 text-sm font-semibold text-[#9C4E3A]">{errors.rating}</p>}
      </fieldset>
      <div>
        <label htmlFor="review-body" className="label">Your story</label>
        <textarea id="review-body" className="field min-h-[120px]" maxLength={1000} value={body} onChange={(e) => setBody(e.target.value)}
          placeholder="What did you order? Where did you sit? Would you come back?" aria-invalid={!!errors.body} />
        <p className={`mt-1 text-xs ${errors.body ? "font-bold text-[#9C4E3A]" : "text-ink-faint"}`}>{errors.body || `${body.trim().length}/1000`}</p>
      </div>
      <div>
        <label htmlFor="review-photo" className="label">Add a photo <span className="font-normal text-ink-faint">(optional · JPG, PNG or WebP, up to 5 MB)</span></label>
        <div className="flex items-center gap-3">
          <label htmlFor="review-photo" className="btn-soft cursor-pointer text-sm"><Icon name="camera" size={17} /> Choose photo</label>
          <input id="review-photo" type="file" accept={ACCEPTED_IMAGE_TYPES.join(",")} className="sr-only" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
          {preview && (
            <span className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Selected photo preview" className="h-14 w-14 rounded-xl object-cover" />
              <button type="button" className="text-sm font-bold underline" onClick={() => onFile(null)}>Remove</button>
            </span>
          )}
        </div>
        {errors.photo && <p className="mt-1 text-sm font-semibold text-[#9C4E3A]">{errors.photo}</p>}
        <p className="mt-1 text-xs text-ink-faint">Photos are resized and location metadata is removed before saving. Only share photos you took.</p>
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" className="btn-soft" onClick={() => setOpen(false)}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={busy}>{busy ? "Posting…" : existing ? "Update review" : "Post review"}</button>
      </div>
      {existing && <p className="text-xs text-ink-faint">You can have one review per café; posting again updates it. Currently: <Stars value={existing.rating} size={12} /></p>}
    </form>
  );
}
