import type { SVGProps } from "react";

/**
 * Little Cup Club icon set — 24px grid, 1.75 stroke, round caps.
 * Drawn to share one slightly-soft, hand-inked feel with the illustrations.
 */
const paths = {
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="M15.5 15.5 20 20" /></>,
  pin: <><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21Z" /><circle cx="12" cy="10" r="2.3" /></>,
  cup: <><path d="M4.5 9h11v4.5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5V9Z" /><path d="M15.5 10.5h1.2a2.3 2.3 0 0 1 0 4.6h-1.6" /><path d="M8 3.5c-.6.9.6 1.6 0 2.6M11.5 3.5c-.6.9.6 1.6 0 2.6" /><path d="M3.5 21h14" /></>,
  matcha: <><path d="M5 10h14l-1.4 7.2a3 3 0 0 1-2.9 2.3H9.3a3 3 0 0 1-2.9-2.3L5 10Z" /><path d="M12 10c0-3 1.8-5.2 4.8-6-.3 3-2 5.2-4.8 6Z" /><path d="M12 10c0-2-1.2-3.4-3.2-4" /></>,
  wifi: <><path d="M3.5 9.5a12 12 0 0 1 17 0" /><path d="M6.5 12.7a7.6 7.6 0 0 1 11 0" /><path d="M9.4 15.8a3.4 3.4 0 0 1 5.2 0" /><circle cx="12" cy="18.7" r=".9" fill="currentColor" /></>,
  plug: <><path d="M9 3.5V8M15 3.5V8" /><path d="M6.5 8h11v3.5a5.5 5.5 0 0 1-11 0V8Z" /><path d="M12 17v3.5" /></>,
  book: <><path d="M4 5.5c2.7-1 5.3-1 8 .7 2.7-1.7 5.3-1.7 8-.7v13c-2.7-1-5.3-1-8 .7-2.7-1.7-5.3-1.7-8-.7v-13Z" /><path d="M12 6.2v13" /></>,
  leaf: <><path d="M5 19C5 10 10.5 5 20 4.5 19.5 14 14 19 5 19Z" /><path d="M5 19c3.5-4.2 7-7 10.5-9" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" /></>,
  paw: <><ellipse cx="12" cy="16" rx="4" ry="3.3" /><circle cx="6.5" cy="10.5" r="1.7" /><circle cx="9.7" cy="6.8" r="1.7" /><circle cx="14.3" cy="6.8" r="1.7" /><circle cx="17.5" cy="10.5" r="1.7" /></>,
  heart: <path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10Z" />,
  stamp: <><path d="M9.5 3.5h5l-1 6.5h-3l-1-6.5Z" /><path d="M5 13a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v2H5v-2Z" /><path d="M4.5 18.5h15" /></>,
  map: <><path d="M3.5 6.5 9 4.5l6 2 5.5-2v13l-5.5 2-6-2-5.5 2v-13Z" /><path d="M9 4.5v13M15 6.5v13" /></>,
  list: <><path d="M9 6.5h11M9 12h11M9 17.5h11" /><circle cx="4.7" cy="6.5" r="1" fill="currentColor" /><circle cx="4.7" cy="12" r="1" fill="currentColor" /><circle cx="4.7" cy="17.5" r="1" fill="currentColor" /></>,
  filter: <><path d="M4 6.5h16M7 12h10M10 17.5h4" /></>,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  star: <path d="m12 3.8 2.5 5.2 5.7.8-4.1 4 1 5.7L12 16.8l-5.1 2.7 1-5.7-4.1-4 5.7-.8L12 3.8Z" />,
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  arrowLeft: <path d="M19 12H5M11 6l-6 6 6 6" />,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  user: <><circle cx="12" cy="8.5" r="3.8" /><path d="M4.5 20c1.3-3.6 4.1-5.4 7.5-5.4s6.2 1.8 7.5 5.4" /></>,
  menu: <path d="M4 7h16M4 12h16M4 17h10" />,
  compass: <><circle cx="12" cy="12" r="8.5" /><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" /></>,
  locate: <><circle cx="12" cy="12" r="6.5" /><circle cx="12" cy="12" r="2" fill="currentColor" /><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3" /></>,
  flag: <><path d="M5.5 21V4" /><path d="M5.5 4.5h11l-2 4 2 4h-11" /></>,
  sparkle: <path d="M12 3.5c.6 4.3 2.2 6 6.5 6.5-4.3.6-5.9 2.2-6.5 6.5-.6-4.3-2.2-5.9-6.5-6.5 4.3-.5 5.9-2.2 6.5-6.5ZM18.5 15.5c.2 1.6.9 2.3 2.5 2.5-1.6.2-2.3.9-2.5 2.5-.2-1.6-.9-2.3-2.5-2.5 1.6-.2 2.3-.9 2.5-2.5Z" />,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  phone: <path d="M6.5 3.5h3l1.5 4-2 1.3a10 10 0 0 0 6.2 6.2l1.3-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2Z" />,
  globe: <><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c2.4 2.4 3.5 5.2 3.5 8.5s-1.1 6.1-3.5 8.5c-2.4-2.4-3.5-5.2-3.5-8.5s1.1-6.1 3.5-8.5Z" /></>,
  camera: <><path d="M4 8.5a2 2 0 0 1 2-2h2l1.5-2h5l1.5 2h2a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8.5Z" /><circle cx="12" cy="12.5" r="3.3" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  directions: <><path d="M12 3 21 12l-9 9-9-9 9-9Z" /><path d="M9 14v-2.5a1.5 1.5 0 0 1 1.5-1.5H15M13 8l2 2-2 2" /></>,
  info: <><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5.5M12 7.8v.2" /></>,
  trash: <><path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 12.5h9l1-12.5" /></>,
  mushroom: <><path d="M3.5 12c0-4.5 3.8-8 8.5-8s8.5 3.5 8.5 8H3.5Z" /><path d="M9.5 12v5.5a2.5 2.5 0 0 0 5 0V12" /><circle cx="9" cy="8" r="1" fill="currentColor" /><circle cx="14.5" cy="7" r=".8" fill="currentColor" /></>,
  community: <><circle cx="8.5" cy="9" r="3" /><circle cx="16.5" cy="10" r="2.5" /><path d="M3 19c.9-3 3-4.5 5.5-4.5S13.1 16 14 19M14.5 15.4c.6-.3 1.3-.4 2-.4 2.2 0 3.8 1.3 4.5 4" /></>,
  collection: <><rect x="4" y="7" width="13" height="13" rx="2.5" /><path d="M7.5 4h10a2.5 2.5 0 0 1 2.5 2.5v10" /></>,
  breeze: <><path d="M3.5 9h11a2.5 2.5 0 1 0-2.5-2.5" /><path d="M3.5 13h15a2.5 2.5 0 1 1-2.5 2.5" /><path d="M3.5 17h6" /></>,
  external: <><path d="M14 4.5h5.5V10M19.5 4.5 11 13" /><path d="M17 14v4a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 5 18V9a1.5 1.5 0 0 1 1.5-1.5h4" /></>,
} as const;

export type IconName = keyof typeof paths;

export function Icon({
  name,
  size = 20,
  strokeWidth = 1.75,
  title,
  ...rest
}: { name: IconName; size?: number; strokeWidth?: number; title?: string } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {paths[name]}
    </svg>
  );
}

export const AMENITY_ICONS: Record<string, IconName> = {
  coffee: "cup",
  matcha: "matcha",
  wifi: "wifi",
  outlets: "plug",
  study: "book",
  outdoor: "sun",
  garden: "leaf",
  pets: "paw",
  pastries: "sparkle",
  aircon: "breeze",
};
