"use client"

import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ReferenceLine,
} from "recharts"

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6"]

export function BudgetChart({
  perStop,
  tripBudget,
}: {
  perStop: { name: string; total: number }[]
  tripBudget: number | null
}) {
  if (perStop.length === 0) return null
  const total = perStop.reduce((s, p) => s + p.total, 0)

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="border rounded-lg p-4">
        <p className="text-sm font-medium mb-2">By stop</p>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={perStop}
              dataKey="total"
              nameKey="name"
              outerRadius={80}
              label={(entry) => `$${Math.round(Number(entry.value ?? 0))}`}
            >
              {perStop.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        <p className="text-sm text-center text-muted-foreground">Total: ${total.toLocaleString()}</p>
      </div>

      <div className="border rounded-lg p-4">
        <p className="text-sm font-medium mb-2">Spend vs budget</p>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={perStop}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`} />
            <Bar dataKey="total" fill="#3b82f6" />
            {tripBudget != null && (
              <ReferenceLine y={tripBudget} stroke="#ef4444" strokeDasharray="4 4" label="Budget" />
            )}
          </BarChart>
        </ResponsiveContainer>
        {tripBudget != null && (
          <p className="text-sm text-center text-muted-foreground">
            Budget cap: ${tripBudget.toLocaleString()}
            {total > tripBudget && <span className="text-destructive font-medium"> · Over by ${(total - tripBudget).toLocaleString()}</span>}
          </p>
        )}
      </div>
    </div>
  )
}
