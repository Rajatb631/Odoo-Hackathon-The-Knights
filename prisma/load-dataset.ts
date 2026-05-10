import "dotenv/config"
import fs from "node:fs"
import path from "node:path"
import { parse } from "csv-parse/sync"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL })
const prisma = new PrismaClient({ adapter })

const DIR = path.join(process.cwd(), "docs", "dataset")

function readCsv<T = Record<string, string>>(file: string): T[] {
  const raw = fs.readFileSync(path.join(DIR, file), "utf8")
  return parse(raw, { columns: true, skip_empty_lines: true, trim: true })
}

const nullIfEmpty = (v: string | undefined | null) =>
  v === undefined || v === null || v === "" ? null : v

const toDate = (v: string) => {
  const [d, t] = v.split(" ")
  const [y, m, day] = d.split("-").map(Number)
  if (!t) return new Date(y, m - 1, day)
  const [hh, mm, ss] = t.split(":").map(Number)
  return new Date(y, m - 1, day, hh, mm, ss)
}

const toBool = (v: string) => v.toLowerCase() === "true"

const STATUS_MAP: Record<string, "UPCOMING" | "ONGOING" | "COMPLETED"> = {
  planned: "UPCOMING",
  draft: "UPCOMING",
  active: "ONGOING",
  ongoing: "ONGOING",
  completed: "COMPLETED",
  cancelled: "COMPLETED",
}

const ROLE_MAP: Record<string, "USER" | "ADMIN"> = {
  user: "USER",
  admin: "ADMIN",
}

async function main() {
  console.log("Appending dataset (skipping duplicates)…")

  // Build cityId remap: new dataset → existing DB id when (name, country) collide.
  const newCityRows = readCsv("City.csv")
  const dbCities = await prisma.city.findMany({ select: { id: true, name: true, country: true } })
  const dbByNameCountry = new Map(dbCities.map((c) => [`${c.name}|${c.country}`, c.id]))
  const cityRemap = new Map<string, string>()
  for (const r of newCityRows) {
    const key = `${r.name}|${r.country}`
    const existing = dbByNameCountry.get(key)
    if (existing && existing !== r.id) cityRemap.set(r.id, existing)
  }
  if (cityRemap.size) {
    console.log(`  cityId remap (collisions):`, [...cityRemap.entries()])
  }
  const remapCity = (id: string | null): string | null => (id ? (cityRemap.get(id) ?? id) : id)

  const images = readCsv("Image.csv").map((r) => ({
    id: r.id,
    data: Buffer.from([0x00]),
    mimeType: r.mimeType,
    createdAt: toDate(r.createdAt),
  }))
  const r1 = await prisma.image.createMany({ data: images, skipDuplicates: true })
  console.log(`  Image: +${r1.count}/${images.length}`)

  const users = readCsv("User.csv").map((r) => ({
    id: r.id,
    email: r.email,
    passwordHash: nullIfEmpty(r.passwordHash),
    firstName: r.firstName,
    lastName: r.lastName,
    phone: nullIfEmpty(r.phone),
    city: nullIfEmpty(r.city),
    country: nullIfEmpty(r.country),
    bio: nullIfEmpty(r.bio),
    role: ROLE_MAP[r.role.toLowerCase()] ?? "USER",
    photoId: nullIfEmpty(r.photoId),
    createdAt: toDate(r.createdAt),
  }))
  const r2 = await prisma.user.createMany({ data: users, skipDuplicates: true })
  console.log(`  User: +${r2.count}/${users.length}`)

  const cities = readCsv("City.csv").map((r) => ({
    id: r.id,
    name: r.name,
    country: r.country,
    region: nullIfEmpty(r.region),
    costIndex: Number(r.costIndex),
    popularity: Number(r.popularity),
    imageId: nullIfEmpty(r.imageId),
  }))
  const r3 = await prisma.city.createMany({ data: cities, skipDuplicates: true })
  console.log(`  City: +${r3.count}/${cities.length}`)

  const trips = readCsv("Trip.csv").map((r) => ({
    id: r.id,
    ownerId: r.ownerId,
    name: r.name,
    description: nullIfEmpty(r.description),
    coverImageId: nullIfEmpty(r.coverImageId),
    startDate: toDate(r.startDate),
    endDate: toDate(r.endDate),
    budget: r.budget ? r.budget : null,
    status: STATUS_MAP[r.status.toLowerCase()] ?? "UPCOMING",
    isPublic: toBool(r.isPublic),
    shareToken: nullIfEmpty(r.shareToken),
    createdAt: toDate(r.createdAt),
  }))
  const r4 = await prisma.trip.createMany({ data: trips, skipDuplicates: true })
  console.log(`  Trip: +${r4.count}/${trips.length}`)

  const activities = readCsv("Activity.csv").map((r) => ({
    id: r.id,
    cityId: remapCity(nullIfEmpty(r.cityId)),
    name: r.name,
    type: r.type,
    description: nullIfEmpty(r.description),
    cost: r.cost,
    durationMin: Number(r.durationMin),
    imageId: nullIfEmpty(r.imageId),
  }))
  const r5 = await prisma.activity.createMany({ data: activities, skipDuplicates: true })
  console.log(`  Activity: +${r5.count}/${activities.length}`)

  const stops = readCsv("Stop.csv").map((r) => ({
    id: r.id,
    tripId: r.tripId,
    cityId: remapCity(r.cityId)!,
    startDate: toDate(r.startDate),
    endDate: toDate(r.endDate),
    budget: r.budget ? r.budget : null,
    notes: nullIfEmpty(r.notes),
    order: Number(r.order),
  }))
  const r6 = await prisma.stop.createMany({ data: stops, skipDuplicates: true })
  console.log(`  Stop: +${r6.count}/${stops.length}`)

  const sas = readCsv("StopActivity.csv").map((r) => ({
    id: r.id,
    stopId: r.stopId,
    activityId: r.activityId,
    scheduledAt: r.scheduledAt ? toDate(r.scheduledAt) : null,
    costOverride: r.costOverride ? r.costOverride : null,
  }))
  const r7 = await prisma.stopActivity.createMany({ data: sas, skipDuplicates: true })
  console.log(`  StopActivity: +${r7.count}/${sas.length}`)

  const packs = readCsv("PackingItem.csv").map((r) => ({
    id: r.id,
    tripId: r.tripId,
    label: r.label,
    category: r.category,
    packed: toBool(r.packed),
  }))
  const r8 = await prisma.packingItem.createMany({ data: packs, skipDuplicates: true })
  console.log(`  PackingItem: +${r8.count}/${packs.length}`)

  const notes = readCsv("Note.csv").map((r) => ({
    id: r.id,
    tripId: r.tripId,
    authorId: r.authorId,
    stopId: nullIfEmpty(r.stopId),
    body: r.body,
    createdAt: toDate(r.createdAt),
  }))
  const r9 = await prisma.note.createMany({ data: notes, skipDuplicates: true })
  console.log(`  Note: +${r9.count}/${notes.length}`)

  const expenses = readCsv("Expense.csv").map((r) => ({
    id: r.id,
    tripId: r.tripId,
    category: r.category,
    label: r.label,
    amount: r.amount,
    date: toDate(r.date),
  }))
  const r10 = await prisma.expense.createMany({ data: expenses, skipDuplicates: true })
  console.log(`  Expense: +${r10.count}/${expenses.length}`)

  console.log("Done.")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
