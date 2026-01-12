"use client"

import { useState, useEffect } from "react"
import { X, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"

const STORAGE_KEY = "donation-toast-dismissed"

export function DonationToast() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Check if already dismissed
    const dismissed = localStorage.getItem(STORAGE_KEY)
    if (dismissed) return

    // Show after a short delay for better UX
    const timer = setTimeout(() => setVisible(true), 3000)
    return () => clearTimeout(timer)
  }, [])

  const handleDismiss = () => {
    setVisible(false)
  }

  const handleDismissPermanently = () => {
    localStorage.setItem(STORAGE_KEY, "true")
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="rounded-xl border bg-background/95 backdrop-blur shadow-lg p-4">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted transition-colors"
          aria-label="Cerrar"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>

        <div className="flex items-start gap-3 pr-6">
          <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-full flex-shrink-0">
            <Heart className="h-4 w-4 text-pink-500 fill-pink-500" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Apoya a DiploTest</p>
            <p className="text-xs text-muted-foreground">
              Somos un proyecto pequeño. Tu apoyo nos ayuda a seguir mejorando.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <Button
                size="sm"
                className="bg-pink-500 hover:bg-pink-600 text-white text-xs h-7"
                asChild
              >
                <a
                  href="https://ko-fi.com/juhume"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Apoyar en Ko-fi
                </a>
              </Button>
              <button
                onClick={handleDismissPermanently}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                No mostrar más
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
