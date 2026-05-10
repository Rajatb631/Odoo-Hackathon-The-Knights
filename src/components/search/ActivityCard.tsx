import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AddActivityToTripDialog } from "./AddActivityToTripDialog"

type Props = {
  id: string
  name: string
  type: string
  description: string | null
  cost: string
  durationMin: number
  cityId: string | null
  cityName: string | null
  imageId: string | null
}

export function ActivityCard(a: Props) {
  return (
    <Card className="overflow-hidden py-0 gap-0">
      {a.imageId ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`/api/images/${a.imageId}`} alt={a.name} className="w-full aspect-[16/9] object-cover" />
      ) : (
        <div className="w-full aspect-[16/9] bg-muted" />
      )}
      <CardHeader className="pt-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">{a.name}</CardTitle>
            {a.cityName && <p className="text-xs text-muted-foreground">{a.cityName}</p>}
          </div>
          <Badge>{a.type}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-4 space-y-2">
        {a.description && <p className="text-sm text-muted-foreground line-clamp-2">{a.description}</p>}
        <div className="flex items-center justify-between text-sm">
          <span>${Number(a.cost).toFixed(0)} · {a.durationMin}m</span>
          <AddActivityToTripDialog activityId={a.id} activityName={a.name} cityId={a.cityId} />
        </div>
      </CardContent>
    </Card>
  )
}
