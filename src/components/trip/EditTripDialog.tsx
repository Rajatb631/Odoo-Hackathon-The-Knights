"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { safeAction } from "@/lib/server-action-utils"
import { createTripSchema, type CreateTripInput } from "@/lib/validations/trip"
import { deleteTrip, updateTrip } from "@/server/actions/trips"

type Initial = {
  id: string
  name: string
  description: string | null
  startDate: string
  endDate: string
  budget: string | null
  coverImageId: string | null
}

export function EditTripDialog({ initial }: { initial: Initial }) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  const { register, handleSubmit, formState: { errors } } = useForm<CreateTripInput>({
    resolver: zodResolver(createTripSchema),
    defaultValues: {
      name: initial.name,
      description: initial.description ?? "",
      startDate: initial.startDate,
      endDate: initial.endDate,
      budget: initial.budget ?? "",
      coverImageId: initial.coverImageId ?? "",
    },
  })

  const onSubmit = (data: CreateTripInput) => {
    startTransition(async () => {
      const res = await safeAction(() => updateTrip({ ...data, id: initial.id }))
      if (!res.ok) {
        toast.error(res.error)
        return
      }
      if (!res.data.ok) {
        toast.error(res.data.error)
        return
      }
      toast.success("Trip updated")
      setOpen(false)
    })
  }

  const onDelete = () => {
    if (!confirm("Delete this trip and all its stops, notes, packing items, expenses?")) return
    startTransition(async () => {
      const res = await safeAction(() => deleteTrip(initial.id))
      if (!res.ok) toast.error(res.error)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Edit trip</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit trip</DialogTitle>
          <DialogDescription>Update name, dates, budget, or description.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Name</Label>
            <Input id="edit-name" {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="edit-start">Start</Label>
              <Input id="edit-start" type="date" {...register("startDate")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-end">End</Label>
              <Input id="edit-end" type="date" {...register("endDate")} />
              {errors.endDate && <p className="text-sm text-destructive">{errors.endDate.message}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-budget">Budget (USD)</Label>
            <Input id="edit-budget" type="number" step="0.01" min="0" {...register("budget")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-desc">Description</Label>
            <Textarea id="edit-desc" rows={3} {...register("description")} />
          </div>
          <div className="flex justify-between gap-2">
            <Button type="button" variant="ghost" onClick={onDelete} disabled={pending}>
              Delete trip
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>
                Cancel
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
