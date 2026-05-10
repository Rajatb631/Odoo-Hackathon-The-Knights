import Link from "next/link"
import { ArrowRight, Plus, Plane, Sparkles } from "lucide-react"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { TripCard } from "@/components/trip/TripCard"

export default async function DashboardPage() {
  const session = await auth()
  const userId = session!.user!.id!
  const firstName = session!.user!.name?.split(" ")[0] ?? "there"

  const [trips, totalTrips] = await Promise.all([
    prisma.trip.findMany({
      where: { ownerId: userId },
      orderBy: { startDate: "desc" },
      take: 3,
    }),
    prisma.trip.count({ where: { ownerId: userId } }),
  ])

  const upcoming = trips.filter((t) => t.status === "UPCOMING").length
  const ongoing = trips.filter((t) => t.status === "ONGOING").length

  return (
    <div className="space-y-10">
      {/* Hero header */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 lg:p-10">
        <div
          aria-hidden
          className="absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full blur-3xl opacity-50"
          style={{ background: "radial-gradient(closest-side, oklch(0.78 0.16 230 / 0.55), transparent)" }}
        />
        <div className="relative flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 mb-4">
              <Sparkles className="w-3 h-3 text-sky-600" />
              <span className="text-xs font-medium text-sky-700">Welcome back</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
              Hello, <span className="text-gradient-brand">{firstName}</span>.
            </h1>
            <p className="text-muted-foreground mt-2 text-base">
              Pick up where you left off, or start something new.
            </p>
          </div>
          <Button
            asChild
            size="lg"
            className="bg-gradient-brand text-white font-semibold shadow-md shadow-sky-500/30 hover:shadow-lg hover:shadow-sky-500/40 hover:opacity-95 transition-all"
          >
            <Link href="/trips/new" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Plan a new trip
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="relative grid grid-cols-3 gap-3 sm:gap-6 mt-8 pt-6 border-t border-border">
          <Stat label="Trips planned" value={totalTrips} />
          <Stat label="Upcoming" value={upcoming} />
          <Stat label="Ongoing" value={ongoing} />
        </div>
      </section>

      {/* Recent trips */}
      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Recent trips</h2>
            <p className="text-sm text-muted-foreground">Your latest adventures</p>
          </div>
          {trips.length > 0 && (
            <Button asChild variant="ghost" size="sm" className="text-sky-600 hover:text-sky-700 hover:bg-sky-500/10">
              <Link href="/trips" className="flex items-center gap-1">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          )}
        </div>

        {trips.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
      </section>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-2xl lg:text-3xl font-bold tracking-tight">{value}</p>
      <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{label}</p>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-dashed border-border bg-card/60 p-10 text-center">
      <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-400/30 to-blue-500/20 flex items-center justify-center mb-4">
        <Plane className="w-6 h-6 text-sky-600" />
      </div>
      <h3 className="font-semibold text-lg">No trips yet</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
        Start by planning your first one — itineraries, expenses, and packing lists all in one place.
      </p>
      <Button
        asChild
        className="mt-5 bg-gradient-brand text-white font-semibold shadow-md shadow-sky-500/25 hover:opacity-95"
      >
        <Link href="/trips/new" className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Plan a trip
        </Link>
      </Button>
    </div>
  )
}
