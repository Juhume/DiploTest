"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QuestionCard } from "@/components/question-card"
import type { Question, Attempt } from "@/lib/types"
import { CheckCircle, XCircle, MinusCircle, Clock, Home, History, RotateCcw } from "lucide-react"

interface ResultsViewProps {
  attempt: Attempt
  questions: Question[]
  answers: Record<string, string[]>
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins === 0) return `${secs}s`
  return `${mins}m ${secs}s`
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}

export function ResultsView({ attempt, questions, answers }: ResultsViewProps) {
  const [reviewFilter, setReviewFilter] = useState<"all" | "correct" | "wrong" | "blank">("all")
  
  const isRealMode = attempt.question_mode === "real"
  const score = isRealMode ? (attempt.correct_count * 0.10) : (attempt.percentage / 10)
  const passingScore = isRealMode ? 5.8 : 6.0
  const passed = isRealMode ? (score >= 5.8) : (attempt.percentage >= 60)

  const getQuestionStatus = (questionId: string): "correct" | "wrong" | "blank" => {
    const userAnswer = answers[questionId]
    
    // Si no hay respuesta en el objeto answers o es un array vacío, es blanco
    if (!userAnswer || userAnswer.length === 0) {
      return "blank"
    }

    const question = questions.find((q) => q.id === questionId)
    if (!question) return "blank"

    const correct = question.correct
    const isCorrect = userAnswer.length === correct.length && userAnswer.every((a) => correct.includes(a))

    return isCorrect ? "correct" : "wrong"
  }

  const filteredQuestions = questions.filter((q) => {
    if (reviewFilter === "all") return true
    const status = getQuestionStatus(q.id)
    return status === reviewFilter
  })

  const percentage = attempt.percentage
  const scoreColor = percentage >= 70 ? "text-green-600" : percentage >= 50 ? "text-amber-600" : "text-red-600"

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-1">Resultados del Test</h1>
          <p className="text-sm text-muted-foreground">{formatDate(attempt.created_at)}</p>
        </header>

        {/* Score Summary */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              {isRealMode ? (
                <>
                  <div className={`text-5xl font-bold ${passed ? "text-green-600" : "text-red-600"}`}>
                    {score.toFixed(2)}
                  </div>
                  <p className="text-muted-foreground mt-1">Nota (sobre 10)</p>
                  <div className={`mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full ${passed ? "bg-green-100 dark:bg-green-950" : "bg-red-100 dark:bg-red-950"}`}>
                    <Badge variant={passed ? "default" : "destructive"} className="text-sm">
                      {passed ? "✓ APTO" : "✗ NO APTO"}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      (Nota de corte: {passingScore})
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className={`text-5xl font-bold ${scoreColor}`}>{percentage.toFixed(1)}%</div>
                  <p className="text-muted-foreground mt-1">Puntuación</p>
                </>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-2xl font-bold text-green-600">{attempt.correct_count}</span>
                </div>
                <p className="text-xs text-muted-foreground">Aciertos</p>
              </div>
              <div className="text-center p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-2xl font-bold text-red-600">{attempt.wrong_count}</span>
                </div>
                <p className="text-xs text-muted-foreground">Fallos</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <MinusCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-2xl font-bold">{attempt.blank_count}</span>
                </div>
                <p className="text-xs text-muted-foreground">En blanco</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-2xl font-bold">{formatDuration(attempt.duration_seconds)}</span>
                </div>
                <p className="text-xs text-muted-foreground">Tiempo</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t text-center text-sm text-muted-foreground">
              <span>Modo: </span>
              <Badge variant="outline">
                {attempt.selection_mode === "all"
                  ? "Pool completo"
                  : attempt.selection_mode === "random"
                    ? `Aleatorio (${attempt.selection_meta?.n || attempt.total_questions})`
                    : `Tema: ${attempt.selection_meta?.tag}`}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Review Section */}
        <Card>
          <CardHeader>
            <CardTitle>Revisión de Respuestas</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={reviewFilter} onValueChange={(v) => setReviewFilter(v as typeof reviewFilter)}>
              <TabsList className="grid w-full grid-cols-4 mb-4">
                <TabsTrigger value="all">Todas ({questions.length})</TabsTrigger>
                <TabsTrigger value="correct" className="text-green-600">
                  Aciertos ({attempt.correct_count})
                </TabsTrigger>
                <TabsTrigger value="wrong" className="text-red-600">
                  Fallos ({attempt.wrong_count})
                </TabsTrigger>
                <TabsTrigger value="blank">Blanco ({attempt.blank_count})</TabsTrigger>
              </TabsList>

              <TabsContent value={reviewFilter} className="space-y-4">
                {filteredQuestions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No hay preguntas en esta categoría</p>
                ) : (
                  filteredQuestions.map((question, index) => {
                    const status = getQuestionStatus(question.id)
                    const userAnswer = answers[question.id] || []

                    return (
                      <div key={question.id} className="relative">
                        <div className="absolute -left-2 top-4 z-10">
                          {status === "correct" && (
                            <CheckCircle className="h-5 w-5 text-green-600 bg-background rounded-full" />
                          )}
                          {status === "wrong" && (
                            <XCircle className="h-5 w-5 text-red-600 bg-background rounded-full" />
                          )}
                          {status === "blank" && (
                            <MinusCircle className="h-5 w-5 text-muted-foreground bg-background rounded-full" />
                          )}
                        </div>
                        <div className="pl-4">
                          <p className="text-xs text-muted-foreground mb-2">
                            Pregunta {questions.findIndex((q) => q.id === question.id) + 1}
                          </p>
                          <QuestionCard
                            question={question}
                            selectedOptions={userAnswer}
                            onAnswerChange={() => {}}
                            showCorrect={true}
                            correctOptions={question.correct}
                          />
                        </div>
                      </div>
                    )
                  })
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <Button asChild className="flex-1">
            <Link href="/">
              <RotateCcw className="mr-2 h-4 w-4" />
              Nuevo Test
            </Link>
          </Button>
          <Button variant="outline" asChild className="flex-1 bg-transparent">
            <Link href="/history">
              <History className="mr-2 h-4 w-4" />
              Ver Historial
            </Link>
          </Button>
          <Button variant="outline" asChild className="flex-1 bg-transparent">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Inicio
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
