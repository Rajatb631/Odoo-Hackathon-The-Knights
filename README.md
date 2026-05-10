# Traveloop

> A modern full-stack travel-planning workspace — multi-city itineraries, budgets,
> packing checklists, journals, and a community feed, all in one place.

Built for the **Odoo Hackathon** (team **The Knights**) on Next.js 16 + React 19 + Prisma + PostgreSQL.

---

## Screens

| | |
|---|---|
| ![Landing hero](docs/ss/Screenshot%202026-05-10%20171030.png) | ![Login](docs/ss/Screenshot%202026-05-10%20171043.png) |
| **Landing** — full-bleed hero with CTAs into the app | **Login** — split layout, glass form, value-prop side panel |
| ![Dashboard](docs/ss/Screenshot%202026-05-10%20171111.png) | ![Trip detail](docs/ss/Screenshot%202026-05-10%20171132.png) |
| **Dashboard** — welcome stats and recent trips | **Trip detail** — budget breakdown (pie + bar) and itinerary |
| ![City search](docs/ss/Screenshot%202026-05-10%20171145.png) | ![Admin](docs/ss/Screenshot%202026-05-10%20171204.png) |
| **City search** — browse and add cities to a trip | **Admin** — platform stats, status bars, top lists |

---

## Table of contents

