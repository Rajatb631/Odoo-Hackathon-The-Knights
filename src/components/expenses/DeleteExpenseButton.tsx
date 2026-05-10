"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { safeAction } from "@/lib/server-action-utils"
import { deleteExpense } from "@/server/actions/expenses"

export function DeleteExpenseButton({ expenseId }: { expenseId: string }) {
  const [pending, startTransition] = useTransition()
  return (
    <Button
      size="sm"
      variant="destructive"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await safeAction(() => deleteExpense(expenseId))
          if (!res.ok) toast.error(res.error)
        })
      }
    >
      Delete
    </Button>
  )
}
