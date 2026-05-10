"use client"

import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { deleteExpense } from "@/server/actions/expenses"

export function DeleteExpenseButton({ expenseId }: { expenseId: string }) {
  const [pending, startTransition] = useTransition()
  return (
    <Button size="sm" variant="ghost" disabled={pending} onClick={() => startTransition(() => deleteExpense(expenseId))}>
      Delete
    </Button>
  )
}
