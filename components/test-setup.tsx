"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Question, QuestionMode, SelectionMode } from "@/lib/types"
import { Play, BookOpen, Trophy, AlertCircle } from "lucide-react"

export function TestSetup() {
  const router = useRouter()
  const [questionMode, setQuestionMode] = useState<QuestionMode>("demo")
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [selectionMode, setSelectionMode] = useState<SelectionMode>("all")
  const [questionCount, setQuestionCount] = useState(10)
  const [selectedTag, setSelectedTag] = useState<string>("")
  const [availableTags, setAvailableTags] = useState<string[]>([])

  useEffect(() => {
    async function fetchQuestions() {
      setLoading(true)
      try {
        const res = await fetch(`/api/questions?mode=${questionMode}`)
        const data = await res.json()
        
        // Validate that data is an array
        if (!Array.isArray(data)) {
          console.error("API returned non-array data:", data)
          setQuestions([])
          setAvailableTags([])
          return
        }
        
        setQuestions(data)

        // Extract unique tags (only for DEMO mode)
        if (questionMode === "demo") {
          const tags = new Set<string>()
          data.forEach((q: Question) => {
            q.tags?.forEach((t: string) => {
              if (t && typeof t === 'string' && t.trim()) {
                tags.add(t.trim())
              }
            })
          })
          setAvailableTags(Array.from(tags).sort())
        } else {
          setAvailableTags([])
        }
        setSelectedTag("")
      } catch (error) {
        console.error("Failed to fetch questions:", error)
        setQuestions([])
        setAvailableTags([])
      } finally {
        setLoading(false)
      }
    }
    fetchQuestions()
  }, [questionMode])

  const handleStartTest = () => {
    const params = new URLSearchParams()
    params.set("questionMode", questionMode)
    
    // In REAL mode, always use all 100 questions (selection mode forced to "all")
    if (questionMode === "real") {
      params.set("selectionMode", "all")
      params.set("count", "100")
    } else {
      params.set("selectionMode", selectionMode)
      
      if (selectionMode === "random") {
        params.set("count", String(Math.min(questionCount, questions.length)))
      } else if (selectionMode === "tag" && selectedTag) {
        params.set("tag", selectedTag)
      }
    }

    router.push(`/test?${params.toString()}`)
  }

  const getQuestionCountForMode = () => {
    if (questionMode === "real") return 100 // Fixed for REAL mode
    if (selectionMode === "all") return questions.length
    if (selectionMode === "random") return Math.min(questionCount, questions.length)
    if (selectionMode === "tag" && selectedTag) {
      return questions.filter((q) => q.tags?.includes(selectedTag)).length
    }
    return 0
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configurar Test</CardTitle>
          <CardDescription>Elige el modo y configura las opciones del test</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Question Mode Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Tipo de Preguntas</Label>
            <Tabs value={questionMode} onValueChange={(v) => setQuestionMode(v as QuestionMode)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="demo" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Demo
                </TabsTrigger>
                <TabsTrigger value="real" className="flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Real
                </TabsTrigger>
              </TabsList>
              <TabsContent value="demo" className="mt-3">
                <p className="text-sm text-muted-foreground">
                  Preguntas de práctica para familiarizarte con el formato del examen.
                </p>
              </TabsContent>
              <TabsContent value="real" className="mt-3">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    <strong>Examen oficial del Cuerpo Diplomático:</strong>
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>100 preguntas + 5 de reserva</li>
                    <li>0,10 puntos por acierto (sin penalización por fallo)</li>
                    <li>Nota de corte: 5,8 sobre 10</li>
                    <li>4 opciones por pregunta, solo 1 correcta</li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Cargando preguntas...</p>
            </div>
          ) : (
            <>
              {/* Selection Mode */}
              {questionMode === "demo" ? (
                <div className="space-y-3">
                  <Label className="text-base font-medium">Modo de Selección</Label>
                  <RadioGroup
                    value={selectionMode}
                    onValueChange={(v) => setSelectionMode(v as SelectionMode)}
                    className="space-y-2"
                  >
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="all" id="mode-all" />
                      <Label htmlFor="mode-all" className="cursor-pointer">
                        Pool completo ({questions.length} preguntas)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="random" id="mode-random" />
                      <Label htmlFor="mode-random" className="cursor-pointer">
                        Aleatorio (N preguntas)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="tag" id="mode-tag" />
                      <Label htmlFor="mode-tag" className="cursor-pointer">
                        Por tema/tag
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              ) : (
                <div className="space-y-3">
                  <Label className="text-base font-medium">Modo de Examen</Label>
                  <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800 p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                          Examen oficial completo
                        </p>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          El test incluirá las 100 preguntas oficiales del examen del Cuerpo Diplomático.
                          Las 5 preguntas de reserva se utilizan solo si alguna pregunta es impugnada.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {questionMode === "demo" && selectionMode === "random" && (
                <div className="space-y-2">
                  <Label htmlFor="question-count">Número de preguntas</Label>
                  <Input
                    id="question-count"
                    type="number"
                    min={1}
                    max={questions.length}
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="max-w-32"
                  />
                  <p className="text-sm text-muted-foreground">Máximo: {questions.length}</p>
                </div>
              )}

              {questionMode === "demo" && selectionMode === "tag" && (
                <div className="space-y-2">
                  <Label htmlFor="tag-select">Seleccionar tema</Label>
                  <Select value={selectedTag} onValueChange={setSelectedTag}>
                    <SelectTrigger id="tag-select" className="max-w-xs">
                      <SelectValue placeholder="Elige un tema" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTags.filter(tag => tag && typeof tag === 'string').map((tag) => (
                        <SelectItem key={tag} value={tag}>
                          {tag}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-4">
                  Preguntas a realizar:{" "}
                  <span className="font-semibold text-foreground">{getQuestionCountForMode()}</span>
                </p>
                <Button
                  onClick={handleStartTest}
                  disabled={getQuestionCountForMode() === 0}
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Comenzar Test
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
