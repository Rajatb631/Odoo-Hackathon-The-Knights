# Traveloop — Implementation Plan

> Stack chosen: **Next.js + Postgres**. Scope: plan covers **all 14 screens**; MVP subset called out separately.
> On approval, this file is copied to `docs/plan.md` in the repo.

## Context
Odoo Hackathon problem: build **Traveloop** — a personalized multi-city travel planning app. Users create trips with stops, activities, dates, budgets; visualize itineraries; track packing + journal; share publicly. Repo currently empty (README + spec PDF + SVG mockups). Branch `dev` is checked out and clean.

## Tech stack
- **Framework:** Next.js 15 (App Router, Server Actions, RSC)
- **Language:** TypeScript
- **DB:** PostgreSQL 16
- **ORM:** Prisma
- **Auth:** NextAuth (Credentials + optional Google OAuth)
- **UI:** Tailwind CSS + shadcn/ui (Radix primitives)
- **Forms / validation:** React Hook Form + Zod
- **Charts (budget screen):** Recharts
- **State:** Server components + minimal client state (Zustand only if needed)
- **Date:** date-fns
- **Maps (optional):** Leaflet + OpenStreetMap (no API key)
- **File uploads (cover photo, profile pic):** UploadThing or local `/public/uploads` for hackathon
- **Hosting:** Vercel (deploy) + Neon/Supabase Postgres (free tier)
- **Package manager:** pnpm

## Repository layout
```
.
├── docs/
│   └── plan.md                     # this plan
├── prisma/
│   ├── schema.prisma
│   └── seed.ts                     # seed cities + activity catalog
├── public/
│   └── uploads/                    # cover photos / avatars
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx              # Screen 1
│   │   │   └── register/page.tsx           # Screen 2 (SVG)
│   │   ├── (app)/
│   │   │   ├── dashboard/page.tsx          # Screen 3
│   │   │   ├── trips/
│   │   │   │   ├── page.tsx                # Screen 6 (list)
│   │   │   │   ├── new/page.tsx            # Screen 4 (create)
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx            # Screen 9 (itinerary view + budget)
│   │   │   │       ├── builder/page.tsx    # Screen 5 (builder)
│   │   │   │       ├── budget/page.tsx     # Screen 9 detail
│   │   │   │       ├── packing/page.tsx    # Screen 10/11 (checklist)
│   │   │   │       ├── notes/page.tsx      # Screen 13
│   │   │   │       └── expenses/page.tsx   # Screen 14 (SVG: invoice)
│   │   │   ├── search/
│   │   │   │   ├── cities/page.tsx         # Screen 7 (PDF) / 8 (SVG)
│   │   │   │   └── activities/page.tsx     # Screen 8 (PDF)
│   │   │   ├── community/page.tsx          # Screen 10 (SVG)
│   │   │   ├── profile/page.tsx            # Screen 12 (PDF) / 7 (SVG)
│   │   │   └── admin/page.tsx              # Screen 14 (PDF) / 12 (SVG) — optional
│   │   ├── share/[token]/page.tsx          # Screen 11 (PDF) — public read-only
│   │   ├── api/
│   │   │   └── auth/[...nextauth]/route.ts
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                     # shadcn primitives
│   │   ├── trip/                   # TripCard, StopEditor, ActivityBlock
│   │   ├── budget/                 # BudgetChart, CostBreakdown
│   │   └── nav/                    # Navbar, Sidebar
│   ├── lib/
│   │   ├── db.ts                   # Prisma client
│   │   ├── auth.ts                 # NextAuth config
│   │   ├── validations/            # Zod schemas
│   │   └── utils.ts
│   └── server/
│       └── actions/                # Server actions per resource
│           ├── trips.ts
│           ├── stops.ts
│           ├── activities.ts
│           ├── packing.ts
│           ├── notes.ts
│           └── expenses.ts
├── .env.example
├── package.json
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

## Data model (Prisma)

```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String?
  firstName    String
  lastName     String
  phone        String?
  city         String?
  country      String?
  photoUrl     String?
  bio          String?
  role         Role     @default(USER)
  createdAt    DateTime @default(now())
  trips        Trip[]
  notes        Note[]
}

enum Role { USER ADMIN }

