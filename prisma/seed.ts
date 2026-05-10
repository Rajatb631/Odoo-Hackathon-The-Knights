import "dotenv/config"
import fs from "node:fs"
import path from "node:path"
import { parse } from "csv-parse/sync"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL })
const prisma = new PrismaClient({ adapter })

const DOCS = path.join(process.cwd(), "docs")

function readCsv<T = Record<string, string>>(file: string): T[] {
  const raw = fs.readFileSync(path.join(DOCS, file), "utf8")
  return parse(raw, { columns: true, skip_empty_lines: true, trim: true })
}

const nullIfEmpty = (v: string | undefined | null) =>
  v === undefined || v === null || v === "" ? null : v

const toDate = (v: string) => new Date(v.replace(" ", "T") + (v.includes("T") || v.length > 10 ? "" : "T00:00:00") + "Z")

async function main() {
  console.log("Seeding…")

  // 1. Image (placeholder bytes)
  const images = readCsv("Image.csv")
  for (const r of images) {
    await prisma.image.create({
      data: {
        id: r.id,
        data: Buffer.from([0x00]),
        mimeType: r.mimeType,
        createdAt: toDate(r.createdAt),
      },
    })
  }
  console.log(`  Image: ${images.length}`)

  // 2. User
  const users = readCsv("User.csv")
  for (const r of users) {
    await prisma.user.create({
      data: {
        id: r.id,
        email: r.email,
        passwordHash: nullIfEmpty(r.passwordHash),
        firstName: r.firstName,
        lastName: r.lastName,
        phone: nullIfEmpty(r.phone),
        city: nullIfEmpty(r.city),
        country: nullIfEmpty(r.country),
        bio: nullIfEmpty(r.bio),
        role: r.role as "USER" | "ADMIN",
        photoId: nullIfEmpty(r.photoId),
        createdAt: toDate(r.createdAt),
      },
    })
  }
  console.log(`  User: ${users.length}`)

  // 3. City
  const cities = readCsv("City.csv")
  for (const r of cities) {
    await prisma.city.create({
      data: {
        id: r.id,
        name: r.name,
        country: r.country,
        region: nullIfEmpty(r.region),
        costIndex: Number(r.costIndex),
        popularity: Number(r.popularity),
        imageId: nullIfEmpty(r.imageId),
      },
    })
  }
  console.log(`  City: ${cities.length}`)

  // 4. Trip
  const trips = readCsv("Trip.csv")
  for (const r of trips) {
    await prisma.trip.create({
      data: {
        id: r.id,
        ownerId: r.ownerId,
        name: r.name,
        description: nullIfEmpty(r.description),
        coverImageId: nullIfEmpty(r.coverImageId),
        startDate: toDate(r.startDate),
        endDate: toDate(r.endDate),
        budget: r.budget ? r.budget : null,
        status: r.status as "UPCOMING" | "ONGOING" | "COMPLETED",
        isPublic: r.isPublic === "true",
        shareToken: nullIfEmpty(r.shareToken),
        createdAt: toDate(r.createdAt),
      },
    })
  }
  console.log(`  Trip: ${trips.length}`)

  // 5. Activity
  const activities = readCsv("Activity.csv")
  for (const r of activities) {
    await prisma.activity.create({
      data: {
        id: r.id,
        cityId: nullIfEmpty(r.cityId),
        name: r.name,
        type: r.type,
        description: nullIfEmpty(r.description),
        cost: r.cost,
        durationMin: Number(r.durationMin),
        imageId: nullIfEmpty(r.imageId),
      },
    })
  }
  console.log(`  Activity: ${activities.length}`)

  // 6. Stop
  const stops = readCsv("Stop.csv")
  for (const r of stops) {
    await prisma.stop.create({
      data: {
        id: r.id,
        tripId: r.tripId,
        cityId: r.cityId,
        startDate: toDate(r.startDate),
        endDate: toDate(r.endDate),
        budget: r.budget ? r.budget : null,
        notes: nullIfEmpty(r.notes),
        order: Number(r.order),
      },
    })
  }
  console.log(`  Stop: ${stops.length}`)

  // 7. StopActivity
  const sas = readCsv("StopActivity.csv")
  for (const r of sas) {
    await prisma.stopActivity.create({
      data: {
        id: r.id,
        stopId: r.stopId,
        activityId: r.activityId,
        scheduledAt: r.scheduledAt ? toDate(r.scheduledAt) : null,
        costOverride: r.costOverride ? r.costOverride : null,
      },
    })
  }
  console.log(`  StopActivity: ${sas.length}`)

  // 8. PackingItem
  const packs = readCsv("PackingItem.csv")
  for (const r of packs) {
    await prisma.packingItem.create({
      data: {
        id: r.id,
        tripId: r.tripId,
        label: r.label,
        category: r.category,
        packed: r.packed === "true",
      },
    })
  }
  console.log(`  PackingItem: ${packs.length}`)

  // 9. Note
  const notes = readCsv("Note.csv")
  for (const r of notes) {
    await prisma.note.create({
      data: {
        id: r.id,
        tripId: r.tripId,
        authorId: r.authorId,
        stopId: nullIfEmpty(r.stopId),
        body: r.body,
        createdAt: toDate(r.createdAt),
      },
    })
  }
  console.log(`  Note: ${notes.length}`)

  // 10. Expense
  const expenses = readCsv("Expense.csv")
  for (const r of expenses) {
    await prisma.expense.create({
      data: {
        id: r.id,
        tripId: r.tripId,
        category: r.category,
        label: r.label,
        amount: r.amount,
        date: toDate(r.date),
      },
    })
  }
  console.log(`  Expense: ${expenses.length}`)

  console.log("Done.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
