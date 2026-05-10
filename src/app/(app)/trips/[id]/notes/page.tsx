import { notFound } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { NoteComposer } from "@/components/notes/NoteComposer"
import { DeleteNoteButton } from "@/components/notes/DeleteNoteButton"

export default async function NotesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  const userId = session!.user!.id!

  const trip = await prisma.trip.findUnique({
    where: { id },
    include: {
      stops: { include: { city: true }, orderBy: { order: "asc" } },
      notes: { orderBy: { createdAt: "desc" }, include: { author: true } },
    },
  })
  if (!trip || trip.ownerId !== userId) notFound()

  const stops = trip.stops.map((s) => ({ id: s.id, cityName: s.city.name }))
  const stopMap = new Map(trip.stops.map((s) => [s.id, s.city.name]))

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">{trip.name} · Notes</h1>
          <p className="text-muted-foreground">Trip-wide and per-stop journal entries.</p>
        </div>
        <Button asChild variant="outline"><Link href={`/trips/${trip.id}`}>← Back to itinerary</Link></Button>
      </div>

      <NoteComposer tripId={trip.id} stops={stops} />

      {trip.notes.length === 0 ? (
        <div className="border rounded-lg p-8 text-center text-muted-foreground">No notes yet.</div>
      ) : (
        <div className="space-y-3">
          {trip.notes.map((n) => {
            const isAuthor = n.authorId === userId
            const stopLabel = n.stopId ? `Stop: ${stopMap.get(n.stopId) ?? "?"}` : "Trip-wide"
            return (
              <Card key={n.id}>
                <CardContent className="space-y-2 py-4">
                  <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span>{stopLabel} · {format(n.createdAt, "MMM d, yyyy 'at' HH:mm")} · {n.author.firstName}</span>
                    {isAuthor && <DeleteNoteButton noteId={n.id} />}
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{n.body}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
