"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createTripSchema, type CreateTripInput } from "@/lib/validations/trip"
import { createTrip } from "@/server/actions/trips"

export default function NewTripPage() {
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const { register, handleSubmit, formState: { errors } } = useForm<CreateTripInput>({
    resolver: zodResolver(createTripSchema),
  })

  const onSubmit = (data: CreateTripInput) => {
    setError(null)
    startTransition(async () => {
      try {
        const res = await createTrip(data)
        if (res && !res.ok) setError(res.error)
      } catch (e) {
        // redirect throws — ignore
        if ((e as Error).message?.includes("NEXT_REDIRECT")) return
        setError((e as Error).message)
      }
    })
  }

  return (
    <div className="max-w-xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Plan a new trip</CardTitle>
          <CardDescription>Start with the basics — you&apos;ll add stops next.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Trip name</Label>
              <Input id="name" placeholder="e.g. European Summer 2026" {...register("name")} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start date</Label>
                <Input id="startDate" type="date" {...register("startDate")} />
                {errors.startDate && <p className="text-sm text-destructive">{errors.startDate.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End date</Label>
                <Input id="endDate" type="date" {...register("endDate")} />
                {errors.endDate && <p className="text-sm text-destructive">{errors.endDate.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget">Budget (USD)</Label>
              <Input id="budget" type="number" step="0.01" min="0" placeholder="2500" {...register("budget")} />
              {errors.budget && <p className="text-sm text-destructive">{errors.budget.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={3} placeholder="Two weeks in Italy + Greece" {...register("description")} />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2">
              <Button type="submit" disabled={pending}>{pending ? "Creating…" : "Create trip"}</Button>
              <Button asChild variant="ghost"><Link href="/trips">Cancel</Link></Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
