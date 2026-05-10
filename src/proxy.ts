import NextAuth from "next-auth"
import authConfig from "@/auth.config"

export const { auth: middleware } = NextAuth(authConfig)

export default middleware((req) => {
  const loggedIn = !!req.auth?.user
  const path = req.nextUrl.pathname
  const isProtected =
    path.startsWith("/dashboard") ||
    path.startsWith("/trips") ||
    path.startsWith("/profile") ||
    path.startsWith("/search") ||
    path.startsWith("/community") ||
    path.startsWith("/admin")
  if (isProtected && !loggedIn) {
    const url = req.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("from", path)
    return Response.redirect(url)
  }
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/images).*)"],
}
