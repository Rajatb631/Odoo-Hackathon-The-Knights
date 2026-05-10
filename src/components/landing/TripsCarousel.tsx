"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, MapPin, Calendar, Wallet } from "lucide-react"

export type CarouselTrip = {
  name: string
  region: string
  img: string
  dates: string
  budget: string
  description: string
  highlights: string[]
}

export function TripsCarousel({ trips }: { trips: CarouselTrip[] }) {
  const [index, setIndex] = useState(0)
  const visible = 2
  const max = Math.max(0, trips.length - visible)

  const prev = () => setIndex((i) => (i - 1 < 0 ? max : i - 1))
  const next = () => setIndex((i) => (i + 1 > max ? 0 : i + 1))

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${(index * 100) / visible}%)` }}
        >
          {trips.map((t) => (
            <div key={t.name} className="w-1/2 shrink-0 px-3">
              <CarouselCard trip={t} />
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm font-medium text-slate-600 font-poppins">
          {index + 1}–{Math.min(index + visible, trips.length)} of {trips.length}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={prev}
            aria-label="Previous"
            className="w-11 h-11 rounded-full bg-white shadow-md ring-1 ring-black/10 flex items-center justify-center hover:bg-slate-50 hover:shadow-lg transition-all"
          >
            <ChevronLeft className="w-5 h-5 text-slate-700" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next"
            className="w-11 h-11 rounded-full bg-slate-900 text-white shadow-md flex items-center justify-center hover:bg-slate-800 hover:shadow-lg transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

function CarouselCard({ trip }: { trip: CarouselTrip }) {
  return (
    <article className="group relative aspect-[16/10] rounded-3xl overflow-hidden shadow-xl ring-1 ring-black/5 cursor-pointer">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={trip.img}
        alt={trip.name}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />

      {/* Center text overlay (default state) */}
      <div
        aria-hidden
        className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-0"
        style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.55) 100%)" }}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 transition-opacity duration-300 group-hover:opacity-0">
        <p className="font-poppins text-xs font-semibold tracking-[0.32em] uppercase text-white/85 mb-2 drop-shadow-md">
          {trip.region}
        </p>
        <h3 className="font-poppins font-extrabold text-white text-2xl sm:text-3xl drop-shadow-lg">
          {trip.name}
        </h3>
      </div>

      {/* Hover detail overlay */}
      <div
        className="absolute inset-0 flex flex-col justify-end p-6 sm:p-7 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.20) 0%, rgba(0,0,0,0.85) 70%, rgba(0,0,0,0.92) 100%)" }}
      >
        <div className="flex items-center gap-1.5 text-white/90 text-xs font-semibold uppercase tracking-[0.18em] mb-2">
          <MapPin className="w-3.5 h-3.5" /> {trip.region}
        </div>
        <h3 className="font-poppins font-extrabold text-white text-2xl sm:text-3xl mb-2 leading-tight">
          {trip.name}
        </h3>
        <p className="font-poppins text-sm text-white/85 leading-relaxed mb-4 line-clamp-2">
          {trip.description}
        </p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/90 mb-4">
          <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {trip.dates}</span>
          <span className="flex items-center gap-1.5"><Wallet className="w-4 h-4" /> {trip.budget}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {trip.highlights.map((h) => (
            <span
              key={h}
              className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm text-xs font-medium text-white border border-white/25"
            >
              {h}
            </span>
          ))}
        </div>
      </div>
    </article>
  )
}
