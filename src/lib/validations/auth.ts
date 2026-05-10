import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password required"),
})

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Min 8 characters"),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
