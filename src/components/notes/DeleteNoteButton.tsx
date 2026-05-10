"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { safeAction } from "@/lib/server-action-utils"
import { deleteNote } from "@/server/actions/notes"

export function DeleteNoteButton({ noteId }: { noteId: string }) {
  const [pending, startTransition] = useTransition()
  return (
    <Button
      size="sm"
      variant="destructive"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await safeAction(() => deleteNote(noteId))
          if (!res.ok) toast.error(res.error)
        })
      }
    >
      Delete
    </Button>
  )
}
