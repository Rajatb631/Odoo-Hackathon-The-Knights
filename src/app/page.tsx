import Link from "next/link"
import { format } from "date-fns"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Plane } from "lucide-react"
import { TripsCarousel, type CarouselTrip } from "@/components/landing/TripsCarousel"

export default async function Home() {
  const session = await auth()
  const userId = session?.user?.id

  const userTrips = userId
    ? await prisma.trip.findMany({
        where: { ownerId: userId },
        orderBy: { startDate: "desc" },
        take: 6,
      })
    : []

  return (
    <div className="bg-background">
      <Hero isAuthed={!!userId} />
      <TravelMoods />
      <FunkyDivider />
      <RegionalAndYourTrips userTrips={userTrips} isAuthed={!!userId} />
      <Footer />
    </div>
  )
}

/* ─────────────────────────── HERO ─────────────────────────── */
function Hero({ isAuthed }: { isAuthed: boolean }) {
  return (
    <section className="relative w-screen h-screen overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/leo-rivas-R_BLOGXpsOg-unsplash.jpg"
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.32) 0%, rgba(0,0,0,0.10) 50%, rgba(0,0,0,0.50) 100%)" }}
      />

      {/* Fully transparent navbar — justify-between */}
      <header className="absolute top-0 inset-x-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 lg:px-12 pt-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full border-2 border-white/70 flex items-center justify-center">
              <span className="text-white font-extrabold text-lg leading-none">T</span>
            </div>
            <div className="leading-tight">
              <p className="text-white font-bold text-base">Traveloop</p>
              <p className="text-white/85 text-xs font-medium">Modern travel planning</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-12 text-white font-bold text-sm tracking-wide">
            <Link href="#moods" className="hover:opacity-80 transition-opacity">Journeys</Link>
            <Link href="#regional" className="hover:opacity-80 transition-opacity">Explore</Link>
            <Link href="#funky" className="hover:opacity-80 transition-opacity">Discover</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center justify-center h-11 px-6 text-white font-bold text-sm hover:opacity-80 transition-opacity"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center h-11 px-6 rounded-xl bg-white text-slate-900 font-bold text-sm hover:shadow-lg transition-all"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Centered overlay */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center">
        <p className="font-marker text-white/95 text-lg sm:text-xl mb-3 drop-shadow-md">
          Travel bold, plan better
        </p>
        <h1 className="font-marker text-white text-4xl sm:text-5xl md:text-6xl leading-tight drop-shadow-xl max-w-4xl">
          Travel smarter, every coast.
        </h1>
        <p className="mt-5 text-white/90 text-sm sm:text-base max-w-xl font-poppins">
          The modern travel workspace for planning, sharing, and building unforgettable journeys.
        </p>

        {/* Rectangle buttons with rounded borders, bold text, proper spacing */}
        <div className="mt-10 flex items-center gap-6">
          <Link
            href={isAuthed ? "/trips/new" : "/register"}
            className="inline-flex items-center justify-center h-14 min-w-[180px] px-8 rounded-2xl bg-white text-slate-900 font-poppins font-extrabold tracking-wide text-base shadow-xl hover:-translate-y-0.5 hover:shadow-2xl transition-all"
          >
            Plan Trip
          </Link>
          <Link
            href={isAuthed ? "/trips" : "/login"}
            className="inline-flex items-center justify-center h-14 min-w-[180px] px-8 rounded-2xl border-2 border-white text-white font-poppins font-extrabold tracking-wide text-base hover:bg-white/15 transition-all"
          >
            Your Trips
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────── TRAVEL MOODS ─────────────────── */
type Mood = { label: string; img: string }

