import { z } from "zod"

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  phone: z.string().max(40).optional().nullable(),
  city: z.string().max(80).optional().nullable(),
  country: z.string().max(80).optional().nullable(),
  bio: z.string().max(2000).optional().nullable(),
  photoId: z.string().optional().nullable(),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
