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
  const [coverId, setCoverId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadErr, setUploadErr] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<CreateTripInput>({
    resolver: zodResolver(createTripSchema),
  })

  async function uploadCover(file: File) {
    setUploadErr(null)
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/images/upload", { method: "POST", body: fd })
      if (!res.ok) {
        setUploadErr(await res.text())
        return
      }
      const { id } = await res.json()
      setCoverId(id)
    } finally {
      setUploading(false)
    }
  }

  const onSubmit = (data: CreateTripInput) => {
    setError(null)
    startTransition(async () => {
      try {
        const res = await createTrip({ ...data, coverImageId: coverId })
        if (res && !res.ok) setError(res.error)
      } catch (e) {
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
            <div className="space-y-2">
              <Label htmlFor="cover">Cover photo (optional)</Label>
              <Input
                id="cover"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/avif"
                disabled={uploading}
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) uploadCover(f)
                }}
              />
              {uploading && <p className="text-xs text-muted-foreground">Uploading…</p>}
              {uploadErr && <p className="text-xs text-destructive">{uploadErr}</p>}
              {coverId && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={`/api/images/${coverId}`} alt="Cover preview" className="rounded border w-full aspect-[16/9] object-cover" />
              )}
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2">
              <Button type="submit" disabled={pending || uploading}>{pending ? "Creating…" : "Create trip"}</Button>
              <Button asChild variant="ghost"><Link href="/trips">Cancel</Link></Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
