import { notFound } from "next/navigation"
import { format } from "date-fns"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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
      take: 5,
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Admin dashboard</h1>
        <p className="text-muted-foreground">Read-only stats across the platform.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Users" value={userTotal} />
        <StatCard label="Trips" value={tripTotal} />
        <StatCard label="Cities" value={cityTotal} />
        <StatCard label="Activities" value={activityTotal} />
        <StatCard label="Likes" value={likeTotal} />
        <StatCard label="Admins" value={usersByRole.find((r) => r.role === "ADMIN")?._count._all ?? 0} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {(["UPCOMING", "ONGOING", "COMPLETED"] as const).map((s) => (
          <Card key={s}>
            <CardHeader>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">{s.toLowerCase()} trips</p>
              <CardTitle className="text-2xl">
                {tripsByStatus.find((t) => t.status === s)?._count._all ?? 0}
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Top 5 cities (by stops)</CardTitle></CardHeader>
          <CardContent>
            {topCityCounts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data.</p>
            ) : (
              <ol className="space-y-1 text-sm">
                {topCityCounts.map((r, i) => {
                  const c = cityMap.get(r.cityId)
                  return (
                    <li key={r.cityId} className="flex justify-between border-b py-1">
                      <span>{i + 1}. {c?.name ?? "?"}, {c?.country ?? ""}</span>
                      <span className="font-medium">{r._count._all}</span>
                    </li>
                  )
                })}
              </ol>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Top 5 activities (by stop assignments)</CardTitle></CardHeader>
          <CardContent>
            {topActivityCounts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data.</p>
            ) : (
              <ol className="space-y-1 text-sm">
                {topActivityCounts.map((r, i) => {
                  const a = activityMap.get(r.activityId)
                  return (
                    <li key={r.activityId} className="flex justify-between border-b py-1">
                      <span>{i + 1}. {a?.name ?? "?"} <span className="text-muted-foreground">({a?.type ?? "?"})</span></span>
                      <span className="font-medium">{r._count._all}</span>
                    </li>
                  )
                })}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Recent signups</CardTitle></CardHeader>
        <CardContent>
          <ul className="divide-y text-sm">
            {recentUsers.map((u) => (
              <li key={u.id} className="flex justify-between py-2">
                <span>
                  <span className="font-medium">{u.firstName} {u.lastName}</span>
                  <span className="text-muted-foreground"> · {u.email} · {u.role}</span>
                </span>
                <span className="text-muted-foreground">{format(u.createdAt, "MMM d, yyyy")}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardHeader>
        <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
        <CardTitle className="text-2xl">{value}</CardTitle>
      </CardHeader>
    </Card>
  )
}
