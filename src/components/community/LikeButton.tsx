"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { safeAction } from "@/lib/server-action-utils"
import { toggleLike } from "@/server/actions/community"

export function LikeButton({
  tripId,
  initialLiked,
  initialCount,
}: {
  tripId: string
  initialLiked: boolean
  initialCount: number
}) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [pending, startTransition] = useTransition()

  return (
    <Button
      size="sm"
      variant={liked ? "default" : "outline"}
      disabled={pending}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        startTransition(async () => {
          const res = await safeAction(() => toggleLike(tripId))
          if (!res.ok) {
            toast.error(res.error)
            return
          }
          setLiked(res.data.liked)
          setCount(res.data.count)
        })
      }}
    >
      {liked ? "♥" : "♡"} {count}
    </Button>
  )
}
