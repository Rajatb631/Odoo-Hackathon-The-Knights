"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { safeAction } from "@/lib/server-action-utils"
import { addActivityToStop } from "@/server/actions/stops"

type Activity = { id: string; name: string; cost: string; durationMin: number; type: string }

export function ActivityPicker({
  stopId,
  activities,
  assignedIds,
}: {
  stopId: string
  activities: Activity[]
  assignedIds: string[]
}) {
  const [activityId, setActivityId] = useState<string>("")
  const [pending, startTransition] = useTransition()

  const available = activities.filter((a) => !assignedIds.includes(a.id))
  if (available.length === 0) {
    return <p className="text-sm text-muted-foreground">All seeded activities for this city already added.</p>
  }

  return (
    <div className="flex gap-2 items-end flex-wrap">
      <div className="flex-1 min-w-[200px]">
        <Select value={activityId} onValueChange={setActivityId}>
          <SelectTrigger><SelectValue placeholder="Add an activity…" /></SelectTrigger>
          <SelectContent>
            {available.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.name} — ${Number(a.cost).toFixed(0)} · {a.durationMin}m
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button
        size="sm"
        disabled={!activityId || pending}
        onClick={() => {
          if (!activityId) return
          startTransition(async () => {
            const res = await safeAction(() => addActivityToStop(stopId, activityId))
            if (!res.ok) toast.error(res.error)
            else { toast.success("Activity added"); setActivityId("") }
          })
        }}
      >
        {pending ? "Adding…" : "Add"}
      </Button>
    </div>
  )
}
