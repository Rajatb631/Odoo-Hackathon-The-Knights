import type { NextAuthConfig } from "next-auth"

export default {
  providers: [],
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const loggedIn = !!auth?.user
      const path = nextUrl.pathname
      const isProtected =
        path.startsWith("/dashboard") ||
        path.startsWith("/trips") ||
        path.startsWith("/profile") ||
        path.startsWith("/search")
      if (isProtected && !loggedIn) return false
      return true
    },
  },
} satisfies NextAuthConfig
