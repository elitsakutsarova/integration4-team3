# MemoMe

Antwerp memory map and travel journal - React Router v7, Supabase, Leaflet/OpenFreeMap.

**Live demo:** https://memomeantwerp.vercel.app

---

## System requirements

| Requirement | Details |
|-------------|---------|
| **Computer** | macOS, Windows, or Linux |
| **Node.js** | **20 LTS** recommended (18.18+ minimum for Vite 8 / React Router 7) |
| **Package manager** | npm (`package-lock.json` included) |
| **Internet** | Required - maps, place search, auth, and fonts load from online services |
| **Browser** | Modern browser with **JavaScript enabled** (Chrome, Firefox, Safari, Edge) |
| **Optional** | OpenSSL - only for `npm run dev:lan` (self-signed HTTPS certs for phone testing) |
| **Optional (phone testing)** | Phone on the **same Wi‑Fi** as your dev machine |

The app does not run without JavaScript or without network access (maps, Supabase, geocoding).

---

## Environment variables (`.env`)

Copy the example file and fill in your values:

```bash
cd memome_app
cp .env.example .env.local
```

`.env` and `.env.local` are gitignored — **never commit real keys**.

| Variable | Required | Where to get it | Purpose |
|----------|----------|-----------------|---------|
| `VITE_APP_ORIGIN` | Yes | You set it | App base URL for links and QR codes |
| `VITE_SUPABASE_URL` | For real auth/data | Supabase → Project Settings → API | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | For real auth/data | Supabase → API Keys (publishable) | Client-side Supabase (safe with RLS) |
| `VITE_SUPABASE_ANON_KEY` | Alternative | Supabase → API Keys (legacy anon) | Same role as publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | For some account actions | Supabase → API Keys (**secret**) | Server-only: delete account, email change, password reset |
| `VITE_ALLOW_LAN` | Optional | Set to `true` for phone dev | Binds dev server to LAN |
| `PHOTON_API_URL` | Optional | Default: Komoot Photon | Override geocoding API base URL |

**Local HTTP (desktop only):**

```env
VITE_APP_ORIGIN=http://localhost:5173
```

**LAN + HTTPS (phone / QR sticker testing):**

```env
VITE_ALLOW_LAN=true
VITE_APP_ORIGIN=https://localhost:5173
```

Without Supabase env vars, the app falls back to a **local dev auth stub** (localStorage) - which is fine for UI work, not for production or shared data.

---

## Step-by-step guide

### First install

```bash
cd memome_app
npm install
cp .env.example .env.local
# Edit .env.local with your Supabase keys (see Online services below)
npm run dev
```

Open **http://localhost:5173**

### How to start

```bash
cd memome_app
npm run dev
```

| Command | When to use |
|---------|-------------|
| `npm run dev` | Normal local dev (HTTP, localhost) |
| `npm run dev:lan` | Test on phone / QR codes (HTTPS + LAN URLs) |
| `npm run certs:generate` | Create or regenerate self-signed TLS certs in `certs/` |
| `npm run build` | Production build |
| `npm start` | Run production build locally |

**Phone testing (stickers / collect QR):**

1. Set `VITE_ALLOW_LAN=true` in `.env.local`
2. Run `npm run dev:lan`
3. On your phone (same Wi‑Fi), open the network url shown in the terminal
4. Trust the dev certificate once (if prompted)
5. In the app: Profile → scan QRs

QR link (deployed): https://memomeantwerp.vercel.app/collect?scan=memme-collect

QR link (localhost): https://<your-lan-ip>:5173/collect?scan=memme-collect

---

## Online services and setup

### 1. Supabase (required for production)

**Uses:** sign-up/login, user profiles, memos, favourites, stickers, feedback, memo photo/video storage.

**Setup:**

