"use client"

import { useState, useEffect, useRef, useCallback } from "react"

const STORAGE_PREFIX = "diplotest_timer_"

interface TimerState {
  startTime: number
  totalSeconds: number
}

interface UseTestTimerOptions {
  /** Unique identifier for the test attempt (used for storage) */
  attemptKey: string
  /** Total duration in seconds (default: 8100 = 135 minutes) */
  totalSeconds?: number
  /** Callback when timer expires */
  onExpire?: () => void
  /** Whether the timer is enabled (default: true) */
  enabled?: boolean
}

interface UseTestTimerReturn {
  /** Remaining seconds */
  remainingSeconds: number
  /** Elapsed seconds */
  elapsedSeconds: number
  /** Whether the timer has expired */
  isExpired: boolean
  /** Start timestamp */
  startTime: number | null
  /** Formatted time string (HH:MM:SS or MM:SS) */
  formattedTime: string
  /** Clear timer from storage (call on manual finish) */
  clearTimer: () => void
  /** Whether timer is in warning zone (< 5 min) */
  isWarning: boolean
  /** Whether timer is in critical zone (< 1 min) */
  isCritical: boolean
}

/**
 * Hook for managing test timer with localStorage persistence.
 *
 * The timer uses Date.now() as the source of truth, not setInterval ticks.
 * This ensures accuracy even when the tab is inactive or throttled.
 *
 * Timer state is persisted to localStorage so page refresh doesn't reset it.
 */
export function useTestTimer({
  attemptKey,
  totalSeconds = 8100, // 135 minutes default
  onExpire,
  enabled = true,
}: UseTestTimerOptions): UseTestTimerReturn {
  const storageKey = `${STORAGE_PREFIX}${attemptKey}`
  const expiredRef = useRef(false)
  const onExpireRef = useRef(onExpire)

  // Keep onExpire ref updated
  useEffect(() => {
    onExpireRef.current = onExpire
  }, [onExpire])

  // Initialize state from localStorage or create new
  const [timerState, setTimerState] = useState<TimerState | null>(() => {
    if (typeof window === "undefined" || !enabled) return null

    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const parsed = JSON.parse(stored) as TimerState
        // Validate stored state
        if (parsed.startTime && parsed.totalSeconds) {
          return parsed
        }
      }
    } catch {
      // Ignore parse errors
    }

    // Create new timer state
    const newState: TimerState = {
      startTime: Date.now(),
      totalSeconds,
    }

    try {
      localStorage.setItem(storageKey, JSON.stringify(newState))
    } catch {
      // Storage might be full or unavailable
    }

    return newState
  })

  // Calculate current remaining time
  const calculateRemaining = useCallback((): number => {
    if (!timerState) return totalSeconds

    const elapsed = Math.floor((Date.now() - timerState.startTime) / 1000)
    return Math.max(0, timerState.totalSeconds - elapsed)
  }, [timerState, totalSeconds])

  const [remainingSeconds, setRemainingSeconds] = useState(calculateRemaining)

  // Update remaining seconds every second
  useEffect(() => {
    if (!enabled || !timerState) return

    const updateTimer = () => {
      const remaining = calculateRemaining()
      setRemainingSeconds(remaining)

      // Check for expiration
      if (remaining <= 0 && !expiredRef.current) {
        expiredRef.current = true
        onExpireRef.current?.()
      }
    }

    // Initial update
    updateTimer()

    // Set interval for visual updates
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [enabled, timerState, calculateRemaining])

  // Clear timer from storage
  const clearTimer = useCallback(() => {
    try {
      localStorage.removeItem(storageKey)
    } catch {
      // Ignore errors
    }
    setTimerState(null)
    expiredRef.current = false
  }, [storageKey])

  // Format time as HH:MM:SS or MM:SS
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    const pad = (n: number) => n.toString().padStart(2, "0")

    if (hours > 0) {
      return `${hours}:${pad(minutes)}:${pad(secs)}`
    }
    return `${pad(minutes)}:${pad(secs)}`
  }

  const elapsedSeconds = timerState
    ? Math.floor((Date.now() - timerState.startTime) / 1000)
    : 0

  return {
    remainingSeconds,
    elapsedSeconds,
    isExpired: remainingSeconds <= 0,
    startTime: timerState?.startTime ?? null,
    formattedTime: formatTime(remainingSeconds),
    clearTimer,
    isWarning: remainingSeconds > 0 && remainingSeconds <= 300, // < 5 min
    isCritical: remainingSeconds > 0 && remainingSeconds <= 60, // < 1 min
  }
}
