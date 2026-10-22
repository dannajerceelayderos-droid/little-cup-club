import Link from "next/link";
import { Suspense } from "react";
import { ExploreView } from "@/components/ExploreView";
import { HeroSearch } from "@/components/HeroSearch";
import { CommunityFeed } from "@/components/CommunityFeed";
import { HeroScene, MoodArt, SleepyCat, Sprig, Stamp } from "@/components/illustrations";
import { Icon } from "@/components/Icon";
import { MOOD_LABELS } from "@/lib/filters";
import { REGIONS, type RegionKey } from "@/lib/places";
import { QUESTS } from "@/lib/quests";
import { SAMPLE_CAFES } from "@/lib/cafes/sample";
import { SAN_PABLO_UNPINNED } from "@/lib/cafes/sanpablo";
import type { Mood } from "@/lib/types";

const MOOD_COPY: Record<Mood, string> = {
  cozy: "Soft chairs, warm lamps, a cup that lasts all afternoon.",
  matcha: "Whisked, iced, layered — for the green-tea faithful.",
  study: "Outlets, Wi-Fi and the kind of quiet that gets things done.",
  garden: "Ferns, sunlight and tables tucked between the plants.",
  date: "Candlelit corners and desserts worth sharing.",
  hidden: "Down an alley, up a staircase, worth the search.",
};

