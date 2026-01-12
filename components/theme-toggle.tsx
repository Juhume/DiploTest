"use client"

import { useTheme } from "next-themes"
import { Sun, Moon, Monitor } from "lucide-react"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const currentTheme = theme ?? "system"
  const resolvedLabel = resolvedTheme === "dark" ? "Oscuro" : "Claro"

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="px-2 py-1.5">
        <p className="text-sm font-medium mb-2">Tema</p>
        <div className="space-y-1 opacity-50">
          <div className="h-6" />
          <div className="h-6" />
          <div className="h-6" />
        </div>
      </div>
    )
  }

  return (
    <div className="px-2 py-1.5">
      <p className="text-sm font-medium mb-2">Tema</p>
      <RadioGroup value={currentTheme} onValueChange={setTheme} className="space-y-1">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="light" id="theme-light" className="h-3.5 w-3.5" />
          <Label htmlFor="theme-light" className="flex items-center gap-2 text-sm font-normal cursor-pointer">
            <Sun className="h-3.5 w-3.5" />
            Claro
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="dark" id="theme-dark" className="h-3.5 w-3.5" />
          <Label htmlFor="theme-dark" className="flex items-center gap-2 text-sm font-normal cursor-pointer">
            <Moon className="h-3.5 w-3.5" />
            Oscuro
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="system" id="theme-system" className="h-3.5 w-3.5" />
          <Label htmlFor="theme-system" className="flex items-center gap-2 text-sm font-normal cursor-pointer">
            <Monitor className="h-3.5 w-3.5" />
            {resolvedTheme ? `Automático (${resolvedLabel})` : "Automático"}
          </Label>
        </div>
      </RadioGroup>
    </div>
  )
}
