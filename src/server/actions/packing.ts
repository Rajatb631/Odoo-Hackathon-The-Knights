"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

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

export async function addPackingItem(tripId: string, label: string, category: string) {
  const userId = await requireUserId()
  await assertTripOwner(tripId, userId)
  if (!label.trim()) return { ok: false as const, error: "Label required" }
  await prisma.packingItem.create({
    data: { tripId, label: label.trim(), category: category.trim() || "other" },
  })
  revalidatePath(`/trips/${tripId}/packing`)
  return { ok: true as const }
}

export async function togglePackingItem(itemId: string) {
  const userId = await requireUserId()
  const item = await prisma.packingItem.findUnique({
    where: { id: itemId },
    include: { trip: true },
  })
  if (!item || item.trip.ownerId !== userId) throw new Error("Not found")
  await prisma.packingItem.update({
    where: { id: itemId },
    data: { packed: !item.packed },
  })
  revalidatePath(`/trips/${item.tripId}/packing`)
}

export async function deletePackingItem(itemId: string) {
  const userId = await requireUserId()
  const item = await prisma.packingItem.findUnique({
    where: { id: itemId },
    include: { trip: true },
  })
  if (!item || item.trip.ownerId !== userId) throw new Error("Not found")
  await prisma.packingItem.delete({ where: { id: itemId } })
  revalidatePath(`/trips/${item.tripId}/packing`)
}
