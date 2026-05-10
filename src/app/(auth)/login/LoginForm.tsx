"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowRight, Eye, EyeOff, Plane, MapPin, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { loginSchema, type LoginInput } from "@/lib/validations/auth"

const features = [
  { icon: Plane, title: "Smart Booking", desc: "AI-powered flight and hotel recommendations" },
  { icon: MapPin, title: "Live Itineraries", desc: "Plan, share, and edit trips together in real time" },
  { icon: Wallet, title: "Expense Tracking", desc: "Split costs and watch your budget at a glance" },
]

export function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const from = params.get("from") || "/dashboard"
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [pending, startTransition] = useTransition()

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = (data: LoginInput) => {
    setError(null)
    startTransition(async () => {
      const res = await signIn("credentials", { ...data, redirect: false })
      if (res?.error) setError("Invalid email or password")
      else { router.push(from); router.refresh() }
    })
  }

  return (
    <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
      {/* Hero */}
      <div className="hidden lg:block">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/30 mb-7">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
          <span className="text-xs font-medium text-sky-700">Trusted by 50,000+ travelers</span>
        </div>
        <h1 className="text-4xl xl:text-5xl font-bold tracking-tight leading-[1.1] mb-5">
          Your journey,
          <br />
          <span className="text-gradient-brand">simplified</span>
        </h1>
        <p className="text-muted-foreground text-base leading-relaxed max-w-md mb-8">
          Manage itineraries, track expenses, and discover new destinations. Everything you need for seamless travel experiences.
        </p>
        <div className="space-y-3 max-w-md">
          {features.map((f) => (
            <div
              key={f.title}
              className="flex items-start gap-4 p-4 rounded-xl bg-card/70 border border-border backdrop-blur-sm hover:border-sky-500/40 hover:bg-card transition-all duration-300 group"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-400/25 to-blue-500/20 flex items-center justify-center group-hover:from-sky-400/40 group-hover:to-blue-500/30 transition-colors shrink-0">
                <f.icon className="w-5 h-5 text-sky-600" />
              </div>
              <div>
                <p className="font-semibold text-sm">{f.title}</p>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
        <div className="relative">
          <div
            aria-hidden
            className="absolute -inset-1 rounded-3xl blur-xl opacity-60"
            style={{ background: "linear-gradient(120deg, oklch(0.74 0.14 220 / 0.35), oklch(0.6 0.18 250 / 0.25))" }}
          />
          <div className="relative glass-card rounded-2xl border border-border shadow-xl shadow-sky-900/5 p-7 sm:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
              <p className="text-sm text-muted-foreground mt-1">Sign in to continue to your dashboard</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  className="h-11 bg-secondary/60 border-border focus-visible:border-sky-500/60 focus-visible:ring-sky-500/20"
                  {...register("email")}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <Link href="#" className="text-xs font-medium text-sky-600 hover:text-sky-700 transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className="h-11 bg-secondary/60 border-border pr-11 focus-visible:border-sky-500/60 focus-visible:ring-sky-500/20"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>

              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={pending}
                className="w-full h-11 bg-gradient-brand text-white font-semibold shadow-md shadow-sky-500/30 hover:shadow-lg hover:shadow-sky-500/40 hover:opacity-95 transition-all"
              >
                {pending ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>

              <p className="text-sm text-muted-foreground text-center pt-2">
                No account?{" "}
                <Link href="/register" className="font-medium text-sky-600 hover:text-sky-700 transition-colors">
                  Create one
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
