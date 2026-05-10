# BBTE — Multi-Course Urdu Landing Site + Admin Panel

## 1. Project Overview

A production-ready Next.js 14 application that powers Urdu-language landing
pages for multiple courses, optimized for Facebook/Meta Ads with WhatsApp
lead capture, Meta Pixel + Conversions API tracking, and a self-contained
admin panel for managing all content without touching code.

- **Public site** — RTL Urdu pages with Noto Nastaliq font, mobile-first
  layout, sticky WhatsApp CTA, and SEO/OG meta per course.
- **Admin panel** — Password-protected dashboard for courses, instructors,
  testimonials, FAQs, leads, and global settings. Image uploads go to
  Supabase Storage.
- **Tracking** — Pixel + CAPI fire `Lead` (on WhatsApp click) and `Purchase`
  (when admin marks a lead as purchased), deduplicated via a shared
  `event_id` (= our tracking UUID).

## 2. Prerequisites

- Node.js 20+ and npm
- A Supabase account (free tier is fine)
- A Meta Business account with a Pixel and Conversions API access (optional
  but required for ad tracking)

## 3. Supabase Setup (step-by-step)

1. Create a new project at https://supabase.com.
2. **Project Settings → Database → Connection string**. Use the **Pooler**
   for *both* connection variables — Supabase's direct host
   (`db.<project>.supabase.co`) is IPv6-only and is not reachable from
   Vercel or most CI environments.
   - **Transaction pooler** (port 6543) → `DATABASE_URL`
     — append `?pgbouncer=true&connection_limit=1`.
   - **Session pooler** (port 5432) → `DIRECT_URL` — used by Prisma
     migrations.
   - Replace `[YOUR-PASSWORD]` with the DB password (URL-encode special
     characters, e.g. `@` → `%40`).
3. **Project Settings → API** (or **API Keys** in newer UIs):
   - Copy the project URL → `NEXT_PUBLIC_SUPABASE_URL`.
   - Copy the **Publishable** / `anon` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
   - Copy the **Secret** / `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`
     (server-only — never expose to the browser).
4. **Storage**: create a new **public** bucket named `uploads`.
5. Paste all values into `.env`.

## 4. Local Setup

```bash
npm install
cp .env.example .env       # then edit values
npx prisma migrate deploy  # or `npx prisma db push` for the very first run
npm run seed               # creates admin user + example course + global settings
npm run dev
```

- Public site: http://localhost:3000
- Admin login: http://localhost:3000/admin/login
- Default credentials come from `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env`.

> If `prisma migrate deploy` complains there are no migrations, run
> `npx prisma migrate dev --name init` once on a clean DB to generate the
> initial migration, commit the `prisma/migrations` folder, and use
> `migrate deploy` thereafter (including in CI/Vercel).

## 5. Meta Pixel Setup

1. Go to https://business.facebook.com/events_manager.
2. **Connect Data Sources → Web → Meta Pixel**.
3. Name the Pixel and enter your live website URL.
4. Copy the 15–16 digit **Pixel ID**.
5. In the admin: `/admin/settings` → **Meta Pixel ID** → paste → Save.
6. Verify: install the **Meta Pixel Helper** Chrome extension, visit your
   site, and confirm `PageView` fires.

## 6. Meta Conversions API Setup

1. In Events Manager open your Pixel.
2. **Settings tab → Conversions API → Set up manually**.
3. Click **Generate Access Token** and copy it.
4. In the admin: `/admin/settings` → **CAPI access token** → paste → Save.
5. (Optional) **Test Events** tab → copy the test event code into
   **CAPI Test Code** so events can be verified without affecting real
   attribution.
6. Click any WhatsApp button on a live course page, then watch **Test Events**
   in Events Manager — a `Lead` event should appear within seconds.
7. Once verified, clear the test code so production events count toward
   ad attribution.

**Why both?** **Pixel** runs in the browser and is blocked by ad blockers,
iOS privacy settings, and other client-side fragility. **CAPI** sends the
same events server-side to recover that data. Because both events share the
same `event_id` (= our tracking UUID), Meta dedupes them automatically.

## 7. How Lead → Purchase tracking works

1. Visitor opens a course page → Pixel `PageView` + `ViewContent` fire.
2. Visitor taps a WhatsApp button → client generates a UUID `tracking_id`.
3. Client fires Pixel `Lead` with `eventID = tracking_id`.
4. Client `POST`s `{courseId, trackingId, …}` to `/api/clicks`. The server
   records the click and fires CAPI `Lead` with the same `event_id`.
5. The visitor is redirected to `wa.me/<number>?text=<message>` with the
   `tracking_id` embedded in the message body.
6. When the visitor pays, the admin opens `/admin/leads`, finds the matching
   tracking ID (visible in the WhatsApp message), and clicks **Purchased**.
7. `/api/admin/leads/:id` (PATCH `status: purchased`) fires CAPI `Purchase`
   with the same `event_id`. Meta attributes the purchase back to the
   originating ad click and optimizes delivery for real buyers.

## 8. Deploying to Vercel

