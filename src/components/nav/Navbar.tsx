"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { Plane, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/trips", label: "My Trips" },
  { href: "/community", label: "Community" },
]

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
  const pathname = usePathname()
  const initials = (name ?? email ?? "U")
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center shadow-md shadow-sky-500/30">
            <Plane className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-lg tracking-tight">Traveloop</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                  active
                    ? "text-foreground bg-secondary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                )}
              >
                {item.label}
              </Link>
            )
          })}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors">
                Search <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild><Link href="/search/cities">Cities</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/search/activities">Activities</Link></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                aria-label="Open profile menu"
                className="h-9 w-9 rounded-full overflow-hidden bg-gradient-brand flex items-center justify-center text-xs font-semibold text-white ring-2 ring-background shadow-sm hover:opacity-90 transition-opacity"
              >
                {photoId ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={`/api/images/${photoId}`} alt="" className="h-9 w-9 object-cover" />
                ) : (
                  <span>{initials}</span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col">
                  <span className="text-sm font-medium truncate">{name || "Account"}</span>
                  {email && <span className="text-xs text-muted-foreground truncate">{email}</span>}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild><Link href="/profile">Profile</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/trips">My Trips</Link></DropdownMenuItem>
              {role === "ADMIN" && (
                <DropdownMenuItem asChild><Link href="/admin">Admin</Link></DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
