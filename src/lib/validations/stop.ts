import { z } from "zod"

export const createStopSchema = z.object({
  tripId: z.string().min(1),
  cityId: z.string().min(1, "Pick a city"),
  startDate: z.string().min(1, "Start date required"),
  endDate: z.string().min(1, "End date required"),
  budget: z.string().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
}).refine((d) => new Date(d.endDate) >= new Date(d.startDate), {
  message: "End date must be on or after start date",
  path: ["endDate"],
})

export type CreateStopInput = z.infer<typeof createStopSchema>
