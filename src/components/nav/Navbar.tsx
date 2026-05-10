"use client"

import Link from "next/link"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Navbar({
  name,
  email,
  photoId,
  role,
}: {
  name?: string | null
  email?: string | null
  photoId?: string | null
  role?: "USER" | "ADMIN"
}) {
  const initials = (name ?? email ?? "U")
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <header className="border-b bg-background sticky top-0 z-40">
      <div className="container mx-auto flex items-center justify-between h-14 px-4">
        <Link href="/dashboard" className="font-semibold tracking-tight text-lg">
          Traveloop
        </Link>
        <nav className="flex items-center gap-1">
          <Button asChild variant="ghost" size="sm"><Link href="/dashboard">Dashboard</Link></Button>
          <Button asChild variant="ghost" size="sm"><Link href="/trips">My Trips</Link></Button>
          <Button asChild variant="ghost" size="sm"><Link href="/community">Community</Link></Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">Search ▾</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild><Link href="/search/cities">Cities</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/search/activities">Activities</Link></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                aria-label="Open profile menu"
                className="ml-2 h-8 w-8 rounded-full p-0 overflow-hidden"
              >
                {photoId ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={`/api/images/${photoId}`} alt="" className="h-8 w-8 object-cover" />
                ) : (
                  <span>{initials}</span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{name || email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild><Link href="/profile">Profile</Link></DropdownMenuItem>
              {role === "ADMIN" && (
                <DropdownMenuItem asChild><Link href="/admin">Admin</Link></DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  )
}
