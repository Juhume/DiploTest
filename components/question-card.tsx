"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, Info, Bookmark, BookmarkCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Question, QuestionMode } from "@/lib/types"

interface QuestionCardProps {
  question: Question
  selectedOptions: string[]
  onAnswerChange: (selected: string[]) => void
  showCorrect?: boolean
  correctOptions?: string[]
  showBookmarkButton?: boolean
  isBookmarked?: boolean
  onToggleBookmark?: (questionId: string, mode: string) => void
  questionMode?: QuestionMode
}

export function QuestionCard({
  question,
  selectedOptions,
  onAnswerChange,
  showCorrect = false,
  correctOptions,
  showBookmarkButton = false,
  isBookmarked = false,
  onToggleBookmark,
  questionMode = "demo",
}: QuestionCardProps) {
  const isMulti = question.multi
  const isBlank = selectedOptions.length === 0

  const handleSingleChange = (value: string) => {
    onAnswerChange([value])
  }

  const handleMultiChange = (optionId: string, checked: boolean) => {
    if (checked) {
      onAnswerChange([...selectedOptions, optionId])
    } else {
      onAnswerChange(selectedOptions.filter((id) => id !== optionId))
    }
  }

  const getOptionStyle = (optionId: string) => {
    if (!showCorrect) return ""

    const isSelected = selectedOptions.includes(optionId)
    const isCorrect = correctOptions?.includes(optionId)

    // Si la pregunta está en blanco, solo resaltar las correctas
    if (isBlank) {
      if (isCorrect) return "border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border-2 shadow-sm shadow-green-200 dark:shadow-green-900"
      return "opacity-50"
    }

    // Si hay respuesta, mostrar correctas e incorrectas
    if (isCorrect && isSelected) return "border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border-2 shadow-sm shadow-green-200 dark:shadow-green-900 animate-in fade-in duration-300"
    if (isCorrect && !isSelected) return "border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border-2 shadow-sm shadow-green-200 dark:shadow-green-900"
    if (!isCorrect && isSelected) return "border-red-500 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/50 dark:to-rose-950/50 border-2 shadow-sm shadow-red-200 dark:shadow-red-900"
    return "opacity-50"
  }

  const getOptionIcon = (optionId: string) => {
    if (!showCorrect) return null

    const isSelected = selectedOptions.includes(optionId)
    const isCorrect = correctOptions?.includes(optionId)

    if (isCorrect) {
      return (
        <div className="flex items-center gap-1 shrink-0">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          {isSelected && <span className="text-xs font-medium text-green-600">Correcto</span>}
        </div>
      )
    }
    if (!isCorrect && isSelected) {
      return (
        <div className="flex items-center gap-1 shrink-0">
          <XCircle className="h-5 w-5 text-red-600" />
          <span className="text-xs font-medium text-red-600">Incorrecto</span>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-base leading-relaxed text-foreground text-pretty">{question.stem}</p>
            {isMulti && !showCorrect && (
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-2 font-medium">
                Selecciona todas las respuestas correctas
              </p>
            )}
          </div>
          <div className="flex gap-2 shrink-0 items-center">
            {isMulti && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                Múltiple
              </Badge>
            )}
            {showCorrect && isBlank && (
              <Badge variant="outline" className="text-amber-600 border-amber-600">
                Sin responder
              </Badge>
            )}
            {showBookmarkButton && onToggleBookmark && (
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${isBookmarked ? "text-amber-500" : "text-muted-foreground"}`}
                onClick={() => onToggleBookmark(question.id, questionMode)}
                title={isBookmarked ? "Quitar de flashcards" : "Guardar para repasar"}
              >
                {isBookmarked ? (
                  <BookmarkCheck className="h-5 w-5 fill-current" />
                ) : (
                  <Bookmark className="h-5 w-5" />
                )}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isMulti ? (
          <div className="space-y-3">
            {question.options.map((option) => {
              const isChecked = selectedOptions.includes(option.id)
              return (
                <div
                  key={option.id}
                  onClick={() => {
                    if (!showCorrect) {
                      handleMultiChange(option.id, !isChecked)
                    }
                  }}
                  className={`flex items-start space-x-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer ${getOptionStyle(option.id)} ${!showCorrect ? "hover:bg-muted/50 hover:scale-[1.01] hover:shadow-sm active:scale-[0.99]" : ""} ${isChecked && !showCorrect ? "ring-2 ring-primary ring-offset-1" : ""}`}
                >
                  <Checkbox
                    id={`${question.id}-${option.id}`}
                    checked={isChecked}
                    onCheckedChange={(checked) => handleMultiChange(option.id, checked as boolean)}
                    disabled={showCorrect}
                    className="mt-0.5 pointer-events-none"
                  />
                  <Label
                    htmlFor={`${question.id}-${option.id}`}
                    className="flex-1 cursor-pointer leading-relaxed text-pretty pointer-events-none"
                  >
                    <span className="font-medium mr-2">{option.id}.</span>
                    {option.text}
                  </Label>
                  {getOptionIcon(option.id)}
                </div>
              )
            })}
          </div>
        ) : (
          <RadioGroup value={selectedOptions[0] || ""} onValueChange={handleSingleChange} disabled={showCorrect}>
            <div className="space-y-3">
              {question.options.map((option) => {
                const isSelected = selectedOptions[0] === option.id
                return (
                <div
                  key={option.id}
                  className={`flex items-start space-x-3 p-3 rounded-lg border transition-all duration-200 ${getOptionStyle(option.id)} ${!showCorrect ? "hover:bg-muted/50 hover:scale-[1.01] hover:shadow-sm active:scale-[0.99] cursor-pointer" : ""} ${isSelected && !showCorrect ? "ring-2 ring-primary ring-offset-1" : ""}`}
                >
                  <RadioGroupItem
                    value={option.id}
                    id={`${question.id}-${option.id}`}
                    className="mt-0.5"
                    disabled={showCorrect}
                  />
                  <Label
                    htmlFor={`${question.id}-${option.id}`}
                    className="flex-1 cursor-pointer leading-relaxed text-pretty"
                  >
                    <span className="font-medium mr-2">{option.id}.</span>
                    {option.text}
                  </Label>
                  {getOptionIcon(option.id)}
                </div>
              )})}
            </div>
          </RadioGroup>
        )}

        {/* Mostrar explicación cuando showCorrect = true */}
        {showCorrect && question.explanation && (
          <div className="mt-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  Explicación
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                  {question.explanation}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
