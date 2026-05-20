-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "postgis";

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null,
  display_name text,
  bio text,
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'admin', 'super_admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- ============================================================
-- NEIGHBORHOODS (Bergen districts)
-- ============================================================
create table public.neighborhoods (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  name_no text,
  slug text unique not null,
  created_at timestamptz not null default now()
);

alter table public.neighborhoods enable row level security;
create policy "Neighborhoods readable by everyone" on public.neighborhoods for select using (true);
create policy "Only admins can modify neighborhoods"
  on public.neighborhoods for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','super_admin'))
  );

-- ============================================================
-- RESTAURANTS
-- ============================================================
create table public.restaurants (
  id uuid primary key default uuid_generate_v4(),
  google_place_id text unique,
  name text not null,
  address text,
  neighborhood_id uuid references public.neighborhoods(id),
  latitude double precision not null,
  longitude double precision not null,
  cuisine_types text[] default '{}',
  phone text,
  website text,
  opening_hours jsonb,
  google_rating numeric(2,1),
  price_level int check (price_level between 0 and 4),
  photo_reference text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.restaurants enable row level security;
create policy "Active restaurants readable by everyone"
  on public.restaurants for select using (is_active = true);
create policy "Admins can do everything with restaurants"
  on public.restaurants for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','super_admin'))
  );

-- Geospatial index
create index restaurants_location_idx on public.restaurants using btree (latitude, longitude);

-- ============================================================
-- CHECK-INS
-- ============================================================
create table public.check_ins (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  photo_url text,
  review text,
  rating int check (rating between 1 and 5),
  dish_name text,
  latitude double precision,
  longitude double precision,
  is_public boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.check_ins enable row level security;

create policy "Public check-ins viewable by everyone"
  on public.check_ins for select using (is_public = true);

create policy "Users can insert own check-ins"
  on public.check_ins for insert with check (auth.uid() = user_id);

create policy "Users can update own check-ins"
  on public.check_ins for update using (auth.uid() = user_id);

create policy "Users can delete own check-ins"
  on public.check_ins for delete using (auth.uid() = user_id);

create policy "Admins can manage all check-ins"
  on public.check_ins for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','super_admin'))
  );

create index check_ins_user_idx on public.check_ins(user_id);
create index check_ins_restaurant_idx on public.check_ins(restaurant_id);
create index check_ins_created_idx on public.check_ins(created_at desc);

-- ============================================================
-- FAVORITES
-- ============================================================
create table public.favorites (
  user_id uuid references public.profiles(id) on delete cascade,
  restaurant_id uuid references public.restaurants(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, restaurant_id)
);

alter table public.favorites enable row level security;
create policy "Users can manage own favorites"
  on public.favorites for all using (auth.uid() = user_id);
create policy "Favorites readable by owner"
  on public.favorites for select using (auth.uid() = user_id);

-- ============================================================
-- BADGES
-- ============================================================
create table public.badges (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  description text,
  icon text not null,
  category text not null check (category in ('visits','explorer','cuisine','streak','special')),
  criteria jsonb not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.badges enable row level security;
create policy "Badges readable by everyone" on public.badges for select using (true);
create policy "Admins manage badges"
  on public.badges for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','super_admin'))
  );

-- ============================================================
-- USER BADGES
-- ============================================================
create table public.user_badges (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  badge_id uuid not null references public.badges(id) on delete cascade,
  awarded_at timestamptz not null default now(),
  unique(user_id, badge_id)
);

alter table public.user_badges enable row level security;
create policy "User badges readable by everyone" on public.user_badges for select using (true);
create policy "System can award badges"
  on public.user_badges for insert with check (true);

-- ============================================================
-- LIKES on check-ins
-- ============================================================
create table public.check_in_likes (
  user_id uuid references public.profiles(id) on delete cascade,
  check_in_id uuid references public.check_ins(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, check_in_id)
);

alter table public.check_in_likes enable row level security;
create policy "Likes readable by everyone" on public.check_in_likes for select using (true);
create policy "Users can manage own likes"
  on public.check_in_likes for all using (auth.uid() = user_id);

-- ============================================================
-- VIEWS
-- ============================================================

-- Rich check-in feed view
create view public.check_in_feed as
  select
    ci.id,
    ci.user_id,
    ci.restaurant_id,
    ci.photo_url,
    ci.review,
    ci.rating,
    ci.dish_name,
    ci.latitude,
    ci.longitude,
    ci.created_at,
    p.username,
    p.display_name,
    p.avatar_url,
    r.name as restaurant_name,
    r.address as restaurant_address,
    r.cuisine_types,
    r.neighborhood_id,
    n.name as neighborhood_name,
    (select count(*) from public.check_in_likes l where l.check_in_id = ci.id) as like_count
  from public.check_ins ci
  join public.profiles p on p.id = ci.user_id
  join public.restaurants r on r.id = ci.restaurant_id
  left join public.neighborhoods n on n.id = r.neighborhood_id
  where ci.is_public = true
  order by ci.created_at desc;