export default function Home() {
  const stampCafes = [SAMPLE_CAFES[0], SAMPLE_CAFES[3], SAMPLE_CAFES[11]];
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-14 pt-10 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pb-20 lg:pt-16">
          <div className="relative z-10 space-y-6">
            <p className="hand inline-flex items-center gap-2 text-2xl text-olive-deep">
              <Sprig className="h-6 w-10" /> a storybook guide to Philippine cafés
            </p>
            <h1 className="text-5xl font-semibold leading-[1.02] sm:text-6xl lg:text-7xl">
              Every cup has <span className="italic text-olive-deep">a&nbsp;story.</span>
            </h1>
            <p className="max-w-lg text-lg text-ink-soft sm:text-xl">Find your next favorite corner, one café at a time.</p>
            <HeroSearch />
          </div>
          <div className="relative mx-auto w-full max-w-[560px]">
            <HeroScene className="h-auto w-full drop-shadow-[0_18px_30px_rgba(73,61,46,0.12)]" />
            <SleepyCat className="absolute -bottom-4 left-4 h-14 w-24 sm:h-16 sm:w-28" />
          </div>
        </div>
      </section>

      {/* MAP */}
      <section aria-labelledby="map-h" className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="hand text-2xl text-biscuit-deep">first stop: San Pablo City, Laguna</p>
            <h2 id="map-h" className="text-3xl font-semibold sm:text-4xl">Wander the café map</h2>
          </div>
          <p className="max-w-md text-sm text-ink-soft">
            Tap a cup to peek inside. San Pablo pins are <b>real cafés</b> (locations from OpenStreetMap; hours and
            details still being verified). Pins elsewhere are labelled <b>fictional samples</b> for now.
          </p>
        </div>
        <Suspense fallback={<div className="skeleton h-[600px] rounded-[22px]" />}>
          <ExploreView variant="embed" />
        </Suspense>
        <div className="card mt-5 p-5">
          <h3 className="text-lg font-semibold">Also loved in San Pablo — not pinned yet</h3>
          <p className="mb-3 text-sm text-ink-soft">
            These come up in café guides but aren&apos;t on OpenStreetMap yet, so we haven&apos;t guessed a pin.
            Know exactly where they are? <Link href="/community/submit" className="font-bold underline">Help pin them</Link>.
          </p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {SAN_PABLO_UNPINNED.map((c) => (
              <li key={c.name} className="rounded-2xl bg-cream-deep px-4 py-3 text-sm">
                <p className="font-bold">{c.name}</p>
                <p className="text-ink-soft">{c.area}</p>
                {c.note && <p className="mt-1">{c.note}</p>}
                <a href={c.url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-xs font-bold text-olive-deep underline">Source: {c.source}</a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* MOODS */}
      <section aria-labelledby="mood-h" className="mx-auto mt-24 max-w-7xl px-4 sm:px-6">
        <p className="hand text-2xl text-biscuit-deep">what are you in the mood for?</p>
        <h2 id="mood-h" className="mb-8 text-3xl font-semibold sm:text-4xl">Discover by mood</h2>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {(Object.keys(MOOD_COPY) as Mood[]).map((m, i) => (
            <li key={m}>
              <Link
                href={`/explore?mood=${m}`}
                className={`card doodle-border group flex h-full items-center gap-4 p-4 transition hover:-translate-y-1 hover:shadow-lift ${i % 2 ? "sm:rotate-[0.4deg]" : "sm:-rotate-[0.4deg]"}`}
              >
                <MoodArt mood={m} className="h-24 w-32 shrink-0 transition group-hover:scale-105" />
                <div>
                  <h3 className="text-xl font-semibold">{MOOD_LABELS[m]}</h3>
                  <p className="mt-1 text-sm text-ink-soft">{MOOD_COPY[m]}</p>
                  <span className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-olive-deep">
                    Explore <Icon name="arrowRight" size={15} className="transition group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* COMMUNITY */}
      <section aria-labelledby="community-h" className="mx-auto mt-24 max-w-7xl px-4 sm:px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="hand text-2xl text-biscuit-deep">fresh from the club</p>
            <h2 id="community-h" className="text-3xl font-semibold sm:text-4xl">Community discoveries</h2>
            <p className="mt-2 max-w-xl text-sm text-ink-soft">
              Reviews marked <b>Sample review</b> are examples written for this demo. They never count towards a café&apos;s rating.
            </p>
          </div>
          <Link href="/community" className="btn-soft">See all stories <Icon name="arrowRight" size={17} /></Link>
        </div>
        <CommunityFeed limit={3} />
      </section>

      {/* PASSPORT */}
      <section aria-labelledby="passport-h" className="mx-auto mt-24 max-w-7xl px-4 sm:px-6">
        <div className="card relative overflow-hidden bg-sage-soft/70 p-6 sm:p-10">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="space-y-5">
              <p className="hand text-2xl text-olive-deep">collect them all</p>
              <h2 id="passport-h" className="text-3xl font-semibold sm:text-4xl">Your Coffee Passport</h2>
              <p className="text-ink-soft">
                Record a visit and an illustrated stamp lands in your passport. Fill regional collections, finish
                little quests and earn badges along the way.
              </p>
              <ul className="grid gap-2 sm:grid-cols-2">
                {(Object.keys(REGIONS) as RegionKey[]).slice(0, 4).map((k) => (
                  <li key={k} className="flex items-center gap-3 rounded-2xl bg-cream/90 px-3 py-2.5">
                    <span className="h-7 w-7 rounded-full border border-ink/20" style={{ background: REGIONS[k].color }} />
                    <span className="text-sm font-bold">{REGIONS[k].name}</span>
                  </li>
                ))}
              </ul>
              <ul className="space-y-1.5 text-sm">
                {QUESTS.slice(1, 4).map((q) => (
                  <li key={q.id} className="flex items-center gap-2">
                    <Icon name="sparkle" size={16} className="text-olive-deep" /> <b>{q.title}:</b> {q.description}
                  </li>
                ))}
              </ul>
              <Link href="/passport" className="btn-primary">
                <Icon name="stamp" size={18} /> Start your passport
              </Link>
            </div>
            <div className="relative mx-auto flex h-72 w-full max-w-md items-center justify-center">
              <div className="absolute inset-4 rounded-[30px] border-2 border-dashed border-olive/40 bg-cream/70" />
              <div className="absolute left-4 top-6"><Stamp name={stampCafes[0].name} city={stampCafes[0].city} art={stampCafes[0].art} rotate={-8} size={128} /></div>
              <div className="absolute right-6 top-2"><Stamp name={stampCafes[1].name} city={stampCafes[1].city} art={stampCafes[1].art} rotate={7} size={120} /></div>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2"><Stamp name={stampCafes[2].name} city={stampCafes[2].city} art={stampCafes[2].art} rotate={-3} size={132} /></div>
              <p className="hand absolute bottom-0 right-2 text-lg text-ink-soft">example stamps</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
