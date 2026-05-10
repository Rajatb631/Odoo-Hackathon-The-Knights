"use client"

import { useEffect } from "react"
import { SessionProvider } from "next-auth/react"
import { Toaster, toast } from "sonner"

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null
      const li = target?.closest("[data-sonner-toast]") as HTMLElement | null
      if (!li) return
      // Dismiss all visible toasts on any click within a toast.
      toast.dismiss()
    }
    document.addEventListener("click", onClick, true)
    return () => document.removeEventListener("click", onClick, true)
  }, [])

  return (
    <SessionProvider>
      {children}
      <Toaster position="top-right" richColors duration={1500} closeButton />
    </SessionProvider>
  )
}
