/* Original storybook illustrations for Little Cup Club.
 * Shared SVG filters live in <IllustrationDefs/> (rendered once in the root layout)
 * so every illustration gets the same gently-wobbly, watercolour-ink feel. */
import type { CafeArt, Mood } from "@/lib/types";

const INK = "#493D2E";

export function IllustrationDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden focusable="false">
      <defs>
        <filter id="lcc-wobble" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="4" />
          <feDisplacementMap in="SourceGraphic" scale="2.6" />
        </filter>
        <filter id="lcc-wash" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves="3" seed="9" result="t" />
          <feDisplacementMap in="SourceGraphic" in2="t" scale="9" result="d" />
          <feGaussianBlur in="d" stdDeviation="0.5" />
        </filter>
      </defs>
    </svg>
  );
}

/* ---------- Brand mark ---------- */
export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
      <circle cx="24" cy="25" r="21" fill="#F6E7A9" filter="url(#lcc-wash)" />
      <g fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" filter="url(#lcc-wobble)">
        <path d="M12 21h20v6.5a8 8 0 0 1-8 8h-4a8 8 0 0 1-8-8V21Z" fill="#FFF9EE" />
        <path d="M32 23h2a3.5 3.5 0 0 1 0 7h-2.6" />
        <path d="M22 21c0-5 3-8.5 8-9.5-.5 5-3.3 8.5-8 9.5Z" fill="#C9D9BD" />
        <path d="M17.5 15c-1-1.3.9-2.4 0-3.8" />
        <path d="M10 39.5h24" />
      </g>
    </svg>
  );
}

/* ---------- Café storefront: stands in for photos (we never show fake photos) ---------- */
export function CafeStorefront({
  art,
  name,
  className,
}: {
  art: CafeArt;
  name?: string;
  className?: string;
  /** @deprecated use <IllustrationNote/> overlay instead */
  label?: boolean;
}) {
  const stripes = Array.from({ length: 7 });
  return (
    <svg viewBox="0 0 320 200" className={className} role="img" aria-label={name ? `Illustration of ${name}` : "Café illustration"} preserveAspectRatio="xMidYMid slice">
      <rect width="320" height="200" fill="#FBF4E6" />
      <ellipse cx="60" cy="40" rx="90" ry="50" fill="#E3ECDB" filter="url(#lcc-wash)" opacity=".9" />
      <ellipse cx="280" cy="60" rx="80" ry="45" fill="#FBF2CF" filter="url(#lcc-wash)" />
      <path d="M0 168 Q80 150 160 160 T320 158 V200 H0Z" fill="#C9D9BD" filter="url(#lcc-wash)" />
      <g filter="url(#lcc-wobble)" stroke={INK} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
        {/* building */}
        <rect x="86" y="64" width="148" height="104" fill={art.wall} />
        {art.roof === 0 && <path d="M78 66 L160 26 L242 66 Z" fill="#DFAE91" />}
        {art.roof === 1 && <path d="M80 64 h160 v-14 a20 20 0 0 0-20-20 h-120 a20 20 0 0 0-20 20 z" fill="#A9C09A" />}
        {art.roof === 2 && <path d="M82 66 L100 34 H220 L238 66 Z" fill="#B9805F" />}
        {/* sign */}
        <rect x="128" y="70" width="64" height="16" rx="8" fill="#FFF9EE" />
        <path d="M144 78h32" strokeWidth="1.4" opacity=".55" />
        {/* awning */}
        <path d="M92 96 h136 l8 18 h-152z" fill="#FFF9EE" />
        {stripes.map((_, i) => (
          <path key={i} d={`M${96 + i * 19.5} 96 h10 l${i < 3 ? -2 : 2} 18 h-12z`} fill={art.awning} stroke="none" />
        ))}
        <path d="M84 114 q9 8 19 0 q9 8 19 0 q9 8 19 0 q9 8 19 0 q9 8 19 0 q9 8 19 0 q9 8 19 0 q9 8 19 0" fill="none" />
        {/* window + door */}
        <rect x="100" y="124" width="54" height="34" rx="4" fill="#E9F1F1" />
        <path d="M127 124v34M100 141h54" />
        <path d="M108 154c2-5 6-5 8 0M131 150h14" strokeWidth="1.4" />
        <path d="M172 168v-36a14 14 0 0 1 28 0v36" fill="#C9D9BD" />
        <circle cx="194" cy="152" r="1.6" fill={INK} />
        {/* plants */}
        {art.plant === 0 && (
          <g>
            <path d="M214 168h18l-3-14h-12z" fill="#DFAE91" />
            <path d="M223 154c-6-10-2-18 0-22 2 4 6 12 0 22M223 154c-10-4-12-10-12-14 5 1 10 5 12 14M223 154c10-4 12-10 12-14-5 1-10 5-12 14" fill="#A9C09A" />
          </g>
        )}
        {art.plant === 1 && (
          <g>
            <path d="M60 168h20l-3-12h-14z" fill="#F6E7A9" />
            <circle cx="70" cy="144" r="12" fill="#A9C09A" />
            <circle cx="64" cy="140" r="2" fill="#EFD3C6" stroke="none" />
            <circle cx="75" cy="146" r="2" fill="#EFD3C6" stroke="none" />
          </g>
        )}
        {art.plant === 2 && (
          <g>
            {/* tiny cat on the step */}
            <path d="M206 168c0-10 4-14 10-14s10 4 10 14z" fill="#DFAE91" />
            <path d="M209 156l2-6 4 4M223 156l-2-6-4 4" fill="#DFAE91" />
            <path d="M226 166c8 0 9-6 6-9" fill="none" />
          </g>
        )}
        {/* table outside */}
        <path d="M250 150h26M263 150v18M255 168h16" fill="none" />
        <path d="M256 144h8v6h-8z" fill="#FFF9EE" />
      </g>
      {/* steam */}
      <g stroke={INK} strokeWidth="1.3" fill="none" strokeLinecap="round" opacity=".55">
        <path d="M258 140c-2-3 2-4 0-7M262 140c-2-3 2-4 0-7" />
      </g>
    </svg>
  );
}

