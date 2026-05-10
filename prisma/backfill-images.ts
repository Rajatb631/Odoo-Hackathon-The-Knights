import "dotenv/config"
import fs from "node:fs"
import path from "node:path"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL })
const prisma = new PrismaClient({ adapter })

const PHOTOS = path.join(process.cwd(), "docs", "photos")

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
}

type Photo = { name: string; buf: Buffer; mime: string; type: "avatar" | "city" | "trip" | "act" }

function classify(filename: string): Photo["type"] {
  const lc = filename.toLowerCase()
  if (/(alice|bob|carol|dave)/.test(lc)) return "avatar"
  if (/(eiffel|louvre|colosseum|shibuya|ubud|liberty|highline)/.test(lc)) return "act"
  if (/(europe|sea|usa)/.test(lc)) return "trip"
  return "city"
}

async function main() {
  const files = fs.readdirSync(PHOTOS).filter((f) => MIME[path.extname(f).toLowerCase()])
  const photos: Photo[] = files.map((f) => ({
    name: f,
    buf: fs.readFileSync(path.join(PHOTOS, f)),
    mime: MIME[path.extname(f).toLowerCase()],
    type: classify(f),
  }))
  const buckets: Record<Photo["type"], Photo[]> = {
    avatar: photos.filter((p) => p.type === "avatar"),
    city: photos.filter((p) => p.type === "city"),
    trip: photos.filter((p) => p.type === "trip"),
    act: photos.filter((p) => p.type === "act"),
  }
  console.log("Photo buckets:", Object.fromEntries(Object.entries(buckets).map(([k, v]) => [k, v.length])))

  // Find images with placeholder data (1 byte).
  const all = await prisma.image.findMany({ select: { id: true, data: true } })
  const placeholders = all.filter((i) => i.data.length <= 1)
  console.log(`${placeholders.length} placeholders / ${all.length} total`)

  let i = 0
  for (const img of placeholders) {
    let bucket: Photo["type"]
    if (img.id.startsWith("img_avatar")) bucket = "avatar"
    else if (img.id.startsWith("img_city")) bucket = "city"
    else if (img.id.startsWith("img_trip")) bucket = "trip"
    else if (img.id.startsWith("img_act")) bucket = "act"
    else bucket = "city"

    const pool = buckets[bucket].length ? buckets[bucket] : photos
    const photo = pool[i % pool.length]
    i++
    await prisma.image.update({
      where: { id: img.id },
      data: { data: photo.buf, mimeType: photo.mime },
    })
    if (i % 25 === 0) console.log(`  ${i} updated…`)
  }
  console.log(`Done — updated ${i} images`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
