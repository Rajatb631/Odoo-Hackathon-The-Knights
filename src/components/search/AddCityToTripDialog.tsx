"use client"

import { useState, useTransition } from "react"
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { addCityToTrip, getMyTripsForPicker } from "@/server/actions/search"

type Trip = Awaited<ReturnType<typeof getMyTripsForPicker>>[number]

export function AddCityToTripDialog({ cityId, cityName }: { cityId: string; cityName: string }) {
  const [open, setOpen] = useState(false)
  const [trips, setTrips] = useState<Trip[] | null>(null)
  const [pending, startTransition] = useTransition()
  const [msg, setMsg] = useState<string | null>(null)

  async function load() {
    const t = await getMyTripsForPicker()
    setTrips(t)
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
                      await addCityToTrip(cityId, t.id)
                      setMsg(`Added to "${t.name}"`)
                      setTimeout(() => { setOpen(false); setMsg(null) }, 900)
                    })
                  }
                >
                  Add
                </Button>
              </li>
            ))}
          </ul>
        )}
        {msg && <p className="text-sm text-green-600 dark:text-green-400">{msg}</p>}
      </DialogContent>
    </Dialog>
  )
}
