"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { safeAction } from "@/lib/server-action-utils"
import { addCityToTrip, getMyTripsForPicker } from "@/server/actions/search"

type Trip = Awaited<ReturnType<typeof getMyTripsForPicker>>[number]

export function AddCityToTripDialog({ cityId, cityName }: { cityId: string; cityName: string }) {
  const [open, setOpen] = useState(false)
  const [trips, setTrips] = useState<Trip[] | null>(null)
  const [pending, startTransition] = useTransition()

  async function load() {
    const res = await safeAction(() => getMyTripsForPicker())
    if (!res.ok) toast.error(res.error)
    else setTrips(res.data)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (v && !trips) load() }}>
      <DialogTrigger asChild>
        <Button size="sm">Add to trip</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add {cityName} to a trip</DialogTitle>
          <DialogDescription>Creates a new stop with default dates — edit in the builder.</DialogDescription>
        </DialogHeader>
        {trips === null ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : trips.length === 0 ? (
          <p className="text-sm text-muted-foreground">No upcoming/ongoing trips. Create a trip first.</p>
        ) : (
          <ul className="space-y-2">
            {trips.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 border rounded p-2">
                <div>
                  <p className="font-medium text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.stops.length} stops {t.stops.length > 0 && `· ${t.stops.map((s) => s.city.name).join(" → ")}`}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      const res = await safeAction(() => addCityToTrip(cityId, t.id))
                      if (!res.ok) {
                        toast.error(res.error)
                        return
                      }
                      toast.success(`Added ${cityName} to "${t.name}"`)
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
