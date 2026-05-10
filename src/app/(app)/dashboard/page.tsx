import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { TripCard } from "@/components/trip/TripCard"

export default async function DashboardPage() {
  const session = await auth()
  const userId = session!.user!.id!

  const trips = await prisma.trip.findMany({
    where: { ownerId: userId },
    orderBy: { startDate: "desc" },
    take: 3,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Welcome back, {session!.user!.name?.split(" ")[0]}.</h1>
          <p className="text-muted-foreground">Pick up where you left off, or start something new.</p>
        </div>
        <Button asChild><Link href="/trips/new">Plan a new trip</Link></Button>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Recent trips</h2>
        {trips.length === 0 ? (
          <div className="border rounded-lg p-8 text-center">
            <p className="text-muted-foreground">No trips yet. Start by planning your first one.</p>
            <Button asChild className="mt-4"><Link href="/trips/new">Plan a trip</Link></Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {trips.map((t) => (
              <TripCard
                key={t.id}
                id={t.id}
                name={t.name}
                description={t.description}
                startDate={t.startDate}
                endDate={t.endDate}
                budget={t.budget?.toString() ?? null}
                status={t.status}
                coverImageId={t.coverImageId}
              />
            ))}
          </div>
        )}
        {trips.length > 0 && (
          <div className="pt-2"><Button asChild variant="ghost" size="sm"><Link href="/trips">View all trips →</Link></Button></div>
        )}
      </section>
    </div>
  )
}
