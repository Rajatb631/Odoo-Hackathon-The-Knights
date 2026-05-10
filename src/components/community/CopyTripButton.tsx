"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { safeAction } from "@/lib/server-action-utils"
import { copyTrip } from "@/server/actions/community"

export function CopyTripButton({ tripId }: { tripId: string }) {
  const [pending, startTransition] = useTransition()
  return (
    <Button
      size="sm"
      variant="outline"
      disabled={pending}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        if (!confirm("Copy this trip into your account?")) return
        startTransition(async () => {
          const res = await safeAction(() => copyTrip(tripId))
          if (!res.ok) toast.error(res.error)
        })
      }}
    >
      {pending ? "Copying…" : "Copy"}
    </Button>
  )
}
