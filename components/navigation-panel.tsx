"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { Question } from "@/lib/types"
import { Flag, CheckCircle2, Sparkles } from "lucide-react"
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

interface NavigationPanelProps {
  questions: Question[]
  answers: Record<string, string[]>
  currentIndex: number
  onQuestionSelect: (index: number) => void
  onFinish: () => void
}

export function NavigationPanel({
  questions,
  answers,
  currentIndex,
  onQuestionSelect,
  onFinish,
}: NavigationPanelProps) {
  const answeredCount = Object.keys(answers).filter((k) => answers[k].length > 0).length
  const progressPercent = (answeredCount / questions.length) * 100
  const isHalfway = progressPercent >= 50 && progressPercent < 100
  const isAlmostDone = progressPercent >= 75 && progressPercent < 100
  const isComplete = progressPercent === 100

  const getProgressMessage = () => {
    if (isComplete) return { icon: <CheckCircle2 className="h-4 w-4 text-green-500" />, text: "¡Todas respondidas!", color: "text-green-600" }
    if (isAlmostDone) return { icon: <Sparkles className="h-4 w-4 text-amber-500" />, text: "¡Ya casi terminas!", color: "text-amber-600" }
    if (isHalfway) return { icon: <Sparkles className="h-4 w-4 text-blue-500" />, text: "¡Vas por la mitad!", color: "text-blue-600" }
    return null
  }

  const progressMessage = getProgressMessage()

  return (
    <Card className="sticky top-20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Navegación</CardTitle>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {answeredCount} de {questions.length} respondidas
            </span>
            <span className="font-medium">{Math.round(progressPercent)}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
          {progressMessage && (
            <div className={`flex items-center gap-1.5 text-xs font-medium ${progressMessage.color}`}>
              {progressMessage.icon}
              {progressMessage.text}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-5 gap-2">
          {questions.map((q, index) => {
            const isAnswered = answers[q.id]?.length > 0
            const isCurrent = index === currentIndex

            return (
              <button
                key={q.id}
                onClick={() => onQuestionSelect(index)}
                className={`
                  aspect-square rounded-md text-sm font-medium transition-colors
                  focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
                  ${isCurrent ? "bg-primary text-primary-foreground" : isAnswered ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100" : "bg-muted text-muted-foreground hover:bg-muted/80"}
                `}
                aria-label={`Pregunta ${index + 1}${isAnswered ? ", respondida" : ", sin responder"}${isCurrent ? ", actual" : ""}`}
              >
                {index + 1}
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-green-100 dark:bg-green-900" />
            <span>Respondida</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-muted" />
            <span>Sin responder</span>
          </div>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="w-full" variant="default">
              <Flag className="mr-2 h-4 w-4" />
              Finalizar Test
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Finalizar el test?</AlertDialogTitle>
              <AlertDialogDescription>
                Has respondido {answeredCount} de {questions.length} preguntas.
                {answeredCount < questions.length && (
                  <span className="block mt-2 text-amber-600">
                    Tienes {questions.length - answeredCount} preguntas sin responder.
                  </span>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Continuar test</AlertDialogCancel>
              <AlertDialogAction onClick={onFinish}>Finalizar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}
