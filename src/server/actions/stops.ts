"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { emptyToNull, parseDateOnly } from "@/lib/forms"
import { createStopSchema, type CreateStopInput } from "@/lib/validations/stop"

async function requireUserId() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  return session.user.id
}

async function assertTripOwner(tripId: string, userId: string) {
  const trip = await prisma.trip.findUnique({ where: { id: tripId } })
  if (!trip || trip.ownerId !== userId) throw new Error("Not found")
  return trip
}

export async function createStop(input: CreateStopInput) {
  const userId = await requireUserId()
  const parsed = createStopSchema.safeParse(input)
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" }

  await assertTripOwner(parsed.data.tripId, userId)

  const last = await prisma.stop.findFirst({
    where: { tripId: parsed.data.tripId },
    orderBy: { order: "desc" },
  })
  const nextOrder = (last?.order ?? 0) + 1

  await prisma.stop.create({
    data: {
      tripId: parsed.data.tripId,
      cityId: parsed.data.cityId,
      startDate: parseDateOnly(parsed.data.startDate),
      endDate: parseDateOnly(parsed.data.endDate),
      budget: emptyToNull(parsed.data.budget),
      notes: emptyToNull(parsed.data.notes),
      order: nextOrder,
    },
  })
  revalidatePath(`/trips/${parsed.data.tripId}/builder`)
  revalidatePath(`/trips/${parsed.data.tripId}`)
  return { ok: true as const }
}

export async function deleteStop(stopId: string) {
  const userId = await requireUserId()
  const stop = await prisma.stop.findUnique({ where: { id: stopId }, include: { trip: true } })
  if (!stop || stop.trip.ownerId !== userId) throw new Error("Not found")
  await prisma.stop.delete({ where: { id: stopId } })
  revalidatePath(`/trips/${stop.tripId}/builder`)
  revalidatePath(`/trips/${stop.tripId}`)
}

export async function moveStop(stopId: string, direction: "up" | "down") {
  const userId = await requireUserId()
  const stop = await prisma.stop.findUnique({ where: { id: stopId }, include: { trip: true } })
  if (!stop || stop.trip.ownerId !== userId) throw new Error("Not found")

  const sibling = await prisma.stop.findFirst({
    where: {
      tripId: stop.tripId,
      order: direction === "up" ? { lt: stop.order } : { gt: stop.order },
    },
    orderBy: { order: direction === "up" ? "desc" : "asc" },
  })
  if (!sibling) return

  await prisma.$transaction([
    prisma.stop.update({ where: { id: stop.id }, data: { order: sibling.order } }),
    prisma.stop.update({ where: { id: sibling.id }, data: { order: stop.order } }),
  ])
  revalidatePath(`/trips/${stop.tripId}/builder`)
  revalidatePath(`/trips/${stop.tripId}`)
}

export async function addActivityToStop(stopId: string, activityId: string) {
  const userId = await requireUserId()
  const stop = await prisma.stop.findUnique({ where: { id: stopId }, include: { trip: true } })
  if (!stop || stop.trip.ownerId !== userId) throw new Error("Not found")

  await prisma.stopActivity.create({
    data: { stopId, activityId },
  })
  revalidatePath(`/trips/${stop.tripId}/builder`)
  revalidatePath(`/trips/${stop.tripId}`)
}

export async function removeStopActivity(stopActivityId: string) {
  const userId = await requireUserId()
  const sa = await prisma.stopActivity.findUnique({
    where: { id: stopActivityId },
    include: { stop: { include: { trip: true } } },
  })
  if (!sa || sa.stop.trip.ownerId !== userId) throw new Error("Not found")
  await prisma.stopActivity.delete({ where: { id: stopActivityId } })
  revalidatePath(`/trips/${sa.stop.tripId}/builder`)
  revalidatePath(`/trips/${sa.stop.tripId}`)
}
