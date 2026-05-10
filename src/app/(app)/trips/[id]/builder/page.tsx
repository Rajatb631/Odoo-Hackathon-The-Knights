import Link from "next/link"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StopEditor } from "@/components/trip/StopEditor"
import { ActivityPicker } from "@/components/trip/ActivityPicker"
import {
  StopMoveButton,
  DeleteStopButton,
  RemoveActivityButton,
} from "@/components/trip/StopActions"

export default async function BuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  const userId = session!.user!.id!

  const trip = await prisma.trip.findUnique({
    where: { id },
    include: {
      stops: {
        orderBy: { order: "asc" },
        include: {
          city: true,
          stopActivities: { include: { activity: true } },
        },
      },
    },
  })
  if (!trip || trip.ownerId !== userId) notFound()

  const cities = await prisma.city.findMany({ orderBy: { name: "asc" } })
  const cityIds = trip.stops.map((s) => s.cityId)
  const activities = cityIds.length
    ? await prisma.activity.findMany({
        where: { cityId: { in: cityIds } },
        orderBy: { name: "asc" },
      })
    : []
  const activitiesByCity = new Map<string, typeof activities>()
  for (const a of activities) {
    if (!a.cityId) continue
    if (!activitiesByCity.has(a.cityId)) activitiesByCity.set(a.cityId, [])
    activitiesByCity.get(a.cityId)!.push(a)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">{trip.name}</h1>
          <p className="text-muted-foreground">
            {format(trip.startDate, "MMM d")} – {format(trip.endDate, "MMM d, yyyy")} · Itinerary builder
          </p>
        </div>
        <Button asChild variant="outline"><Link href={`/trips/${trip.id}`}>View itinerary →</Link></Button>
      </div>

      <div className="space-y-4">
        {trip.stops.length === 0 ? (
          <div className="border rounded-lg p-8 text-center text-muted-foreground">
            No stops yet — add your first city below.
          </div>
        ) : (
          trip.stops.map((stop, idx) => {
            const cityActivities = (activitiesByCity.get(stop.cityId) ?? []).map((a) => ({
              id: a.id, name: a.name, cost: a.cost.toString(), durationMin: a.durationMin, type: a.type,
            }))
            const assignedIds = stop.stopActivities.map((sa) => sa.activityId)
            return (
              <Card key={stop.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <CardTitle>Stop {idx + 1}: {stop.city.name}, {stop.city.country}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {format(stop.startDate, "MMM d")} – {format(stop.endDate, "MMM d, yyyy")}
                        {stop.budget && ` · $${Number(stop.budget).toLocaleString()}`}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <StopMoveButton stopId={stop.id} direction="up" disabled={idx === 0} />
                      <StopMoveButton stopId={stop.id} direction="down" disabled={idx === trip.stops.length - 1} />
                      <DeleteStopButton stopId={stop.id} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {stop.notes && <p className="text-sm text-muted-foreground italic">{stop.notes}</p>}
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Activities ({stop.stopActivities.length})</p>
                    {stop.stopActivities.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No activities assigned.</p>
                    ) : (
                      <ul className="space-y-1">
                        {stop.stopActivities.map((sa) => (
                          <li key={sa.id} className="flex items-center justify-between text-sm border-b py-1.5">
                            <span>
                              <span className="font-medium">{sa.activity.name}</span>
                              <span className="text-muted-foreground"> — ${Number(sa.costOverride ?? sa.activity.cost).toFixed(0)} · {sa.activity.durationMin}m</span>
                            </span>
                            <RemoveActivityButton stopActivityId={sa.id} />
                          </li>
                        ))}
                      </ul>
                    )}
                    <ActivityPicker stopId={stop.id} activities={cityActivities} assignedIds={assignedIds} />
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}

        <StopEditor tripId={trip.id} cities={cities.map((c) => ({ id: c.id, name: c.name, country: c.country }))} />
      </div>
    </div>
  )
}
