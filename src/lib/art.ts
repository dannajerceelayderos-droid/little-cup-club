import type { CafeArt } from "./types";

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/** Deterministic storefront colours for any café id. */
export function artFromId(id: string): CafeArt {
  const h = hash(id);
  const awnings = ["#DFAE91", "#C9D9BD", "#F6E7A9", "#EFD3C6", "#A9C09A", "#B9805F"];
  const walls = ["#FFF9EE", "#FBF2CF", "#E3ECDB", "#F8EEDC", "#F0D5C4"];
  return {
    awning: awnings[h % awnings.length],
    wall: walls[(h >> 3) % walls.length],
    roof: ((h >> 6) % 3) as 0 | 1 | 2,
    plant: ((h >> 9) % 3) as 0 | 1 | 2,
  };
}

