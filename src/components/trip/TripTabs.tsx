"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function TripTabs({ tripId }: { tripId: string }) {
  const path = usePathname()
  const tabs = [
    { href: `/trips/${tripId}`, label: "Itinerary", match: (p: string) => p === `/trips/${tripId}` },
    { href: `/trips/${tripId}/builder`, label: "Builder", match: (p: string) => p.endsWith("/builder") },
    { href: `/trips/${tripId}/packing`, label: "Packing", match: (p: string) => p.endsWith("/packing") },
    { href: `/trips/${tripId}/notes`, label: "Notes", match: (p: string) => p.endsWith("/notes") },
    { href: `/trips/${tripId}/expenses`, label: "Expenses", match: (p: string) => p.endsWith("/expenses") },
  ]
  return (
    <nav className="border-b flex gap-1 overflow-x-auto">
      {tabs.map((t) => {
        const active = t.match(path)
        return (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "px-3 py-2 text-sm border-b-2 -mb-px whitespace-nowrap",
              active ? "border-primary font-medium" : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </Link>
        )
      })}
    </nav>
  )
}
