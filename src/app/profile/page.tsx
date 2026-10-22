"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useStore } from "@/components/StoreProvider";
import { Avatar } from "@/components/illustrations";
import { fieldErrors, profileSchema } from "@/lib/validation";
import { stampedCafes } from "@/lib/quests";

export default function ProfilePage() {
  const { profile, updateProfile, mode, signedIn, signOut, data, ready } = useStore();
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(0);
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!profile) return;
    setName(profile.displayName);
    setAvatar(profile.avatar);
    setBio(profile.bio ?? "");
    setCity(profile.homeCity ?? "");
  }, [profile]);

  if (mode === "supabase" && ready && !signedIn)
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-3xl font-semibold">Sign in to see your profile</h1>
        <Link href="/signin" className="btn-primary mt-6">Sign in</Link>
      </div>
    );

  return (
    <div className="mx-auto max-w-2xl px-4 pb-10 pt-10 sm:px-6">
      <h1 className="text-4xl font-semibold">Your profile</h1>
      {mode === "demo" && (
        <p className="mt-2 rounded-2xl bg-butter-soft px-4 py-3 text-sm">
          You&apos;re a guest in demo mode. Your profile and passport are stored only in this browser.
        </p>
      )}
      <form
        noValidate
        className="card mt-6 space-y-5 p-6"
        onSubmit={async (e) => {
          e.preventDefault();
          const parsed = profileSchema.safeParse({ displayName: name, avatar, bio: bio || undefined, homeCity: city || undefined });
          if (!parsed.success) return setErrors(fieldErrors(parsed.error));
          setErrors({});
          await updateProfile(parsed.data);
        }}
      >
        <fieldset>
          <legend className="label">Avatar</legend>
          <div className="flex flex-wrap gap-3" role="radiogroup" aria-label="Avatar">
            {[0, 1, 2, 3, 4, 5].map((v) => (
              <button key={v} type="button" role="radio" aria-checked={avatar === v} onClick={() => setAvatar(v)}
                className={`rounded-full p-1 transition ${avatar === v ? "ring-4 ring-olive" : "hover:ring-2 hover:ring-ink/20"}`}>
                <Avatar variant={v} size={56} label={`Avatar option ${v + 1}`} />
              </button>
            ))}
          </div>
        </fieldset>
        <div>
          <label htmlFor="dn" className="label">Display name</label>
          <input id="dn" className="field" maxLength={40} value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!errors.displayName} />
          {errors.displayName && <p className="mt-1 text-sm font-semibold text-[#9C4E3A]">{errors.displayName}</p>}
        </div>
        <div>
          <label htmlFor="hc" className="label">Home city <span className="font-normal text-ink-faint">(optional)</span></label>
          <input id="hc" className="field" maxLength={60} value={city} onChange={(e) => setCity(e.target.value)} />
        </div>
        <div>
          <label htmlFor="bio" className="label">Bio <span className="font-normal text-ink-faint">(optional)</span></label>
          <textarea id="bio" className="field min-h-[90px]" maxLength={280} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Barako in the morning, matcha after three." />
        </div>
        <button className="btn-primary">Save profile</button>
      </form>

      <div className="card mt-6 grid grid-cols-3 gap-3 p-5 text-center">
        {[["Stamps", stampedCafes(data.visits).length], ["Reviews", data.myReviews.length], ["Saved", data.wishlist.length]].map(([k, v]) => (
          <div key={k}><p className="font-display text-3xl font-semibold">{v}</p><p className="text-xs font-extrabold uppercase tracking-wider text-ink-faint">{k}</p></div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link href="/passport" className="btn-soft">Open passport</Link>
        {mode === "supabase" ? (
          <button className="btn-ghost" onClick={signOut}>Sign out</button>
        ) : (
          <button
            className="btn-ghost text-sm"
            onClick={() => {
              if (confirm("Reset all demo data in this browser? This clears your stamps, wishlist and reviews.")) {
                localStorage.removeItem("lcc:demo:v1");
                location.reload();
              }
            }}
          >
            Reset demo data
          </button>
        )}
      </div>
    </div>
  );
}
