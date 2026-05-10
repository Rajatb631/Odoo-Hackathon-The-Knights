"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { updateProfileSchema, type UpdateProfileInput } from "@/lib/validations/profile"
import { updateProfile } from "@/server/actions/profile"

export function ProfileForm({
  initial,
}: {
  initial: UpdateProfileInput
}) {
  const [photoId, setPhotoId] = useState<string | null>(initial.photoId ?? null)
  const [uploading, setUploading] = useState(false)
  const [uploadErr, setUploadErr] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const { register, handleSubmit, formState: { errors } } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: initial,
  })

  async function uploadAvatar(file: File) {
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
      setPhotoId(id)
    } finally {
      setUploading(false)
    }
  }

  const onSubmit = (data: UpdateProfileInput) => {
    setMsg(null)
    startTransition(async () => {
      const res = await updateProfile({ ...data, photoId })
      if (!res.ok) setMsg(res.error)
      else setMsg("Saved.")
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center gap-4">
        {photoId ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`/api/images/${photoId}`} alt="Avatar" className="size-20 rounded-full object-cover border" />
        ) : (
          <div className="size-20 rounded-full bg-muted border flex items-center justify-center text-muted-foreground text-sm">No photo</div>
        )}
        <div className="space-y-1">
          <Label htmlFor="avatar">Avatar</Label>
          <Input
            id="avatar"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/avif"
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) uploadAvatar(f)
            }}
          />
          {uploading && <p className="text-xs text-muted-foreground">Uploading…</p>}
          {uploadErr && <p className="text-xs text-destructive">{uploadErr}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="firstName">First name</Label>
          <Input id="firstName" {...register("firstName")} />
          {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="lastName">Last name</Label>
          <Input id="lastName" {...register("lastName")} />
          {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" {...register("phone")} />
        </div>
        <div className="grid grid-cols-2 gap-3 col-span-2">
          <div className="space-y-1">
            <Label htmlFor="city">City</Label>
            <Input id="city" {...register("city")} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="country">Country</Label>
            <Input id="country" {...register("country")} />
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" rows={3} {...register("bio")} />
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save changes"}</Button>
        {msg && <span className="text-sm text-muted-foreground">{msg}</span>}
      </div>
    </form>
  )
}
