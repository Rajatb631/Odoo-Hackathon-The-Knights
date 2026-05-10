"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { safeAction } from "@/lib/server-action-utils"
import { deleteStop, moveStop, removeStopActivity } from "@/server/actions/stops"

export function StopMoveButton({ stopId, direction, disabled }: { stopId: string; direction: "up" | "down"; disabled?: boolean }) {
  const [pending, startTransition] = useTransition()
  return (
    <Button
      size="sm"
      variant="outline"
      disabled={disabled || pending}
      onClick={() =>
        startTransition(async () => {
          const res = await safeAction(() => moveStop(stopId, direction))
          if (!res.ok) toast.error(res.error)
        })
      }
    >
      {direction === "up" ? "↑" : "↓"}
    </Button>
  )
}

export function DeleteStopButton({ stopId }: { stopId: string }) {
  const [pending, startTransition] = useTransition()
  return (
    <Button
      size="sm"
      variant="outline"
      disabled={pending}
      onClick={() => {
        if (!confirm("Delete this stop and its activities?")) return
        startTransition(async () => {
          const res = await safeAction(() => deleteStop(stopId))
          if (!res.ok) toast.error(res.error)
          else toast.success("Stop deleted")
        })
      }}
    >
      Delete
    </Button>
  )
}

export function RemoveActivityButton({ stopActivityId }: { stopActivityId: string }) {
  const [pending, startTransition] = useTransition()
  return (
    <Button
      size="sm"
      variant="ghost"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await safeAction(() => removeStopActivity(stopActivityId))
          if (!res.ok) toast.error(res.error)
        })
      }
    >
      Remove
    </Button>
  )
}
