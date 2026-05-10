import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Navbar } from "@/components/nav/Navbar"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { photoId: true, role: true },
  })
  return (
    <div className="relative min-h-screen bg-background">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(900px circle at 100% 0%, oklch(0.78 0.16 230 / 0.18), transparent 60%), radial-gradient(700px circle at 0% 100%, oklch(0.88 0.08 220 / 0.25), transparent 55%)",
        }}
      />
      <Navbar
        name={session.user.name}
        email={session.user.email}
        photoId={user?.photoId ?? null}
        role={user?.role}
      />
      <main className="container mx-auto px-4 py-8 flex-1">{children}</main>
    </div>
  )
}
