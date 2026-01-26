"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { QuestionCard } from "@/components/question-card"
import { NavigationPanel } from "@/components/navigation-panel"
import { MobileNavigation } from "@/components/mobile-navigation"
import { TestTimer } from "@/components/test-timer"
import type { Question, QuestionMode, SelectionMode } from "@/lib/types"
import { gradeAttempt } from "@/lib/grading"
import { useTestAnalytics } from "@/hooks/use-analytics"
import { useTestTimer } from "@/hooks/use-test-timer"
import { AlertCircle, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Flag, Loader2, Calendar, LogOut, Copy, RefreshCw, Check } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

// Timer duration for real/academy mode: 135 minutes = 8100 seconds
const TEST_DURATION_SECONDS = 8100

/**
 * Extract exam year from question ID or exam_year field
 */
function getQuestionYear(question: Question): number | null {
  // First check if question has exam_year field
  if (question.exam_year) {
    return question.exam_year
  }
  // Try to extract from ID pattern "examen_real_YYYY_qN"
  const match = question.id.match(/examen_real_(\d{4})/)
  if (match) {
    return parseInt(match[1], 10)
  }
  return null
}

export function TestRunner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { trackTestStart, trackTestComplete } = useTestAnalytics()
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string[]>>({})
  const [startTime] = useState(() => Date.now())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errorTrace, setErrorTrace] = useState<string | null>(null)
  const [showErrorTrace, setShowErrorTrace] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showNavPanel, setShowNavPanel] = useState(false)
  const [timeExpiredMessage, setTimeExpiredMessage] = useState<string | null>(null)

  const questionMode = (searchParams.get("questionMode") as QuestionMode) || "demo"
  const selectionMode = (searchParams.get("selectionMode") as SelectionMode) || "all"
  const count = Number(searchParams.get("count")) || 10
  const tag = searchParams.get("tag") || ""
  const examYear = searchParams.get("examYear") || ""

  // Generate a unique attempt key for timer persistence (stable across renders)
  const [attemptKey] = useState(() => {
    if (typeof window === "undefined") return `${questionMode}_${Date.now()}`
    // Check if there's an existing attempt key in storage for this session
    const existingKey = sessionStorage.getItem("current_test_attempt_key")
    if (existingKey) return existingKey
    // Generate new key
    const newKey = `${questionMode}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
    sessionStorage.setItem("current_test_attempt_key", newKey)
    return newKey
  })

  // Timer enabled only for real and academy modes
  const timerEnabled = questionMode === "real" || questionMode === "academy"

  // Ref to track if we've already triggered auto-finish (prevents double submission)
  const autoFinishTriggeredRef = useRef(false)
  // Ref to store answers for auto-finish (to avoid stale closure)
  const answersRef = useRef(answers)
  answersRef.current = answers
  // Ref to store questions for auto-finish
  const questionsRef = useRef(questions)
  questionsRef.current = questions
  // Ref to store clearTimer function (to avoid temporal dead zone with useCallback)
  const clearTimerRef = useRef<(() => void) | null>(null)

  // Handle timer expiration - auto finish test
  const handleTimerExpire = useCallback(async () => {
    if (autoFinishTriggeredRef.current) return
    autoFinishTriggeredRef.current = true

    // Use refs to get current values
    const currentAnswers = answersRef.current
    const currentQuestions = questionsRef.current

    // Si las preguntas no se han cargado (ej: usuario vuelve a un test expirado),
    // limpiar todo y redirigir al inicio
    if (currentQuestions.length === 0) {
      clearTimerRef.current?.()
      sessionStorage.removeItem("current_test_attempt_key")
      setError("El tiempo del test ha expirado. Por favor, inicia un nuevo test.")
      return
    }

    setTimeExpiredMessage("Tiempo agotado (135:00). El test se ha enviado automáticamente.")

    setSaving(true)
    setError(null)
    setErrorTrace(null)

    // Track if we already set a detailed error trace
    let traceAlreadySet = false

    const durationSeconds = TEST_DURATION_SECONDS // Full time used
    const result = gradeAttempt(currentQuestions, currentAnswers, questionMode)

    const selectionMeta: { n?: number; tag?: string; examYear?: number } = {}
    if (selectionMode === "random") {
      selectionMeta.n = count
    } else if (selectionMode === "tag" && tag) {
      selectionMeta.tag = tag
    }
    if (examYear) {
      selectionMeta.examYear = parseInt(examYear, 10)
    }

    try {
      const attemptData = {
        question_mode: questionMode,
        selection_mode: selectionMode,
        selection_meta: selectionMeta,
        total_questions: currentQuestions.length,
        correct_count: result.correctCount,
        wrong_count: result.wrongCount,
        blank_count: result.blankCount,
        percentage: result.percentage,
        duration_seconds: durationSeconds,
        answers: currentAnswers,
        grading: result.grading,
      }

      const res = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(attemptData),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        const errorMessage = errorData.details || errorData.error || "Failed to save attempt"
        const trace = JSON.stringify({
          status: res.status,
          statusText: res.statusText,
          serverError: errorData,
          attemptData: {
            ...attemptData,
            answers: `[${Object.keys(attemptData.answers).length} respuestas]`,
            grading: `[${Object.keys(attemptData.grading).length} preguntas evaluadas]`,
          },
          timestamp: new Date().toISOString(),
          context: "timer_expire",
        }, null, 2)
        setErrorTrace(trace)
        traceAlreadySet = true
        throw new Error(errorMessage)
      }

      const savedAttempt = await res.json()

      trackTestComplete(questionMode, result.score, durationSeconds, result.passed)

      // Clear timer from localStorage
      clearTimerRef.current?.()
      // Clear session storage for attempt key
      sessionStorage.removeItem("current_test_attempt_key")

      // Clear time expired message before redirect
      setTimeExpiredMessage(null)

      // Redirect with time expired flag
      router.push(`/results/${savedAttempt.id}?timeExpired=true`)
    } catch (err) {
      console.error("Error saving attempt on timer expire:", err)
      setTimeExpiredMessage(null) // Clear to show error overlay
      setError("No se pudo guardar el intento. Por favor, inténtalo de nuevo.")
      // Only set trace if we haven't already set a more detailed one
      if (!traceAlreadySet && err instanceof Error) {
        setErrorTrace(JSON.stringify({
          message: err.message,
          stack: err.stack,
          timestamp: new Date().toISOString(),
          context: "timer_expire",
        }, null, 2))
      }
      autoFinishTriggeredRef.current = false
    } finally {
      setSaving(false)
    }
  }, [questionMode, selectionMode, count, tag, examYear, trackTestComplete, router])

  // Initialize timer hook
  const {
    formattedTime,
    isWarning,
    isCritical,
    isExpired,
    clearTimer,
  } = useTestTimer({
    attemptKey,
    totalSeconds: TEST_DURATION_SECONDS,
    onExpire: handleTimerExpire,
    enabled: timerEnabled,
  })

  // Keep ref in sync for use in handleTimerExpire
  clearTimerRef.current = clearTimer

  useEffect(() => {
    async function fetchAndFilterQuestions() {
      try {
        const params = new URLSearchParams()
        params.set("mode", questionMode)

        // Handle review mode - fetch failed questions
        if (selectionMode === "review") {
          params.set("selectionMode", "review")
        } else if (selectionMode === "random") {
          params.set("random", "true")
          params.set("limit", String(count))
        } else if (selectionMode === "tag" && tag) {
          params.set("tag", tag)
        }

        // Pass exam year filter for real mode
        if (questionMode === "real" && examYear) {
          params.set("examYear", examYear)
        }

        const res = await fetch(`/api/questions?${params.toString()}`)
        if (!res.ok) throw new Error("Failed to fetch questions")
        const data: Question[] = await res.json()

        if (data.length === 0) {
          setError("No se encontraron preguntas para este criterio")
          return
        }

        setQuestions(data)

        // Track test start
        trackTestStart(questionMode, data.length)
      } catch (err) {
        setError("Error al cargar las preguntas")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchAndFilterQuestions()
  }, [questionMode, selectionMode, count, tag, examYear, trackTestStart])

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore if typing in an input, in alert dialog, or test is expired/saving
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        document.querySelector('[role="alertdialog"]') ||
        isExpired ||
        saving
      )
        return

      const currentQuestion = questions[currentIndex]
      if (!currentQuestion) return

      // Navigation shortcuts
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        if (currentIndex < questions.length - 1) {
          setCurrentIndex((i) => i + 1)
        }
      } else if (e.key === "Enter" && e.shiftKey) {
        e.preventDefault()
        if (currentIndex > 0) {
          setCurrentIndex((i) => i - 1)
        }
      }

      // Option selection shortcuts (1-4 or A-D)
      const optionKeys: Record<string, string> = {
        "1": "A",
        "2": "B",
        "3": "C",
        "4": "D",
        a: "A",
        b: "B",
        c: "C",
        d: "D",
      }
      const optionId = optionKeys[e.key.toLowerCase()]
      if (optionId && currentQuestion.options.find((o) => o.id === optionId)) {
        e.preventDefault()
        if (currentQuestion.multi) {
          // Multi-select: toggle the option
          setAnswers((prev) => {
            const current = prev[currentQuestion.id] || []
            const isSelected = current.includes(optionId)
            return {
              ...prev,
              [currentQuestion.id]: isSelected
                ? current.filter((id) => id !== optionId)
                : [...current, optionId],
            }
          })
        } else {
          // Single-select: replace the answer
          setAnswers((prev) => ({
            ...prev,
            [currentQuestion.id]: [optionId],
          }))
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [questions, currentIndex, isExpired, saving])

  const handleAnswerChange = useCallback((questionId: string, selectedOptions: string[]) => {
    // Don't allow changes if timer expired
    if (isExpired) return
    setAnswers((prev) => ({
      ...prev,
      [questionId]: selectedOptions,
    }))
  }, [isExpired])

  const handleFinishTest = async () => {
    // Prevent finishing if already saving or expired (using ref for sync check)
    if (saving || autoFinishTriggeredRef.current) return
    autoFinishTriggeredRef.current = true

    setSaving(true)
    setError(null)
    setErrorTrace(null)

    const durationSeconds = Math.floor((Date.now() - startTime) / 1000)
    const result = gradeAttempt(questions, answers, questionMode)

    // Prepare selection meta based on mode
    const selectionMeta: { n?: number; tag?: string; examYear?: number } = {}
    if (selectionMode === "random") {
      selectionMeta.n = count
    } else if (selectionMode === "tag" && tag) {
      selectionMeta.tag = tag
    }
    if (examYear) {
      selectionMeta.examYear = parseInt(examYear, 10)
    }

    // Track if we already set a detailed error trace (to avoid overwriting with less useful info)
    let traceAlreadySet = false

    // Save attempt to database
    try {
      const attemptData = {
        question_mode: questionMode,
        selection_mode: selectionMode,
        selection_meta: selectionMeta,
        total_questions: questions.length,
        correct_count: result.correctCount,
        wrong_count: result.wrongCount,
        blank_count: result.blankCount,
        percentage: result.percentage,
        duration_seconds: durationSeconds,
        answers,
        grading: result.grading,
      }

      const res = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(attemptData),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        const errorMessage = errorData.details || errorData.error || "Failed to save attempt"
        const trace = JSON.stringify({
          status: res.status,
          statusText: res.statusText,
          serverError: errorData,
          attemptData: {
            ...attemptData,
            answers: `[${Object.keys(attemptData.answers).length} respuestas]`,
            grading: `[${Object.keys(attemptData.grading).length} preguntas evaluadas]`,
          },
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
        }, null, 2)
        setErrorTrace(trace)
        traceAlreadySet = true
        throw new Error(errorMessage)
      }

      const savedAttempt = await res.json()

      // Clear timer from storage on manual finish
      clearTimer?.()
      // Clear session storage for attempt key
      sessionStorage.removeItem("current_test_attempt_key")

      // Track test completion
      trackTestComplete(
        questionMode,
        result.score,
        durationSeconds,
        result.passed
      )

      // Redirect to results page with attempt ID
      router.push(`/results/${savedAttempt.id}`)
    } catch (err) {
      console.error("Error saving attempt:", err)
      setError("No se pudo guardar el intento. Por favor, inténtalo de nuevo.")
      // Only set trace if we haven't already set a more detailed one
      if (!traceAlreadySet && err instanceof Error) {
        setErrorTrace(JSON.stringify({
          message: err.message,
          stack: err.stack,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
        }, null, 2))
      }
      // Reset ref to allow retry
      autoFinishTriggeredRef.current = false
    } finally {
      setSaving(false)
    }
  }

  const handleExitTest = useCallback(() => {
    if (saving || autoFinishTriggeredRef.current || isExpired) return
    clearTimer?.()
    sessionStorage.removeItem("current_test_attempt_key")
    router.push("/app")
  }, [clearTimer, isExpired, router, saving])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Cargando preguntas...</p>
        </div>
      </div>
    )
  }

  if (error || questions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <h2 className="text-xl font-semibold">Error</h2>
            <p className="text-muted-foreground">{error || "No se encontraron preguntas"}</p>
            <Button onClick={() => router.push("/app")}>Volver al inicio</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]
  const answeredCount = Object.keys(answers).filter((qId) => answers[qId]?.length > 0).length
  const currentQuestionYear = questionMode === "real" ? getQuestionYear(currentQuestion) : null

  return (
    <div className="min-h-screen bg-background">
      {/* Time expired overlay message */}
      {timeExpiredMessage && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md">
            <CardContent className="pt-6 text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-amber-500 mx-auto" />
              <h2 className="text-xl font-semibold">Tiempo agotado</h2>
              <p className="text-muted-foreground">{timeExpiredMessage}</p>
              <div className="flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span>Guardando resultados...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Error overlay with trace toggle - responsive */}
      {error && !saving && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <Card className="w-full max-w-[calc(100vw-1rem)] sm:max-w-lg max-h-[calc(100vh-1rem)] overflow-y-auto">
            <CardContent className="pt-4 sm:pt-6 space-y-3 sm:space-y-4">
              <div className="text-center">
                <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-destructive mx-auto" />
                <h2 className="text-lg sm:text-xl font-semibold mt-3 sm:mt-4">Error al guardar</h2>
                <p className="text-sm sm:text-base text-muted-foreground mt-2">{error}</p>
              </div>

              {errorTrace && (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setShowErrorTrace(!showErrorTrace)}
                    className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors w-full justify-center py-1"
                  >
                    {showErrorTrace ? (
                      <ChevronUp className="h-4 w-4 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 flex-shrink-0" />
                    )}
                    <span className="truncate">
                      {showErrorTrace ? "Ocultar detalles técnicos" : "Ver detalles técnicos"}
                    </span>
                  </button>

                  {showErrorTrace && (
                    <div className="relative">
                      <pre className="text-[10px] sm:text-xs bg-muted p-2 sm:p-3 rounded-md overflow-x-auto overflow-y-auto max-h-32 sm:max-h-48 text-left whitespace-pre-wrap break-all sm:break-normal sm:whitespace-pre">
                        {errorTrace}
                      </pre>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-1 right-1 sm:top-2 sm:right-2 h-7 w-7 sm:h-8 sm:w-8 p-0"
                        onClick={() => {
                          navigator.clipboard.writeText(errorTrace)
                          setCopied(true)
                          toast.success("Copiado al portapapeles")
                          setTimeout(() => setCopied(false), 2000)
                        }}
                      >
                        {copied ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="sm:size-default"
                  onClick={() => {
                    setError(null)
                    setErrorTrace(null)
                    setShowErrorTrace(false)
                    setCopied(false)
                  }}
                >
                  Cerrar
                </Button>
                <Button size="sm" className="sm:size-default" onClick={handleFinishTest} disabled={saving}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reintentar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Mobile Header with Timer */}
      <div className="lg:hidden sticky top-0 z-40 bg-background border-b px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {currentIndex + 1}/{questions.length}
            </span>
            {currentQuestionYear && (
              <Badge variant="outline" className="text-xs">
                <Calendar className="h-3 w-3 mr-1" />
                {currentQuestionYear}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {timerEnabled && (
              <TestTimer
                formattedTime={formattedTime}
                isWarning={isWarning}
                isCritical={isCritical}
                isExpired={isExpired}
              />
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-destructive">
                  <LogOut className="h-4 w-4" />
                  <span className="sr-only">Salir del test</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Salir del test?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tu progreso actual no se guardará y perderás las respuestas registradas.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Continuar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleExitTest}
                    disabled={saving || isExpired}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Salir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <MobileNavigation
          questions={questions}
          answers={answers}
          currentIndex={currentIndex}
          onPrevious={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          onNext={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
          onQuestionSelect={(index) => {
            setCurrentIndex(index)
            setShowNavPanel(false)
          }}
          onFinish={handleFinishTest}
          showNavPanel={showNavPanel}
          setShowNavPanel={setShowNavPanel}
        />
      </div>

      {/* Desktop Layout - 2 columns */}
      <div className="hidden lg:flex lg:min-h-screen">
        {/* Left column: Question */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-3xl mx-auto">
            {/* Desktop Header with Timer and Year Badge */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  Pregunta {currentIndex + 1} de {questions.length}
                </span>
                {currentQuestionYear && (
                  <Badge variant="secondary" className="font-normal">
                    <Calendar className="h-3 w-3 mr-1" />
                    Examen {currentQuestionYear}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3">
                {timerEnabled && (
                  <TestTimer
                    formattedTime={formattedTime}
                    isWarning={isWarning}
                    isCritical={isCritical}
                    isExpired={isExpired}
                  />
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-destructive">
                      <LogOut className="h-4 w-4 mr-2" />
                      Salir
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Salir del test?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tu progreso actual no se guardará y perderás las respuestas registradas.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Continuar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleExitTest}
                        disabled={saving || isExpired}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Salir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            <QuestionCard
              question={currentQuestion}
              selectedOptions={answers[currentQuestion.id] || []}
              onAnswerChange={(selected) => handleAnswerChange(currentQuestion.id, selected)}
            />

            {/* Desktop Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 gap-4">
              <Button
                variant="outline"
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                disabled={currentIndex === 0 || isExpired}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>
              {currentIndex < questions.length - 1 ? (
                <Button onClick={() => setCurrentIndex((i) => i + 1)} disabled={isExpired}>
                  Siguiente
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="default" disabled={isExpired || saving}>
                      <Flag className="h-4 w-4 mr-2" />
                      Finalizar Test
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Finalizar el test?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Has contestado {answeredCount} de {questions.length} preguntas.
                        {answeredCount < questions.length &&
                          ` Quedan ${questions.length - answeredCount} preguntas sin contestar.`}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleFinishTest} disabled={saving}>
                        {saving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Guardando...
                          </>
                        ) : (
                          "Finalizar"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>

            {/* Keyboard shortcuts hint */}
            <div className="mt-6 text-xs text-muted-foreground space-y-1">
              <p>
                <strong>Atajos de teclado:</strong>
              </p>
              <p>• Enter: Siguiente | Shift+Enter: Anterior</p>
              <p>• 1-4 o A-D: {currentQuestion.multi ? "Marcar/desmarcar opción" : "Seleccionar opción"}</p>
            </div>
          </div>
        </div>

        {/* Right column: Navigation Panel */}
        <div className="w-80 border-l bg-muted/30 p-6 overflow-y-auto">
          <NavigationPanel
            questions={questions}
            currentIndex={currentIndex}
            answers={answers}
            onQuestionSelect={setCurrentIndex}
            onFinish={handleFinishTest}
          />
        </div>
      </div>

      {/* Mobile Layout - Single column */}
      <div className="lg:hidden px-4 py-6 pb-24">
        <QuestionCard
          question={currentQuestion}
          selectedOptions={answers[currentQuestion.id] || []}
          onAnswerChange={(selected) => handleAnswerChange(currentQuestion.id, selected)}
        />

        {/* Mobile Navigation Buttons */}
        <div className="flex items-center justify-between mt-6 gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0 || isExpired}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Anterior
          </Button>
          {currentIndex < questions.length - 1 ? (
            <Button size="sm" onClick={() => setCurrentIndex((i) => i + 1)} disabled={isExpired}>
              Siguiente
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
