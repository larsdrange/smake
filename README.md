# Smake — Bergen Food Check-ins

A mobile-first web app for checking in at Bergen restaurants, sharing food photos, and discovering what others are eating.

---

## Features

- **Check-in** — Photo upload, star rating, dish name, review
- **Social feed** — Bergen-wide and nearby tabs
- **Restaurant map** — All Bergen restaurants with visited markers
- **Gamification** — Badges for visit milestones, neighborhoods, cuisines, streaks
- **User profiles** — Visit history grid, stats, badges, favorites, personal map
- **Admin panel** — `/admin` — manage restaurants, users, check-ins, badges
- **Google Places seed** — Pull Bergen restaurants with coordinates from Google Places API

---

## Setup

### 1. Install Node.js

Download from [nodejs.org](https://nodejs.org) (LTS version).

### 2. Install dependencies

```bash
cd ~/projects/food-bergen
npm install
```

### 3. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free project
2. In **Project Settings → API**, copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

### 4. Run the database migration

In Supabase dashboard → **SQL Editor**, paste and run the contents of:
```
supabase/migrations/001_initial.sql
```

### 5. Create storage buckets

In Supabase → **Storage**, create two public buckets:
- `avatars`
- `check-in-photos`

For each bucket, add a storage policy: `Allow public read` (SELECT for all).
Also add an INSERT policy for authenticated users on both buckets.

### 6. Get a Google Places API key

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project, enable **Places API** and **Maps JavaScript API**
3. Create an API key

### 7. Configure environment variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_EMAILS=your@email.com,other-admin@email.com
```

> **Important:** `ADMIN_EMAILS` — put your email here. When you first sign up, your account is automatically given `super_admin` role.

### 8. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 9. Seed restaurants

1. Sign up with the email in `ADMIN_EMAILS`
2. Go to [/admin/restaurants](http://localhost:3000/admin/restaurants)
3. Click **"Seed from Google"** — this pulls ~60 Bergen restaurants from Google Places

---

## App structure

| Route | Description |
|---|---|
| `/feed` | Social feed (Bergen + Nearby tabs) |
| `/map` | Restaurant map |
| `/checkin` | Check-in flow (requires login) |
| `/explore` | Search and filter restaurants |
| `/profile/[username]` | User profile |
| `/settings` | Edit profile, avatar, sign out |
| `/admin` | Admin dashboard (admin role only) |
| `/admin/restaurants` | Manage restaurants, seed from Google |
| `/admin/users` | Manage users, assign roles |
| `/admin/checkins` | View and delete check-ins |
| `/admin/badges` | View all badges |

---

## Tech stack

- **Next.js 15** (App Router, TypeScript)
- **Supabase** (Auth, PostgreSQL, Storage, RLS)
- **Tailwind CSS** (mobile-first design)
- **Leaflet + OpenStreetMap** (maps, no billing)
- **Google Places API** (restaurant seeding only)
- **lucide-react** (icons)

---

## Deployment (Vercel)

```bash
# Push to GitHub, then connect to Vercel
# Add all .env.local values as Vercel environment variables
# Set NEXT_PUBLIC_APP_URL to your production URL
```
