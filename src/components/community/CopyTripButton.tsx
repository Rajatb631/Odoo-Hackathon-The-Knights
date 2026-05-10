"use client"

import { useTransition } from "react"
import { Button } from "@/components/ui/button"
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
          try {
            await copyTrip(tripId)
          } catch (err) {
            if ((err as Error).message?.includes("NEXT_REDIRECT")) return
            alert((err as Error).message)
          }
        })
      }}
    >
      {pending ? "Copying…" : "Copy"}
    </Button>
  )
}
