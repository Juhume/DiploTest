"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, Info } from "lucide-react"
import type { Question } from "@/lib/types"

interface QuestionCardProps {
  question: Question
  selectedOptions: string[]
  onAnswerChange: (selected: string[]) => void
  showCorrect?: boolean
  correctOptions?: string[]
}

export function QuestionCard({
  question,
  selectedOptions,
  onAnswerChange,
  showCorrect = false,
  correctOptions,
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
      if (isCorrect) return "border-green-500 bg-green-50 dark:bg-green-950 border-2"
      return "opacity-60"
    }

    // Si hay respuesta, mostrar correctas e incorrectas
    if (isCorrect && isSelected) return "border-green-500 bg-green-50 dark:bg-green-950 border-2"
    if (isCorrect && !isSelected) return "border-green-500 bg-green-50 dark:bg-green-950 border-2"
    if (!isCorrect && isSelected) return "border-red-500 bg-red-50 dark:bg-red-950 border-2"
    return "opacity-60"
  }

  const getOptionIcon = (optionId: string) => {
    if (!showCorrect) return null

    const isSelected = selectedOptions.includes(optionId)
    const isCorrect = correctOptions?.includes(optionId)

    if (isCorrect) {
      return <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
    }
    if (!isCorrect && isSelected) {
      return <XCircle className="h-5 w-5 text-red-600 shrink-0" />
    }
    return null
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <p className="text-base leading-relaxed text-foreground text-pretty">{question.stem}</p>
          <div className="flex gap-2 shrink-0">
            {isMulti && (
              <Badge variant="secondary">
                Múltiple
              </Badge>
            )}
            {showCorrect && isBlank && (
              <Badge variant="outline" className="text-amber-600 border-amber-600">
                Sin responder
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isMulti ? (
          <div className="space-y-3">
            {question.options.map((option) => (
              <div
                key={option.id}
                className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${getOptionStyle(option.id)} ${!showCorrect ? "hover:bg-muted/50" : ""}`}
              >
                <Checkbox
                  id={`${question.id}-${option.id}`}
                  checked={selectedOptions.includes(option.id)}
                  onCheckedChange={(checked) => handleMultiChange(option.id, checked as boolean)}
                  disabled={showCorrect}
                  className="mt-0.5"
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
            ))}
          </div>
        ) : (
          <RadioGroup value={selectedOptions[0] || ""} onValueChange={handleSingleChange} disabled={showCorrect}>
            <div className="space-y-3">
              {question.options.map((option) => (
                <div
                  key={option.id}
                  className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${getOptionStyle(option.id)} ${!showCorrect ? "hover:bg-muted/50" : ""}`}
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
              ))}
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
