"use client"

import { useCallback } from "react"

export type AnalyticsEvent = 
  | "test_started"
  | "test_completed"
  | "test_abandoned"
  | "question_answered"
  | "answer_changed"
  | "results_viewed"
  | "history_viewed"
  | "signup_completed"
  | "login_completed"
  | "error_occurred"

interface EventProperties {
  [key: string]: string | number | boolean | null | undefined
}

/**
 * Custom hook para trackear eventos de analytics
 * Compatible con Vercel Analytics y extensible a otros servicios
 */
export function useAnalytics() {
  const trackEvent = useCallback((event: AnalyticsEvent, properties?: EventProperties) => {
    // Vercel Analytics
    if (typeof window !== "undefined" && (window as any).va) {
      (window as any).va("track", event, properties)
    }

    // Console log en desarrollo
    if (process.env.NODE_ENV === "development") {
      console.log("📊 Analytics Event:", event, properties)
    }

    // Aquí podrías agregar otros servicios como Google Analytics, Mixpanel, etc.
    // if (typeof window !== "undefined" && (window as any).gtag) {
    //   (window as any).gtag("event", event, properties)
    // }
  }, [])

  const trackPageView = useCallback((url: string) => {
    if (typeof window !== "undefined" && (window as any).va) {
      (window as any).va("pageview", { url })
    }
  }, [])

  return { trackEvent, trackPageView }
}

/**
 * Hook específico para trackear rendimiento de tests
 */
export function useTestAnalytics() {
  const { trackEvent } = useAnalytics()

  const trackTestStart = useCallback((mode: "demo" | "real", questionCount: number) => {
    trackEvent("test_started", {
      mode,
      question_count: questionCount,
      timestamp: new Date().toISOString(),
    })
  }, [trackEvent])

  const trackTestComplete = useCallback((
    mode: "demo" | "real",
    score: number,
    duration: number,
    passed: boolean
  ) => {
    trackEvent("test_completed", {
      mode,
      score,
      duration_seconds: duration,
      passed,
      timestamp: new Date().toISOString(),
    })
  }, [trackEvent])

  const trackTestAbandoned = useCallback((
    mode: "demo" | "real",
    questionsAnswered: number,
    totalQuestions: number
  ) => {
    trackEvent("test_abandoned", {
      mode,
      questions_answered: questionsAnswered,
      total_questions: totalQuestions,
      completion_rate: (questionsAnswered / totalQuestions) * 100,
      timestamp: new Date().toISOString(),
    })
  }, [trackEvent])

  return { trackTestStart, trackTestComplete, trackTestAbandoned }
}
