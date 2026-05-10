import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import authConfig from "@/auth.config"
import { prisma } from "@/lib/db"
import { loginSchema } from "@/lib/validations/auth"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(creds) {
        const parsed = loginSchema.safeParse(creds)
        if (!parsed.success) return null
        const { email, password } = parsed.data
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user || !user.passwordHash) return null
        const ok = await bcrypt.compare(password, user.passwordHash)
        if (!ok) return null
        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      const t = token as Record<string, unknown>
      if (user?.id) t.id = String(user.id)
      const role = (user as { role?: "USER" | "ADMIN" } | undefined)?.role
      if (role) t.role = role
      return token
    },
    async session({ session, token }) {
      const t = token as Record<string, unknown>
      if (t.id && session.user) {
        session.user.id = String(t.id)
      }
      if (t.role && session.user) {
        session.user.role = t.role as "USER" | "ADMIN"
      }
      return session
    },
  },
})
