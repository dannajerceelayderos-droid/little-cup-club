-- Little Cup Club — initial schema
-- Run with the Supabase CLI (`supabase db push`) or paste into the SQL editor.
--
-- Data provenance
--   cafes.*                 curated/verified listings maintained by the team (source = 'curated')
--                           or approved community submissions (source = 'community').
--   *_ref text columns      provider-prefixed café ids: 'cafe-<uuid>', 'osm-n123', 'sample-…'.
--                           OSM cafés are NOT copied into `cafes`; we keep only a small display
--                           snapshot (name, coords, city, tags) next to a user's wishlist/visit,
--                           which ODbL permits with attribution.
--   reviews, visits, wishlists, photos, submissions, reports: user-generated.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- profiles
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 40),
  avatar      smallint not null default 0 check (avatar between 0 and 5),
  bio         text check (char_length(bio) <= 280),
  home_city   text check (char_length(home_city) <= 60),
  role        text not null default 'member' check (role in ('member', 'moderator')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(nullif(split_part(new.email, '@', 1), ''), 'Member'))
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_moderator() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'moderator');
$$;

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------- cafes (curated)
create table public.cafes (
  id              text primary key default ('cafe-' || gen_random_uuid()),
  source          text not null default 'curated' check (source in ('curated', 'community')),
  name            text not null check (char_length(name) between 2 and 80),
  description     text,
  lat             double precision not null check (lat between 4 and 22),
  lng             double precision not null check (lng between 116 and 127.5),
  address         text,
  city            text,
  region          text,
  price           smallint check (price between 1 and 4),
  amenities       text[] not null default '{}',
  moods           text[] not null default '{}',
  ambiance        text[] not null default '{}',
  menu_highlights text[] not null default '{}',
  hours_raw       text,
  hours_verified  boolean not null default false,
  phone           text,
  website         text,
  independent     boolean,
  verified        boolean not null default false,
  verified_at     timestamptz,
  attribution     text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index cafes_region_idx on public.cafes (region);
create index cafes_latlng_idx on public.cafes (lat, lng);
create trigger cafes_touch before update on public.cafes for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------- wishlists
create table public.wishlists (
  user_id       uuid not null references public.profiles (id) on delete cascade,
  cafe_ref      text not null check (char_length(cafe_ref) <= 120),
  cafe_snapshot jsonb not null,
  created_at    timestamptz not null default now(),
  primary key (user_id, cafe_ref)
);

-- ---------------------------------------------------------------- visits & stamps
create table public.visits (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles (id) on delete cascade,
  cafe_ref      text not null check (char_length(cafe_ref) <= 120),
  cafe_snapshot jsonb not null,
  visited_on    date not null default current_date check (visited_on <= current_date + 1),
  note          text check (char_length(note) <= 280),
  created_at    timestamptz not null default now(),
  -- product rule: one recorded visit per café per day
  unique (user_id, cafe_ref, visited_on)
);
create index visits_user_idx on public.visits (user_id, visited_on desc);

-- One stamp per café: the first recorded visit.
create view public.stamps with (security_invoker = true) as
  select distinct on (user_id, cafe_ref) user_id, cafe_ref, cafe_snapshot, visited_on as stamped_on
  from public.visits
  order by user_id, cafe_ref, visited_on asc;

-- ---------------------------------------------------------------- reviews & photos
create table public.reviews (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  cafe_ref    text not null check (char_length(cafe_ref) <= 120),
  cafe_name   text not null check (char_length(cafe_name) <= 120),
  cafe_city   text,
  rating      smallint not null check (rating between 1 and 5),
  body        text not null check (char_length(body) between 10 and 1000),
  photo_path  text check (photo_path is null or photo_path like (user_id::text || '/%')),
  status      text not null default 'published' check (status in ('published', 'hidden')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, cafe_ref)
);
create index reviews_cafe_idx on public.reviews (cafe_ref, created_at desc) where status = 'published';
create index reviews_recent_idx on public.reviews (created_at desc) where status = 'published';
create trigger reviews_touch before update on public.reviews for each row execute function public.touch_updated_at();

create view public.cafe_ratings with (security_invoker = true) as
  select cafe_ref, round(avg(rating)::numeric, 2) as avg_rating, count(*)::int as review_count
  from public.reviews where status = 'published'
  group by cafe_ref;

-- ---------------------------------------------------------------- quests
create table public.quests (
  id          text primary key,
  title       text not null,
  description text not null,
  target      int not null check (target > 0),
  badge       text not null,
  rule        jsonb not null default '{}'
);
create table public.user_quests (
  user_id      uuid not null references public.profiles (id) on delete cascade,
  quest_id     text not null references public.quests (id) on delete cascade,
  progress     int not null default 0 check (progress >= 0),
  completed_at timestamptz,
  primary key (user_id, quest_id)
);

-- ---------------------------------------------------------------- submissions & reports
create table public.cafe_submissions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  name        text not null check (char_length(name) between 2 and 80),
  city        text not null check (char_length(city) between 2 and 60),
  address     text not null check (char_length(address) between 5 and 160),
  lat         double precision check (lat between 4 and 22),
  lng         double precision check (lng between 116 and 127.5),
  website     text check (website is null or website ~ '^https://'),
  amenities   text[] not null default '{}',
  notes       text check (char_length(notes) <= 500),
  status      text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references public.profiles (id),
  reviewed_at timestamptz,
  created_at  timestamptz not null default now()
);
create index submissions_status_idx on public.cafe_submissions (status, created_at);