const MOODS: Mood[] = [
  { label: "Beach",     img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=80&auto=format&fit=crop" },
  { label: "Mountains", img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900&q=80&auto=format&fit=crop" },
  { label: "Rocks",     img: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=900&q=80&auto=format&fit=crop" },
  { label: "Forests",   img: "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=900&q=80&auto=format&fit=crop" },
  { label: "Safari",    img: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=900&q=80&auto=format&fit=crop" },
]

function TravelMoods() {
  return (
    <section
      id="moods"
      className="relative w-screen h-screen min-h-[760px] flex flex-col items-center justify-center px-6 py-16"
      style={{
        background:
          "linear-gradient(180deg, #93d2ff 0%, #c9e6fa 30%, #ffffff 75%, #ffffff 100%)",
      }}
    >
      <div className="max-w-5xl mx-auto text-center mb-14">
        <p className="font-poppins font-bold text-sm sm:text-base tracking-[0.28em] uppercase text-slate-700 mb-6">
          Travel Moods
        </p>
        <h2 className="font-boldonse text-black text-5xl sm:text-6xl md:text-7xl leading-[1.05] mb-6">
          Find the perfect destination
          <br className="hidden sm:block" />
          for your next adventure.
        </h2>
        <p className="font-poppins font-bold text-lg sm:text-xl md:text-2xl text-slate-800 leading-snug max-w-3xl mx-auto">
          Explore curated travel styles and match your mood with beach, mountain, safari, forest, or rock escapes.
        </p>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
        {MOODS.map((m) => (
          <MoodCard key={m.label} mood={m} />
        ))}
      </div>
    </section>
  )
}

function MoodCard({ mood }: { mood: Mood }) {
  return (
    <Link
      href="/register"
      className="group relative aspect-[3/4] rounded-2xl overflow-hidden shadow-lg ring-1 ring-black/5 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={mood.img}
        alt={mood.label}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      {/* Bottom gradient for label legibility */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-1/2"
        style={{ background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.65))" }}
      />
      <div className="absolute inset-x-0 bottom-0 p-4">
        <p className="font-poppins font-bold text-white text-base sm:text-lg drop-shadow-md">
          {mood.label}
        </p>
      </div>
    </Link>
  )
}

/* ───────────────── FUNKY DIVIDER (full-bleed cloud bg) ───────────────── */
function FunkyDivider() {
  return (
    <section id="funky" className="relative w-screen h-screen min-h-[640px] overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/iccup-xNtwmcRP-gw-unsplash.jpg"
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Soft white veil to keep black text readable */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.0) 0%, rgba(255,255,255,0.55) 100%)" }}
      />

      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6 max-w-4xl mx-auto">
        <p className="font-poppins font-bold text-sm sm:text-base tracking-[0.28em] uppercase text-slate-900 mb-6">
          Travel vibes
        </p>

        <h2 className="font-marker text-5xl sm:text-7xl md:text-8xl leading-[1.05] text-rainbow drop-shadow-sm mb-6">
          chase the sun ☀️
          <br />
          catch the wave 🌊
        </h2>

        <p className="font-poppins font-semibold text-black text-lg sm:text-xl md:text-2xl max-w-2xl leading-snug mb-4">
          A travel vibe that feels playful, premium, and easy. ✨
        </p>
        <p className="font-poppins text-black/80 text-base sm:text-lg max-w-2xl leading-relaxed">
          Pack light 🎒, dream loud 💭, wander often 🗺️ — your next obsession is one click away. 🌍
        </p>
      </div>
    </section>
  )
}

/* ─────────────── REGIONAL + PREVIOUS TRIPS ─────────────── */
type DummyTrip = {
  name: string
  region: string
  img: string
  description: string
}

const TOP_REGIONS: DummyTrip[] = [
  {
    name: "Coastal escapes",
    region: "Santorini, Greece",
    img: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=900&q=80&auto=format&fit=crop",
    description:
      "A crisp, easy itinerary with memorable stays, curated meals, and local highlights built for confident travelers.",
  },
  {
    name: "Neon skylines",
    region: "Tokyo, Japan",
    img: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=900&q=80&auto=format&fit=crop",
    description:
      "Late-night ramen, hidden alleys, and a city that never sleeps — engineered for first-timers and regulars alike.",
  },
  {
    name: "Volcanic wanders",
    region: "Reykjavík, Iceland",
    img: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=900&q=80&auto=format&fit=crop",
    description:
      "Black sand beaches, glacier walks, and the Northern Lights routed through the smartest stops on the Ring Road.",
  },
  {
    name: "Tropical drift",
    region: "Bali, Indonesia",
    img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=900&q=80&auto=format&fit=crop",
    description:
      "Surf, rice terraces, and slow mornings — a balanced week that blends beach time with cultural depth.",
  },
]

const CAROUSEL_TRIPS: CarouselTrip[] = [
  {
    name: "Coastal escapes",
    region: "Santorini, Greece",
    img: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1200&q=80&auto=format&fit=crop",
    dates: "Jul 7 – Jul 14, 2026",
    budget: "$2,090",
    description:
      "Caldera sunsets, cliffside dinners, and ferry hops to nearby islands — paced so you actually rest between the highlights.",
    highlights: ["Sunset cruise", "Oia at dawn", "Local wine"],
  },
  {
    name: "Neon skylines",
    region: "Tokyo, Japan",
    img: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=80&auto=format&fit=crop",
    dates: "Apr 3 – Apr 11, 2026",
    budget: "$2,420",
    description:
      "Shibuya nights, Tsukiji mornings, and a day trip to Hakone — designed to balance the chaos with calm.",
    highlights: ["Shibuya crossing", "teamLab", "Hakone onsen"],
  },
  {
    name: "Volcanic wanders",
    region: "Reykjavík, Iceland",
    img: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80&auto=format&fit=crop",
    dates: "Jun 12 – Jun 21, 2026",
    budget: "$3,150",
    description:
      "Drive the Ring Road with a mix of glacier hikes, hot springs, and the Diamond Beach detour you'll be glad you took.",
    highlights: ["Ring Road", "Glacier hike", "Blue Lagoon"],
  },
  {
    name: "Tropical drift",
    region: "Bali, Indonesia",
    img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=80&auto=format&fit=crop",
    dates: "Mar 14 – Mar 22, 2026",
    budget: "$1,840",
    description:
      "Ubud rice terraces, Canggu surf days, and Nusa Penida cliffs — a balanced loop that respects your jetlag.",
    highlights: ["Surf lessons", "Tegallalang", "Nusa Penida"],
  },
]

function RegionalAndYourTrips({
  userTrips,
  isAuthed,
}: {
  userTrips: Array<{ id: string; name: string; startDate: Date; endDate: Date; budget: unknown; coverImageId: string | null; status: string; description: string | null }>
  isAuthed: boolean
}) {
  const userCarouselTrips: CarouselTrip[] = userTrips.map((t) => ({
    name: t.name,
    region: "Your trip",
    img: t.coverImageId ? `/api/images/${t.coverImageId}` : "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80&auto=format&fit=crop",
    dates: `${format(t.startDate, "MMM d")} – ${format(t.endDate, "MMM d, yyyy")}`,
    budget: t.budget != null ? `$${Number(t.budget).toLocaleString()}` : "—",
    description: t.description ?? "Your saved itinerary — pick up the planning where you left off.",
    highlights: [t.status.toLowerCase()],
  }))

  return (
    <section
      id="regional"
      className="relative w-screen px-6 py-24 font-poppins"
      style={{
        background: "linear-gradient(180deg, #ffffff 0%, #e6f3fc 60%, #c9e6fa 100%)",
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* TOP REGIONAL */}
        <div className="mb-14">
          <p className="font-poppins font-bold text-xs sm:text-sm tracking-[0.28em] uppercase text-slate-600 mb-4">
            Top regional selections
          </p>
          <h2 className="font-poppins font-extrabold text-black text-4xl sm:text-5xl md:text-6xl leading-[1.05] mb-3">
            Trips loved by our community
          </h2>
          <p className="font-poppins text-base sm:text-lg text-slate-500 max-w-2xl">
            Hand-picked routes built around how real travelers actually move.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          {TOP_REGIONS.map((t) => (
            <RegionalCard key={t.name} trip={t} />
          ))}
        </div>

        {/* PREVIOUS TRIPS */}
        <div className="mb-10">
          <p className="font-poppins font-bold text-xs sm:text-sm tracking-[0.28em] uppercase text-slate-600 mb-4">
            Previous trips
          </p>
          <h2 className="font-poppins font-extrabold text-black text-4xl sm:text-5xl md:text-6xl leading-[1.05] mb-3">
            Real routes from real travelers.
          </h2>
          <p className="font-poppins text-base sm:text-lg text-slate-500 max-w-2xl">
            Hover any card to see what the trip actually looks like day-to-day.
          </p>
        </div>

        {!isAuthed ? (
          <TripsCarousel trips={CAROUSEL_TRIPS} />
        ) : userCarouselTrips.length === 0 ? (
          <div className="rounded-3xl bg-white p-10 text-center shadow-md ring-1 ring-black/5">
            <p className="font-poppins text-slate-700 mb-5">No trips yet — your first journey is a click away.</p>
            <Link
              href="/trips/new"
              className="inline-flex items-center h-12 px-7 rounded-xl bg-slate-900 text-white font-poppins font-bold hover:bg-slate-800 transition-colors"
            >
              Plan a trip
            </Link>
          </div>
        ) : (
          <TripsCarousel trips={userCarouselTrips} />
        )}
      </div>
    </section>
  )
}

function RegionalCard({ trip }: { trip: DummyTrip }) {
  return (
    <Link
      href="/register"
      className="group block rounded-3xl overflow-hidden bg-white shadow-md ring-1 ring-black/5 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
    >
      <div className="relative aspect-[5/4] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={trip.img}
          alt={trip.name}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-5">
        <h3 className="font-poppins font-extrabold text-black text-lg leading-snug mb-1">
          {trip.name}
        </h3>
        <p className="font-poppins text-sm font-medium text-slate-500 mb-3">{trip.region}</p>
        <p className="font-poppins text-sm text-slate-600 leading-relaxed">{trip.description}</p>
      </div>
    </Link>
  )
}

/* ─────────────────────────── FOOTER ─────────────────────────── */
function Footer() {
  return (
    <footer className="bg-slate-950 text-white font-poppins">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-14 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center">
              <Plane className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold tracking-tight text-lg">Traveloop</span>
          </div>
          <p className="text-sm text-white/60 leading-relaxed max-w-sm">
            The modern travel workspace for planning, sharing, and building unforgettable journeys.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-[0.24em] uppercase text-white/50 mb-4">Product</p>
          <ul className="space-y-2 text-sm text-white/80">
            <li><Link href="#moods" className="hover:text-white transition-colors">Travel Moods</Link></li>
            <li><Link href="#regional" className="hover:text-white transition-colors">Top Regions</Link></li>
            <li><Link href="/register" className="hover:text-white transition-colors">Get started</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-[0.24em] uppercase text-white/50 mb-4">Company</p>
          <ul className="space-y-2 text-sm text-white/80">
            <li><Link href="#" className="hover:text-white transition-colors">Privacy</Link></li>
            <li><Link href="#" className="hover:text-white transition-colors">Terms</Link></li>
            <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-5 text-xs text-white/50">
          © {new Date().getFullYear()} Traveloop. Built for travelers, by travelers.
        </div>
      </div>
    </footer>
  )
}
