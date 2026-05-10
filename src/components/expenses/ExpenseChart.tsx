"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

export function ExpenseChart({ data }: { data: { name: string; total: number }[] }) {
  if (data.length === 0) return null
  return (
    <div className="border rounded-lg p-4">
      <p className="text-sm font-medium mb-2">By category</p>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            dataKey="total"
            nameKey="name"
            outerRadius={80}
            label={(entry) => `$${Math.round(Number(entry.value ?? 0))}`}
          >
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