1. Push to GitHub.
2. Import the repo into Vercel — framework is auto-detected as Next.js.
3. **Build & Output settings** — leave as defaults. The repo ships a
   `vercel.json` with:
   - **Build command:** `prisma generate && next build`
   - **Install command:** `npm install`
   - **Output directory:** (auto, `.next`)

   Do **not** put `prisma migrate deploy` in the build command. Vercel's
   build container can't always reach the database, and migrations should
   not run on every deploy. Run them as a one-off step (see step 5).
4. Add the following **environment variables** (Settings → Environment
   Variables → Production + Preview + Development). Use the Supabase
   **pooler** URLs — see section 3 above:

   | Variable | Where to get it |
   |---|---|
   | `DATABASE_URL` | Supabase → Connection string → Transaction pooler (6543) |
   | `DIRECT_URL` | Supabase → Connection string → Session pooler (5432) |
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase → API → Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → API → publishable / anon |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase → API → secret / service_role |
   | `ADMIN_EMAIL` | Whatever email you want to log in with |
   | `ADMIN_PASSWORD` | Strong password (used by seed script) |
   | `JWT_SECRET` | Long random string (≥ 32 chars) |
   | `DEFAULT_WHATSAPP_NUMBER` | E.164 without `+`, e.g. `923001234567` |
5. **First-time DB setup** — run migrations + seed once from your laptop
   against the production DB:
   ```bash
   # In a fresh terminal, with the same .env values you put in Vercel:
   npm run db:migrate    # applies prisma/migrations to Supabase
   npm run seed          # creates admin user, settings row, demo course
   ```
   After this, every Vercel deploy is just `next build` — fast, no DB
   contact during build.
6. Click **Deploy**. Public site is at the Vercel URL; admin login is at
   `/admin/login`.
7. (Optional) Update `next.config.js` `images.remotePatterns` if your
   Supabase bucket uses a custom domain.

## 9. Common Issues

- **"Pixel not firing"** — Pixel ID is empty in settings, or an ad blocker
  is active. Verify with the Pixel Helper extension.
- **"CAPI events not arriving"** — Wrong access token, missing test event
  code, or server-side `fetch` blocked by your hosting provider. Check
  the server logs (`/api/clicks` and `/api/admin/leads/[id]`).
- **"Image upload fails"** — The `uploads` bucket either doesn't exist or
  isn't public. Create it in Supabase → Storage and tick "Public bucket".
- **"Urdu font looks wrong"** — Hard-refresh and check DevTools → Network
  for `Noto+Nastaliq+Urdu` requests. The font is loaded via `next/font`
  and self-hosted by Next.js, so a CDN block on Google Fonts shouldn't
  matter.
- **`Tenant or user not found` on Prisma** — Your `DATABASE_URL` /
  `DIRECT_URL` are wrong. Use the exact strings from
  Project Settings → Database in Supabase, with the password URL-encoded.
- **`P1001: Can't reach database server at db.<project>.supabase.co:5432`**
  on Vercel build — you are pointing at Supabase's direct (IPv6-only)
  host. Switch `DIRECT_URL` (and `DATABASE_URL`) to the Supabase
  **pooler** host (`aws-0-<region>.pooler.supabase.com`). See section 3.

## File / folder map

```
app/
  (public)/          ← RTL Urdu landing pages (root layout #1)
    page.tsx         ← home: list of active courses
    course/[slug]/   ← course landing page
  (admin)/           ← LTR English admin (root layout #2)
    admin/
      login/
      (protected)/   ← auth-required: dashboard, courses, leads, settings, account
  api/
    clicks/          ← public POST: record click + fire CAPI Lead
    admin/...        ← auth-protected CRUD endpoints
    auth/...         ← login, logout, change password
    capi/purchase/   ← server-side Purchase fire (also triggered from leads PATCH)
components/
  public/            ← hero, sections, WhatsApp button, sticky mobile CTA, FAQ
  admin/             ← sidebar, course editor tabs, leads table, settings form
  ui/                ← button, input, card, badge, label
lib/
  prisma.ts auth.ts capi.ts supabase.ts utils.ts admin-guard.ts course-sections.ts
prisma/
  schema.prisma seed.ts
middleware.ts        ← guards /admin/* and /api/admin/*
```

## Product decisions documented in code

- **Section labels** are stored on the `Course` model (eight `label*` fields)
  with matching `show*` boolean toggles, so each course can rename or hide
  any section without code changes (per the spec).
- **Section CRUD** for the six per-course collections (forYou, notForYou,
  learn, details, testimonials, faqs) is served by a single dynamic route
  at `/api/admin/courses/[id]/[section]/...` driven by
  `lib/course-sections.ts`. This avoids 18+ near-identical route files.
- **WhatsApp click recording** uses `navigator.sendBeacon` with a `fetch`
  fallback so the request survives the navigation to `wa.me`.
- **CAPI deduplication** uses our client-generated `tracking_id` (UUID v4)
  as the Meta `event_id` for both browser Pixel and server-side events.
- **Mobile sticky CTA** uses `IntersectionObserver` and hides itself when
  any inline WhatsApp button is in view to avoid double-CTA on screen.
- **Static generation**: the public course page uses `generateStaticParams`
  and `revalidate = 60` for fast loads + content updates within a minute.
- **Multiple root layouts**: `app/(public)/layout.tsx` is RTL Urdu;
  `app/(admin)/layout.tsx` is LTR English. Next.js supports this via
  route groups when there is no top-level `app/layout.tsx`.
