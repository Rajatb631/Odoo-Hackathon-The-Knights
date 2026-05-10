import { notFound } from "next/navigation"
import { format } from "date-fns"
import {
  Users,
  Plane,
  Building2,
  Sparkles,
  Heart,
  ShieldCheck,
  ArrowUpRight,
} from "lucide-react"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export default async function AdminPage() {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") notFound()

  const [
    userTotal,
    usersByRole,
    tripTotal,
    tripsByStatus,
    cityTotal,
    activityTotal,
    likeTotal,
    topCityCounts,
    topActivityCounts,
    recentUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.groupBy({ by: ["role"], _count: { _all: true } }),
    prisma.trip.count(),
    prisma.trip.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.city.count(),
    prisma.activity.count(),
    prisma.like.count(),
    prisma.stop.groupBy({
      by: ["cityId"],
      _count: { _all: true },
      orderBy: { _count: { cityId: "desc" } },
      take: 5,
    }),
    prisma.stopActivity.groupBy({
      by: ["activityId"],
      _count: { _all: true },
      orderBy: { _count: { activityId: "desc" } },
      take: 5,
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { id: true, firstName: true, lastName: true, email: true, createdAt: true, role: true },
    }),
  ])

  const cityIds = topCityCounts.map((r) => r.cityId)
  const activityIds = topActivityCounts.map((r) => r.activityId)
  const [cities, activities] = await Promise.all([
    prisma.city.findMany({ where: { id: { in: cityIds } }, select: { id: true, name: true, country: true } }),
    prisma.activity.findMany({ where: { id: { in: activityIds } }, select: { id: true, name: true, type: true } }),
  ])
  const cityMap = new Map(cities.map((c) => [c.id, c]))
  const activityMap = new Map(activities.map((a) => [a.id, a]))

  const adminCount = usersByRole.find((r) => r.role === "ADMIN")?._count._all ?? 0
  const upcoming = tripsByStatus.find((t) => t.status === "UPCOMING")?._count._all ?? 0
  const ongoing = tripsByStatus.find((t) => t.status === "ONGOING")?._count._all ?? 0
  const completed = tripsByStatus.find((t) => t.status === "COMPLETED")?._count._all ?? 0
  const maxCity = Math.max(1, ...topCityCounts.map((r) => r._count._all))
  const maxActivity = Math.max(1, ...topActivityCounts.map((r) => r._count._all))

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-700" />
            <span className="text-xs font-semibold text-sky-700 tracking-wide">Admin</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Platform overview</h1>
          <p className="text-muted-foreground mt-1">Read-only stats across users, trips, and content.</p>
        </div>
      </header>

      {/* Stat cards */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard icon={Users} label="Users" value={userTotal} accent="sky" />
        <StatCard icon={Plane} label="Trips" value={tripTotal} accent="blue" />
        <StatCard icon={Building2} label="Cities" value={cityTotal} accent="indigo" />
        <StatCard icon={Sparkles} label="Activities" value={activityTotal} accent="violet" />
        <StatCard icon={Heart} label="Likes" value={likeTotal} accent="rose" />
        <StatCard icon={ShieldCheck} label="Admins" value={adminCount} accent="emerald" />
      </section>

      {/* Trip status breakdown */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold tracking-tight">Trips by status</h2>
            <p className="text-sm text-muted-foreground">Snapshot of every trip on the platform.</p>
          </div>
          <span className="text-xs font-medium text-muted-foreground tabular-nums">{tripTotal} total</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatusBar label="Upcoming" value={upcoming} total={tripTotal} color="bg-sky-500" />
          <StatusBar label="Ongoing" value={ongoing} total={tripTotal} color="bg-emerald-500" />
          <StatusBar label="Completed" value={completed} total={tripTotal} color="bg-slate-500" />
        </div>
      </section>

      {/* Two-column lists */}
      <section className="grid md:grid-cols-2 gap-5">
        <RankedList
          title="Top cities"
          subtitle="Ranked by stops added"
          empty="No cities yet."
          rows={topCityCounts.map((r) => {
            const c = cityMap.get(r.cityId)
            return {
              key: r.cityId,
              primary: c?.name ?? "Unknown",
              secondary: c?.country ?? "",
              count: r._count._all,
              max: maxCity,
            }
          })}
        />
        <RankedList
          title="Top activities"
          subtitle="Ranked by stop assignments"
          empty="No activities yet."
          rows={topActivityCounts.map((r) => {
            const a = activityMap.get(r.activityId)
            return {
              key: r.activityId,
              primary: a?.name ?? "Unknown",
              secondary: a?.type ?? "",
              count: r._count._all,
              max: maxActivity,
            }
          })}
        />
      </section>

      {/* Recent signups */}
      <section className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="flex items-end justify-between p-6 pb-4">
          <div>
            <h2 className="text-lg font-bold tracking-tight">Recent signups</h2>
            <p className="text-sm text-muted-foreground">Latest users to join the platform.</p>
          </div>
        </div>
        <ul className="divide-y divide-border">
          {recentUsers.length === 0 ? (
            <li className="px-6 py-6 text-sm text-muted-foreground">No users yet.</li>
          ) : (
            recentUsers.map((u) => {
              const initials = `${u.firstName?.[0] ?? ""}${u.lastName?.[0] ?? ""}`.toUpperCase() || "U"
              return (
                <li key={u.id} className="flex items-center gap-4 px-6 py-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-brand flex items-center justify-center text-xs font-semibold text-white shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm truncate">
                      {u.firstName} {u.lastName}
                      {u.role === "ADMIN" && (
                        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide bg-sky-500/10 text-sky-700 border border-sky-500/25">
                          ADMIN
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                  </div>
                  <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                    {format(u.createdAt, "MMM d, yyyy")}
                  </span>
                </li>
              )
            })
          )}
        </ul>
      </section>
    </div>
  )
}

const ACCENTS = {
  sky: "bg-sky-500/10 text-sky-700",
  blue: "bg-blue-500/10 text-blue-700",
  indigo: "bg-indigo-500/10 text-indigo-700",
  violet: "bg-violet-500/10 text-violet-700",
  rose: "bg-rose-500/10 text-rose-700",
  emerald: "bg-emerald-500/10 text-emerald-700",
} as const

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Users
  label: string
  value: number
  accent: keyof typeof ACCENTS
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 hover:border-sky-500/40 hover:shadow-md hover:shadow-sky-500/5 transition-all">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${ACCENTS[accent]}`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="mt-3 text-2xl font-extrabold tracking-tight tabular-nums">{value.toLocaleString()}</p>
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
    </div>
  )
}

function StatusBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold">{label}</span>
        <span className="text-sm text-muted-foreground tabular-nums">
          {value} <span className="text-xs">· {pct}%</span>
        </span>
      </div>
      <div className="h-2 rounded-full bg-secondary overflow-hidden">
        <div className={`h-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

type Row = { key: string; primary: string; secondary: string; count: number; max: number }

function RankedList({
  title,
  subtitle,
  empty,
  rows,
}: {
  title: string
  subtitle: string
  empty: string
  rows: Row[]
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-end justify-between mb-5">
        <div>
          <h3 className="text-base font-bold tracking-tight">{title}</h3>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ol className="space-y-3">
          {rows.map((r, i) => {
            const pct = (r.count / r.max) * 100
            return (
              <li key={r.key} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded-md bg-secondary flex items-center justify-center text-[10px] font-bold tabular-nums text-muted-foreground shrink-0">
                      {i + 1}
                    </span>
                    <span className="font-semibold truncate">{r.primary}</span>
                    {r.secondary && (
                      <span className="text-xs text-muted-foreground truncate">· {r.secondary}</span>
                    )}
                  </span>
                  <span className="font-bold tabular-nums shrink-0 ml-2">{r.count}</span>
                </div>
                <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full bg-gradient-brand" style={{ width: `${pct}%` }} />
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
