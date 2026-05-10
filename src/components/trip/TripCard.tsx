import Link from "next/link"
import { format } from "date-fns"
import { Calendar, Wallet, Plane } from "lucide-react"
import { cn } from "@/lib/utils"

type Status = "UPCOMING" | "ONGOING" | "COMPLETED"

type Props = {
  id: string
  name: string
  description?: string | null
  startDate: Date
  endDate: Date
  budget?: number | string | null
  status: Status
  coverImageId?: string | null
}

const STATUS_STYLES: Record<Status, string> = {
  UPCOMING: "bg-sky-500/15 text-sky-700 border-sky-500/30",
  ONGOING: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  COMPLETED: "bg-secondary text-muted-foreground border-border",
}

const STATUS_LABEL: Record<Status, string> = {
  UPCOMING: "Upcoming",
  ONGOING: "Ongoing",
  COMPLETED: "Completed",
}

export function TripCard(t: Props) {
  return (
    <Link href={`/trips/${t.id}`} className="block group">
      <article className="overflow-hidden rounded-2xl bg-card border border-border transition-all duration-300 hover:border-sky-500/40 hover:shadow-lg hover:shadow-sky-500/10 hover:-translate-y-0.5">
        <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-sky-100 via-blue-50 to-sky-50">
          {t.coverImageId ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/api/images/${t.coverImageId}`}
              alt={t.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Plane className="w-10 h-10 text-sky-500/50" strokeWidth={1.5} />
            </div>
          )}
          <span
            className={cn(
              "absolute top-3 right-3 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border backdrop-blur-md",
              STATUS_STYLES[t.status]
            )}
          >
            {STATUS_LABEL[t.status]}
          </span>
        </div>

        <div className="p-5 space-y-3">
          <h3 className="font-semibold text-base tracking-tight group-hover:text-sky-600 transition-colors line-clamp-1">
            {t.name}
          </h3>

          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            <span>{format(t.startDate, "MMM d")} – {format(t.endDate, "MMM d, yyyy")}</span>
          </div>

          {t.budget != null && (
            <div className="flex items-center gap-1.5 text-sm">
              <Wallet className="w-3.5 h-3.5 text-sky-600" />
              <span className="font-medium">${Number(t.budget).toLocaleString()}</span>
            </div>
          )}

          {t.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{t.description}</p>
          )}
        </div>
      </article>
    </Link>
  )
}
