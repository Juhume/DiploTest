"use client"

import { Clock, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface TestTimerProps {
  /** Formatted time string (from useTestTimer) */
  formattedTime: string
  /** Whether timer is in warning zone (< 5 min) */
  isWarning?: boolean
  /** Whether timer is in critical zone (< 1 min) */
  isCritical?: boolean
  /** Whether timer has expired */
  isExpired?: boolean
  /** Optional className for custom styling */
  className?: string
}

/**
 * Test timer display component.
 * Shows remaining time with visual urgency indicators.
 */
export function TestTimer({
  formattedTime,
  isWarning = false,
  isCritical = false,
  isExpired = false,
  className,
}: TestTimerProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-sm font-medium transition-colors",
        // Normal state
        !isWarning && !isCritical && !isExpired && "bg-muted text-foreground",
        // Warning state (< 5 min)
        isWarning && !isCritical && "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200",
        // Critical state (< 1 min)
        isCritical && !isExpired && "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200 animate-pulse",
        // Expired state
        isExpired && "bg-red-500 text-white",
        className
      )}
      role="timer"
      aria-live="polite"
      aria-label={`Tiempo restante: ${formattedTime}`}
    >
      {isCritical || isExpired ? (
        <AlertTriangle className="h-4 w-4" />
      ) : (
        <Clock className="h-4 w-4" />
      )}
      <span className="tabular-nums">{formattedTime}</span>
    </div>
  )
}