/* ---------- Hero scene ---------- */
export function HeroScene({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 560 460" className={className} role="img" aria-label="A storybook map with a little café beside a lake, a sleepy cat and winding paths">
      <defs>
        <clipPath id="hero-blob">
          <path d="M40 70 C90 10 220 20 300 18 C420 14 520 40 540 130 C560 230 548 330 500 400 C440 470 280 452 170 444 C70 436 18 380 14 280 C10 190 0 120 40 70Z" />
        </clipPath>
      </defs>
      <g clipPath="url(#hero-blob)">
        <rect width="560" height="460" fill="#FBF2CF" />
        {/* land patches */}
        <path d="M0 0h260l-40 140H0z" fill="#F0D5C4" filter="url(#lcc-wash)" opacity=".85" />
        <path d="M300 0h260v170H340z" fill="#E3ECDB" filter="url(#lcc-wash)" />
        <path d="M0 300h200l40 160H0z" fill="#C9D9BD" filter="url(#lcc-wash)" />
        <path d="M380 300h180v160H340z" fill="#EFD3C6" filter="url(#lcc-wash)" opacity=".8" />
        {/* lake */}
        <path d="M330 210c40-30 120-30 170 0 40 26 30 74-20 86-56 14-120 10-150-20-20-20-16-48 0-66Z" fill="#CFE1DC" filter="url(#lcc-wash)" />
        <g stroke="#7FA9A0" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity=".8">
          <path d="M370 240q6-4 12 0M410 262q6-4 12 0M450 236q6-4 12 0M392 282q6-4 12 0" />
        </g>
        {/* little boat */}
        <g filter="url(#lcc-wobble)" stroke={INK} strokeWidth="1.6" strokeLinejoin="round">
          <path d="M430 270h30l-5 7h-20z" fill="#DFAE91" />
          <path d="M444 270v-14l9 10z" fill="#FFF9EE" />
        </g>
        {/* roads */}
        <g fill="none" stroke="#FFF9EE" strokeWidth="18" strokeLinecap="round">
          <path d="M-10 190 C120 170 200 230 290 210 S460 140 580 160" />
          <path d="M220 470 C230 380 210 300 260 220 S300 80 280 -10" />
        </g>
        <g fill="none" stroke={INK} strokeWidth="1.2" strokeDasharray="2 7" strokeLinecap="round" opacity=".45">
          <path d="M-10 190 C120 170 200 230 290 210 S460 140 580 160" />
          <path d="M220 470 C230 380 210 300 260 220 S300 80 280 -10" />
        </g>
        {/* trees */}
        {[[60, 90], [110, 120], [470, 70], [520, 110], [60, 380], [120, 410], [500, 390]].map(([x, y], i) => (
          <g key={i} filter="url(#lcc-wobble)" stroke={INK} strokeWidth="1.5">
            <path d={`M${x} ${y + 26}v-12`} />
            <ellipse cx={x} cy={y} rx="16" ry="18" fill={i % 2 ? "#A9C09A" : "#7B8767"} fillOpacity={i % 2 ? 1 : 0.75} />
          </g>
        ))}
        {/* palm */}
        <g filter="url(#lcc-wobble)" stroke={INK} strokeWidth="1.5" fill="none" strokeLinecap="round">
          <path d="M520 300c-6-30-4-50 6-70" />
          <path d="M526 230c-14-8-28-6-36 2M526 230c12-10 26-10 34-2M526 230c-4-14 2-24 10-28M526 230c-12 2-20 12-22 22" stroke="#7B8767" strokeWidth="3" />
        </g>
        {/* café building */}
        <g filter="url(#lcc-wobble)" stroke={INK} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
          <path d="M120 300v-90h130v90z" fill="#FFF9EE" />
          <path d="M108 214 L185 160 L262 214 Z" fill="#DFAE91" />
          <rect x="150" y="186" width="70" height="18" rx="9" fill="#FFF9EE" />
          <path d="M126 236h118l8 16H118z" fill="#F6E7A9" />
          <path d="M140 236l-4 16M160 236l-2 16M180 236v16M200 236l2 16M220 236l4 16" />
          <rect x="132" y="260" width="42" height="30" rx="3" fill="#E9F1F1" />
          <path d="M153 260v30" />
          <path d="M196 300v-34a12 12 0 0 1 24 0v34" fill="#C9D9BD" />
          {/* window cat */}
          <path d="M138 290c0-8 3-11 8-11s8 3 8 11z" fill="#DFAE91" />
          <path d="M140 281l1.5-5 3 3M152 281l-1.5-5-3 3" fill="#DFAE91" />
          {/* flower boxes */}
          <path d="M130 292h46v6h-46z" fill="#B9805F" />
        </g>
        <text x="185" y="199" textAnchor="middle" fontFamily="Caveat, cursive" fontSize="17" fontWeight="600" fill={INK}>
          kapihan
        </text>
        {/* mushrooms + flowers */}
        <g filter="url(#lcc-wobble)" stroke={INK} strokeWidth="1.5">
          <path d="M296 330a14 10 0 0 1 28 0z" fill="#DFAE91" />
          <path d="M305 330v10h10v-10" fill="#FFF9EE" />
          <circle cx="304" cy="325" r="1.8" fill="#FFF9EE" stroke="none" />
          <circle cx="314" cy="323" r="1.5" fill="#FFF9EE" stroke="none" />
          <path d="M330 338a8 6 0 0 1 16 0z" fill="#EFD3C6" />
          <path d="M336 338v6h5v-6" fill="#FFF9EE" />
        </g>
        {[[90, 330], [104, 342], [262, 320], [360, 120], [376, 132], [430, 340], [446, 350]].map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="4.5" fill={i % 2 ? "#EFD3C6" : "#F6E7A9"} stroke={INK} strokeWidth="1.1" />
            <circle cx={x} cy={y} r="1.4" fill="#B9805F" />
          </g>
        ))}
        {/* map pins */}
        {[[400, 140, "#C9D9BD"], [300, 410, "#F6E7A9"], [80, 230, "#EFD3C6"]].map(([x, y, c], i) => (
          <g key={i} className="motion-safe:animate-bob" style={{ animationDelay: `${i * 0.6}s`, transformOrigin: `${x}px ${y}px` }}>
            <path d={`M${x} ${Number(y) + 18}c-9-10-14-16-14-24a14 14 0 0 1 28 0c0 8-5 14-14 24z`} fill={String(c)} stroke={INK} strokeWidth="1.8" filter="url(#lcc-wobble)" />
            <path d={`M${Number(x) - 6} ${Number(y) - 8}h12v4a6 6 0 0 1-12 0z`} fill="#FFF9EE" stroke={INK} strokeWidth="1.4" />
          </g>
        ))}
        {/* hand-lettered labels */}
        <text x="420" y="320" fontFamily="Caveat, cursive" fontSize="20" fill="#55603F" transform="rotate(-6 420 320)">
          lakeside
        </text>
        <text x="40" y="160" fontFamily="Caveat, cursive" fontSize="19" fill="#55603F" transform="rotate(-4 40 160)">
          garden lane
        </text>
      </g>
      {/* outline of the blob */}
      <path
        d="M40 70 C90 10 220 20 300 18 C420 14 520 40 540 130 C560 230 548 330 500 400 C440 470 280 452 170 444 C70 436 18 380 14 280 C10 190 0 120 40 70Z"
        fill="none"
        stroke={INK}
        strokeWidth="2"
        filter="url(#lcc-wobble)"
      />
      {/* floating cup */}
      <g transform="translate(470 18)" filter="url(#lcc-wobble)" stroke={INK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="34" cy="70" rx="40" ry="8" fill="#DFAE91" opacity=".5" stroke="none" />
        <path d="M6 30h52v16a20 20 0 0 1-20 20h-12a20 20 0 0 1-20-20z" fill="#FFF9EE" />
        <path d="M58 34h5a8 8 0 0 1 0 16h-6" fill="none" />
        <path d="M10 34h44" stroke="#B9805F" strokeWidth="4" />
        <path d="M22 22c-3-4 3-6 0-10M34 22c-3-4 3-6 0-10" fill="none" className="motion-safe:animate-steam" />
      </g>
    </svg>
  );
}

