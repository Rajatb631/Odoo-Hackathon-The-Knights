"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { updateProfileSchema, type UpdateProfileInput } from "@/lib/validations/profile"

export async function updateProfile(input: UpdateProfileInput) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  const parsed = updateProfileSchema.safeParse(input)
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      phone: parsed.data.phone ?? null,
      city: parsed.data.city ?? null,
      country: parsed.data.country ?? null,
      bio: parsed.data.bio ?? null,
      ...(parsed.data.photoId ? { photoId: parsed.data.photoId } : {}),
    },
  })
  revalidatePath("/profile")
  revalidatePath("/dashboard")
  return { ok: true as const }
}
