import Link from "next/link";
import { LogoMark, Sprig } from "./illustrations";

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-ink/10 bg-sage-soft/60">
      <Sprig className="absolute -top-6 left-6 h-12 w-20" />
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <LogoMark size={34} />
            <span className="font-display text-lg font-semibold">Little Cup Club</span>
          </div>
          <p className="hand text-2xl text-olive-deep">Every cup has a story.</p>
          <p className="text-sm text-ink-soft">A storybook guide to independent cafés across the Philippines.</p>
        </div>
        <div>
          <h2 className="mb-3 font-body text-sm font-extrabold uppercase tracking-wider text-ink-soft">Discover</h2>
          <ul className="space-y-2 text-sm font-semibold">
            <li><Link className="hover:underline" href="/explore">Explore the map</Link></li>
            <li><Link className="hover:underline" href="/collections">Collections</Link></li>
            <li><Link className="hover:underline" href="/passport">Coffee Passport</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="mb-3 font-body text-sm font-extrabold uppercase tracking-wider text-ink-soft">Community</h2>
          <ul className="space-y-2 text-sm font-semibold">
            <li><Link className="hover:underline" href="/community">Reviews &amp; recommendations</Link></li>
            <li><Link className="hover:underline" href="/community/submit">Suggest a café</Link></li>
            <li><Link className="hover:underline" href="/about">About the data</Link></li>
          </ul>
        </div>
        <div className="text-xs leading-relaxed text-ink-soft">
          <p>
            Map data © OpenStreetMap contributors. Tiles by OpenFreeMap. Sample cafés are fictional and shown for
            demonstration only. Real-café listings come from OpenStreetMap and may be incomplete.
          </p>
          <p className="mt-3">© {new Date().getFullYear()} Little Cup Club</p>
        </div>
      </div>
    </footer>
  );
}
