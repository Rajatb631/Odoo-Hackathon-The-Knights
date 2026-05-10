import { notFound } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { PackingList } from "@/components/packing/PackingList"
import { Button } from "@/components/ui/button"

export default async function PackingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  const userId = session!.user!.id!

  const trip = await prisma.trip.findUnique({
    where: { id },
    include: { packingItems: { orderBy: [{ category: "asc" }, { label: "asc" }] } },
  })
  if (!trip || trip.ownerId !== userId) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">{trip.name} · Packing</h1>
          <p className="text-muted-foreground">Don&apos;t forget anything important.</p>
        </div>
        <Button asChild variant="outline"><Link href={`/trips/${trip.id}`}>← Back to itinerary</Link></Button>
      </div>
      <PackingList tripId={trip.id} items={trip.packingItems} />
    </div>
  )
}
