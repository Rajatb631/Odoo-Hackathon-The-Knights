import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { Navbar } from "@/components/nav/Navbar"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect("/login")
  return (
    <>
      <Navbar name={session.user.name} email={session.user.email} />
      <main className="container mx-auto px-4 py-6 flex-1">{children}</main>
    </>
  )
}
