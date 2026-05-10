import Link from "next/link"
import { format } from "date-fns"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LikeButton } from "@/components/community/LikeButton"
import { CopyTripButton } from "@/components/community/CopyTripButton"

export default async function CommunityPage() {
  const session = await auth()
  const userId = session!.user!.id!

  const trips = await prisma.trip.findMany({
    where: { isPublic: true, shareToken: { not: null } },
    include: {
      owner: { select: { firstName: true, lastName: true } },
      stops: {
        select: { id: true, city: { select: { name: true } } },
        orderBy: { order: "asc" },
      },
      _count: { select: { likes: true } },
      likes: { where: { userId }, take: 1 },
    },
    orderBy: [{ likes: { _count: "desc" } }, { createdAt: "desc" }],
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Community</h1>
        <p className="text-muted-foreground">Public trips shared by other travellers. Like the ones you love, copy them to your account, and customise.</p>
      </div>

      {trips.length === 0 ? (
        <div className="border rounded-lg p-12 text-center text-muted-foreground">
          No public trips yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {trips.map((t) => {
            const liked = t.likes.length > 0
            const isOwner = t.ownerId === userId
            return (
              <Card key={t.id} className="overflow-hidden py-0 gap-0">
                <Link href={`/share/${t.shareToken}`}>
                  {t.coverImageId ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`/api/images/${t.coverImageId}`}
                      alt={t.name}
                      className="w-full aspect-[16/9] object-cover"
                    />
                  ) : (
                    <div className="w-full aspect-[16/9] bg-muted" />
                  )}
                </Link>
                <CardHeader className="pt-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base">{t.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        by {t.owner.firstName} · {format(t.startDate, "MMM yyyy")}
                      </p>
                    </div>
                    <Badge variant="outline">{t.stops.length} stops</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-4 space-y-3">
                  {t.stops.length > 0 && (
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {t.stops.map((s) => s.city.name).join(" → ")}
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <LikeButton tripId={t.id} initialLiked={liked} initialCount={t._count.likes} />
                    {!isOwner && <CopyTripButton tripId={t.id} />}
                    <Link
                      href={`/share/${t.shareToken}`}
                      className="text-sm underline ml-auto"
                    >
                      View
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
