"use client"

import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"

interface KofiButtonProps {
  className?: string
}

export function KofiButton({ className }: KofiButtonProps) {
  return (
    <Button
      asChild
      variant="outline"
      className={`gap-2 border-pink-300 hover:bg-pink-50 hover:border-pink-400 dark:border-pink-700 dark:hover:bg-pink-950/50 ${className}`}
    >
      <a
        href="https://ko-fi.com/juhume"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Heart className="h-4 w-4 text-pink-500 fill-pink-500" />
        <span>Apoyar en Ko-fi</span>
      </a>
    </Button>
  )
}
