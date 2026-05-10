"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { safeAction } from "@/lib/server-action-utils"
import { addActivityToExistingStop, getMyTripsForPicker } from "@/server/actions/search"

type Trip = Awaited<ReturnType<typeof getMyTripsForPicker>>[number]

export function AddActivityToTripDialog({
  activityId,
  activityName,
  cityId,
}: {
  activityId: string
  activityName: string
  cityId: string | null
}) {
  const [open, setOpen] = useState(false)
  const [trips, setTrips] = useState<Trip[] | null>(null)
  const [pending, startTransition] = useTransition()

  async function load() {
    const res = await safeAction(() => getMyTripsForPicker())
    if (!res.ok) toast.error(res.error)
    else setTrips(res.data)
  }

  const matchingStops = (trips ?? []).flatMap((t) =>
    t.stops
      .filter((s) => !cityId || s.cityId === cityId)
      .map((s) => ({ tripId: t.id, tripName: t.name, stopId: s.id, cityName: s.city.name })),
  )

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (v && !trips) load() }}>
      <DialogTrigger asChild>
        <Button size="sm">Add to trip</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add {activityName}</DialogTitle>
          <DialogDescription>
            Pick a stop in the matching city. Add the city first if you don&apos;t see options.
          </DialogDescription>
        </DialogHeader>
        {trips === null ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : matchingStops.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No matching stop. Add the city to a trip first via /search/cities.
          </p>
        ) : (
          <ul className="space-y-2">
            {matchingStops.map((s) => (
              <li key={s.stopId} className="flex items-center justify-between gap-3 border rounded p-2">
                <div>
                  <p className="font-medium text-sm">{s.tripName}</p>
                  <p className="text-xs text-muted-foreground">Stop: {s.cityName}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      const res = await safeAction(() => addActivityToExistingStop(s.stopId, activityId))
                      if (!res.ok) {
                        toast.error(res.error)
                        return
                      }
                      if (res.data.duplicate) toast.info("Already added")
                      else toast.success(`Added to "${s.tripName}"`)
                      setOpen(false)
                    })
                  }
                >
                  Add
                </Button>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  )
}