/* ---------- Mood vignettes ---------- */
export function MoodArt({ mood, className }: { mood: Mood; className?: string }) {
  const s = { stroke: INK, strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const bg: Record<Mood, string> = {
    cozy: "#F0D5C4", matcha: "#C9D9BD", study: "#F6E7A9", garden: "#E3ECDB", date: "#EFD3C6", hidden: "#CFE1DC",
  };
  return (
    <svg viewBox="0 0 160 120" className={className} aria-hidden>
      <ellipse cx="80" cy="64" rx="66" ry="48" fill={bg[mood]} filter="url(#lcc-wash)" />
      <g filter="url(#lcc-wobble)" {...s}>
        {mood === "cozy" && (
          <>
            <path d="M40 92V62a12 12 0 0 1 12-12h36a12 12 0 0 1 12 12v30" fill="#DFAE91" />
            <path d="M34 72a8 8 0 0 1 12 0v20h48V72a8 8 0 0 1 12 0v24H34z" fill="#B9805F" />
            <path d="M118 96V40M108 40h20l-4-14h-12z" fill="#F6E7A9" />
            <path d="M58 70h20v6a8 8 0 0 1-8 8h-4a8 8 0 0 1-8-8z" fill="#FFF9EE" />
          </>
        )}
        {mood === "matcha" && (
          <>
            <path d="M44 66h64l-6 22a10 10 0 0 1-10 7H60a10 10 0 0 1-10-7z" fill="#FFF9EE" />
            <ellipse cx="76" cy="66" rx="32" ry="6" fill="#A9C09A" />
            <path d="M112 40l10 30M118 38l10 30M124 36l8 26" />
            <path d="M108 66c4 4 18 4 24-6l-12-24c-8 2-14 14-12 30z" fill="#F6E7A9" />
            <path d="M56 44c6-10 16-14 26-12-4 10-14 14-26 12z" fill="#7B8767" fillOpacity=".7" />
          </>
        )}
        {mood === "study" && (
          <>
            <rect x="36" y="78" width="60" height="12" rx="2" fill="#C9D9BD" />
            <rect x="40" y="66" width="54" height="12" rx="2" fill="#DFAE91" />
            <rect x="34" y="54" width="58" height="12" rx="2" fill="#FFF9EE" />
            <path d="M104 64h18v12a9 9 0 0 1-9 9h0a9 9 0 0 1-9-9z" fill="#FFF9EE" />
            <path d="M122 68h3a4 4 0 0 1 0 8h-3" fill="none" />
            <path d="M110 56c-2-3 2-4 0-7M116 56c-2-3 2-4 0-7" fill="none" />
            <path d="M44 60h30" opacity=".5" />
          </>
        )}
        {mood === "garden" && (
          <>
            <path d="M50 94h26l-4-20H54z" fill="#DFAE91" />
            <path d="M63 74c-12-16-4-30 0-36 4 6 12 20 0 36M63 74c-14-6-18-14-18-22 8 2 16 8 18 22M63 74c14-6 18-14 18-22-8 2-16 8-18 22" fill="#A9C09A" />
            <path d="M92 94h20l-3-14H95z" fill="#F6E7A9" />
            <circle cx="102" cy="68" r="12" fill="#7B8767" fillOpacity=".6" />
            <circle cx="96" cy="64" r="3" fill="#EFD3C6" />
            <circle cx="107" cy="70" r="3" fill="#FFF9EE" />
          </>
        )}
        {mood === "date" && (
          <>
            <path d="M40 66h30v12a12 12 0 0 1-12 12h-6a12 12 0 0 1-12-12z" fill="#FFF9EE" />
            <path d="M90 66h30v12a12 12 0 0 1-12 12h-6a12 12 0 0 1-12-12z" fill="#FFF9EE" />
            <path d="M80 50s-12-7-12-15a6 6 0 0 1 12-2 6 6 0 0 1 12 2c0 8-12 15-12 15z" fill="#DFAE91" />
            <path d="M52 58c-2-4 2-6 0-10M106 58c-2-4 2-6 0-10" fill="none" />
            <path d="M34 96h92" />
          </>
        )}
        {mood === "hidden" && (
          <>
            <path d="M62 96V60a18 18 0 0 1 36 0v36z" fill="#C9D9BD" />
            <circle cx="91" cy="80" r="2" fill={INK} />
            <path d="M40 96c0-20 10-34 22-40M120 96c0-22-8-36-22-42" fill="none" />
            <path d="M36 70c8-6 16-6 22 0-8 6-16 6-22 0zM104 56c8-6 16-6 22 0-8 6-16 6-22 0zM110 80c8-6 16-6 22 0-8 6-16 6-22 0z" fill="#A9C09A" />
            <path d="M28 96a10 7 0 0 1 20 0z" fill="#DFAE91" />
            <path d="M34 96v4h8v-4" fill="#FFF9EE" />
          </>
        )}
      </g>
    </svg>
  );
}

/* ---------- Avatars (illustrated, original) ---------- */
const AVATAR_BG = ["#C9D9BD", "#F6E7A9", "#EFD3C6", "#CFE1DC", "#DFAE91", "#E3ECDB"];
const HAIR = ["#493D2E", "#6E604E", "#2E2620", "#B9805F", "#55603F", "#3A3024"];

export function Avatar({ variant = 0, size = 40, label }: { variant?: number; size?: number; label?: string }) {
  const v = Math.abs(variant) % 6;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" role="img" aria-label={label ?? "Member avatar"} className="shrink-0">
      <circle cx="24" cy="24" r="23" fill={AVATAR_BG[v]} stroke={INK} strokeWidth="1.5" />
      <g stroke={INK} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 44c2-8 7-11 14-11s12 3 14 11" fill={v % 2 ? "#FFF9EE" : "#A9C09A"} />
        <circle cx="24" cy="22" r="9.5" fill="#F3D9C3" />
        {v === 0 && <path d="M14 22c0-8 5-12 10-12s10 4 10 12c-3-4-7-6-10-6s-7 2-10 6z" fill={HAIR[v]} />}
        {v === 1 && <path d="M14.5 20c1-7 5-10 9.5-10s9 3 9.5 10c-6 0-12-3-14-6-1 3-3 5-5 6z" fill={HAIR[v]} />}
        {v === 2 && <path d="M13 26c-1-10 4-16 11-16s12 6 11 16l-2-8c-4 1-12 1-18 0z" fill={HAIR[v]} />}
        {v === 3 && <><path d="M14.5 20c1-6 5-9 9.5-9s8.5 3 9.5 9z" fill={HAIR[v]} /><circle cx="24" cy="9" r="3.5" fill={HAIR[v]} /></>}
        {v === 4 && <path d="M13.5 23c0-8 4-13 10.5-13S34.5 15 34.5 23c0 4-1 8-2 10l-1-11c-5 0-10-2-12-5-1 3-3 5-5 6l-.5 10c-1-2-.5-6-.5-10z" fill={HAIR[v]} />}
        {v === 5 && <path d="M14 19c2-6 6-8 10-8s8 2 10 8h-20zM12 19h24" fill={HAIR[v]} />}
        <circle cx="20.5" cy="23" r=".9" fill={INK} stroke="none" />
        <circle cx="27.5" cy="23" r=".9" fill={INK} stroke="none" />
        <path d="M22 27c1.2 1 2.8 1 4 0" fill="none" />
        <circle cx="18.5" cy="26" r="1.6" fill="#DFAE91" stroke="none" opacity=".6" />
        <circle cx="29.5" cy="26" r="1.6" fill="#DFAE91" stroke="none" opacity=".6" />
      </g>
    </svg>
  );
}