model Trip {
  id          String    @id @default(cuid())
  ownerId     String
  owner       User      @relation(fields: [ownerId], references: [id])
  name        String
  description String?
  coverUrl    String?
  startDate   DateTime
  endDate     DateTime
  budget      Decimal?  // overall planned budget
  status      TripStatus @default(UPCOMING)
  isPublic    Boolean   @default(false)
  shareToken  String?   @unique
  createdAt   DateTime  @default(now())
  stops       Stop[]
  packingItems PackingItem[]
  notes       Note[]
  expenses    Expense[]
}

enum TripStatus { UPCOMING ONGOING COMPLETED }

model City {
  id         String   @id @default(cuid())
  name       String
  country    String
  region     String?
  costIndex  Int       // 1..10
  popularity Int       // 1..100
  imageUrl   String?
  stops      Stop[]
  activities Activity[]
  @@unique([name, country])
}

model Stop {
  id        String   @id @default(cuid())
  tripId    String
  trip      Trip     @relation(fields: [tripId], references: [id], onDelete: Cascade)
  cityId    String
  city      City     @relation(fields: [cityId], references: [id])
  startDate DateTime
  endDate   DateTime
  budget    Decimal?
  notes     String?
  order     Int
  stopActivities StopActivity[]
}

model Activity {
  id          String  @id @default(cuid())
  cityId      String?
  city        City?   @relation(fields: [cityId], references: [id])
  name        String
  type        String  // sightseeing, food, adventure...
  description String?
  cost        Decimal
  durationMin Int
  imageUrl    String?
  stopActivities StopActivity[]
}

model StopActivity {
  id         String   @id @default(cuid())
  stopId     String
  stop       Stop     @relation(fields: [stopId], references: [id], onDelete: Cascade)
  activityId String
  activity   Activity @relation(fields: [activityId], references: [id])
  scheduledAt DateTime?
  costOverride Decimal?
}

model PackingItem {
  id       String  @id @default(cuid())
  tripId   String
  trip     Trip    @relation(fields: [tripId], references: [id], onDelete: Cascade)
  label    String
  category String  // clothing, documents, electronics
  packed   Boolean @default(false)
}

model Note {
  id        String   @id @default(cuid())
  tripId    String
  trip      Trip     @relation(fields: [tripId], references: [id], onDelete: Cascade)
  authorId  String
  author    User     @relation(fields: [authorId], references: [id])
  stopId    String?
  body      String
  createdAt DateTime @default(now())
}

