"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

export function ExpenseChart({ data }: { data: { name: string; total: number }[] }) {
  if (data.length === 0) return null
  return (
    <div className="rounded-xl border bg-card p-6">
      <p className="text-sm font-semibold mb-4">By category</p>
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 12, right: 12, bottom: 12, left: 12 }}>
            <Pie
              data={data}
              dataKey="total"
              nameKey="name"
              outerRadius={70}
              label={(entry) => `$${Math.round(Number(entry.value ?? 0))}`}
              labelLine={false}
            >
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`} />
            <Legend wrapperStyle={{ paddingTop: 12, fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
