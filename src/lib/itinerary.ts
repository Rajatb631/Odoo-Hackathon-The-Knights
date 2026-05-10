import type { Activity, City, Stop, StopActivity, Trip } from "@prisma/client"

export type FullStop = Stop & {
  city: City
  stopActivities: (StopActivity & { activity: Activity })[]
}

export type FullTrip = Trip & { stops: FullStop[] }

export function computePerStopTotals(trip: FullTrip) {
  return trip.stops.map((s) => {
    const stopBudget = s.budget != null ? Number(s.budget) : 0
    const activityTotal = s.stopActivities.reduce(
      (sum, sa) => sum + Number(sa.costOverride ?? sa.activity.cost),
      0,
    )
    return {
      stopId: s.id,
      name: `${s.city.name}`,
      total: stopBudget + activityTotal,
      stopBudget,
      activityTotal,
    }
  })
}

export function getDays(start: Date, end: Date): Date[] {
  const days: Date[] = []
  const cur = new Date(start)
  cur.setHours(0, 0, 0, 0)
  const last = new Date(end)
  last.setHours(0, 0, 0, 0)
  while (cur <= last) {
    days.push(new Date(cur))
    cur.setDate(cur.getDate() + 1)
  }
  return days
}
