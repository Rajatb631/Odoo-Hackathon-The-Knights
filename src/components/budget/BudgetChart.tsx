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
      <div className="rounded-xl border bg-card p-6">
        <p className="text-sm font-semibold mb-4">By stop</p>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 12, right: 12, bottom: 12, left: 12 }}>
              <Pie
                data={perStop}
                dataKey="total"
                nameKey="name"
                outerRadius={70}
                label={(entry) => `$${Math.round(Number(entry.value ?? 0))}`}
                labelLine={false}
              >
                {perStop.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`} />
              <Legend wrapperStyle={{ paddingTop: 12, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <p className="text-sm text-center text-muted-foreground mt-3">
          Total: ${total.toLocaleString()}
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <p className="text-sm font-semibold mb-4">Spend vs budget</p>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={perStop} margin={{ top: 12, right: 16, bottom: 24, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.91 0.018 230)" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11 }}
                tickMargin={10}
                interval={0}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                tickMargin={8}
                axisLine={false}
                tickLine={false}
                width={48}
              />
              <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`} cursor={{ fill: "oklch(0.96 0.018 230 / 0.6)" }} />
              <Bar dataKey="total" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              {tripBudget != null && (
                <ReferenceLine y={tripBudget} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "Budget", fontSize: 11, fill: "#ef4444", position: "right" }} />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
        {tripBudget != null && (
          <p className="text-sm text-center text-muted-foreground mt-3">
            Budget cap: ${tripBudget.toLocaleString()}
            {total > tripBudget && <span className="text-destructive font-medium"> · Over by ${(total - tripBudget).toLocaleString()}</span>}
          </p>
        )}
      </div>
    </div>
  )
}