model Expense {
  id        String   @id @default(cuid())
  tripId    String
  trip     Trip     @relation(fields: [tripId], references: [id], onDelete: Cascade)
  category  String   // transport, stay, activities, meals, other
  label     String
  amount    Decimal
  date      DateTime
}
```

## Screen mapping → routes (all 14)
| # | Screen | Route | Source |
|---|---|---|---|
| 1 | Login | `/login` | PDF + SVG |
| 2 | Register | `/register` | SVG (PDF combines with login) |
| 3 | Dashboard / Landing | `/dashboard` | PDF + SVG |
| 4 | Create Trip | `/trips/new` | PDF + SVG |
| 5 | Itinerary Builder | `/trips/[id]/builder` | PDF + SVG |
| 6 | My Trips list | `/trips` | PDF + SVG |
| 7 | City Search | `/search/cities` | PDF |
| 8 | Activity Search | `/search/activities` | PDF + SVG |
| 9 | Itinerary View + Budget | `/trips/[id]` (+ `/budget`) | PDF + SVG |
| 10 | Community feed | `/community` | SVG |
| 11 | Packing Checklist | `/trips/[id]/packing` | PDF + SVG |
| 12 | User Profile / Settings | `/profile` | PDF + SVG |
| 13 | Trip Notes / Journal | `/trips/[id]/notes` | PDF + SVG |
| 14 | Expense / Invoice + Admin | `/trips/[id]/expenses`, `/admin` | PDF + SVG |
| — | Public shared trip | `/share/[token]` | PDF #11 |

## MVP (ship-first subset)
Goal: smallest demoable slice that proves the core value (multi-city itinerary with budget).
1. **Auth** — register + login (Credentials only; Google OAuth deferred)
2. **Dashboard** — welcome + recent trips + "Plan New Trip" CTA
3. **Create Trip** — name, dates, description
4. **My Trips list** — cards, basic filter
5. **Itinerary Builder** — add stops (city + dates + budget) + reorder
6. **Itinerary View** — day-wise grouped view with activity blocks
7. **Budget breakdown** — per-stop sum + chart
8. **Public share** — read-only link via shareToken

**Deferred (post-MVP):** city/activity search UIs (use seeded dropdown for MVP), packing checklist, trip notes, community feed, expenses/invoice, admin panel, profile editing UI, Google OAuth, file uploads (use URL string field).

## Implementation phases

### Phase 0 — Scaffolding (~30 min)
- `pnpm create next-app` (TS, Tailwind, App Router, src/, ESLint)
- Add Prisma, NextAuth, Zod, RHF, shadcn init, Recharts
- `.env.example` (DATABASE_URL, NEXTAUTH_SECRET)
- Prisma schema + first migration
- Seed script: ~30 cities, ~50 activities

### Phase 1 — Auth + shell (~1h)
- NextAuth Credentials provider + bcrypt
- `/register`, `/login` pages with RHF/Zod
- Protected layout `(app)` redirects unauthenticated users
- Navbar with profile dropdown

### Phase 2 — Trip CRUD (~1.5h)
- Server actions: `createTrip`, `listTrips`, `getTrip`, `updateTrip`, `deleteTrip`
- Pages: `/dashboard`, `/trips`, `/trips/new`, `/trips/[id]`
- TripCard component, status badges (computed from dates)

### Phase 3 — Itinerary builder + view (~2h)
- Stop CRUD server actions + reordering (`order` field)
- Builder UI: list of stop cards, "Add Stop" modal, drag handles
- Activity assignment via dropdown from seeded catalog
- View: grouped by city → day-wise activity timeline
- Calendar/list view toggle

### Phase 4 — Budget breakdown (~45 min)
- Aggregate stop budgets + activity costs server-side
- Recharts pie (by category) + bar (per-day)
- Over-budget highlight

### Phase 5 — Share (~30 min)
- "Make public" toggle generates `shareToken` (nanoid)
- `/share/[token]` reads trip read-only, no auth
- Copy-link button + "Copy Trip" (clones into authed user)

→ **MVP demo-ready** at end of Phase 5.

### Phase 6 — Search UIs (~1h)
- `/search/cities` + `/search/activities` with search/filter/group/sort (URL state)
- Add-to-trip from search

### Phase 7 — Packing + Notes (~1h)
- Packing checklist: server actions + checkboxes per category
- Notes journal: per-trip and per-stop, sorted by date

### Phase 8 — Expenses + Profile + Community (~1.5h)
- Expense entry + invoice page (PDF export via `@react-pdf/renderer` if time)
- Profile edit page (name, photo URL, bio, password change)
- Community: list of public trips, like/copy

### Phase 9 — Admin + polish (~1h)
- Admin route guarded by `role=ADMIN`
- Tables: top cities, top activities, user counts, trip counts
- Final polish: empty states, loading skeletons, error toasts

## Critical files to create
- `prisma/schema.prisma` — data model above
- `prisma/seed.ts` — cities + activities catalog
- `src/lib/auth.ts` — NextAuth config
- `src/lib/db.ts` — Prisma singleton
- `src/server/actions/trips.ts` — trip CRUD
- `src/server/actions/stops.ts` — stop CRUD + reorder
- `src/components/trip/StopEditor.tsx` — core builder UI
- `src/components/budget/BudgetChart.tsx` — Recharts wrapper
- `src/app/share/[token]/page.tsx` — public read-only

## Reusable utilities to leverage
- shadcn/ui primitives (Button, Card, Dialog, Form, Input, Select, Tabs, Calendar)
- date-fns for date math (trip duration, day grouping)
- NextAuth `auth()` helper for server-side session

## Verification
- **Auth flow:** register → login → access `/dashboard` → logout
- **Trip flow:** create trip → add 3 stops with dates → assign activities → view itinerary grouped by day → see budget chart
- **Share flow:** toggle public → open `/share/[token]` in incognito → confirm read-only
- **MVP gate:** `pnpm build` clean, manual run-through of Phases 1–5 in browser
- **DB integrity:** delete trip cascades stops/activities/notes/packing
- **Type safety:** `pnpm tsc --noEmit` clean
- **Lint:** `pnpm lint` clean

## Open items
- Confirm hackathon allows non-Odoo stack (PDF doesn't mandate it; Odoo branding only on title page)
- Confirm time budget — current plan ~9h all phases, ~5h MVP
- Confirm team split (frontend/backend/db) — Next.js full-stack means everyone touches everything
- Confirm deployment target (Vercel + Neon recommended)
