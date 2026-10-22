import type { Metadata } from "next";
import Link from "next/link";
import { SAMPLE_CAFES } from "@/lib/cafes/sample";
import { SAN_PABLO_CAFES } from "@/lib/cafes/sanpablo";
import type { Cafe } from "@/lib/types";
import { CafeStorefront, MoodArt, Sprig } from "@/components/illustrations";
import { Icon } from "@/components/Icon";
import { MyWishlistCollection } from "@/components/MyWishlistCollection";

export const metadata: Metadata = { title: "Collections" };

const COLLECTIONS: { id: string; title: string; blurb: string; mood: Parameters<typeof MoodArt>[0]["mood"]; pick: (c: Cafe) => boolean }[] = [
  { id: "rainy-day", title: "Rainy-day reading nooks", blurb: "Quiet corners for a book and a long, slow latte.", mood: "cozy", pick: (c) => c.ambiance.includes("quiet") && c.moods.includes("cozy") },
  { id: "matcha-trail", title: "The matcha trail", blurb: "From ceremonial bowls to coconut matcha by the sea.", mood: "matcha", pick: (c) => c.amenities.includes("matcha") },
  { id: "deadline", title: "Deadline season", blurb: "Outlets, Wi-Fi and tables big enough for a laptop and a pastry.", mood: "study", pick: (c) => c.amenities.includes("outlets") && c.amenities.includes("wifi") },
  { id: "garden", title: "Garden escapes", blurb: "Leafy courtyards, hammocks and resident cats.", mood: "garden", pick: (c) => c.moods.includes("garden") },
  { id: "date", title: "Slow dates", blurb: "Two cups, one dessert, no rush.", mood: "date", pick: (c) => c.moods.includes("date") },
  { id: "hidden", title: "Worth the detour", blurb: "Small, tucked-away places you have to look for.", mood: "hidden", pick: (c) => c.moods.includes("hidden") },
];

export default function CollectionsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-10 pt-10 sm:px-6">
      <p className="hand flex items-center gap-2 text-2xl text-olive-deep"><Sprig className="h-6 w-10" /> little lists, lovingly made</p>
      <h1 className="text-4xl font-semibold sm:text-5xl">Collections</h1>
      <p className="mt-3 max-w-2xl text-ink-soft">
        Hand-picked sets of cafés for every kind of day. The San Pablo crawl lists <b>real cafés</b>; the mood
        collections below are still built from <b>fictional sample cafés</b> until more cities are curated.
      </p>

      <MyWishlistCollection />

      <section aria-labelledby="col-sanpablo" className="mt-12">
        <div className="mb-4 flex flex-wrap items-center gap-4">
          <MoodArt mood="garden" className="h-16 w-20" />
          <div className="flex-1">
            <h2 id="col-sanpablo" className="text-2xl font-semibold">San Pablo City café crawl</h2>
            <p className="text-sm text-ink-soft">Real cafés around the seven-lakes city · {SAN_PABLO_CAFES.length} cafés · pins © OpenStreetMap</p>
          </div>
          <span className="rounded-full bg-sage px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-olive-deep">Real cafés</span>
        </div>
        <ul className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-3 [scrollbar-width:thin]">
          {SAN_PABLO_CAFES.map((c) => (
            <li key={c.id} className="w-64 shrink-0 snap-start">
              <Link href={`/cafe/${c.id}`} className="card group block overflow-hidden transition hover:-translate-y-1 hover:shadow-lift">
                <div className="h-36 border-b border-ink/10"><CafeStorefront art={c.art} name={c.name} className="h-full w-full" label={false} /></div>
                <div className="p-4">
                  <h3 className="truncate text-lg font-semibold">{c.name}</h3>
                  <p className="flex items-center gap-1 truncate text-sm text-ink-soft"><Icon name="pin" size={14} /> {c.address}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-12 space-y-12">
        {COLLECTIONS.map((col) => {
          const cafes = SAMPLE_CAFES.filter(col.pick);
          return (
            <section key={col.id} aria-labelledby={`col-${col.id}`}>
              <div className="mb-4 flex flex-wrap items-center gap-4">
                <MoodArt mood={col.mood} className="h-16 w-20" />
                <div className="flex-1">
                  <h2 id={`col-${col.id}`} className="text-2xl font-semibold">{col.title}</h2>
                  <p className="text-sm text-ink-soft">{col.blurb} · {cafes.length} cafés</p>
                </div>
                <span className="rounded-full border border-dashed border-biscuit-deep/60 bg-butter-soft px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-[#8A5A3C]">Sample collection</span>
              </div>
              <ul className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-3 [scrollbar-width:thin]">
                {cafes.map((c) => (
                  <li key={c.id} className="w-64 shrink-0 snap-start">
                    <Link href={`/cafe/${c.id}`} className="card group block overflow-hidden transition hover:-translate-y-1 hover:shadow-lift">
                      <div className="h-36 border-b border-ink/10"><CafeStorefront art={c.art} name={c.name} className="h-full w-full" label={false} /></div>
                      <div className="p-4">
                        <h3 className="truncate text-lg font-semibold">{c.name}</h3>
                        <p className="flex items-center gap-1 text-sm text-ink-soft"><Icon name="pin" size={14} /> {c.city}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
