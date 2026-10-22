# Little Cup Club ☕︎

*Every cup has a story.* A storybook-style café discovery app for the Philippines — explore an illustrated
map, discover cafés by mood, save favourites, collect passport stamps and share reviews.

Built with **Next.js 15 (App Router) · TypeScript · Tailwind CSS · Framer Motion · MapLibre GL JS · Supabase**.

## Run it locally

```bash
npm install
cp .env.example .env.local   # optional — the app works without any keys
npm run dev                  # http://localhost:3000
```

With no environment variables the app runs in **demo mode**:

- the map uses free OpenFreeMap vector tiles (recoloured into the storybook palette in the browser);
- **sample cafés** are fictional and labelled everywhere ("Sample café · fictional");
- **real cafés** can be loaded from OpenStreetMap on the Explore page (toggle "Real cafés (OSM)");
- wishlists, visits/stamps, reviews (incl. photos), reports and submissions are saved in the browser's localStorage.

## What works

| Area | Status |
| --- | --- |
| Homepage: hero search, quick filters, embedded map with map/list toggle, mood cards, community feed, passport teaser | ✅ |
| Explore: split-screen list + map (desktop), Map/List switch + filter sheet (mobile), URL-synced filters | ✅ |
| Filters: region, price, coffee/matcha, Wi-Fi, outlets, study, outdoor/garden, pets, ambiance | ✅ |
| "Open now" filter | Disabled on purpose until verified hours exist |
| Sorting: relevance, rating (only when ≥3 member reviews exist), distance (geolocation with graceful fallback) | ✅ |
| Custom illustrated markers, hover/selection sync between cards and markers, preview cards | ✅ |
| Café page: details, verified vs unavailable info, map, directions, wishlist, visit + stamp, reviews with photo upload, report | ✅ |
| Coffee Passport: stamps, regional collections, quests, badges, wishlist, visit history | ✅ |
| Community: review feed, report review, suggest a café, submission status, profiles | ✅ |
| Supabase auth (magic link) + cloud persistence | ✅ when configured |
| Moderator dashboard UI | Not built — moderate via Supabase table editor (RLS + `is_moderator()` ready) |

## Honesty rules baked in

- Sample cafés are fictional, have **no** invented ratings, hours, phone numbers or photos, and directions are disabled.
- Ratings are averages of **member** reviews only. Sample reviews are labelled and never counted.
- OSM listings are shown as **unverified**; OSM opening hours are displayed raw and never used for "open now".
- No photos are scraped. Cafés without member photos show a generated storefront illustration, labelled as such.
- A recorded visit is an honour-system check-in. Location is never read for stamps. One visit per café per day;
  one stamp per café (the first visit).

## Data sources & provider abstraction

`src/lib/cafes/provider.ts` is the only thing the UI talks to. Providers today:

- `sample` — `src/lib/cafes/sample.ts` (fictional demo seed).
- `osm` — `src/lib/cafes/osm.ts`, queried server-side through `/api/cafes` (Overpass API). © OpenStreetMap
  contributors, ODbL. Attribution is shown on the map, in lists and on café pages. Responses are cached ~12h.
  Queries are limited to small bounding boxes (zoom ≥ 12) to respect the shared Overpass service.

To add a licensed places API (Mapbox Search, Foursquare, etc.), implement the same `fetchCafes(bbox)` /
`getById` shape server-side, keep the key in a non-`NEXT_PUBLIC_` env var, and review that provider's caching,
attribution and photo-display terms. **Do not scrape Google Maps.**

### Field provenance

| Field(s) | Source |
| --- | --- |
| `cafes.*` (curated table) | Team-curated / approved submissions |
| OSM café name, coords, address, `opening_hours`, phone, website, amenity tags | OpenStreetMap (ODbL), unverified |
| `*_snapshot` jsonb on wishlists/visits | Copy of the displayed café fields (incl. OSM, permitted under ODbL with attribution) |
| reviews, ratings, photos, visits, wishlists, submissions, reports, profiles | User-generated |

## Supabase setup

1. Create a project at supabase.com.
2. Run the migration: `supabase db push` (CLI) or paste `supabase/migrations/20261022000000_init.sql` into the SQL editor.
   It creates tables, indexes, constraints, views (`stamps`, `cafe_ratings`), RLS policies, the `review-photos`
   storage bucket (2 MB, images only) and seeds the quest catalogue.
3. Auth → URL configuration: add `http://localhost:3000/auth/callback` and `https://<your-domain>/auth/callback`
   to the redirect allow-list. Enable the Email (magic link) provider.
4. Put `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local` (and in Vercel project env vars).
5. Make someone a moderator: `update profiles set role = 'moderator' where id = '<user uuid>';`

Security notes: only the anon key reaches the browser. Every table has RLS; users can only read/write their own
wishlists, visits, submissions and reports; published reviews are public; authors can't edit their `role` or
un-hide a moderated review; three open reports auto-hide a review. Photos are re-encoded client-side
(EXIF/GPS stripped) and the bucket enforces type/size limits plus per-user folders.

## Map configuration

- Default: `https://tiles.openfreemap.org/styles/positron` (free, no key; OSM attribution shown).
- Mapbox: set `NEXT_PUBLIC_MAPBOX_TOKEN` to a **public, URL-restricted** `pk.*` token. The app then renders Mapbox
  `light-v11` raster tiles via MapLibre (MapLibre GL JS is the open-source fork of Mapbox GL JS with the same API;
  switching to `mapbox-gl` is a one-line import change in `CafeMap.tsx` if you prefer Mapbox's vector styles).
- If tiles fail to load, the map shows a friendly message and the list view keeps working.

## Project map

```
src/app/                 routes (/, /explore, /cafe/[id], /passport, /collections, /community, /community/submit,
                         /profile, /signin, /auth/callback, /about, /api/cafes)
src/components/          UI: CafeMap, ExploreView, SearchBox, Filters, cafe-bits, CafeDetail, CommunityFeed,
                         ReportDialog/Modal, StoreProvider, Nav, Footer, Icon (icon set), illustrations (SVG art)
src/lib/                 types, places (gazetteer + regions), filters, quests, validation (zod), config
src/lib/cafes/           provider abstraction, sample seed, OSM provider
src/lib/store/           Backend interface, localStorage demo backend, Supabase backend
supabase/migrations/     schema + RLS
```

## Accessibility

Keyboard-reachable markers (they're buttons with labels), combobox search with arrow-key support, focus-trapped
dialogs, visible focus rings, `aria-live` toasts and result counts, `prefers-reduced-motion` respected globally
and in Framer Motion, colour contrast kept to coffee-ink on cream for all body text.
