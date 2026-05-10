import { notFound } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { ExpenseForm } from "@/components/expenses/ExpenseForm"
import { ExpenseChart } from "@/components/expenses/ExpenseChart"
import { DeleteExpenseButton } from "@/components/expenses/DeleteExpenseButton"

export default async function ExpensesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  const userId = session!.user!.id!

  const trip = await prisma.trip.findUnique({
    where: { id },
    include: { expenses: { orderBy: { date: "desc" } } },
  })
  if (!trip || trip.ownerId !== userId) notFound()

  const totals = new Map<string, number>()
  for (const e of trip.expenses) {
    totals.set(e.category, (totals.get(e.category) ?? 0) + Number(e.amount))
  }
  const chartData = [...totals.entries()].map(([name, total]) => ({ name, total }))
  const grandTotal = [...totals.values()].reduce((a, b) => a + b, 0)
  const tripBudget = trip.budget != null ? Number(trip.budget) : null
  const overBudget = tripBudget != null && grandTotal > tripBudget

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">{trip.name} · Expenses</h1>
          <p className="text-muted-foreground">Track real spend — compare against budget.</p>
        </div>
        <Button asChild variant="outline"><Link href={`/trips/${trip.id}`}>← Back to itinerary</Link></Button>
      </div>

      <ExpenseForm tripId={trip.id} />

      <div className="grid md:grid-cols-2 gap-4">
        <ExpenseChart data={chartData} />
        <div className="border rounded-lg p-4 space-y-2">
          <p className="text-sm font-medium">Totals</p>
          <ul className="text-sm space-y-1">
            {chartData.length === 0
              ? <li className="text-muted-foreground">No expenses yet.</li>
              : chartData.map((d) => (
                  <li key={d.name} className="flex justify-between">
                    <span className="capitalize">{d.name}</span>
                    <span className="font-medium">${d.total.toLocaleString()}</span>
                  </li>
                ))}
          </ul>
          <div className="border-t pt-2 flex justify-between font-medium text-sm">
            <span>Total</span>
            <span>${grandTotal.toLocaleString()}</span>
          </div>
          {tripBudget != null && (
            <div className="text-xs text-muted-foreground">
              Budget cap: ${tripBudget.toLocaleString()}
              {overBudget && <span className="text-destructive font-medium"> · Over by ${(grandTotal - tripBudget).toLocaleString()}</span>}
            </div>
          )}
        </div>
      </div>

      {trip.expenses.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">Category</th>
                <th className="text-left p-3">Label</th>
                <th className="text-right p-3">Amount</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {trip.expenses.map((e) => (
                <tr key={e.id}>
                  <td className="p-3">{format(e.date, "MMM d, yyyy")}</td>
                  <td className="p-3 capitalize">{e.category}</td>
                  <td className="p-3">{e.label}</td>
                  <td className="p-3 text-right font-medium">${Number(e.amount).toLocaleString()}</td>
                  <td className="p-3 text-right"><DeleteExpenseButton expenseId={e.id} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
