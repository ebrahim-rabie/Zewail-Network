# ZC Network
A web platform for **Zewail City of Science and Technology** that connects current
students with alumni. It's a searchable graduate, directory: approved alumni
voluntarily share their journey and contact info, and anyone can browse and reach out.

Built from the `ZC Network.dc.html` design, implemented faithfully with the
requested stack.

## Tech stack

- **Frontend:** React + Vite
- **Styling:** Tailwind CSS (design tokens exposed as CSS variables)
- **Routing:** React Router
- **Backend + DB + Auth:** Supabase (PostgreSQL, Auth, Row Level Security)
- **Hosting:** Vercel (frontend) + Supabase (backend)

## Roles & how it works

| Role | Can do |
| --- | --- |
| **Guest** (no account) | Browse the directory and view public profiles. Private fields (whatever a member hid) are never sent to them. |
| **Alumni** (approved) | Sign up (name + email + password). Account starts **pending**. Fill out the profile (basic info, ZC info, work experience, contacts) with a **public/private toggle per field**. Edit anytime after approval. |
| **Admin** | Review pending applications (Approve / Reject). Suspend / restore / remove approved members. |

Privacy is enforced **server-side**: guests read a `directory_profiles` view that
only returns approved members and nulls out any field the owner marked private —
hidden data never leaves the database.

## Project structure
Rabie

```
src/
  components/    Reusable UI (Backdrop, Logo, Avatar, GraduateCard, PrivacyToggle, …)
  pages/         One file per screen (Welcome, Browse, Profile, Signup, Login, Dashboard, Admin)
  hooks/         Data hooks (useGraduates)
  context/       AuthContext (session + profile + admin flag)
  lib/           supabase client + profile helpers (initials, tints, masking-aware decorate)
supabase/
  schema.sql     Tables, RLS, triggers, is_admin(), the privacy-masking view
  seed.sql       12 demo graduates + a few pending applications
```

## Getting started

### 1. Install

```bash
npm install
```

### 2. Create a Supabase project

At [supabase.com](https://supabase.com), create a free project. Then in the
**SQL editor** run these files **in order**:

1. `supabase/schema.sql` — tables, RLS, triggers, the directory view (this is the
   full, up-to-date schema; a fresh project only needs this one).
2. `supabase/seed.sql` — optional demo data (12 grads + a few pending), safe to skip.
3. `supabase/03_open_signup.sql` — auto-confirm signups (no email-verification wait).

The `02_*` and `04_*` files are **incremental migrations** for a database that was
created from an earlier version of `schema.sql`. On a brand-new project you can
skip them — `schema.sql` already includes everything they add (useful links,
storage policies, admin remove, and the edit-review workflow).

Then create a **public Storage bucket named `avatars`** (Storage → New bucket → Public).

In **Authentication → Providers → Email**, for the smoothest local flow you can
turn **"Confirm email"** off (otherwise new signups must confirm before logging in).

For profile photos, create a **public Storage bucket named `avatars`**
(Storage → New bucket → Public).

### 3. Configure environment

```bash
cp .env.example .env
```

Fill in from **Project Settings → API**:

```
VITE_SUPABASE_URL=https://YOUR-PROJECT-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

### 4. Run

```bash
npm run dev
```

Open http://localhost:5173.

## Making yourself an admin

Sign up through the app, then in the Supabase SQL editor:

```sql
update public.profiles
set account_role = 'admin', status = 'approved'
where email = 'you@zc.edu.eg';
```

Reload the app — the **Admin** link appears in the header.

## Deploying to Vercel

1. Push this repo to GitHub.
2. Import it in Vercel (framework preset: **Vite**).
3. Add the two `VITE_SUPABASE_*` env vars in the Vercel project settings.
4. Deploy. (A `vercel.json` rewrite is included so client-side routes work on refresh.)

## Notes on the implementation

- The design's exact palette (OKLCH tokens), fonts (Space Grotesk + Plus Jakarta
  Sans), keyframe animations, and ambient backdrop are ported verbatim.
- `current_title` / `current_company` (the card headline) are derived from the most
  recent work-experience entry and stay public even when the work *history* is private.
- A `career_path` field (Industry / Grad school / Startup / Other) was added to the
  editor so the directory's career-path filter is functional.
