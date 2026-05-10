"use client"

import { useState, useTransition, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowRight, Eye, EyeOff, Sparkles, Users, Compass } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { registerSchema, type RegisterInput } from "@/lib/validations/auth"
import { registerUser } from "@/server/actions/auth"

const benefits = [
  { icon: Sparkles, title: "Plan smarter", desc: "AI-curated suggestions tuned to your travel style" },
  { icon: Users, title: "Travel together", desc: "Invite friends to co-edit itineraries and split costs" },
  { icon: Compass, title: "Discover more", desc: "Hidden gems sourced from a community of travelers" },
]

function scorePassword(p: string): { score: number; label: string; color: string } {
  let s = 0
  if (p.length >= 8) s++
  if (p.length >= 12) s++
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++
  if (/\d/.test(p)) s++
  if (/[^A-Za-z0-9]/.test(p)) s++
  if (s <= 1) return { score: Math.max(s, p ? 1 : 0), label: "Weak", color: "from-red-400 to-red-500" }
  if (s <= 3) return { score: s, label: "Fair", color: "from-sky-400 to-sky-500" }
  return { score: s, label: "Strong", color: "from-emerald-400 to-emerald-500" }
}

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [pending, startTransition] = useTransition()

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })
  const password = watch("password") || ""
  const strength = useMemo(() => scorePassword(password), [password])

  const onSubmit = (data: RegisterInput) => {
    setError(null)
    startTransition(async () => {
      const res = await registerUser(data)
      if (!res.ok) { setError(res.error); return }
      const signin = await signIn("credentials", { email: data.email, password: data.password, redirect: false })
      if (signin?.error) setError("Registered but sign-in failed. Try logging in.")
      else { router.push("/dashboard"); router.refresh() }
    })
  }

  return (
    <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
      {/* Hero */}
      <div className="hidden lg:block">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/30 mb-7">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
          <span className="text-xs font-medium text-sky-700">Free to start · No credit card</span>
        </div>
        <h1 className="text-4xl xl:text-5xl font-bold tracking-tight leading-[1.1] mb-5">
          Plan trips
          <br />
          <span className="text-gradient-brand">worth telling</span>
        </h1>
        <p className="text-muted-foreground text-base leading-relaxed max-w-md mb-8">
          Join thousands building beautiful itineraries with friends — from weekend getaways to grand multi-city adventures.
        </p>

        <div className="space-y-3 max-w-md mb-7">
          {benefits.map((b) => (
            <div
              key={b.title}
              className="flex items-start gap-4 p-4 rounded-xl bg-card/70 border border-border backdrop-blur-sm hover:border-sky-500/40 hover:bg-card transition-all duration-300 group"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-400/25 to-blue-500/20 flex items-center justify-center group-hover:from-sky-400/40 group-hover:to-blue-500/30 transition-colors shrink-0">
                <b.icon className="w-5 h-5 text-sky-600" />
              </div>
              <div>
                <p className="font-semibold text-sm">{b.title}</p>
                <p className="text-sm text-muted-foreground">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex -space-x-2.5">
            {["A", "M", "J", "S", "K"].map((ltr, i) => (
              <div
                key={ltr}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 border-2 border-background flex items-center justify-center text-xs font-semibold text-white"
                style={{ zIndex: 5 - i }}
              >
                {ltr}
              </div>
            ))}
          </div>
          <div>
            <p className="text-sm font-medium">Loved by 50,000+ travelers</p>
            <p className="text-xs text-muted-foreground">Across 120 countries and counting</p>
          </div>
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
              <h2 className="text-2xl font-bold tracking-tight">Create your account</h2>
              <p className="text-sm text-muted-foreground mt-1">Start planning your next adventure</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName" className="text-sm font-medium">First name</Label>
                  <Input
                    id="firstName"
                    placeholder="Jane"
                    className="h-11 bg-secondary/60 border-border focus-visible:border-sky-500/60 focus-visible:ring-sky-500/20"
                    {...register("firstName")}
                  />
                  {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName" className="text-sm font-medium">Last name</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    className="h-11 bg-secondary/60 border-border focus-visible:border-sky-500/60 focus-visible:ring-sky-500/20"
                    {...register("lastName")}
                  />
                  {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
                </div>
              </div>

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
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
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

                {password && (
                  <div className="space-y-2 rounded-lg bg-secondary/40 border border-border/60 p-3 mt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Password strength</span>
                      <span className={`font-semibold bg-gradient-to-r ${strength.color} bg-clip-text text-transparent`}>
                        {strength.label}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <div
                          key={lvl}
                          className={`h-1.5 flex-1 rounded-full transition-all ${
                            lvl <= strength.score ? `bg-gradient-to-r ${strength.color}` : "bg-border"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
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
                    Creating…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Create account
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center leading-relaxed">
                By creating an account you agree to our{" "}
                <Link href="#" className="text-sky-600 hover:text-sky-700">Terms</Link> and{" "}
                <Link href="#" className="text-sky-600 hover:text-sky-700">Privacy Policy</Link>.
              </p>

              <p className="text-sm text-muted-foreground text-center pt-1">
                Have an account?{" "}
                <Link href="/login" className="font-medium text-sky-600 hover:text-sky-700 transition-colors">
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
