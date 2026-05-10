import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { TripCard } from "@/components/trip/TripCard"

const STATUSES = ["UPCOMING", "ONGOING", "COMPLETED"] as const

export default async function TripsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const session = await auth()
  const userId = session!.user!.id!
  const { status } = await searchParams
  const filter = STATUSES.find((s) => s === status)

  const trips = await prisma.trip.findMany({
    where: { ownerId: userId, ...(filter ? { status: filter } : {}) },
    orderBy: { startDate: "desc" },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">My trips</h1>
          <p className="text-muted-foreground">All trips you&apos;ve planned.</p>
        </div>
        <Button asChild><Link href="/trips/new">New trip</Link></Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button asChild variant={!filter ? "default" : "outline"} size="sm"><Link href="/trips">All</Link></Button>
        {STATUSES.map((s) => (
          <Button
            key={s}
            asChild
            variant={filter === s ? "default" : "outline"}
            size="sm"
          >
            <Link href={`/trips?status=${s}`}>{s.toLowerCase()}</Link>
          </Button>
        ))}
      </div>

      {trips.length === 0 ? (
        <div className="border rounded-lg p-12 text-center">
          <p className="text-muted-foreground">No trips found.</p>
          <Button asChild className="mt-4"><Link href="/trips/new">Plan your first trip</Link></Button>
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
    </div>
  )
}
