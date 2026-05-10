import { z } from "zod"

export const EXPENSE_CATEGORIES = ["transport", "stay", "activities", "meals", "other"] as const

export const createExpenseSchema = z.object({
  tripId: z.string().min(1),
  category: z.enum(EXPENSE_CATEGORIES),
  label: z.string().min(1, "Label required").max(200),
  amount: z.string().min(1, "Amount required"),
  date: z.string().min(1, "Date required"),
})

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>
