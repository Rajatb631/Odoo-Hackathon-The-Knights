import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { Button } from "@/components/ui/button"

export default async function Home() {
  const session = await auth()
  if (session?.user) redirect("/dashboard")

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="space-y-3 max-w-2xl">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Plan multi-city trips with confidence.</h1>
        <p className="text-lg text-muted-foreground">
          Build day-by-day itineraries, manage budgets, and share read-only links with travel companions.
        </p>
      </div>
      <div className="flex gap-3">
        <Button asChild><Link href="/register">Get started</Link></Button>
        <Button asChild variant="outline"><Link href="/login">Sign in</Link></Button>
      </div>
    </div>
  )
}
