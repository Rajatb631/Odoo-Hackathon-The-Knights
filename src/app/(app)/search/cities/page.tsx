import Link from "next/link"
import { prisma } from "@/lib/db"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CityCard } from "@/components/search/CityCard"

export default async function CitySearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; country?: string; sort?: string }>
}) {
  const { q, country, sort } = await searchParams

  const cities = await prisma.city.findMany({
    where: {
      ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
      ...(country ? { country: { equals: country, mode: "insensitive" } } : {}),
    },
    orderBy: sort === "cost" ? { costIndex: "asc" } : { popularity: "desc" },
  })

  const allCountries = await prisma.city.findMany({
    distinct: ["country"],
    select: { country: true },
    orderBy: { country: "asc" },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">City search</h1>
        <p className="text-muted-foreground">Find cities and add them as trip stops.</p>
      </div>

      <form className="flex gap-2 flex-wrap items-end" action="/search/cities">
        <div className="flex-1 min-w-[200px]">
          <label className="text-sm font-medium">Name</label>
          <Input name="q" defaultValue={q} placeholder="Paris" />
        </div>
        <div>
          <label className="text-sm font-medium">Country</label>
          <select name="country" defaultValue={country ?? ""} className="block border rounded h-9 px-3 text-sm">
            <option value="">Any</option>
            {allCountries.map((c) => (
              <option key={c.country} value={c.country}>{c.country}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Sort</label>
          <select name="sort" defaultValue={sort ?? "popularity"} className="block border rounded h-9 px-3 text-sm">
            <option value="popularity">Popularity</option>
            <option value="cost">Cost (low → high)</option>
          </select>
        </div>
        <Button type="submit">Apply</Button>
        <Button asChild variant="ghost"><Link href="/search/cities">Reset</Link></Button>
      </form>

      {cities.length === 0 ? (
        <div className="border rounded-lg p-8 text-center text-muted-foreground">No cities match.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cities.map((c) => (
            <CityCard
              key={c.id}
              id={c.id}
              name={c.name}
              country={c.country}
              region={c.region}
              costIndex={c.costIndex}
              popularity={c.popularity}
              imageId={c.imageId}
            />
          ))}
        </div>
      )}
    </div>
  )
}