1. [Local setup](#local-setup)
2. [Environment variables](#environment-variables)
3. [Database & seeding](#database--seeding)
4. [Features](#features)
5. [Architecture at a glance](#architecture-at-a-glance)
6. [Tech stack](#tech-stack)
7. [Project structure](#project-structure)
8. [Data model](#data-model)
9. [Server actions & route handlers](#server-actions--route-handlers)
10. [Authentication & RBAC](#authentication--rbac)
11. [App routes overview](#app-routes-overview)
12. [Common scripts](#common-scripts)
13. [Deployment](#deployment)
14. [Roadmap](#roadmap)

---

## Local setup

### Prerequisites

- **Node.js** ≥ 20
- **pnpm** ≥ 9 (`npm i -g pnpm`)
- **PostgreSQL 16** — local Docker, native install, or a free [Neon](https://neon.tech) database

### 1 — Clone

```bash
git clone https://github.com/Rajatb631/Odoo-Hackathon-The-Knights.git traveloop
cd traveloop
```

### 2 — Install

```bash
pnpm install
```

### 3 — Configure environment from `.env.example`

The repo ships an **`.env.example`** at the project root that documents every variable
the app reads, with inline comments and example connection strings for both local
Postgres and Neon. **Copy it to `.env` and fill in the blanks — do not commit `.env`**
(the repo's `.gitignore` already covers it via `.env*` with a `!.env.example` exception):

```bash
# macOS / Linux
cp .env.example .env

# Windows PowerShell
Copy-Item .env.example .env
```

Then open `.env` in your editor. At minimum you need to set:

- `DATABASE_URL` — from step 4 below
- `NEXTAUTH_SECRET` — generate one with:
  ```bash
  openssl rand -base64 32
  ```
- `NEXTAUTH_URL` — leave as `http://localhost:3000` for local dev

See the full table in [Environment variables](#environment-variables) for everything else.

### 4 — Provision Postgres

**Option A — Docker (recommended for local dev):**

```bash
docker run --name traveloop-pg -e POSTGRES_PASSWORD=dev \
  -e POSTGRES_DB=traveloop -p 5432:5432 -d postgres:16
```

Then in `.env`:

```env
DATABASE_URL="postgresql://postgres:dev@localhost:5432/traveloop"
```

**Option B — Neon (serverless, no install):**

Create a project on [neon.tech](https://neon.tech), copy the pooled and direct URLs, and use:

```env
DATABASE_URL="postgresql://USER:PASS@ep-xxx-pooler.region.neon.tech/traveloop?sslmode=require"
DIRECT_URL="postgresql://USER:PASS@ep-xxx.region.neon.tech/traveloop?sslmode=require"
```

### 5 — Apply migrations

```bash
pnpm prisma migrate deploy        # production-style
# OR for active development:
pnpm prisma migrate dev
```

### 6 — Seed (optional but recommended)

```bash
pnpm prisma db seed
```

This loads cities, activities, demo trips, and admin users from `docs/dataset/*.csv` so the app isn't empty on first run.

### 7 — Run

```bash
pnpm dev
```

The app boots at <http://localhost:3000>.

---

## Environment variables

> The canonical reference is **`.env.example`** in the project root — every variable
> below has an inline comment there with example values. The table is a quick lookup.

| Var | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | ✅ | Postgres connection string used by Prisma at runtime |
| `DIRECT_URL` | ⚠ Neon only | Non-pooled connection used for migrations. Set when `DATABASE_URL` points at PgBouncer / Neon's pooler |
| `NEXTAUTH_SECRET` | ✅ | JWT signing secret. Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | ✅ in prod | Public URL of the app (e.g. `https://traveloop.vercel.app`) |
| `AUTH_SECRET` / `AUTH_URL` / `AUTH_TRUST_HOST` | optional | Aliases honored by Auth.js v5 |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | optional | Enables Google OAuth (disabled by default) |
| `NODE_ENV` | implicit | `development` / `production` |

> ⚠ Never commit `.env`. The repo's `.gitignore` already excludes `.env*` (with `!.env.example` exception).

---

## Database & seeding

The seed flow expects CSVs in `docs/dataset/`. The main entrypoints:

- **`pnpm prisma db seed`** runs `prisma/seed.ts` which orchestrates everything — users, cities, activities, trips, stops, sample expenses, packing items, notes.
- **`pnpm tsx prisma/load-dataset.ts`** — bulk-load just the catalog CSVs (cities, activities) without rewriting demo trips.
- **`pnpm tsx prisma/load-images.ts`** — import images from `docs/photos/` into the `Image` table so they can be served via `/api/images/[id]`.
- **`pnpm tsx prisma/backfill-images.ts`** — repair tool: links existing trips/users to imported images.
- **`pnpm tsx prisma/fix-passwords.ts`** — one-off helper for re-hashing seed passwords.

Reset everything (⚠ **destructive**):

```bash
pnpm prisma migrate reset
```

---

## Features

| Domain | Capabilities |
|---|---|
| **Auth** | Email + password (Auth.js v5 credentials), JWT sessions, role-based access (`USER`, `ADMIN`) |
| **Trips** | Multi-city itineraries with stops, day-grouped activities, status badges (`UPCOMING` / `ONGOING` / `COMPLETED`), cover images, public share links |
| **Builder** | Add/reorder stops, attach activities, edit dates, drag friendly UX |
| **Budget & expenses** | Per-stop budget, per-trip cap, category breakdown, pie + bar charts (Recharts), over-budget warnings |
| **Notes & packing** | Markdown-light notes per stop, packing checklists with packed/unpacked state |
| **Search** | City + activity catalog with filters and 1-click "Add to trip" |
| **Community** | Public trips feed, likes |
| **Admin** | Platform-wide stat tiles, trips-by-status bars, top cities/activities, recent signups |
| **Profile** | Avatar upload, name/email editing |
| **Sharing** | Read-only public route at `/share/[id]` for trips marked public |

---

## Architecture at a glance

```
┌────────────────────────────────────────────────────────────────────┐
│  Browser  (Next.js 16 / React 19 — App Router, RSC, Server Actions)│
│                                                                    │
│   Pages (RSC)            Client islands           Forms / charts   │
│   ───────────            ──────────────           ──────────────   │
│   src/app/(auth)/*       src/components/*         RHF + Zod        │
│   src/app/(app)/*        Navbar, dialogs          Recharts         │
│   src/app/share/*        TripsCarousel, etc.      Sonner toasts    │
└──────────────┬─────────────────────────────┬──────────────────────┘
               │                             │
               │ Server Actions ('use server') / Route Handlers
               ▼                             ▼
┌────────────────────────────────────────────────────────────────────┐
│  Server  (same Next.js process — no separate API service)          │
│                                                                    │
│   src/lib/auth.ts             ← NextAuth (Auth.js v5) config       │
│   src/server/actions/*        ← Mutations (auth, trips, stops,     │
│                                 expenses, notes, packing, search,  │
│                                 community, profile)                │
│   src/lib/db.ts               ← Prisma client (singleton)          │
│   src/app/api/*               ← Image upload + auth callbacks      │
│   src/lib/server-action-utils ← `safeAction()` error envelope      │
└──────────────┬─────────────────────────────────────────────────────┘
               │ Prisma ORM
               ▼
┌────────────────────────────────────────────────────────────────────┐
│  PostgreSQL  (local Docker / NeonDB serverless)                    │
│  Tables: User, Trip, Stop, Activity, StopActivity, City, Like,     │
│          PackingItem, Note, Expense, Image, Account, Session       │
└────────────────────────────────────────────────────────────────────┘
```

**Key decisions**

- **Server Components first.** Pages are RSC by default; client interactivity is opt-in (Navbar, forms, dialogs, charts).
- **Server Actions over a separate API.** All mutations are typed `'use server'` functions in `src/server/actions/*`. No `/api/v1/*` REST surface to maintain.
- **Zod schemas live in `src/lib/validations/`** and are reused by RHF on the client and `safeAction()` on the server — one source of truth for shape and constraints.
- **Standard error envelope.** Server actions return `{ ok: true, data } | { ok: false, error }` via `safeAction()` so the UI can `if (!res.ok) toast.error(res.error)` everywhere.
- **Role-based access at layout level.** `(app)/layout.tsx` redirects unauthenticated users; `(app)/admin/page.tsx` 404s for non-admins.

---

## Tech stack

### Frontend
- **Next.js 16.2.6** — App Router, React Server Components, Server Actions, Turbopack dev server
- **React 19.2.4** — concurrent features, `useTransition`, Actions
- **TypeScript 5**
- **Tailwind CSS 4** (via `@tailwindcss/postcss`)
- **shadcn/ui** + **Radix UI** primitives
- **lucide-react** — icon set
- **React Hook Form** + **Zod** + `@hookform/resolvers` — forms + validation
- **Recharts** — budget pie / bar / reference-line charts
- **date-fns** — date math and formatting
- **sonner** — toasts
- **next/font/google** — Geist (default), Poppins, Permanent Marker, Boldonse (landing display fonts)

### Backend
- **Next.js Server Actions** + **Route Handlers** (`src/app/api/*`)
- **NextAuth.js (Auth.js v5)** — credentials provider, JWT sessions, Prisma adapter
- **bcryptjs** — password hashing
- **Prisma 7** ORM with the **`@prisma/adapter-pg`** driver
- **node-postgres (`pg`)** — Postgres driver

### Database
- **PostgreSQL 16** (local Docker, native install, or **NeonDB** serverless)

### Tooling
- **pnpm** — package manager
- **ESLint 9** with `eslint-config-next`
- **tsx** — TypeScript runner for seed/import scripts
- **csv-parse** — bulk-load helpers in `prisma/load-*.ts`

---

## Project structure

```
.
├── prisma/
│   ├── schema.prisma          # Data model (12 tables + 2 enums)
│   ├── migrations/            # Versioned SQL migrations
│   ├── seed.ts                # `prisma db seed` entry
│   ├── load-dataset.ts        # Bulk import from docs/dataset/*.csv
│   ├── load-images.ts         # Import binary images into Image table
│   ├── backfill-images.ts     # Repair script
│   └── fix-passwords.ts       # Migration helper
│
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout (fonts, providers, html shell)
│   │   ├── page.tsx           # Landing page (public)
│   │   ├── globals.css        # Tailwind + theme tokens + utilities
│   │   │
│   │   ├── (auth)/            # Public auth routes (own layout)
│   │   │   ├── layout.tsx
│   │   │   ├── login/
│   │   │   └── register/
│   │   │
│   │   ├── (app)/             # Protected app routes — auth-gated
│   │   │   ├── layout.tsx     # Redirects to /login if no session
│   │   │   ├── dashboard/
│   │   │   ├── trips/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx        # Trip overview
│   │   │   │       ├── builder/        # Itinerary builder
│   │   │   │       ├── expenses/       # Budget + expense ledger
│   │   │   │       ├── notes/          # Stop notes
│   │   │   │       └── packing/        # Packing checklist
│   │   │   ├── search/
│   │   │   │   ├── cities/
│   │   │   │   └── activities/
│   │   │   ├── community/     # Public-trips feed
│   │   │   ├── profile/       # Account + avatar
│   │   │   └── admin/         # Admin-only dashboard
│   │   │
│   │   ├── share/[id]/        # Public read-only trip view
│   │   │
│   │   └── api/
│   │       ├── auth/[...nextauth]/   # Auth.js handlers
│   │       └── images/[id]/          # Streams images from DB
│   │
│   ├── components/
│   │   ├── ui/                # shadcn primitives (Button, Card, Dialog, …)
│   │   ├── nav/               # Navbar
│   │   ├── trip/              # TripCard, ItineraryView, StopEditor, StopActions, EditTripDialog
│   │   ├── budget/            # BudgetChart
│   │   ├── expenses/          # ExpenseChart, ExpenseForm, DeleteExpenseButton
│   │   ├── notes/             # NoteComposer, DeleteNoteButton
│   │   ├── packing/           # PackingList
│   │   ├── search/            # City / activity browse + filters
│   │   ├── community/         # Feed, like button
│   │   ├── profile/           # ProfileForm, avatar upload
│   │   ├── landing/           # TripsCarousel and other landing-only widgets
│   │   └── providers.tsx      # Session + Toaster providers
│   │
│   ├── lib/
│   │   ├── auth.ts            # NextAuth config
│   │   ├── db.ts              # Prisma client singleton
│   │   ├── forms.ts           # RHF helpers
│   │   ├── itinerary.ts       # Day-grouping / cost utilities
│   │   ├── server-action-utils.ts  # `safeAction()`
│   │   ├── utils.ts           # `cn()` and misc
│   │   └── validations/       # Zod schemas (auth, trips, stops, …)
│   │
│   └── server/
│       └── actions/           # Server actions (one file per domain)
│           ├── auth.ts
│           ├── community.ts
│           ├── expenses.ts
│           ├── notes.ts
│           ├── packing.ts
│           ├── profile.ts
│           ├── search.ts
│           ├── stops.ts
│           └── trips.ts
│
├── public/                    # Static assets (logos, landing imagery)
├── docs/                      # Design notes, dataset CSVs, screenshots
│   ├── ss/                    # README screenshots
│   ├── stack.md               # Detailed stack notes
│   ├── plan.md                # Build plan
│   ├── dataset/               # Seed CSVs
│   └── photos/                # Image assets for seed
│
├── .env.example
├── components.json            # shadcn config
├── next.config.ts
├── prisma.config.ts
├── tsconfig.json
└── package.json
```

---

## Data model

Defined in `prisma/schema.prisma`. The **bold** entities are the ones you'll touch most:

```
User ─┬─< Trip ─┬─< Stop ─┬─< StopActivity >─ Activity
      │         │         ├─< PackingItem
      │         │         ├─< Note
      │         │         └─< Expense
      │         ├─ City (FK on Stop)
      │         └─< Like
      ├─< Image (also referenced by User.photoId, Trip.coverImageId)
      ├─ Account            (Auth.js)
      └─ Session            (Auth.js)
```

Twelve tables total: `User`, `Account`, `Session`, `VerificationToken`, `Trip`, `Stop`, `City`, `Activity`, `StopActivity`, `PackingItem`, `Note`, `Expense`, `Image`, `Like`, plus enums `Role` (`USER` | `ADMIN`) and `TripStatus` (`UPCOMING` | `ONGOING` | `COMPLETED`).

---

## Server actions & route handlers

Mutations live in `src/server/actions/*` as `'use server'` functions. They follow a consistent pattern:

```ts
// src/server/actions/expenses.ts
'use server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { expenseSchema } from '@/lib/validations/expenses'

export async function createExpense(input: unknown) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')
  const data = expenseSchema.parse(input)              // 1. validate
  const expense = await prisma.expense.create({...})    // 2. mutate
  revalidatePath(`/trips/${data.tripId}/expenses`)      // 3. invalidate
  return expense
}
```

Client components wrap these calls with `safeAction()` (`src/lib/server-action-utils.ts`) so errors become `{ ok: false, error }` envelopes that toast nicely:

```tsx
const res = await safeAction(() => deleteExpense(id))
if (!res.ok) toast.error(res.error)
```

Two route handlers live under `src/app/api/`:
- **`/api/auth/[...nextauth]`** — Auth.js handlers
- **`/api/images/[id]`** — streams binary images stored in the `Image` table back to the browser (used by `<img src="/api/images/{id}" />`)

---

## Authentication & RBAC

- **Provider:** `Credentials` (email + password). Optional Google OAuth is wired but disabled by default.
- **Sessions:** JWT (Auth.js v5 default), validated server-side via `auth()` from `src/lib/auth.ts`.
- **Hashing:** `bcryptjs`.
- **Gating:**
  - `(auth)` route group — public; users with a session are redirected to `/dashboard`.
  - `(app)` route group — `layout.tsx` calls `auth()` and `redirect("/login")` if missing.
  - `(app)/admin` — `notFound()` for non-admins so the route's existence is hidden.
- **Self-hosted-friendly:** no third-party identity service required for MVP.

---

## App routes overview

| Path | Auth | Description |
|---|---|---|
| `/` | public | Landing page |
| `/login`, `/register` | public | Auth forms (redirect to `/dashboard` if signed in) |
| `/dashboard` | user | Welcome + recent trips + stats |
| `/trips` | user | All your trips |
| `/trips/new` | user | Create-trip form |
| `/trips/[id]` | user (owner) | Trip overview + budget |
| `/trips/[id]/builder` | user (owner) | Itinerary builder |
| `/trips/[id]/expenses` | user (owner) | Per-stop expenses + chart |
| `/trips/[id]/notes` | user (owner) | Stop notes |
| `/trips/[id]/packing` | user (owner) | Packing checklist |
| `/search/cities` | user | City catalog with country/popularity filters |
| `/search/activities` | user | Activity catalog with type filter |
| `/community` | user | Public-trips feed |
| `/profile` | user | Edit profile + avatar |
| `/admin` | admin | Platform stats and moderation surfaces |
| `/share/[id]` | public | Read-only trip view (when trip is marked public) |
| `/api/images/[id]` | public | Streams an Image row's bytes |

---

## Common scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Next.js dev server with Turbopack |
| `pnpm build` | Production build |
| `pnpm start` | Run the production build |
| `pnpm lint` | ESLint |
| `pnpm exec tsc --noEmit` | Type-check without emitting |
| `pnpm prisma generate` | Regenerate Prisma client (run after editing `schema.prisma`) |
| `pnpm prisma migrate dev` | Create + apply a migration in dev |
| `pnpm prisma migrate deploy` | Apply migrations in prod |
| `pnpm prisma studio` | DB browser GUI |
| `pnpm prisma db seed` | Load seed data |

---

## Deployment

Recommended stack:

| Service | Platform |
|---|---|
| App | **Vercel** (Next.js native) |
| Database | **NeonDB** (serverless Postgres) |
| Image storage | Currently in-DB via the `Image` table; future: S3/R2 |

Deploy steps:

1. Push the repo to GitHub.
2. Import on Vercel and set the env vars listed above.
3. Add a Neon database, copy `DATABASE_URL` (pooled) and `DIRECT_URL` (direct).
4. The Vercel build runs `prisma generate` automatically; you'll need to run `pnpm prisma migrate deploy` against Neon at least once.

Pre-deploy checklist:

- [ ] `pnpm build` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm exec tsc --noEmit` passes
- [ ] Login + register work end-to-end
- [ ] Trip CRUD + share link works
- [ ] Migrations applied against the prod DB

---

## Roadmap

- AI-assisted itinerary generation (LLM integration)
- Real-time collaboration on trips (CRDT or Liveblocks)
- Native mobile (React Native / Expo)
- Export trip as PDF
- Map view with Leaflet + OpenStreetMap
- Currency conversion in the expense ledger
- Offline-capable PWA shell

---

## Team

Built for the **Odoo Hackathon** by **The Knights**.

Contributions welcome — fork, branch, PR.
