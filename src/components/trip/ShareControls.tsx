"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { toggleShare } from "@/server/actions/trips"

export function ShareControls({
  tripId,
  initialPublic,
  initialToken,
}: {
  tripId: string
  initialPublic: boolean
  initialToken: string | null
}) {
  const [isPublic, setPublic] = useState(initialPublic)
  const [token, setToken] = useState(initialToken)
  const [pending, startTransition] = useTransition()
  const [copied, setCopied] = useState(false)

  const url = token && typeof window !== "undefined" ? `${window.location.origin}/share/${token}` : null

  return (
    <div className="border rounded-lg p-4 space-y-2">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="font-medium">Public share</p>
          <p className="text-sm text-muted-foreground">
            {isPublic ? "Anyone with the link can view this trip." : "Only you can view this trip."}
          </p>
        </div>
        <Button
          size="sm"
          variant={isPublic ? "outline" : "default"}
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const res = await toggleShare(tripId)
              if (res.ok) {
                setPublic(res.isPublic)
                setToken(res.shareToken)
              }
            })
          }
        >
          {pending ? "…" : isPublic ? "Make private" : "Make public"}
        </Button>
      </div>
      {isPublic && url && (
        <div className="flex gap-2">
          <input
            readOnly
            value={url}
            className="flex-1 text-sm border rounded px-3 py-2 bg-muted/40"
            onFocus={(e) => e.currentTarget.select()}
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              navigator.clipboard.writeText(url)
              setCopied(true)
              setTimeout(() => setCopied(false), 1500)
            }}
          >
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
      )}
    </div>
  )
}
