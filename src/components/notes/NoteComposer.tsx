"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { createNote } from "@/server/actions/notes"

type Stop = { id: string; cityName: string }

export function NoteComposer({ tripId, stops }: { tripId: string; stops: Stop[] }) {
  const [body, setBody] = useState("")
  const [stopId, setStopId] = useState<string>("")
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  return (
    <form
      className="border rounded-lg p-4 space-y-3"
      onSubmit={(e) => {
        e.preventDefault()
        setError(null)
        startTransition(async () => {
          const res = await createNote(tripId, body, stopId || null)
          if (!res.ok) setError(res.error)
          else { setBody(""); setStopId("") }
        })
      }}
    >
      <Textarea
        rows={3}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Add a note or journal entry…"
      />
      <div className="flex items-center gap-2 flex-wrap">
        <select
          value={stopId}
          onChange={(e) => setStopId(e.target.value)}
          className="border rounded h-9 px-3 text-sm"
        >
          <option value="">Trip-wide</option>
          {stops.map((s) => <option key={s.id} value={s.id}>Stop: {s.cityName}</option>)}
        </select>
        <Button type="submit" disabled={pending || !body.trim()}>
          {pending ? "Saving…" : "Add note"}
        </Button>
        {error && <span className="text-sm text-destructive">{error}</span>}
      </div>
    </form>
  )
}
