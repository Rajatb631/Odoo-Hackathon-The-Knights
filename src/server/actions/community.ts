"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

async function requireUserId() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  return session.user.id
}

export async function toggleLike(tripId: string) {
  const userId = await requireUserId()
  const trip = await prisma.trip.findUnique({ where: { id: tripId } })
  if (!trip || !trip.isPublic) throw new Error("Not found")

  const existing = await prisma.like.findUnique({
    where: { userId_tripId: { userId, tripId } },
  })

  if (existing) {
    await prisma.like.delete({ where: { userId_tripId: { userId, tripId } } })
  } else {
    await prisma.like.create({ data: { userId, tripId } })
  }

  const count = await prisma.like.count({ where: { tripId } })
  revalidatePath("/community")
  return { liked: !existing, count }
}

export async function copyTrip(sourceTripId: string) {
  const userId = await requireUserId()
  const source = await prisma.trip.findUnique({
    where: { id: sourceTripId },
    include: {
      stops: {
        orderBy: { order: "asc" },
        include: { stopActivities: true },
      },
    },
  })
  if (!source || !source.isPublic) throw new Error("Not found")

  const newTrip = await prisma.$transaction(async (tx) => {
    const trip = await tx.trip.create({
      data: {
        ownerId: userId,
        name: `${source.name} (copy)`,
        description: source.description,
        coverImageId: source.coverImageId,
        startDate: source.startDate,
        endDate: source.endDate,
        budget: source.budget,
        status: "UPCOMING",
        isPublic: false,
        shareToken: null,
      },
    })

    for (const stop of source.stops) {
      const newStop = await tx.stop.create({
        data: {
          tripId: trip.id,
          cityId: stop.cityId,
          startDate: stop.startDate,
          endDate: stop.endDate,
          budget: stop.budget,
          notes: stop.notes,
          order: stop.order,
        },
      })
      if (stop.stopActivities.length > 0) {
        await tx.stopActivity.createMany({
          data: stop.stopActivities.map((sa) => ({
            stopId: newStop.id,
            activityId: sa.activityId,
            scheduledAt: sa.scheduledAt,
            costOverride: sa.costOverride,
          })),
        })
      }
    }

    return trip
  })

  revalidatePath("/dashboard")
  revalidatePath("/trips")
  redirect(`/trips/${newTrip.id}/builder`)
}
