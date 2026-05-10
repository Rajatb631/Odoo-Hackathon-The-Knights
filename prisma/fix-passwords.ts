import "dotenv/config"
import bcrypt from "bcryptjs"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  const hash = await bcrypt.hash("password123", 10)
  const result = await prisma.user.updateMany({
    where: { passwordHash: { contains: "placeholder" } },
    data: { passwordHash: hash },
  })
  console.log(`Updated ${result.count} users. Demo password: password123`)
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
