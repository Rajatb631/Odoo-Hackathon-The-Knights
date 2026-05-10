import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BudgetChart } from "@/components/budget/BudgetChart"
import { computePerStopTotals, getDays, type FullTrip } from "@/lib/itinerary"

export function ItineraryView({ trip, readOnly = false }: { trip: FullTrip; readOnly?: boolean }) {
  const perStop = computePerStopTotals(trip)
  const totalSpend = perStop.reduce((s, p) => s + p.total, 0)
  const tripBudget = trip.budget != null ? Number(trip.budget) : null
  const overBudget = tripBudget != null && totalSpend > tripBudget

  return (
    <div className="space-y-6">
      {trip.coverImageId && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/api/images/${trip.coverImageId}`}
          alt={trip.name}
          className="w-full aspect-[21/9] object-cover rounded-lg border"
        />
      )}

      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">{trip.name}</h1>
          <p className="text-muted-foreground">
            {format(trip.startDate, "MMM d")} – {format(trip.endDate, "MMM d, yyyy")}
            {tripBudget != null && ` · Budget $${tripBudget.toLocaleString()}`}
          </p>
          {trip.description && <p className="mt-2 max-w-2xl">{trip.description}</p>}
        </div>
        <Badge variant={trip.status === "UPCOMING" ? "default" : trip.status === "ONGOING" ? "secondary" : "outline"}>
          {trip.status.toLowerCase()}
        </Badge>
      </div>

      {overBudget && (
        <div className="border border-destructive/50 bg-destructive/5 text-destructive rounded-lg p-3 text-sm">
          Trip planned spend (${totalSpend.toLocaleString()}) exceeds budget (${tripBudget!.toLocaleString()}).
        </div>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Budget breakdown</h2>
        {trip.stops.length === 0 ? (
          <p className="text-muted-foreground text-sm">Add stops in the builder to see budget.</p>
        ) : (
          <BudgetChart perStop={perStop} tripBudget={tripBudget} />
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Itinerary</h2>
        {trip.stops.length === 0 ? (
          <p className="text-muted-foreground text-sm">No stops yet.</p>
        ) : (
          <div className="space-y-4">
            {trip.stops.map((stop, idx) => {
              const days = getDays(stop.startDate, stop.endDate)
              return (
                <Card key={stop.id}>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Stop {idx + 1}: {stop.city.name}, {stop.city.country}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {format(stop.startDate, "MMM d")} – {format(stop.endDate, "MMM d, yyyy")} · {days.length} days
                      {stop.budget && ` · $${Number(stop.budget).toLocaleString()}`}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {stop.notes && <p className="text-sm italic text-muted-foreground">{stop.notes}</p>}
                    {(() => {
                      const dayBuckets = days.map((day) => {
                        const dayActivities = stop.stopActivities.filter((sa) => {
                          if (!sa.scheduledAt) return false
                          const d = new Date(sa.scheduledAt)
                          d.setHours(0, 0, 0, 0)
                          return d.getTime() === day.getTime()
                        })
                        return { day, dayActivities }
                      })
                      const populated = dayBuckets.filter((b) => b.dayActivities.length > 0)
                      const emptyCount = dayBuckets.length - populated.length
                      if (populated.length === 0) return null
                      return (
                        <ul className="space-y-2">
                          {populated.map(({ day, dayActivities }) => (
                            <li key={day.toISOString()} className="border-l-2 pl-3">
                              <p className="text-sm font-medium">{format(day, "EEE, MMM d")}</p>
                              <ul className="text-sm space-y-1 mt-1">
                                {dayActivities.map((sa) => (
                                  <li key={sa.id}>
                                    <span className="font-medium">{format(new Date(sa.scheduledAt!), "HH:mm")}</span>
                                    {" — "}
                                    {sa.activity.name}
                                    <span className="text-muted-foreground"> (${Number(sa.costOverride ?? sa.activity.cost).toFixed(0)})</span>
                                  </li>
                                ))}
                              </ul>
                            </li>
                          ))}
                          {emptyCount > 0 && (
                            <li className="text-xs text-muted-foreground italic pl-3">
                              + {emptyCount} {emptyCount === 1 ? "day" : "days"} with no scheduled activities
                            </li>
                          )}
                        </ul>
                      )
                    })()}
                    {stop.stopActivities.some((sa) => !sa.scheduledAt) && (
                      <div className="pt-2">
                        <p className="text-sm font-medium">Activities</p>
                        <ul className="text-sm space-y-1 mt-1">
                          {stop.stopActivities.filter((sa) => !sa.scheduledAt).map((sa) => (
                            <li key={sa.id}>
                              {sa.activity.name}
                              <span className="text-muted-foreground"> — ${Number(sa.costOverride ?? sa.activity.cost).toFixed(0)} · {sa.activity.durationMin}m</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </section>

      {!readOnly && (
        <p className="text-sm text-muted-foreground">
          Use the <strong>builder</strong> to add stops, activities, and adjust dates.
        </p>
      )}
    </div>
  )
}
