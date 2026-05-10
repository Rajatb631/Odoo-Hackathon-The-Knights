import Link from "next/link"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type Props = {
  id: string
  name: string
  description?: string | null
  startDate: Date
  endDate: Date
  budget?: number | string | null
  status: "UPCOMING" | "ONGOING" | "COMPLETED"
  coverImageId?: string | null
}

const STATUS_VARIANT: Record<Props["status"], "default" | "secondary" | "outline"> = {
  UPCOMING: "default",
  ONGOING: "secondary",
  COMPLETED: "outline",
}

export function TripCard(t: Props) {
  return (
    <Link href={`/trips/${t.id}`} className="block group">
      <Card className="overflow-hidden transition-shadow hover:shadow-md py-0 gap-0">
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
        <CardHeader className="pt-4">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base group-hover:underline">{t.name}</CardTitle>
            <Badge variant={STATUS_VARIANT[t.status]}>{t.status.toLowerCase()}</Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-4 space-y-1">
          <p className="text-sm text-muted-foreground">
            {format(t.startDate, "MMM d")} – {format(t.endDate, "MMM d, yyyy")}
          </p>
          {t.budget != null && (
            <p className="text-sm font-medium">Budget: ${Number(t.budget).toLocaleString()}</p>
          )}
          {t.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{t.description}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
