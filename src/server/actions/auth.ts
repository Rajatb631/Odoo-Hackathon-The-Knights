"use server"

import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"
import { registerSchema, type RegisterInput } from "@/lib/validations/auth"

export async function registerUser(input: RegisterInput) {
  const parsed = registerSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false as const, error: "Invalid input" }
  }
  const { email, password, firstName, lastName } = parsed.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return { ok: false as const, error: "Email already registered" }
  }

  const passwordHash = await bcrypt.hash(password, 10)
  await prisma.user.create({
    data: { email, passwordHash, firstName, lastName },
  })

  return { ok: true as const }
}
