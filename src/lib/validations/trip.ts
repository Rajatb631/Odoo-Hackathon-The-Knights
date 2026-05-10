import { z } from "zod"

export const createTripSchema = z.object({
  name: z.string().min(1, "Name required").max(120),
  description: z.string().max(2000).optional().nullable(),
  startDate: z.string().min(1, "Start date required"),
  endDate: z.string().min(1, "End date required"),
  budget: z.string().optional().nullable(),
}).refine((d) => new Date(d.endDate) >= new Date(d.startDate), {
  message: "End date must be on or after start date",
  path: ["endDate"],
})

export type CreateTripInput = z.infer<typeof createTripSchema>
