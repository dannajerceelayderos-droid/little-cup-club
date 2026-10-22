"use client";

import Link from "next/link";
import { useState } from "react";
import { z } from "zod";
import { useStore } from "@/components/StoreProvider";
import { LogoMark, SleepyCat } from "@/components/illustrations";
import { Icon } from "@/components/Icon";

export default function SignInPage() {
  const { mode, signIn, signedIn, profile } = useStore();
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  if (mode === "demo")
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <LogoMark size={64} />
        <h1 className="mt-4 text-3xl font-semibold">You&apos;re in demo mode</h1>
        <p className="mt-3 text-ink-soft">
          Accounts switch on once Supabase is configured. Until then, your wishlist, stamps and reviews are saved
          privately in this browser as a guest.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Link href="/profile" className="btn-primary">Edit guest profile</Link>
          <Link href="/about#setup" className="btn-soft">Setup guide</Link>
        </div>
      </div>
    );

  if (signedIn)
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-3xl font-semibold">Welcome back, {profile?.displayName}</h1>
        <Link href="/passport" className="btn-primary mt-6">Open your passport</Link>
      </div>
    );

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="card relative overflow-hidden p-7">
        <SleepyCat className="absolute -right-2 -top-1 h-12 w-20 opacity-90" />
        <LogoMark size={52} />
        <h1 className="mt-3 text-3xl font-semibold">Join the club</h1>
        <p className="mt-2 text-ink-soft">We&apos;ll email you a magic link — no password needed.</p>
        {sent ? (
          <p className="mt-6 rounded-2xl bg-sage px-4 py-3 font-semibold" role="status">
            <Icon name="check" className="inline" size={18} /> Check {email} for your sign-in link.
          </p>
        ) : (
          <form
            className="mt-6 space-y-3"
            noValidate
            onSubmit={async (e) => {
              e.preventDefault();
              const ok = z.string().trim().email().safeParse(email);
              if (!ok.success) return setErr("Please enter a valid email address.");
              setErr("");
              setBusy(true);
              if (await signIn(ok.data)) setSent(true);
              setBusy(false);
            }}
          >
            <label htmlFor="email" className="label">Email</label>
            <input id="email" type="email" autoComplete="email" className="field" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!err} aria-describedby={err ? "email-err" : undefined} />
            {err && <p id="email-err" className="text-sm font-semibold text-[#9C4E3A]">{err}</p>}
            <button className="btn-primary w-full" disabled={busy}>{busy ? "Sending…" : "Send magic link"}</button>
          </form>
        )}
      </div>
    </div>
  );
}