create table public.reports (
  id          uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  target_type text not null check (target_type in ('cafe', 'review')),
  target_ref  text not null check (char_length(target_ref) <= 120),
  reason      text not null check (reason in ('closed','wrong_location','wrong_details','not_a_cafe','duplicate','inappropriate','spam','other')),
  details     text check (char_length(details) <= 500),
  status      text not null default 'open' check (status in ('open', 'resolved', 'dismissed')),
  created_at  timestamptz not null default now(),
  unique (reporter_id, target_type, target_ref)
);
create index reports_status_idx on public.reports (status, created_at);

-- ---------------------------------------------------------------- Row Level Security
alter table public.profiles         enable row level security;
alter table public.cafes            enable row level security;
alter table public.wishlists        enable row level security;
alter table public.visits           enable row level security;
alter table public.reviews          enable row level security;
alter table public.quests           enable row level security;
alter table public.user_quests      enable row level security;
alter table public.cafe_submissions enable row level security;
alter table public.reports          enable row level security;

-- profiles: public read (display name + avatar appear on reviews); users edit their own, never their role.
create policy "profiles readable" on public.profiles for select using (true);
create policy "profiles self update" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
revoke update on public.profiles from authenticated, anon;
grant update (display_name, avatar, bio, home_city) on public.profiles to authenticated;

-- cafes: public read; writes only via service role / moderators.
create policy "cafes readable" on public.cafes for select using (true);
create policy "moderators manage cafes" on public.cafes for all using (public.is_moderator()) with check (public.is_moderator());

-- wishlists: private to owner.
create policy "own wishlist" on public.wishlists for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- visits: private to owner; insert/delete only (no rewriting history).
create policy "read own visits" on public.visits for select using (auth.uid() = user_id);
create policy "add own visits" on public.visits for insert with check (auth.uid() = user_id);
create policy "delete own visits" on public.visits for delete using (auth.uid() = user_id);

-- reviews: published are public; authors manage their own; hidden reviews can't be un-hidden by authors.
create policy "read published or own reviews" on public.reviews for select
  using (status = 'published' or auth.uid() = user_id or public.is_moderator());
create policy "write own review" on public.reviews for insert with check (auth.uid() = user_id and status = 'published');
create policy "edit own published review" on public.reviews for update
  using (auth.uid() = user_id and status = 'published') with check (auth.uid() = user_id and status = 'published');
create policy "delete own review" on public.reviews for delete using (auth.uid() = user_id);
create policy "moderators moderate reviews" on public.reviews for update using (public.is_moderator()) with check (public.is_moderator());

-- quests: public catalogue; progress private.
create policy "quests readable" on public.quests for select using (true);
create policy "own quest progress" on public.user_quests for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- submissions: author can create (pending only) and read their own; moderators decide.
create policy "submit cafe" on public.cafe_submissions for insert
  with check (auth.uid() = user_id and status = 'pending' and reviewed_by is null);
create policy "read own submissions" on public.cafe_submissions for select using (auth.uid() = user_id or public.is_moderator());
create policy "moderators review submissions" on public.cafe_submissions for update using (public.is_moderator()) with check (public.is_moderator());

-- reports: anyone signed in can file; only moderators see/resolve them all.
create policy "file report" on public.reports for insert with check (auth.uid() = reporter_id and status = 'open');
create policy "read own reports" on public.reports for select using (auth.uid() = reporter_id or public.is_moderator());
create policy "moderators resolve reports" on public.reports for update using (public.is_moderator()) with check (public.is_moderator());

-- Auto-hide a review once 3 different members report it, pending moderator review.
create or replace function public.auto_hide_reported_review() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.target_type = 'review' and
     (select count(*) from public.reports where target_type = 'review' and target_ref = new.target_ref and status = 'open') >= 3 then
    update public.reviews set status = 'hidden' where id::text = new.target_ref;
  end if;
  return new;
end $$;
create trigger reports_autohide after insert on public.reports for each row execute function public.auto_hide_reported_review();

-- ---------------------------------------------------------------- storage: review photos
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('review-photos', 'review-photos', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "review photos public read" on storage.objects for select using (bucket_id = 'review-photos');
create policy "upload own review photos" on storage.objects for insert to authenticated
  with check (bucket_id = 'review-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "delete own review photos" on storage.objects for delete to authenticated
  using (bucket_id = 'review-photos' and (storage.foldername(name))[1] = auth.uid()::text);

-- ---------------------------------------------------------------- seed quests
insert into public.quests (id, title, description, target, badge) values
  ('first-sip', 'First sip', 'Record your first café visit.', 1, 'Sprout'),
  ('matcha-trail', 'Matcha trail', 'Visit three cafés that serve matcha or tea.', 3, 'Whisk'),
  ('indie-five', 'Indie five', 'Visit five independent coffee shops.', 5, 'Lantern'),
  ('study-buddy', 'Study buddy', 'Find three study-friendly nooks.', 3, 'Bookmark'),
  ('garden-wanderer', 'Garden wanderer', 'Sip your way through two garden cafés.', 2, 'Fern'),
  ('island-hopper', 'Island hopper', 'Collect stamps in three different regions.', 3, 'Paper boat'),
  ('storyteller', 'Storyteller', 'Write three café reviews.', 3, 'Quill'),
  ('daydreamer', 'Daydreamer', 'Save five cafés to your wishlist.', 5, 'Cloud')
on conflict (id) do nothing;

-- ---------------------------------------------------------------- backfill
-- Members who signed up before this migration ran get a profile too.
insert into public.profiles (id, display_name)
select id, coalesce(nullif(split_part(email, '@', 1), ''), 'Member') from auth.users
on conflict (id) do nothing;
