"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import type { Question } from "@/lib/types"
import { ChevronLeft, ChevronRight, Flag, Grid3X3 } from "lucide-react"
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

interface MobileNavigationProps {
  questions: Question[]
  answers: Record<string, string[]>
  currentIndex: number
  onPrevious: () => void
  onNext: () => void
  onQuestionSelect: (index: number) => void
  onFinish: () => void
  showNavPanel: boolean
  setShowNavPanel: (show: boolean) => void
}

export function MobileNavigation({
  questions,
  answers,
  currentIndex,
  onPrevious,
  onNext,
  onQuestionSelect,
  onFinish,
  showNavPanel,
  setShowNavPanel,
}: MobileNavigationProps) {
  const answeredCount = Object.keys(answers).filter((k) => answers[k].length > 0).length
  const isLastQuestion = currentIndex === questions.length - 1

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t p-3 safe-area-inset-bottom">
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={currentIndex === 0}
          className="flex-1 bg-transparent"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only sm:ml-1">Anterior</span>
        </Button>

        <Sheet open={showNavPanel} onOpenChange={setShowNavPanel}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              <Grid3X3 className="h-4 w-4 mr-1" />
              <span className="text-xs">
                {currentIndex + 1}/{questions.length}
              </span>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[60vh]">
            <SheetHeader>
              <SheetTitle>
                Preguntas ({answeredCount}/{questions.length} respondidas)
              </SheetTitle>
            </SheetHeader>
            <div className="grid grid-cols-6 gap-2 mt-4 overflow-y-auto max-h-[calc(60vh-100px)]">
              {questions.map((q, index) => {
                const isAnswered = answers[q.id]?.length > 0
                const isCurrent = index === currentIndex

                return (
                  <button
                    key={q.id}
                    onClick={() => onQuestionSelect(index)}
                    className={`
                      aspect-square rounded-md text-sm font-medium transition-colors
                      focus:outline-none focus:ring-2 focus:ring-ring
                      ${isCurrent ? "bg-primary text-primary-foreground" : isAnswered ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100" : "bg-muted text-muted-foreground"}
                    `}
                  >
                    {index + 1}
                  </button>
                )
              })}
            </div>
            <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-green-100 dark:bg-green-900" />
                <span>Respondida</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-muted" />
                <span>Sin responder</span>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {isLastQuestion ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" className="flex-1">
                <Flag className="h-4 w-4 mr-1" />
                Finalizar
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
                <AlertDialogCancel>Continuar</AlertDialogCancel>
                <AlertDialogAction onClick={onFinish}>Finalizar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <Button size="sm" onClick={onNext} className="flex-1">
            <span className="sr-only sm:not-sr-only sm:mr-1">Siguiente</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
