import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const img = await prisma.image.findUnique({ where: { id } })
  if (!img) return new NextResponse("Not found", { status: 404 })
  return new NextResponse(new Uint8Array(img.data), {
    headers: {
      "Content-Type": img.mimeType,
      "Content-Length": String(img.data.length),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  })
}
