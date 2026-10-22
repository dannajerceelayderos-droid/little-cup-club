import type { Metadata } from "next";
import { isSupabaseConfigured, MAPBOX_TOKEN } from "@/lib/config";
import { Icon } from "@/components/Icon";
import { Sprig } from "@/components/illustrations";

export const metadata: Metadata = { title: "About the data" };

function Status({ on, label }: { on: boolean; label: string }) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-2xl bg-cream-deep px-4 py-3 text-sm">
      <span className="font-bold">{label}</span>
      <span className={`rounded-full px-2.5 py-0.5 text-xs font-extrabold ${on ? "bg-sage" : "bg-butter"}`}>{on ? "Connected" : "Demo fallback"}</span>
    </li>
  );
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-10 pt-10 sm:px-6">
      <p className="hand flex items-center gap-2 text-2xl text-olive-deep"><Sprig className="h-6 w-10" /> honest little maps</p>
      <h1 className="text-4xl font-semibold sm:text-5xl">About the data</h1>

      <div className="mt-8 space-y-6 text-[1.02rem] leading-relaxed">
        <section className="card p-6">
          <h2 className="mb-3 text-2xl font-semibold">Where cafés come from</h2>
          <ul className="space-y-3">
            <li className="flex gap-3"><Icon name="info" className="mt-1 shrink-0 text-olive-deep" />
              <span><b>Sample cafés</b> are fictional. They&apos;re placed near real town centres so the demo map has something to show, and they&apos;re labelled everywhere they appear. They have no invented ratings, hours or phone numbers, and directions are disabled.</span></li>
            <li className="flex gap-3"><Icon name="pin" className="mt-1 shrink-0 text-olive-deep" />
              <span><b>San Pablo City cafés</b> are real. Their names and pins come from OpenStreetMap; descriptions are only added where a published guide describes them (credited on the page). Hours, prices and contact details are left blank or marked unverified until confirmed.</span></li>
            <li className="flex gap-3"><Icon name="map" className="mt-1 shrink-0 text-olive-deep" />
              <span><b>Real cafés</b> come from <a className="underline" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> (© OpenStreetMap contributors, ODbL) through the Overpass API. They&apos;re community-edited and shown as <i>unverified</i>. Opening hours from OSM are displayed as-is and never used for &ldquo;open now&rdquo;.</span></li>
            <li className="flex gap-3"><Icon name="community" className="mt-1 shrink-0 text-olive-deep" />
              <span><b>Ratings</b> are averages of member reviews only. Sample reviews never count.</span></li>
            <li className="flex gap-3"><Icon name="camera" className="mt-1 shrink-0 text-olive-deep" />
              <span><b>Photos</b> are only ever member uploads. Where there are none, we draw an illustration instead of using a stock or scraped image.</span></li>
          </ul>
        </section>

        <section className="card p-6">
          <h2 className="mb-3 text-2xl font-semibold">What a recorded visit means</h2>
          <p>A visit is a check-in you make yourself, on your honour. We don&apos;t read or verify your location. Each café gives one stamp (on your first recorded visit) and you can record at most one visit per café per day.</p>
        </section>

        <section id="setup" className="card scroll-mt-28 p-6">
          <h2 className="mb-3 text-2xl font-semibold">This site&apos;s setup</h2>
          <ul className="space-y-2">
            <Status on={isSupabaseConfigured} label="Accounts & cloud saves (Supabase)" />
            <Status on={!!MAPBOX_TOKEN} label="Mapbox tiles (otherwise free OpenFreeMap tiles)" />
            <Status on label="Real cafés via OpenStreetMap" />
          </ul>
          <p className="mt-4 text-sm text-ink-soft">
            In demo mode everything you save stays in this browser&apos;s local storage. Site owners: see the README for
            Supabase migrations and environment variables.
          </p>
        </section>
      </div>
    </div>
  );
}
