import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Navbar } from "@/components/nav/Navbar"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { photoId: true },
  })
  return (
    <>
      <Navbar
        name={session.user.name}
        email={session.user.email}
        photoId={user?.photoId ?? null}
      />
      <main className="container mx-auto px-4 py-6 flex-1">{children}</main>
    </>
  )
}
