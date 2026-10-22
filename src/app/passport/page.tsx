"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { useStore } from "@/components/StoreProvider";
import { Avatar, Stamp } from "@/components/illustrations";
import { Icon, type IconName } from "@/components/Icon";
import { EmptyState, SaveButton } from "@/components/cafe-bits";
import { QUESTS, regionProgress, stampedCafes } from "@/lib/quests";
import { CafeStorefront } from "@/components/illustrations";

const TABS = [
  { id: "stamps", label: "Stamps", icon: "stamp" },
  { id: "quests", label: "Quests & badges", icon: "sparkle" },
  { id: "wishlist", label: "Wishlist", icon: "heart" },
  { id: "history", label: "Visit history", icon: "clock" },
] as const satisfies readonly { id: string; label: string; icon: IconName }[];
type Tab = (typeof TABS)[number]["id"];

const BADGE_COLORS = ["#C9D9BD", "#F6E7A9", "#DFAE91", "#EFD3C6", "#CFE1DC", "#A9C09A", "#F0D5C4", "#E3ECDB"];

function Progress({ value, max, color = "#7B8767", label }: { value: number; max: number; color?: string; label: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div role="progressbar" aria-label={label} aria-valuenow={Math.min(value, max)} aria-valuemin={0} aria-valuemax={max} className="h-3 overflow-hidden rounded-full border border-ink/15 bg-cream">
      <motion.div className="h-full rounded-full" style={{ background: color }} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: "easeOut" }} />
    </div>
  );
}

