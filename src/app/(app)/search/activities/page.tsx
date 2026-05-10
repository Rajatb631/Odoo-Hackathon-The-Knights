import Link from "next/link"
import { prisma } from "@/lib/db"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ActivityCard } from "@/components/search/ActivityCard"

export default async function ActivitySearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; cityId?: string; maxCost?: string }>
}) {
  const { q, type, cityId, maxCost } = await searchParams

  const activities = await prisma.activity.findMany({
    where: {
      ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
      ...(type ? { type: { equals: type, mode: "insensitive" } } : {}),
      ...(cityId ? { cityId } : {}),
    },
    include: { city: true },
    orderBy: { name: "asc" },
  })

  const filtered = maxCost
    ? activities.filter((a) => Number(a.cost) <= Number(maxCost))
    : activities

  const types = await prisma.activity.findMany({
    distinct: ["type"],
    select: { type: true },
    orderBy: { type: "asc" },
  })
  const cities = await prisma.city.findMany({ orderBy: { name: "asc" } })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Activity search</h1>
        <p className="text-muted-foreground">Discover things to do and add them to a stop.</p>
      </div>

      <form className="flex gap-2 flex-wrap items-end" action="/search/activities">
        <div className="flex-1 min-w-[200px]">
          <label className="text-sm font-medium">Name</label>
          <Input name="q" defaultValue={q} placeholder="Eiffel" />
        </div>
        <div>
          <label className="text-sm font-medium">Type</label>
          <select name="type" defaultValue={type ?? ""} className="block border rounded h-9 px-3 text-sm">
            <option value="">Any</option>
            {types.map((t) => (
              <option key={t.type} value={t.type}>{t.type}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">City</label>
          <select name="cityId" defaultValue={cityId ?? ""} className="block border rounded h-9 px-3 text-sm">
            <option value="">Any</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>{c.name}, {c.country}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Max cost</label>
          <Input name="maxCost" type="number" min="0" defaultValue={maxCost} placeholder="100" className="w-28" />
        </div>
        <Button type="submit">Apply</Button>
        <Button asChild variant="ghost"><Link href="/search/activities">Reset</Link></Button>
      </form>

      {filtered.length === 0 ? (
        <div className="border rounded-lg p-8 text-center text-muted-foreground">No activities match.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((a) => (
            <ActivityCard
              key={a.id}
              id={a.id}
              name={a.name}
              type={a.type}
              description={a.description}
              cost={a.cost.toString()}
              durationMin={a.durationMin}
              cityId={a.cityId}
              cityName={a.city?.name ?? null}
              imageId={a.imageId}
            />
          ))}
        </div>
      )}
    </div>
  )
}
