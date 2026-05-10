"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { nanoid } from "nanoid"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { createTripSchema, type CreateTripInput } from "@/lib/validations/trip"

async function requireUserId() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  return session.user.id
}

export async function createTrip(input: CreateTripInput) {
  const userId = await requireUserId()
  const parsed = createTripSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }
  const trip = await prisma.trip.create({
    data: {
      ownerId: userId,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      startDate: new Date(parsed.data.startDate),
      endDate: new Date(parsed.data.endDate),
      budget: parsed.data.budget && parsed.data.budget !== "" ? parsed.data.budget : null,
      coverImageId: parsed.data.coverImageId || null,
    },
  })
  revalidatePath("/dashboard")
  revalidatePath("/trips")
  redirect(`/trips/${trip.id}/builder`)
}

export async function deleteTrip(id: string) {
  const userId = await requireUserId()
  const trip = await prisma.trip.findUnique({ where: { id } })
  if (!trip || trip.ownerId !== userId) throw new Error("Not found")
  await prisma.trip.delete({ where: { id } })
  revalidatePath("/dashboard")
  revalidatePath("/trips")
  redirect("/trips")
}

export async function toggleShare(id: string) {
  const userId = await requireUserId()
  const trip = await prisma.trip.findUnique({ where: { id } })
  if (!trip || trip.ownerId !== userId) throw new Error("Not found")

  const next = !trip.isPublic
  const updated = await prisma.trip.update({
    where: { id },
    data: {
      isPublic: next,
      shareToken: next ? trip.shareToken ?? nanoid(12) : null,
    },
  })
  revalidatePath(`/trips/${id}`)
  return { ok: true as const, isPublic: updated.isPublic, shareToken: updated.shareToken }
}