export default function PassportPage() {
  const { data, profile, ready, mode, signedIn } = useStore();
  const [tab, setTab] = useState<Tab>("stamps");

  if (mode === "supabase" && ready && !signedIn)
    return (
      <div className="mx-auto max-w-xl px-4 py-20">
        <EmptyState title="Your passport is waiting" body="Sign in to collect stamps, save cafés and track quests across devices."
          action={<Link href="/signin" className="btn-primary">Sign in</Link>} />
      </div>
    );

  const stamps = stampedCafes(data.visits);
  const regions = regionProgress(data.visits);
  const qd = { visits: data.visits, reviews: data.myReviews, wishlist: data.wishlist };
  const quests = QUESTS.map((q) => ({ ...q, value: q.progress(qd) }));
  const badges = quests.filter((q) => q.value >= q.target);
  const regionsVisited = regions.filter((r) => r.count > 0).length;
  const slots = Math.max(8, Math.ceil((stamps.length + 1) / 4) * 4);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-10 pt-8 sm:px-6">
      {/* cover */}
      <div className="relative overflow-hidden rounded-[30px] border-2 border-olive-deep/70 bg-olive p-6 text-cream shadow-lift sm:p-9">
        <div className="pointer-events-none absolute inset-3 rounded-[24px] border border-dashed border-cream/40" />
        <div className="relative flex flex-wrap items-center gap-5">
          <div className="rounded-full bg-cream p-1"><Avatar variant={profile?.avatar ?? 0} size={72} label="Your avatar" /></div>
          <div className="min-w-0 flex-1">
            <p className="hand text-2xl text-butter">Coffee Passport of</p>
            <h1 className="truncate text-4xl font-semibold text-cream">{profile?.displayName ?? "…"}</h1>
            <p className="mt-1 text-sm text-cream/80">Republic of Little Cups · No. {String(stamps.length).padStart(3, "0")}</p>
          </div>
          <dl className="grid grid-cols-4 gap-2 text-center sm:gap-4">
            {[
              ["Stamps", stamps.length],
              ["Visits", data.visits.length],
              ["Regions", regionsVisited],
              ["Badges", badges.length],
            ].map(([k, v]) => (
              <div key={k} className="rounded-2xl bg-cream/15 px-3 py-2 sm:px-4">
                <dt className="text-[11px] font-extrabold uppercase tracking-wider text-cream/80">{k}</dt>
                <dd className="font-display text-2xl font-semibold">{ready ? v : "–"}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* tabs */}
      <div role="tablist" aria-label="Passport sections" className="mt-8 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
        {TABS.map((t) => (
          <button key={t.id} role="tab" id={`tab-${t.id}`} aria-selected={tab === t.id} aria-controls={`panel-${t.id}`}
            onClick={() => setTab(t.id)} className="chip shrink-0 py-2" data-active={tab === t.id}>
            <Icon name={t.icon} size={17} /> {t.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="mt-6">
        {!ready ? (
          <div className="skeleton h-80 rounded-[26px]" />
        ) : tab === "stamps" ? (
          <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
            <section className="card p-5 sm:p-7" aria-label="Your stamps">
              <div className="mb-4 flex items-baseline justify-between">
                <h2 className="text-2xl font-semibold">Stamp pages</h2>
                <span className="hand text-xl text-ink-soft">one stamp per café</span>
              </div>
              {stamps.length === 0 && (
                <p className="mb-5 rounded-2xl bg-butter-soft px-4 py-3 text-sm">
                  No stamps yet. Open any café and tap <b>Mark as visited</b> to collect your first one.
                </p>
              )}
              <ul className="grid grid-cols-2 gap-x-2 gap-y-5 sm:grid-cols-4">
                {Array.from({ length: slots }).map((_, i) => {
                  const v = stamps[i];
                  return (
                    <li key={v?.cafe.id ?? `empty-${i}`} className="flex flex-col items-center">
                      {v ? (
                        <Link href={`/cafe/${v.cafe.id}`} className="rounded-full transition hover:scale-105" aria-label={`${v.cafe.name}, first visited ${v.visitedOn}`}>
                          <Stamp name={v.cafe.name} city={v.cafe.city} art={v.cafe.art} size={118} rotate={((i * 37) % 15) - 7}
                            date={new Date(v.visitedOn + "T00:00").toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })} />
                        </Link>
                      ) : (
                        <Stamp empty size={118} />
                      )}
                    </li>
                  );
                })}
              </ul>
              <p className="mt-6 text-xs text-ink-faint">
                Stamps come from visits you record yourself. We don&apos;t verify your location — it&apos;s an honour system.
              </p>
            </section>
            <section className="card p-5 sm:p-7" aria-label="Regional collections">
              <h2 className="mb-1 text-2xl font-semibold">Regional collections</h2>
              <p className="mb-5 text-sm text-ink-soft">Collect three stamps in a region to complete its page.</p>
              <ul className="space-y-4">
                {regions.map((r) => (
                  <li key={r.key}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 font-bold">
                        <span className="h-4 w-4 rounded-full border border-ink/20" style={{ background: r.color }} /> {r.name}
                      </span>
                      <span className="font-semibold text-ink-soft">{Math.min(r.count, r.target)}/{r.target}{r.count >= r.target ? " ✓" : ""}</span>
                    </div>
                    <Progress value={r.count} max={r.target} color={r.color} label={`${r.name} progress`} />
                    <p className="mt-1 text-xs text-ink-faint">{r.blurb}</p>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        ) : tab === "quests" ? (
          <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
            <section className="card p-5 sm:p-7" aria-label="Quests">
              <h2 className="mb-5 text-2xl font-semibold">Quests</h2>
              <ul className="space-y-5">
                {quests.map((q, i) => {
                  const done = q.value >= q.target;
                  return (
                    <li key={q.id} className="flex gap-4">
                      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 ${done ? "border-olive-deep bg-sage" : "border-dashed border-ink/25 bg-cream"}`}>
                        <Icon name={done ? "check" : "sparkle"} size={20} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <h3 className="text-lg font-semibold">{q.title}</h3>
                          <span className="text-sm font-bold text-ink-soft">{Math.min(q.value, q.target)}/{q.target}</span>
                        </div>
                        <p className="mb-2 text-sm text-ink-soft">{q.description}</p>
                        <Progress value={q.value} max={q.target} color={BADGE_COLORS[i % BADGE_COLORS.length]} label={`${q.title} progress`} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
            <section className="card p-5 sm:p-7" aria-label="Badges">
              <h2 className="mb-1 text-2xl font-semibold">Badges</h2>
              <p className="mb-5 text-sm text-ink-soft">Cosmetic keepsakes for finished quests.</p>
              <ul className="grid grid-cols-3 gap-4">
                {quests.map((q, i) => {
                  const done = q.value >= q.target;
                  return (
                    <li key={q.id} className="flex flex-col items-center gap-1.5 text-center">
                      <motion.span
                        whileHover={done ? { rotate: [0, -8, 8, 0] } : undefined}
                        className={`grid h-16 w-16 place-items-center rounded-full border-2 ${done ? "border-ink/60" : "border-dashed border-ink/20 grayscale"}`}
                        style={{ background: done ? BADGE_COLORS[i % BADGE_COLORS.length] : "#F8EEDC" }}
                        aria-label={`${q.badge} badge, ${done ? "earned" : "locked"}`}
                      >
                        <Icon name={(["leaf", "matcha", "sun", "book", "leaf", "map", "heart", "sparkle"] as IconName[])[i]} size={26} className={done ? "" : "opacity-30"} />
                      </motion.span>
                      <span className={`text-xs font-bold ${done ? "" : "text-ink-faint"}`}>{q.badge}</span>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>
        ) : tab === "wishlist" ? (
          data.wishlist.length === 0 ? (
            <EmptyState title="Nothing saved yet" body="Tap the heart on any café to save it for a future day out."
              action={<Link href="/explore" className="btn-primary text-sm">Explore cafés</Link>} />
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.wishlist.map((w) => (
                <li key={w.cafe.id} className="card relative overflow-hidden">
                  <div className="h-32 border-b border-ink/10"><CafeStorefront art={w.cafe.art} name={w.cafe.name} className="h-full w-full" label={false} /></div>
                  <div className="flex items-start justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <Link href={`/cafe/${w.cafe.id}`} className="block truncate text-lg font-semibold hover:underline">{w.cafe.name}</Link>
                      <p className="text-sm text-ink-soft">{w.cafe.city}{w.cafe.source === "sample" ? " · sample café" : ""}</p>
                    </div>
                    <SaveButton cafe={w.cafe} size="sm" />
                  </div>
                </li>
              ))}
            </ul>
          )
        ) : data.visits.length === 0 ? (
          <EmptyState title="No visits recorded" body="Your café diary fills up as you record visits." action={<Link href="/explore" className="btn-primary text-sm">Find a café</Link>} />
        ) : (
          <ol className="relative space-y-4 border-l-2 border-dashed border-olive/40 pl-6">
            {data.visits.map((v) => (
              <li key={v.id} className="relative">
                <span className="absolute -left-[33px] top-4 h-4 w-4 rounded-full border-2 border-cream bg-olive" />
                <div className="card p-4">
                  <p className="text-xs font-extrabold uppercase tracking-wider text-ink-faint">
                    {new Date(v.visitedOn + "T00:00").toLocaleDateString("en-PH", { weekday: "short", month: "long", day: "numeric", year: "numeric" })}
                  </p>
                  <Link href={`/cafe/${v.cafe.id}`} className="text-lg font-semibold hover:underline">{v.cafe.name}</Link>
                  <span className="text-sm text-ink-soft"> · {v.cafe.city}</span>
                  {v.note && <p className="hand mt-1 text-xl text-ink-soft">“{v.note}”</p>}
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
