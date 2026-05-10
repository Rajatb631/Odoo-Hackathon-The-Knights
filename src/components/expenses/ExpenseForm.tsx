"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createExpenseSchema, type CreateExpenseInput, EXPENSE_CATEGORIES } from "@/lib/validations/expense"
import { createExpense } from "@/server/actions/expenses"

export function ExpenseForm({ tripId }: { tripId: string }) {
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateExpenseInput>({
    resolver: zodResolver(createExpenseSchema),
    defaultValues: { tripId, category: "meals" },
  })

  const onSubmit = (data: CreateExpenseInput) => {
    setError(null)
    startTransition(async () => {
      const res = await createExpense(data)
      if (!res.ok) setError(res.error)
      else reset({ tripId, category: data.category })
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="border rounded-lg p-4 space-y-3 grid grid-cols-1 sm:grid-cols-5 gap-3 sm:items-end">
      <input type="hidden" {...register("tripId")} value={tripId} />
      <div className="space-y-1">
        <Label>Category</Label>
        <select {...register("category")} className="block border rounded h-9 px-3 text-sm w-full">
          {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="space-y-1 sm:col-span-2">
        <Label>Label</Label>
        <Input {...register("label")} placeholder="Hotel night" />
        {errors.label && <p className="text-xs text-destructive">{errors.label.message}</p>}
      </div>
      <div className="space-y-1">
        <Label>Amount</Label>
        <Input type="number" step="0.01" min="0" {...register("amount")} placeholder="120.00" />
        {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
      </div>
      <div className="space-y-1">
        <Label>Date</Label>
        <Input type="date" {...register("date")} />
        {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
      </div>
      <div className="sm:col-span-5 flex items-center gap-3">
        <Button type="submit" disabled={pending}>{pending ? "Adding…" : "Add expense"}</Button>
        {error && <span className="text-sm text-destructive">{error}</span>}
      </div>
    </form>
  )
}
