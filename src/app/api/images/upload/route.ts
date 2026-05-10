import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp", "image/avif"])
const MAX_BYTES = 5 * 1024 * 1024

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 })

  const form = await req.formData()
  const file = form.get("file")
  if (!(file instanceof File)) {
    return new NextResponse("No file", { status: 400 })
  }
  if (!ALLOWED.has(file.type)) {
    return new NextResponse(`Unsupported type ${file.type}`, { status: 415 })
  }
  if (file.size > MAX_BYTES) {
    return new NextResponse("File too large (max 5MB)", { status: 413 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const image = await prisma.image.create({
    data: { data: buffer, mimeType: file.type },
  })
  return NextResponse.json({ id: image.id })
}
