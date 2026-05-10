"use client"

import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { deleteStop, moveStop, removeStopActivity } from "@/server/actions/stops"

export function StopMoveButton({ stopId, direction, disabled }: { stopId: string; direction: "up" | "down"; disabled?: boolean }) {
  const [pending, startTransition] = useTransition()
  return (
    <Button
      size="sm"
      variant="outline"
      disabled={disabled || pending}
      onClick={() => startTransition(() => moveStop(stopId, direction))}
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
        startTransition(() => deleteStop(stopId))
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
      onClick={() => startTransition(() => removeStopActivity(stopActivityId))}
    >
      Remove
    </Button>
  )
}
