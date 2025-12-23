"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { QuestionCard } from "@/components/question-card"
import { NavigationPanel } from "@/components/navigation-panel"
import { MobileNavigation } from "@/components/mobile-navigation"
import type { Question, QuestionMode, SelectionMode } from "@/lib/types"
import { gradeAttempt } from "@/lib/grading"
import { useTestAnalytics } from "@/hooks/use-analytics"
import { AlertCircle, ChevronLeft, ChevronRight, Flag, Loader2 } from "lucide-react"
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

export function TestRunner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { trackTestStart, trackTestComplete, trackTestAbandoned } = useTestAnalytics()
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string[]>>({})
  const [startTime] = useState(() => Date.now())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const questionMode = (searchParams.get("questionMode") as QuestionMode) || "demo"
  const selectionMode = (searchParams.get("selectionMode") as SelectionMode) || "all"
  const count = Number(searchParams.get("count")) || 10
  const tag = searchParams.get("tag") || ""

  useEffect(() => {
    async function fetchAndFilterQuestions() {
      try {
        const params = new URLSearchParams()
        params.set("mode", questionMode)

        if (selectionMode === "random") {
          params.set("random", "true")
          params.set("limit", String(count))
        } else if (selectionMode === "tag" && tag) {
          params.set("tag", tag)
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
  }, [questionMode, selectionMode, count, tag, trackTestStart])

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore if typing in an input or if in an alert dialog
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        document.querySelector('[role="alertdialog"]')
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

      // Option selection shortcuts (1-4 or A-D) - only for single choice
      if (!currentQuestion.multi) {
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
          setAnswers((prev) => ({
            ...prev,
            [currentQuestion.id]: [optionId],
          }))
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [questions, currentIndex])

  const handleAnswerChange = useCallback((questionId: string, selectedOptions: string[]) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: selectedOptions,
    }))
  }, [])

  const handleFinishTest = async () => {
    setSaving(true)
    const durationSeconds = Math.floor((Date.now() - startTime) / 1000)
    const result = gradeAttempt(questions, answers, questionMode)

    // Prepare selection meta based on mode
    const selectionMeta: { n?: number; tag?: string } = {}
    if (selectionMode === "random") {
      selectionMeta.n = count
    } else if (selectionMode === "tag" && tag) {
      selectionMeta.tag = tag
    }

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
        throw new Error("Failed to save attempt")
      }

      const savedAttempt = await res.json()

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
    } finally {
      setSaving(false)
    }
  }

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

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <MobileNavigation
          currentIndex={currentIndex}
          totalQuestions={questions.length}
          answeredCount={answeredCount}
          onNavigate={setCurrentIndex}
          onFinish={handleFinishTest}
          answers={answers}
          questions={questions}
        />
      </div>

      {/* Desktop Layout - 2 columns */}
      <div className="hidden lg:flex lg:min-h-screen">
        {/* Left column: Question */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-3xl mx-auto">
            <QuestionCard
              question={currentQuestion}
              questionNumber={currentIndex + 1}
              totalQuestions={questions.length}
              selectedOptions={answers[currentQuestion.id] || []}
              onAnswerChange={(selected) => handleAnswerChange(currentQuestion.id, selected)}
            />

            {/* Desktop Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 gap-4">
              <Button
                variant="outline"
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>
              {currentIndex < questions.length - 1 ? (
                <Button onClick={() => setCurrentIndex((i) => i + 1)}>
                  Siguiente
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="default">
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
              {!currentQuestion.multi && <p>• 1-4 o A-D: Seleccionar opción</p>}
            </div>
          </div>
        </div>

        {/* Right column: Navigation Panel */}
        <div className="w-80 border-l bg-muted/30 p-6 overflow-y-auto">
          <NavigationPanel
            questions={questions}
            currentIndex={currentIndex}
            answers={answers}
            onNavigate={setCurrentIndex}
            onFinish={handleFinishTest}
            saving={saving}
          />
        </div>
      </div>

      {/* Mobile Layout - Single column */}
      <div className="lg:hidden px-4 py-6 pb-24">
        <QuestionCard
          question={currentQuestion}
          questionNumber={currentIndex + 1}
          totalQuestions={questions.length}
          selectedOptions={answers[currentQuestion.id] || []}
          onAnswerChange={(selected) => handleAnswerChange(currentQuestion.id, selected)}
        />

        {/* Mobile Navigation Buttons */}
        <div className="flex items-center justify-between mt-6 gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Anterior
          </Button>
          {currentIndex < questions.length - 1 ? (
            <Button size="sm" onClick={() => setCurrentIndex((i) => i + 1)}>
              Siguiente
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
