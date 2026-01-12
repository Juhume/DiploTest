"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { HelpCircle, X } from "lucide-react"

const STORAGE_KEY = "diplotest_welcome_seen"

export function WelcomeGuideCard() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const seen = localStorage.getItem(STORAGE_KEY)
      if (!seen) {
        localStorage.setItem(STORAGE_KEY, "true")
        setVisible(true)
      }
    } catch {
      setVisible(true)
    }
  }, [])

  if (!visible) return null

  return (
    <Card className="mb-8 border-muted/60 bg-background/70">
      <CardContent className="py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="font-semibold text-lg">Primera vez en DiploTest?</p>
            <p className="text-sm text-muted-foreground">
              Descubre modos de práctica, flashcards, repaso de errores y estadisticas.
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => setVisible(false)}
            aria-label="Cerrar aviso de bienvenida"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Button asChild className="w-full sm:w-auto">
            <Link href="/guide">
              <HelpCircle className="mr-2 h-4 w-4" />
              Ver guía de uso
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
