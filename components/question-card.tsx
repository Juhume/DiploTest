"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
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

    if (isCorrect && isSelected) return "border-green-500 bg-green-50 dark:bg-green-950"
    if (isCorrect && !isSelected) return "border-green-500 bg-green-50 dark:bg-green-950"
    if (!isCorrect && isSelected) return "border-red-500 bg-red-50 dark:bg-red-950"
    return ""
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <p className="text-base leading-relaxed text-foreground text-pretty">{question.stem}</p>
          {isMulti && (
            <Badge variant="secondary" className="shrink-0">
              Múltiple
            </Badge>
          )}
        </div>
        {question.tags && question.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {question.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
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
                </div>
              ))}
            </div>
          </RadioGroup>
        )}
      </CardContent>
    </Card>
  )
}
