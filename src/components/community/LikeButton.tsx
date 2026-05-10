"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
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
          const res = await toggleLike(tripId)
          setLiked(res.liked)
          setCount(res.count)
        })
      }}
    >
      {liked ? "♥" : "♡"} {count}
    </Button>
  )
}
