"use client";

import Link from "next/link";
import { useStore } from "./StoreProvider";

const STATUS: Record<string, string> = { pending: "Waiting for review", approved: "Approved", rejected: "Not added" };

export function MySubmissions() {
  const { data, ready } = useStore();
  return (
    <div className="card p-5">
      <h2 className="mb-3 text-xl font-semibold">Your suggestions</h2>
      {!ready ? (
        <div className="skeleton h-16 rounded-xl" />
      ) : data.submissions.length === 0 ? (
        <p className="text-sm text-ink-soft">
          Know a lovely café that isn&apos;t on the map? <Link href="/community/submit" className="font-bold underline">Suggest it</Link>.
        </p>
      ) : (
        <ul className="space-y-2">
          {data.submissions.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-2 rounded-xl bg-cream-deep px-3 py-2 text-sm">
              <span className="min-w-0"><b className="block truncate">{s.name}</b><span className="text-ink-faint">{s.city}</span></span>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${s.status === "approved" ? "bg-sage" : s.status === "rejected" ? "bg-blush" : "bg-butter"}`}>
                {STATUS[s.status]}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