1. Create a project at [supabase.com](https://supabase.com)
2. Copy **Project URL** and **publishable/anon key** into `.env.local`
3. Copy **service_role key** into `.env.local` as `SUPABASE_SERVICE_ROLE_KEY` (server only - never prefix with `VITE_`)
4. In Supabase → **SQL Editor**, run the SQL files from `memome_app/supabase/` **in this order** (copy/paste each file):

| Order | File | Notes |
|------:|------|-------|
| 1 | [`supabase/users.sql`](supabase/users.sql) | Auth-linked profiles + RLS |
| 2 | [`supabase/backfill-profiles.sql`](supabase/backfill-profiles.sql) | If you already have auth users |
| 3 | [`supabase/user-collections.sql`](supabase/user-collections.sql) | Saved memos / discover favourites |
| 4 | [`supabase/feedback.sql`](supabase/feedback.sql) | Support form submissions |
| 5 | [`supabase/migrate-drop-legacy-sticker-tables.sql`](supabase/migrate-drop-legacy-sticker-tables.sql) | **Only** when upgrading an old schema |
| 6 | [`supabase/stickers.sql`](supabase/stickers.sql) | Digital sticker collectibles |
| 7 | [`supabase/sync-digital-stickers-catalog.sql`](supabase/sync-digital-stickers-catalog.sql) | After adding new sticker PNGs |
| 8 | [`supabase/memos.sql`](supabase/memos.sql) | Public map memos |
| 9 | [`supabase/memo-media.sql`](supabase/memo-media.sql) | Storage bucket for memo media |
| 10 | [`supabase/migrate-memos-place-id.sql`](supabase/migrate-memos-place-id.sql) | Photon place IDs on memos |
| 11 | [`supabase/migrate-memos-author-role.sql`](supabase/migrate-memos-author-role.sql) | Author role on memos |
| 12 | [`supabase/migrate-memos-update.sql`](supabase/migrate-memos-update.sql) | Memo edit support |

**Run only if needed:**

| File | When |
|------|------|
| [`supabase/fix-users-rls.sql`](supabase/fix-users-rls.sql) | Profile save fails with RLS errors |
| [`supabase/fix-handle-new-user.sql`](supabase/fix-handle-new-user.sql) | Signup/profile trigger issues |
| [`supabase/resolve-login-email.sql`](supabase/resolve-login-email.sql) | Username login problems |
| [`supabase/migrate-fix-sticker-duplicates.sql`](supabase/migrate-fix-sticker-duplicates.sql) | Duplicate sticker rows |

**Auth dashboard (recommended):**

- Authentication → Providers → enable Email
- Set Site URL and redirect URLs for your dev origin (`http://localhost:5173` or your LAN HTTPS URL)
- Configure email templates if you use confirmation emails

There is no Supabase CLI config in this repo - the schema is applied by pasting the SQL files above into the SQL Editor itself.

---

### 2. Photon / Komoot geocoding (no account needed)

**Powers:** place search in Search and Add Memo location picker (Antwerp only).

- Proxied through `/api/location-search` (rate limited: 30 requests/min per IP)
- Default upstream: `https://photon.komoot.io/api/`
- Optional override: `PHOTON_API_URL` in `.env.local`
- No API key or signup — public fair-use service

---

### 3. OpenStreetMap / OpenFreeMap (no setup)

**Powers:** map tiles on the home map and location picker.

- Tiles load from public CDNs (OpenFreeMap default, OSM fallback)
- No keys required

---

### 4. Overpass API (no setup)

**Powers:** optional place hero images via `/api/place-image`.

- Uses public `overpass-api.de`
- No keys required

---

### 5. Google Fonts (no setup)

Loaded from `fonts.googleapis.com` (Space Grotesk, Playfair Display, Press Start 2P). App fonts (SunAntwerpen, Antwerpen) are bundled under `public/fonts/`.

---

### 6. Vercel (production hosting)

**Deployed app:** https://memomeantwerp.vercel.app

Deploy settings in [`vercel.json`](vercel.json):

- Install: `npm install`
- Build: `npm run build`
- Output: `build/server`

Set the same env vars in Vercel → Project → Settings → Environment Variables (`VITE_*` and `SUPABASE_SERVICE_ROLE_KEY`).

---

## Project layout

```
memome_app/
├── app/              # React Router routes, components, utils
├── public/           # Static assets (stickers, fonts, images)
├── supabase/         # SQL to run in Supabase SQL Editor
├── scripts/          # Dev cert generator, CSS split, etc.
├── .env.example      # Template for local env
└── package.json
```

---

## Troubleshooting

| Problem | Check |
|---------|--------|
| Login/signup does nothing | `VITE_SUPABASE_URL` + publishable/anon key in `.env.local`; restart dev server |
| Email/password change fails | `SUPABASE_SERVICE_ROLE_KEY` set (server-only, not `VITE_*`) |
| Place search empty | Internet connection; search is Antwerp-only; HTTP 429 = wait a minute |
| QR scan fails on phone | Use `npm run dev:lan`, same Wi‑Fi, trust HTTPS cert |
| Blank page | JavaScript must be enabled |

---

## Further documentation

Team process notes, test history, and security write-up: [`../process_diary.md`](process_diary.md)
