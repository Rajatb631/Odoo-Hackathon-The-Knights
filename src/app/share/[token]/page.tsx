import { notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/db"
import { ItineraryView } from "@/components/trip/ItineraryView"

export default async function SharedTripPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const trip = await prisma.trip.findUnique({
    where: { shareToken: token },
    include: {
      stops: {
        orderBy: { order: "asc" },
        include: {
          city: true,
          stopActivities: { include: { activity: true } },
        },
      },
    },
  })
  if (!trip || !trip.isPublic) notFound()

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6 pb-4 border-b flex items-center justify-between">
        <Link href="/" className="font-semibold">Traveloop</Link>
        <span className="text-xs text-muted-foreground uppercase tracking-wide">Public itinerary</span>
      </div>
      <ItineraryView trip={trip} readOnly />
    </div>
  )
}
