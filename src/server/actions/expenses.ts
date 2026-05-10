"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { createExpenseSchema, type CreateExpenseInput } from "@/lib/validations/expense"

async function requireUserId() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  return session.user.id
}

export async function createExpense(input: CreateExpenseInput) {
  const userId = await requireUserId()
  const parsed = createExpenseSchema.safeParse(input)
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" }

  const trip = await prisma.trip.findUnique({ where: { id: parsed.data.tripId } })
  if (!trip || trip.ownerId !== userId) throw new Error("Not found")

  const amount = Number(parsed.data.amount)
  if (Number.isNaN(amount) || amount <= 0) return { ok: false as const, error: "Amount must be > 0" }

  await prisma.expense.create({
    data: {
      tripId: parsed.data.tripId,
      category: parsed.data.category,
      label: parsed.data.label,
      amount: parsed.data.amount,
      date: new Date(parsed.data.date),
    },
  })
  revalidatePath(`/trips/${parsed.data.tripId}/expenses`)
  return { ok: true as const }
}

export async function deleteExpense(expenseId: string) {
  const userId = await requireUserId()
  const exp = await prisma.expense.findUnique({
    where: { id: expenseId },
    include: { trip: true },
  })
  if (!exp || exp.trip.ownerId !== userId) throw new Error("Not found")
  await prisma.expense.delete({ where: { id: expenseId } })
  revalidatePath(`/trips/${exp.tripId}/expenses`)
}