/* ---------- Passport stamp ---------- */
export function Stamp({
  name,
  city,
  date,
  art,
  size = 132,
  rotate = 0,
  empty = false,
}: {
  name?: string;
  city?: string;
  date?: string;
  art?: CafeArt;
  size?: number;
  rotate?: number;
  empty?: boolean;
}) {
  const color = empty ? "#C8BBA6" : "#7B8767";
  const scallops = Array.from({ length: 28 });
  const pathId = `arc-${(name ?? "x").replace(/[^a-z0-9]/gi, "").slice(0, 14)}-${size}`;
  return (
    <svg width={size} height={size} viewBox="0 0 132 132" style={{ transform: `rotate(${rotate}deg)` }} role="img" aria-label={empty ? "Empty stamp slot" : `Stamp for ${name}`}>
      <defs>
        <path id={pathId} d="M22 66a44 44 0 1 1 88 0" />
      </defs>
      <g filter="url(#lcc-wobble)">
        {scallops.map((_, i) => {
          const a = (i / scallops.length) * Math.PI * 2;
          return <circle key={i} cx={66 + Math.cos(a) * 60} cy={66 + Math.sin(a) * 60} r="5.4" fill={empty ? "#F8EEDC" : art?.awning ?? "#F6E7A9"} />;
        })}
        <circle cx="66" cy="66" r="60" fill={empty ? "#F8EEDC" : art?.awning ?? "#F6E7A9"} />
        <circle cx="66" cy="66" r="54" fill="#FFF9EE" stroke={color} strokeWidth="2" strokeDasharray={empty ? "4 5" : undefined} />
        <circle cx="66" cy="66" r="47" fill="none" stroke={color} strokeWidth="1.2" />
      </g>
      {empty ? (
        <g stroke="#C8BBA6" strokeWidth="2" fill="none" strokeLinecap="round">
          <path d="M52 62h28v8a12 12 0 0 1-12 12h-4a12 12 0 0 1-12-12z" />
          <path d="M80 64h3a5 5 0 0 1 0 10h-4" />
        </g>
      ) : (
        <>
          <text fontFamily="Nunito, sans-serif" fontSize="9.5" fontWeight="800" letterSpacing="1.6" fill={color}>
            <textPath href={`#${pathId}`} startOffset="50%" textAnchor="middle">
              {(name ?? "").toUpperCase().slice(0, 26)}
            </textPath>
          </text>
          <g stroke={INK} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" filter="url(#lcc-wobble)">
            <path d="M48 62h32v10a14 14 0 0 1-14 14h-4a14 14 0 0 1-14-14z" fill={art?.wall ?? "#FBF2CF"} />
            <path d="M80 65h3.5a5.5 5.5 0 0 1 0 11H79" fill="none" />
            <path d="M58 54c-2-3 2-4 0-7M66 54c-2-3 2-4 0-7" fill="none" />
            <path d="M52 66h24" stroke={art?.awning ?? "#DFAE91"} strokeWidth="3" />
          </g>
          <text x="66" y="100" textAnchor="middle" fontFamily="Caveat, cursive" fontSize="14" fill={INK}>
            {city?.slice(0, 18)}
          </text>
          {date && (
            <text x="66" y="111" textAnchor="middle" fontFamily="Nunito, sans-serif" fontSize="7.5" fontWeight="700" fill={color}>
              {date}
            </text>
          )}
        </>
      )}
    </svg>
  );
}

/* ---------- Small decorative doodles ---------- */
export function Sprig({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 40" className={className} aria-hidden>
      <g fill="#A9C09A" stroke={INK} strokeWidth="1.4" strokeLinecap="round" filter="url(#lcc-wobble)">
        <path d="M4 34C20 28 36 18 56 6" fill="none" />
        <path d="M18 28c-2-7 2-11 6-12 1 5-1 10-6 12zM30 21c-2-7 2-11 6-12 1 5-1 10-6 12zM42 14c-2-6 1-10 5-11 1 5-1 9-5 11z" />
        <path d="M22 26c6-2 11 0 12 4-5 1-10 0-12-4zM34 19c6-2 11 0 12 4-5 1-10 0-12-4z" />
      </g>
    </svg>
  );
}

export function SleepyCat({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 90 50" className={className} aria-hidden>
      <g stroke={INK} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" filter="url(#lcc-wobble)">
        <path d="M10 44c0-16 12-24 30-24s30 6 30 20c0 4-2 4-6 4H14c-3 0-4 0-4 0z" fill="#DFAE91" />
        <path d="M58 26l4-10 6 8M70 26l2-10-8 6" fill="#DFAE91" />
        <path d="M60 34c2 1 4 1 6 0M68 34c2 1 4 1 6 0" fill="none" />
        <path d="M10 44c-6 0-8-6-4-10" fill="none" />
        <path d="M28 30q4-3 8 0M36 36q4-3 8 0" fill="none" opacity=".5" />
      </g>
      <text x="78" y="14" fontFamily="Caveat, cursive" fontSize="13" fill="#6E604E">z z</text>
    </svg>
  );
}

/* ---------- Map marker (rendered to an HTML string for MapLibre) ---------- */
export function markerSvg(fill: string, glyph: "cup" | "matcha" | "leaf" | "book") {
  const g =
    glyph === "matcha"
      ? '<path d="M13 15h14l-1.6 6a3 3 0 0 1-2.9 2.2h-5a3 3 0 0 1-2.9-2.2z" fill="#FFF9EE"/><path d="M20 15c0-3 2-5 5-5.6-.3 3-2 5-5 5.6z" fill="#7B8767"/>'
      : glyph === "leaf"
        ? '<path d="M13 23c0-6 4-10 13-10.6C25.5 19 22 23 13 23z" fill="#FFF9EE"/><path d="M13 23c3-3 6-5 9-6.5" fill="none"/>'
        : glyph === "book"
          ? '<path d="M12 13c2.5-1 5-1 8 .6 3-1.6 5.5-1.6 8-.6v9.5c-2.5-1-5-1-8 .6-3-1.6-5.5-1.6-8-.6z" fill="#FFF9EE"/><path d="M20 13.6v9.6" fill="none"/>'
          : '<path d="M13 14h12v5a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5z" fill="#FFF9EE"/><path d="M25 15.5h1.2a2.2 2.2 0 0 1 0 4.4H25" fill="none"/><path d="M17 11.5c-.6-1 .6-1.6 0-2.6M20.5 11.5c-.6-1 .6-1.6 0-2.6" fill="none"/>';
  return `<svg class="cup-pin" width="40" height="50" viewBox="0 0 40 50" aria-hidden="true">
  <ellipse cx="20" cy="47" rx="8" ry="2.4" fill="#493D2E" opacity=".18"/>
  <path d="M20 46C11 36 4 29 4 19.5a16 16 0 0 1 32 0C36 29 29 36 20 46z" fill="${fill}" stroke="#493D2E" stroke-width="2" stroke-linejoin="round" filter="url(#lcc-wobble)"/>
  <circle cx="20" cy="19" r="10.5" fill="#FFF9EE" fill-opacity=".55"/>
  <g stroke="#493D2E" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${g}</g>
</svg>`;
}

/** HTML overlay pill that marks an image as an illustration, not a photo. */
export function IllustrationNote() {
  return (
    <span className="absolute bottom-2 left-2 rounded-full bg-cream/90 px-2.5 py-0.5 text-[11px] font-bold text-ink-soft">
      Illustration · no photo yet
    </span>
  );
}
