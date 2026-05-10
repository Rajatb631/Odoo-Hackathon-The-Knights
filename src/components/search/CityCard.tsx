import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AddCityToTripDialog } from "./AddCityToTripDialog"

type Props = {
  id: string
  name: string
  country: string
  region: string | null
  costIndex: number
  popularity: number
  imageId: string | null
}

export function CityCard(c: Props) {
  return (
    <Card className="overflow-hidden py-0 gap-0">
      {c.imageId ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`/api/images/${c.imageId}`} alt={c.name} className="w-full aspect-[16/9] object-cover" />
      ) : (
        <div className="w-full aspect-[16/9] bg-muted" />
      )}
      <CardHeader className="pt-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">{c.name}</CardTitle>
            <p className="text-xs text-muted-foreground">{c.region ? `${c.region}, ` : ""}{c.country}</p>
          </div>
          <Badge variant="outline">★ {c.popularity}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Cost index: <span className="font-medium">{c.costIndex}/10</span></p>
        <AddCityToTripDialog cityId={c.id} cityName={c.name} />
      </CardContent>
    </Card>
  )
}
