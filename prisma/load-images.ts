import "dotenv/config"
import fs from "node:fs"
import path from "node:path"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL })
const prisma = new PrismaClient({ adapter })

const PHOTOS = path.join(process.cwd(), "docs", "photos")

const MAP: Record<string, string> = {
  img_avatar_alice: "alice.jpg",
  img_avatar_bob: "bob.avif",
  img_avatar_carol: "carol.webp",
  img_avatar_dave: "dave.webp",
  img_city_paris: "paris (2).jpeg",
  img_city_rome: "rome.jpeg",
  img_city_tokyo: "tokyo.jpeg",
  img_city_bali: "bali.jpeg",
  img_city_nyc: "usa.jpeg",
  img_trip_europe: "europe.jpeg",
  img_trip_sea: "sea.jpeg",
  img_trip_usa: "usa.jpeg",
  img_act_eiffel: "eiffel.jpeg",
  img_act_louvre: "louvre.jpeg",
  img_act_colosseum: "colosseum.jpeg",
  img_act_shibuya: "shibuya.jpeg",
  img_act_ubud: "ubud.jpeg",
  img_act_liberty: "liberty.jpeg",
  img_act_highline: "highline.jpeg",
}

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
}

async function main() {
  console.log("Loading images…")
  for (const [id, file] of Object.entries(MAP)) {
    const full = path.join(PHOTOS, file)
    if (!fs.existsSync(full)) {
      console.warn(`  ${id} → ${file} MISSING, skipping`)
      continue
    }
    const buf = fs.readFileSync(full)
    const ext = path.extname(file).toLowerCase()
    const mimeType = MIME[ext] ?? "application/octet-stream"
    await prisma.image.update({
      where: { id },
      data: { data: buf, mimeType },
    })
    console.log(`  ${id} ← ${file} (${(buf.length / 1024).toFixed(1)} KB, ${mimeType})`)
  }
  console.log("Done.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
