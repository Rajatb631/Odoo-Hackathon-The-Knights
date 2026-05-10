"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createStopSchema, type CreateStopInput } from "@/lib/validations/stop"
import { createStop } from "@/server/actions/stops"

type City = { id: string; name: string; country: string }

export function StopEditor({ tripId, cities }: { tripId: string; cities: City[] }) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const {
    register, handleSubmit, setValue, reset, formState: { errors },
  } = useForm<CreateStopInput>({
    resolver: zodResolver(createStopSchema),
    defaultValues: { tripId },
  })

  const onSubmit = (data: CreateStopInput) => {
    setError(null)
    startTransition(async () => {
      const res = await createStop(data)
      if (!res.ok) setError(res.error)
      else {
        reset({ tripId })
        setOpen(false)
      }
    })
  }

  if (!open) {
    return <Button onClick={() => setOpen(true)}>+ Add stop</Button>
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="border rounded-lg p-4 space-y-4 bg-muted/30">
      <input type="hidden" {...register("tripId")} value={tripId} />
      <div className="space-y-2">
        <Label>City</Label>
        <Select onValueChange={(v) => setValue("cityId", v, { shouldValidate: true })}>
          <SelectTrigger><SelectValue placeholder="Pick a city…" /></SelectTrigger>
          <SelectContent>
            {cities.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}, {c.country}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.cityId && <p className="text-sm text-destructive">{errors.cityId.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="startDate">Arrive</Label>
          <Input id="startDate" type="date" {...register("startDate")} />
          {errors.startDate && <p className="text-sm text-destructive">{errors.startDate.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">Depart</Label>
          <Input id="endDate" type="date" {...register("endDate")} />
          {errors.endDate && <p className="text-sm text-destructive">{errors.endDate.message}</p>}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="budget">Stop budget (USD)</Label>
        <Input id="budget" type="number" step="0.01" min="0" {...register("budget")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" rows={2} {...register("notes")} />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>{pending ? "Adding…" : "Add stop"}</Button>
        <Button type="button" variant="ghost" onClick={() => { setOpen(false); reset({ tripId }) }}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
