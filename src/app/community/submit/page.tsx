"use client";

import Link from "next/link";
import { useState } from "react";
import type { Amenity } from "@/lib/types";
import { AMENITY_LABELS } from "@/lib/filters";
import { fieldErrors, submissionSchema } from "@/lib/validation";
import { useStore } from "@/components/StoreProvider";
import { Icon, AMENITY_ICONS } from "@/components/Icon";
import { MoodArt } from "@/components/illustrations";

const AMENITIES = Object.keys(AMENITY_LABELS) as Amenity[];

function Field({ id, label, hint, error, children }: { id: string; label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="label">{label}{hint && <span className="font-normal text-ink-faint"> {hint}</span>}</label>
      {children}
      {error && <p id={`${id}-err`} className="mt-1 text-sm font-semibold text-[#9C4E3A]">{error}</p>}
    </div>
  );
}

export default function SubmitCafePage() {
  const { submitCafe, mode, signedIn } = useStore();
  const [form, setForm] = useState({ name: "", city: "", address: "", website: "", lat: "", lng: "", notes: "" });
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [confirm, setConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));
  const inv = (k: string) => ({ "aria-invalid": !!errors[k], "aria-describedby": errors[k] ? `${k}-err` : undefined });

  if (mode === "supabase" && !signedIn)
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-3xl font-semibold">Sign in to suggest a café</h1>
        <p className="mt-2 text-ink-soft">Suggestions are linked to your account so moderators can follow up.</p>
        <Link href="/signin" className="btn-primary mt-6">Sign in</Link>
      </div>
    );

  if (done)
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <MoodArt mood="garden" className="mx-auto h-28 w-36" />
        <h1 className="mt-4 text-3xl font-semibold">Salamat! We got it.</h1>
        <p className="mt-2 text-ink-soft">Your suggestion is waiting for a moderator. Once it&apos;s checked, it can join the map.</p>
        <div className="mt-6 flex justify-center gap-2">
          <Link href="/community" className="btn-soft">Back to community</Link>
          <button className="btn-primary" onClick={() => { setDone(false); setForm({ name: "", city: "", address: "", website: "", lat: "", lng: "", notes: "" }); setAmenities([]); setConfirm(false); }}>
            Suggest another
          </button>
        </div>
      </div>
    );

  return (
    <div className="mx-auto max-w-2xl px-4 pb-10 pt-10 sm:px-6">
      <Link href="/community" className="btn-ghost -ml-3 mb-4 text-sm"><Icon name="arrowLeft" size={17} /> Community</Link>
      <h1 className="text-4xl font-semibold">Suggest a café</h1>
      <p className="mt-2 text-ink-soft">Help grow the map. Suggestions are reviewed by moderators before they appear.</p>
      <form
        noValidate
        className="card mt-8 space-y-5 p-6"
        onSubmit={async (e) => {
          e.preventDefault();
          const parsed = submissionSchema.safeParse({ ...form, website: form.website || undefined, notes: form.notes || undefined, amenities, confirm });
          if (!parsed.success) {
            setErrors(fieldErrors(parsed.error));
            return;
          }
          setErrors({});
          setBusy(true);
          const { confirm: _c, ...payload } = parsed.data;
          void _c;
          const ok = await submitCafe(payload);
          setBusy(false);
          if (ok) setDone(true);
        }}
      >
        <Field id="name" label="Café name" error={errors.name}>
          <input id="name" className="field" maxLength={80} value={form.name} onChange={set("name")} {...inv("name")} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="city" label="Town or city" error={errors.city}>
            <input id="city" className="field" maxLength={60} value={form.city} onChange={set("city")} placeholder="San Pablo City" {...inv("city")} />
          </Field>
          <Field id="website" label="Website or social link" hint="(optional)" error={errors.website}>
            <input id="website" type="url" className="field" maxLength={200} value={form.website} onChange={set("website")} placeholder="https://" {...inv("website")} />
          </Field>
        </div>
        <Field id="address" label="Address or landmark" error={errors.address}>
          <input id="address" className="field" maxLength={160} value={form.address} onChange={set("address")} placeholder="Near the plaza, beside the bakery" {...inv("address")} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="lat" label="Latitude" hint="(optional)" error={errors.lat}>
            <input id="lat" inputMode="decimal" className="field" value={form.lat} onChange={set("lat")} placeholder="14.0697" {...inv("lat")} />
          </Field>
          <Field id="lng" label="Longitude" hint="(optional)" error={errors.lng}>
            <input id="lng" inputMode="decimal" className="field" value={form.lng} onChange={set("lng")} placeholder="121.3253" {...inv("lng")} />
          </Field>
        </div>
        <fieldset>
          <legend className="label">What does it have?</legend>
          <div className="flex flex-wrap gap-2">
            {AMENITIES.map((a) => (
              <button key={a} type="button" className="chip" aria-pressed={amenities.includes(a)}
                onClick={() => setAmenities((l) => (l.includes(a) ? l.filter((x) => x !== a) : [...l, a]))}>
                <Icon name={AMENITY_ICONS[a]} size={16} /> {AMENITY_LABELS[a]}
              </button>
            ))}
          </div>
        </fieldset>
        <Field id="notes" label="Anything else?" hint="(optional)" error={errors.notes}>
          <textarea id="notes" className="field min-h-[100px]" maxLength={500} value={form.notes} onChange={set("notes")} placeholder="Opening days, what to order, why you love it…" />
        </Field>
        <div>
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" className="mt-1 h-4 w-4 accent-[#7B8767]" checked={confirm} onChange={(e) => setConfirm(e.target.checked)} aria-invalid={!!errors.confirm} />
            <span>I&apos;ve visited this café or know it well, and the details above are accurate to the best of my knowledge.</span>
          </label>
          {errors.confirm && <p className="mt-1 text-sm font-semibold text-[#9C4E3A]">{errors.confirm}</p>}
        </div>
        {Object.keys(errors).length > 0 && (
          <p role="alert" className="rounded-xl bg-blush px-3 py-2 text-sm font-semibold">Please fix the highlighted fields.</p>
        )}
        <button className="btn-primary w-full" disabled={busy}>{busy ? "Sending…" : "Submit for review"}</button>
      </form>
    </div>
  );
}
