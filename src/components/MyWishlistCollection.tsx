"use client";

import Link from "next/link";
import { useStore } from "./StoreProvider";
import { CafeStorefront } from "./illustrations";
import { Icon } from "./Icon";

export function MyWishlistCollection() {
  const { data, ready } = useStore();
  return (
    <section aria-labelledby="col-mine" className="card mt-10 bg-blush/40 p-5 sm:p-7">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="col-mine" className="flex items-center gap-2 text-2xl font-semibold"><Icon name="heart" className="fill-biscuit" /> Someday list</h2>
          <p className="text-sm text-ink-soft">Your personal collection — every café you&apos;ve saved.</p>
        </div>
        <Link href="/passport" className="btn-soft text-sm">Manage in passport</Link>
      </div>
      {!ready ? (
        <div className="skeleton h-28 rounded-2xl" />
      ) : data.wishlist.length === 0 ? (
        <p className="text-sm text-ink-soft">Tap the heart on any café to start your list.</p>
      ) : (
        <ul className="flex gap-3 overflow-x-auto pb-2">
          {data.wishlist.map((w) => (
            <li key={w.cafe.id} className="w-52 shrink-0">
              <Link href={`/cafe/${w.cafe.id}`} className="block overflow-hidden rounded-2xl border border-ink/12 bg-cream transition hover:shadow-card">
                <div className="h-24"><CafeStorefront art={w.cafe.art} name={w.cafe.name} className="h-full w-full" label={false} /></div>
                <p className="truncate px-3 py-2 text-sm font-bold">{w.cafe.name}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
