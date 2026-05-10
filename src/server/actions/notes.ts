"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

async function requireUserId() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  return session.user.id
}

export async function createNote(tripId: string, body: string, stopId?: string | null) {
  const userId = await requireUserId()
  if (!body.trim()) return { ok: false as const, error: "Note cannot be empty" }
  const trip = await prisma.trip.findUnique({ where: { id: tripId } })
  if (!trip || trip.ownerId !== userId) throw new Error("Not found")

  if (stopId) {
    const stop = await prisma.stop.findUnique({ where: { id: stopId } })
    if (!stop || stop.tripId !== tripId) throw new Error("Stop mismatch")
  }

  await prisma.note.create({
    data: {
      tripId,
      authorId: userId,
      stopId: stopId || null,
      body: body.trim(),
    },
  })
  revalidatePath(`/trips/${tripId}/notes`)
  return { ok: true as const }
}

export async function deleteNote(noteId: string) {
  const userId = await requireUserId()
  const note = await prisma.note.findUnique({ where: { id: noteId } })
  if (!note || note.authorId !== userId) throw new Error("Not found")
  await prisma.note.delete({ where: { id: noteId } })
  revalidatePath(`/trips/${note.tripId}/notes`)
}
