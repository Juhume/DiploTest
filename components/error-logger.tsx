"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

/**
 * Error Boundary y Logger para monitoreo de errores del cliente
 * Captura errores no manejados y los envía a Vercel Analytics
 */
export function ErrorLogger() {
  const pathname = usePathname()

  useEffect(() => {
    // Capturar errores no manejados
    const handleError = (event: ErrorEvent) => {
      console.error("Unhandled error:", event.error)
      
      // Enviar a analytics (si tienes Vercel Analytics habilitado)
      if (typeof window !== "undefined" && (window as any).va) {
        (window as any).va("track", "Error", {
          error: event.error?.message || "Unknown error",
          stack: event.error?.stack,
          page: pathname,
        })
      }
    }

    // Capturar rechazos de promesas no manejados
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled promise rejection:", event.reason)
      
      if (typeof window !== "undefined" && (window as any).va) {
        (window as any).va("track", "PromiseRejection", {
          reason: event.reason?.message || String(event.reason),
          page: pathname,
        })
      }
    }

    window.addEventListener("error", handleError)
    window.addEventListener("unhandledrejection", handleUnhandledRejection)

    return () => {
      window.removeEventListener("error", handleError)
      window.removeEventListener("unhandledrejection", handleUnhandledRejection)
    }
  }, [pathname])

  return null
}