-- User stats view
create view public.user_stats as
  select
    p.id as user_id,
    p.username,
    count(distinct ci.id) as total_check_ins,
    count(distinct ci.restaurant_id) as unique_restaurants,
    count(distinct r.neighborhood_id) as neighborhoods_visited,
    (
      select array_agg(distinct cuisine)
      from public.check_ins ci2
      join public.restaurants r2 on r2.id = ci2.restaurant_id,
      unnest(r2.cuisine_types) as cuisine
      where ci2.user_id = p.id
    ) as cuisines_tried,
    max(ci.created_at) as last_check_in
  from public.profiles p
  left join public.check_ins ci on ci.user_id = p.id
  left join public.restaurants r on r.id = ci.restaurant_id
  group by p.id, p.username;

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger restaurants_updated_at before update on public.restaurants
  for each row execute function public.handle_updated_at();

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  admin_emails text := current_setting('app.admin_emails', true);
  user_role text := 'user';
begin
  if admin_emails is not null and new.email = any(string_to_array(admin_emails, ',')) then
    user_role := 'super_admin';
  end if;

  insert into public.profiles (id, username, display_name, role)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'username',
      split_part(new.email, '@', 1) || '_' || substr(new.id::text, 1, 4)
    ),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    user_role
  );
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Get nearby restaurants
create or replace function public.get_nearby_restaurants(
  lat double precision,
  lng double precision,
  radius_km double precision default 2.0,
  lim int default 50
)
returns setof public.restaurants
language sql stable as $$
  select *
  from public.restaurants
  where is_active = true
    and (
      6371 * acos(
        cos(radians(lat)) * cos(radians(latitude)) *
        cos(radians(longitude) - radians(lng)) +
        sin(radians(lat)) * sin(radians(latitude))
      )
    ) <= radius_km
  order by (
    6371 * acos(
      cos(radians(lat)) * cos(radians(latitude)) *
      cos(radians(longitude) - radians(lng)) +
      sin(radians(lat)) * sin(radians(latitude))
    )
  )
  limit lim;
$$;

-- ============================================================
-- SEED: Bergen neighborhoods
-- ============================================================
insert into public.neighborhoods (name, name_no, slug) values
  ('Bergenhus', 'Bergenhus', 'bergenhus'),
  ('Sentrum', 'Sentrum', 'sentrum'),
  ('Bryggen', 'Bryggen', 'bryggen'),
  ('Nordnes', 'Nordnes', 'nordnes'),
  ('Sandviken', 'Sandviken', 'sandviken'),
  ('Møhlenpris', 'Møhlenpris', 'mohlenpris'),
  ('Nygård', 'Nygård', 'nygard'),
  ('Laksevåg', 'Laksevåg', 'laksvag'),
  ('Åsane', 'Åsane', 'asane'),
  ('Fana', 'Fana', 'fana'),
  ('Ytrebygda', 'Ytrebygda', 'ytrebygda'),
  ('Arna', 'Arna', 'arna');

-- ============================================================
-- SEED: Badges
-- ============================================================
insert into public.badges (slug, name, description, icon, category, criteria) values
  ('first-bite', 'First Bite', 'Checked in for the first time', '🍽️', 'visits', '{"check_ins": 1}'),
  ('explorer-5', 'Explorer', 'Visited 5 different restaurants', '🗺️', 'visits', '{"unique_restaurants": 5}'),
  ('foodie-10', 'Foodie', 'Visited 10 different restaurants', '🧑‍🍳', 'visits', '{"unique_restaurants": 10}'),
  ('regular-25', 'Regular', 'Visited 25 different restaurants', '⭐', 'visits', '{"unique_restaurants": 25}'),
  ('connoisseur-50', 'Connoisseur', 'Visited 50 different restaurants', '🏆', 'visits', '{"unique_restaurants": 50}'),
  ('neighborhood-3', 'Neighborhood Hopper', 'Explored 3 different neighborhoods', '🏘️', 'explorer', '{"neighborhoods": 3}'),
  ('neighborhood-6', 'Bergen Explorer', 'Explored 6 different neighborhoods', '🗺️', 'explorer', '{"neighborhoods": 6}'),
  ('neighborhood-all', 'Bergen Master', 'Explored all Bergen neighborhoods', '👑', 'explorer', '{"neighborhoods": 12}'),
  ('sushi-fan', 'Sushi Fan', 'Checked in at a Japanese restaurant', '🍣', 'cuisine', '{"cuisine": "Japanese"}'),
  ('pizza-lover', 'Pizza Lover', 'Checked in at an Italian restaurant', '🍕', 'cuisine', '{"cuisine": "Italian"}'),
  ('seafood-seeker', 'Seafood Seeker', 'Tried seafood at a Bergen restaurant', '🦞', 'cuisine', '{"cuisine": "Seafood"}'),
  ('streak-7', 'Week Warrior', 'Checked in every week for a month', '🔥', 'streak', '{"weekly_streak": 4}'),
  ('bryggen-regular', 'Bryggen Regular', 'Visited the Bryggen area 3 times', '🏰', 'special', '{"neighborhood_slug": "bryggen", "visits": 3}');

-- ============================================================
-- STORAGE: Create buckets (run via Supabase dashboard or CLI)
-- ============================================================
-- insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);
-- insert into storage.buckets (id, name, public) values ('check-in-photos', 'check-in-photos', true);
