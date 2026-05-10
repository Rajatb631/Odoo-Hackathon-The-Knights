"use client"

import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { deleteNote } from "@/server/actions/notes"

export function DeleteNoteButton({ noteId }: { noteId: string }) {
  const [pending, startTransition] = useTransition()
  return (
    <Button
      size="sm"
      variant="ghost"
      disabled={pending}
      onClick={() => startTransition(() => deleteNote(noteId))}
    >
      Delete
    </Button>
  )
}
