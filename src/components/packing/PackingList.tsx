"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { safeAction } from "@/lib/server-action-utils"
import { addPackingItem, deletePackingItem, togglePackingItem } from "@/server/actions/packing"

type Item = { id: string; label: string; category: string; packed: boolean }

const CATEGORIES = ["clothing", "documents", "electronics", "toiletries", "other"]

export function PackingList({ tripId, items }: { tripId: string; items: Item[] }) {
  const [, startTransition] = useTransition()
  const [activeCat, setActiveCat] = useState<string>("clothing")
  const [label, setLabel] = useState("")

  const grouped = new Map<string, Item[]>()
  for (const cat of CATEGORIES) grouped.set(cat, [])
  for (const item of items) {
    if (!grouped.has(item.category)) grouped.set(item.category, [])
    grouped.get(item.category)!.push(item)
  }

  const total = items.length
  const packed = items.filter((i) => i.packed).length
  const pct = total === 0 ? 0 : Math.round((packed / total) * 100)

  return (
    <div className="space-y-6">
      {total > 0 && (
        <div className="border rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Progress</span>
            <span className="text-muted-foreground">{packed} / {total} packed ({pct}%)</span>
          </div>
          <div className="h-2 rounded bg-muted overflow-hidden">
            <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      <form
        className="flex gap-2 items-end flex-wrap border rounded-lg p-4"
        onSubmit={(e) => {
          e.preventDefault()
          const lbl = label.trim()
          if (!lbl) {
            toast.error("Enter an item name")
            return
          }
          setLabel("")
          startTransition(async () => {
            const res = await safeAction(() => addPackingItem(tripId, lbl, activeCat))
            if (!res.ok) toast.error(res.error)
            else if (!res.data.ok) toast.error(res.data.error)
            else toast.success(`Added ${lbl}`)
          })
        }}
      >
        <div className="flex-1 min-w-[200px]">
          <label className="text-sm font-medium" htmlFor="new-packing-label">New item</label>
          <Input id="new-packing-label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Walking shoes" />
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor="new-packing-category">Category</label>
          <select
            id="new-packing-category"
            value={activeCat}
            onChange={(e) => setActiveCat(e.target.value)}
            className="block border rounded h-9 px-3 text-sm"
          >
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <Button type="submit" disabled={!label.trim()}>Add</Button>
      </form>

      <div className="space-y-4">
        {[...grouped.entries()].map(([cat, list]) => (
          <div key={cat} className="border rounded-lg p-4">
            <h3 className="font-medium capitalize mb-2">{cat} <span className="text-muted-foreground text-sm font-normal">({list.length})</span></h3>
            {list.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing in this category.</p>
            ) : (
              <ul className="divide-y">
                {list.map((item) => {
                  const checkboxId = `pack-${item.id}`
                  return (
                    <li key={item.id} className="flex items-center gap-3 py-2">
                      <input
                        id={checkboxId}
                        type="checkbox"
                        checked={item.packed}
                        onChange={() =>
                          startTransition(async () => {
                            const res = await safeAction(() => togglePackingItem(item.id))
                            if (!res.ok) toast.error(res.error)
                          })
                        }
                        className="size-4 cursor-pointer"
                      />
                      <label
                        htmlFor={checkboxId}
                        className={`flex-1 text-sm cursor-pointer ${item.packed ? "line-through text-muted-foreground" : ""}`}
                      >
                        {item.label}
                      </label>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() =>
                          startTransition(async () => {
                            const res = await safeAction(() => deletePackingItem(item.id))
                            if (!res.ok) toast.error(res.error)
                          })
                        }
                      >
                        Remove
                      </Button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
