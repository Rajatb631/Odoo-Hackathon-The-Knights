import Link from "next/link"
import { Plane } from "lucide-react"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Animated background orbs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-32 w-[640px] h-[640px] rounded-full blur-3xl opacity-60 animate-orb"
        style={{
          background:
            "radial-gradient(closest-side, oklch(0.78 0.16 230 / 0.55), oklch(0.66 0.18 250 / 0.18), transparent)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-32 w-[520px] h-[520px] rounded-full blur-3xl opacity-50 animate-orb"
        style={{
          animationDelay: "3s",
          background:
            "radial-gradient(closest-side, oklch(0.88 0.08 220 / 0.7), oklch(0.78 0.12 235 / 0.2), transparent)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.18 0.02 260) 1px, transparent 1px), linear-gradient(90deg, oklch(0.18 0.02 260) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      {/* Header */}
      <header className="relative z-10 px-6 lg:px-10 pt-6">
        <div className="max-w-7xl mx-auto flex items-center">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center shadow-md shadow-sky-500/30">
              <Plane className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-lg tracking-tight">Traveloop</span>
          </Link>
        </div>
      </header>

      {/* Centered content */}
      <main className="relative z-10 flex items-center justify-center px-6 lg:px-10 py-10 lg:py-16 min-h-[calc(100vh-5rem)]">
        <div className="w-full max-w-7xl">{children}</div>
      </main>
    </div>
  )
}
