"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

async function requireUserId() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  return session.user.id
}

export async function addCityToTrip(cityId: string, tripId: string) {
  const userId = await requireUserId()
  const trip = await prisma.trip.findUnique({ where: { id: tripId } })
  if (!trip || trip.ownerId !== userId) throw new Error("Not found")
  const city = await prisma.city.findUnique({ where: { id: cityId } })
  if (!city) throw new Error("City not found")

  const last = await prisma.stop.findFirst({
    where: { tripId },
    orderBy: { order: "desc" },
  })
  const nextOrder = (last?.order ?? 0) + 1

  const tripStart = new Date(trip.startDate)
  const tripEnd = new Date(trip.endDate)

  const rawStart = last ? new Date(last.endDate) : tripStart
  const start = rawStart < tripStart ? tripStart : rawStart > tripEnd ? tripEnd : rawStart

  const candidateEnd = new Date(start)
  candidateEnd.setDate(candidateEnd.getDate() + 2)
  const end = candidateEnd > tripEnd ? tripEnd : candidateEnd < start ? start : candidateEnd

  await prisma.stop.create({
    data: {
      tripId,
      cityId,
      startDate: start,
      endDate: end,
      order: nextOrder,
    },
  })
  revalidatePath(`/trips/${tripId}/builder`)
  revalidatePath(`/trips/${tripId}`)
  return { ok: true as const }
}

export async function addActivityToExistingStop(stopId: string, activityId: string) {
  const userId = await requireUserId()
  const stop = await prisma.stop.findUnique({
    where: { id: stopId },
    include: { trip: true },
  })
  if (!stop || stop.trip.ownerId !== userId) throw new Error("Not found")

  // Avoid duplicate
  const existing = await prisma.stopActivity.findFirst({
    where: { stopId, activityId },
  })
  if (existing) return { ok: true as const, duplicate: true }

  await prisma.stopActivity.create({ data: { stopId, activityId } })
  revalidatePath(`/trips/${stop.tripId}/builder`)
  revalidatePath(`/trips/${stop.tripId}`)
  return { ok: true as const }
}

export async function getMyTripsForPicker() {
  const userId = await requireUserId()
  return prisma.trip.findMany({
    where: { ownerId: userId, status: { in: ["UPCOMING", "ONGOING"] } },
    select: {
      id: true,
      name: true,
      startDate: true,
      endDate: true,
      stops: {
        select: { id: true, cityId: true, city: { select: { name: true } } },
        orderBy: { order: "asc" },
      },
    },
    orderBy: { startDate: "asc" },
  })
}
