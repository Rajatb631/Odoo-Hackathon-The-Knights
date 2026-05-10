import Link from "next/link"
import { notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { ItineraryView } from "@/components/trip/ItineraryView"
import { ShareControls } from "@/components/trip/ShareControls"

export default async function TripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  const userId = session!.user!.id!

  const trip = await prisma.trip.findUnique({
    where: { id },
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
  if (!trip || trip.ownerId !== userId) notFound()

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-2">
        <Button asChild variant="outline"><Link href={`/trips/${trip.id}/builder`}>Edit itinerary</Link></Button>
      </div>
      <ShareControls tripId={trip.id} initialPublic={trip.isPublic} initialToken={trip.shareToken} />
      <ItineraryView trip={trip} />
    </div>
  )
}
