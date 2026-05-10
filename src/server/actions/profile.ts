"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { emptyToNull } from "@/lib/forms"
import { updateProfileSchema, type UpdateProfileInput } from "@/lib/validations/profile"

export async function updateProfile(input: UpdateProfileInput) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  const parsed = updateProfileSchema.safeParse(input)
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" }

  const userId = session.user.id
  const newPhotoId = emptyToNull(parsed.data.photoId ?? null)

  const previous = await prisma.user.findUnique({
    where: { id: userId },
    select: { photoId: true },
  })

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        firstName: parsed.data.firstName.trim(),
        lastName: parsed.data.lastName.trim(),
        phone: emptyToNull(parsed.data.phone),
        city: emptyToNull(parsed.data.city),
        country: emptyToNull(parsed.data.country),
        bio: emptyToNull(parsed.data.bio),
        ...(newPhotoId ? { photoId: newPhotoId } : {}),
      },
    })

    // Cleanup orphan: if a new uploaded image replaces a previously uploaded one,
    // delete the old Image row. Skip seeded images (id starts with "img_").
    if (
      newPhotoId &&
      previous?.photoId &&
      previous.photoId !== newPhotoId &&
      !previous.photoId.startsWith("img_")
    ) {
      await tx.image.delete({ where: { id: previous.photoId } }).catch(() => {})
    }
  })

  revalidatePath("/profile")
  revalidatePath("/dashboard")
  return { ok: true as const }
}
