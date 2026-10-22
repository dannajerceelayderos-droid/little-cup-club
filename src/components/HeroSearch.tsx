"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FEATURED_CAFES } from "@/lib/cafes/provider";
import { Icon, type IconName } from "./Icon";
import { SearchBox } from "./SearchBox";

const QUICK: { label: string; href: string; icon: IconName }[] = [
  { label: "Coffee", href: "/explore?amenity=coffee", icon: "cup" },
  { label: "Matcha", href: "/explore?mood=matcha", icon: "matcha" },
  { label: "Study spots", href: "/explore?mood=study", icon: "book" },
  { label: "Garden cafés", href: "/explore?mood=garden", icon: "leaf" },
  { label: "Cozy corners", href: "/explore?mood=cozy", icon: "mushroom" },
];

export function HeroSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");
  return (
    <div className="space-y-4">
      <SearchBox
        size="lg"
        value={q}
        onChange={setQ}
        cafes={FEATURED_CAFES}
        placeholder="Where are you sipping? Town, city or café"
        onSubmit={(v) => router.push(v.trim() ? `/explore?q=${encodeURIComponent(v.trim())}` : "/explore")}
        onPickPlace={(p) => router.push(`/explore?q=${encodeURIComponent(p.name)}`)}
        onPickCafe={(c) => router.push(`/cafe/${c.id}`)}
        buttonLabel="Find cafés"
      />
      <ul className="flex flex-wrap gap-2" aria-label="Quick filters">
        {QUICK.map((f) => (
          <li key={f.label}>
            <button type="button" onClick={() => router.push(f.href)} className="chip bg-cream/90 py-2 hover:-translate-y-0.5 hover:bg-butter/60">
              <Icon name={f.icon} size={17} /> {f.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
