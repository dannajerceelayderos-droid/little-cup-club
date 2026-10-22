import type { Metadata } from "next";
import Link from "next/link";
import { CommunityFeed } from "@/components/CommunityFeed";
import { MySubmissions } from "@/components/MySubmissions";
import { Icon } from "@/components/Icon";
import { Sprig } from "@/components/illustrations";

export const metadata: Metadata = { title: "Community" };

export default function CommunityPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-10 pt-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="hand flex items-center gap-2 text-2xl text-olive-deep"><Sprig className="h-6 w-10" /> stories over coffee</p>
          <h1 className="text-4xl font-semibold sm:text-5xl">Community</h1>
          <p className="mt-3 max-w-2xl text-ink-soft">
            Reviews, photos and recommendations from members. Reviews marked <b>Sample review</b> are demo examples.
          </p>
        </div>
        <Link href="/community/submit" className="btn-primary"><Icon name="plus" size={18} /> Suggest a café</Link>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">
        <section aria-labelledby="recent-h">
          <h2 id="recent-h" className="mb-5 text-2xl font-semibold">Recent reviews</h2>
          <CommunityFeed limit={24} />
        </section>
        <aside className="space-y-6">
          <MySubmissions />
          <div className="card p-5">
            <h2 className="mb-2 text-xl font-semibold">How moderation works</h2>
            <ul className="space-y-2 text-sm text-ink-soft">
              <li className="flex gap-2"><Icon name="check" size={16} className="mt-0.5 shrink-0 text-olive-deep" /> New café suggestions are reviewed before they appear on the map.</li>
              <li className="flex gap-2"><Icon name="check" size={16} className="mt-0.5 shrink-0 text-olive-deep" /> Anyone signed in can report a review or a listing; moderators decide.</li>
              <li className="flex gap-2"><Icon name="check" size={16} className="mt-0.5 shrink-0 text-olive-deep" /> You can edit or delete your own reviews at any time.</li>
              <li className="flex gap-2"><Icon name="check" size={16} className="mt-0.5 shrink-0 text-olive-deep" /> Be kind, be honest, and only post photos you took.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
