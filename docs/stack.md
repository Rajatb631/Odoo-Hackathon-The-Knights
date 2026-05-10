# Traveloop — Tech Stack

Single-repo Next.js full-stack app. Frontend, backend (server actions + route handlers), and DB layer all live in this codebase.

## Frontend

| Purpose | Tool | Version | Notes |
|---|---|---|---|
| Framework | Next.js | 16.2.6 | App Router, RSC, Server Actions. ⚠ Breaking changes from Next 15 — check `node_modules/next/dist/docs/` before coding |
| UI runtime | React | 19.2.4 | Concurrent features, `useOptimistic`, Actions |
| Language | TypeScript | ^5 | Strict mode |
| Styling | Tailwind CSS | ^4 | Via `@tailwindcss/postcss` |
| Component library | shadcn/ui | latest | Radix primitives + Tailwind. Install on demand: `pnpm dlx shadcn@latest add <component>` |
| Icons | lucide-react | latest | Bundled with shadcn |
| Forms | React Hook Form | latest | Client-side form state |
| Validation | Zod | latest | Shared schemas across client + server |
| RHF + Zod bridge | @hookform/resolvers | latest | |
| Charts | Recharts | latest | Budget pie/bar charts (Screen 9) |
| Dates | date-fns | latest | Day grouping, trip duration |
| Drag-and-drop | @dnd-kit/core + @dnd-kit/sortable | latest | Reorder stops in itinerary builder |
| Maps (optional) | Leaflet + react-leaflet | latest | OpenStreetMap, no API key |
| Toasts | sonner | latest | Success/error notifications |
| Client state | (none for MVP) | — | Server components first; add Zustand only if a client-only need emerges |

## Backend (in-repo, no separate service)

| Purpose | Tool | Notes |
|---|---|---|
| Server runtime | Next.js Server Actions + Route Handlers | All mutations via `'use server'` actions in `src/server/actions/*` |
| Auth | NextAuth.js (Auth.js v5) | Credentials provider for MVP; Google OAuth post-MVP |
| Password hashing | bcryptjs | + `@types/bcryptjs` |
| Session strategy | JWT (NextAuth default) | Stateless, no session table |
| Share tokens | nanoid | Public trip share URLs (`/share/[token]`) |
| File uploads | Stored in Postgres as `bytea` | Binary blobs in DB — single source of truth, works on Neon + local. Served via `/api/images/[id]` route handler with proper `Content-Type` |
| PDF export (post-MVP) | @react-pdf/renderer | Expense invoice screen |

## Database

| Purpose | Tool | Notes |
|---|---|---|
| RDBMS | PostgreSQL | 16+. Works with both local Postgres (Docker / installed) **and** NeonDB. Switch via `DATABASE_URL` in `.env` — Prisma client + connection string are identical for either |
| ORM | Prisma | Schema in `prisma/schema.prisma`. Migrations via `pnpm prisma migrate dev` |
| Seed | tsx + `prisma/seed.ts` | ~30 cities, ~50 activities seeded for search UIs |
| Connection pool | Prisma singleton in `src/lib/db.ts` | Dev hot-reload safe pattern |

### Schema overview
9 models: `User`, `Trip`, `Stop`, `Activity`, `StopActivity`, `City`, `PackingItem`, `Note`, `Expense`. Two enums: `Role`, `TripStatus`. Cascading deletes from `Trip` to its children. See `docs/plan.md` for full Prisma schema.

## Tooling / dev workflow

| Purpose | Tool |
|---|---|
| Package manager | pnpm 10.x |
| Linter | ESLint 9 (`eslint-config-next`) |
| Type-check | `pnpm tsc --noEmit` |
| Git hooks (optional) | husky + lint-staged |
| Env management | `.env` (gitignored) + `.env.example` |
| Hot reload | `next dev` |

## Deploy / infra

| Purpose | Tool |
|---|---|
| App hosting | Vercel |
| Postgres hosting | NeonDB (cloud) **or** local Postgres — driven by `DATABASE_URL` |
| File storage | Inside Postgres (`bytea` columns). No external object store |
| Domain | Vercel-provided subdomain for hackathon demo |
| CI | Vercel automatic preview deploys per PR |

## External services / APIs

| Service | Purpose | Required? |
|---|---|---|
| OpenStreetMap tiles | Map background | Optional, Phase 6+ |
| Google OAuth | Social login | Optional, post-MVP |
| Unsplash (manual) | Seed city/activity images | Optional, can use placeholders |

## Branching / collaboration

| What | How |
|---|---|
| Default working branch | `dev` |
| Release branch | `main` (untouched until demo) |
| Commits | No `Co-Authored-By` trailer |
| PR target | `dev` for features; `dev → main` for demo cut |

## What we're explicitly NOT using

- Redux / Jotai / Recoil — server components handle most state
- Express / Fastify / standalone backend — Next handles it
- MongoDB / Firebase — Postgres only
- Sequelize / Drizzle — Prisma only
- Material UI / Chakra / Ant — shadcn only
- Jest / Vitest in MVP — manual QA for the hackathon time-box
- Docker compose for app (Postgres only if local)
