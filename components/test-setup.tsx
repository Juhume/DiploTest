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
import { Play, BookOpen, Trophy, AlertCircle, RefreshCw, CheckCircle2, GraduationCap } from "lucide-react"

export function TestSetup() {
  const router = useRouter()
  const [questionMode, setQuestionMode] = useState<QuestionMode>("demo")
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [selectionMode, setSelectionMode] = useState<SelectionMode>("all")
  const [questionCount, setQuestionCount] = useState(10)
  const [selectedTag, setSelectedTag] = useState<string>("")
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [failedQuestions, setFailedQuestions] = useState<Question[]>([])
  const [failedStats, setFailedStats] = useState<{ total: number; corrected: number }>({ total: 0, corrected: 0 })
  const [loadingFailed, setLoadingFailed] = useState(true)

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

  // Fetch failed questions for review mode
  useEffect(() => {
    async function fetchFailedQuestions() {
      setLoadingFailed(true)
      try {
        const res = await fetch("/api/questions/failed")
        const data = await res.json()
        if (data.questions) {
          setFailedQuestions(data.questions)
          setFailedStats(data.stats || { total: 0, corrected: 0 })
        }
      } catch (error) {
        console.error("Failed to fetch failed questions:", error)
      } finally {
        setLoadingFailed(false)
      }
    }
    fetchFailedQuestions()
  }, [])

  const handleStartTest = () => {
    const params = new URLSearchParams()
    params.set("questionMode", questionMode)

    // In REAL and ACADEMY modes, always use 100 questions (exam simulation)
    if (questionMode === "real" || questionMode === "academy") {
      params.set("selectionMode", "all")
      params.set("count", "100")
    } else {
      params.set("selectionMode", selectionMode)

      if (selectionMode === "random") {
        params.set("count", String(Math.min(questionCount, questions.length)))
      } else if (selectionMode === "tag" && selectedTag) {
        params.set("tag", selectedTag)
      } else if (selectionMode === "review") {
        params.set("count", String(failedQuestions.length))
      }
    }

    router.push(`/test?${params.toString()}`)
  }

  const handleStartReview = () => {
    const params = new URLSearchParams()
    params.set("questionMode", "demo") // Review uses demo mode for flexibility
    params.set("selectionMode", "review")
    params.set("count", String(failedQuestions.length))
    router.push(`/test?${params.toString()}`)
  }

  const getQuestionCountForMode = () => {
    if (questionMode === "real" || questionMode === "academy") return 100 // Fixed for exam simulation modes
    if (selectionMode === "all") return questions.length
    if (selectionMode === "random") return Math.min(questionCount, questions.length)
    if (selectionMode === "tag" && selectedTag) {
      return questions.filter((q) => q.tags?.includes(selectedTag)).length
    }
    return 0
  }

  return (
    <div className="space-y-6">
      {/* Review Mode Card - Highlighted when there are failed questions */}
      {!loadingFailed && failedQuestions.length > 0 && (
        <Card className="shadow-lg border-2 border-orange-500/50 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center gap-2 text-orange-700 dark:text-orange-400">
              <RefreshCw className="h-5 w-5" />
              Repaso de Errores
            </CardTitle>
            <CardDescription className="text-orange-600/80 dark:text-orange-400/80">
              Tienes preguntas pendientes de corregir
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">
                  {failedQuestions.length} preguntas falladas
                </p>
                <p className="text-sm text-muted-foreground">
                  Ya has corregido {failedStats.corrected} preguntas en intentos posteriores
                </p>
              </div>
              <Button
                onClick={handleStartReview}
                className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg w-full sm:w-auto"
                size="lg"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Repasar Ahora
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success message when all questions are corrected */}
      {!loadingFailed && failedQuestions.length === 0 && failedStats.corrected > 0 && (
        <Card className="shadow-lg border-2 border-green-500/50 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
          <CardContent className="py-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <div>
                <p className="font-semibold text-green-700 dark:text-green-400">
                  Sin errores pendientes
                </p>
                <p className="text-sm text-muted-foreground">
                  Has corregido todas tus preguntas falladas. Sigue practicando para mantener el nivel.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-lg border-muted">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            Configurar Test
          </CardTitle>
          <CardDescription className="text-base">Elige el modo y configura las opciones del test</CardDescription>
        </CardHeader>
      <CardContent className="space-y-8">
        {/* Question Mode Selection */}
        <div className="space-y-4">
          <Label className="text-lg font-semibold">Modo de Práctica</Label>
          <RadioGroup
            value={questionMode}
            onValueChange={(v) => setQuestionMode(v as QuestionMode)}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <RadioGroupItem value="demo" id="mode-demo" className="peer sr-only" />
              <Label
                htmlFor="mode-demo"
                className="flex flex-col items-start justify-between rounded-xl border-2 border-muted bg-card p-6 hover:bg-accent/50 cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 h-full min-h-[140px]"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="font-semibold text-lg">Modo Demo</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Preguntas de práctica para familiarizarte con el formato del examen.
                </p>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="real" id="mode-real" className="peer sr-only" />
              <Label
                htmlFor="mode-real"
                className="flex flex-col items-start justify-between rounded-xl border-2 border-muted bg-card p-6 hover:bg-accent/50 cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 h-full min-h-[140px] relative"
              >
                <div className="absolute top-2 right-2">
                  <span className="text-xs font-bold px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400">
                    100% REAL
                  </span>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Trophy className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="font-semibold text-lg">Examen Real</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Preguntas de exámenes oficiales pasados (2021-2024).
                </p>
              </Label>
            </div>
            <div className="md:col-span-2">
              <RadioGroupItem value="academy" id="mode-academy" className="peer sr-only" />
              <Label
                htmlFor="mode-academy"
                className="flex flex-col items-start justify-between rounded-xl border-2 border-muted bg-card p-6 hover:bg-accent/50 cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 h-full min-h-[100px]"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <GraduationCap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="font-semibold text-lg">Práctica Academia</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-400">
                    +1400 preguntas
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Preguntas de diversas academias preparatorias. Formato y dificultad similar al examen real.
                </p>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Cargando preguntas...</p>
          </div>
        ) : (
          <>
            {/* Selection Mode */}
            {questionMode === "demo" ? (
              <div className="space-y-4">
                <Label className="text-lg font-semibold">Opciones de Selección</Label>
                <RadioGroup
                  value={selectionMode}
                  onValueChange={(v) => setSelectionMode(v as SelectionMode)}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                    <RadioGroupItem value="all" id="mode-all" />
                    <Label htmlFor="mode-all" className="cursor-pointer flex-1 font-medium">
                      Pool completo <span className="text-muted-foreground">({questions.length} preguntas)</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                    <RadioGroupItem value="random" id="mode-random" />
                    <Label htmlFor="mode-random" className="cursor-pointer flex-1 font-medium">
                      Aleatorio <span className="text-muted-foreground">(Selecciona cantidad)</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                    <RadioGroupItem value="tag" id="mode-tag" />
                    <Label htmlFor="mode-tag" className="cursor-pointer flex-1 font-medium">
                      Por tema <span className="text-muted-foreground">(Filtra por categoría)</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            ) : questionMode === "real" ? (
              <div className="space-y-3">
                <Label className="text-lg font-semibold">Información del Examen</Label>
                <div className="rounded-xl border-2 border-green-500/20 bg-green-50 dark:bg-green-950/20 p-5">
                  <div className="flex items-start gap-3">
                    <Trophy className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="space-y-2">
                      <p className="font-semibold text-green-700 dark:text-green-400">
                        Preguntas 100% Reales de Examen
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• 100 preguntas de examenes oficiales pasados</li>
                        <li>• Convocatorias 2021, 2022, 2023 y 2024</li>
                        <li>• 0,10 puntos por acierto (sin penalizacion)</li>
                        <li>• Nota de corte: 5,8 sobre 10</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <Label className="text-lg font-semibold">Información del Examen</Label>
                <div className="rounded-xl border-2 border-purple-500/20 bg-purple-50 dark:bg-purple-950/20 p-5">
                  <div className="flex items-start gap-3">
                    <GraduationCap className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div className="space-y-2">
                      <p className="font-semibold text-purple-700 dark:text-purple-400">
                        Preguntas de Academia
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• 100 preguntas elaboradas por academias</li>
                        <li>• Formato y dificultad similar al examen real</li>
                        <li>• 0,10 puntos por acierto (sin penalizacion)</li>
                        <li>• Nota de corte: 5,8 sobre 10</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {questionMode === "demo" && selectionMode === "random" && (
              <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                <Label htmlFor="question-count" className="text-base font-medium">Número de preguntas</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="question-count"
                    type="number"
                    min={1}
                    max={questions.length}
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="max-w-32"
                  />
                  <span className="text-sm text-muted-foreground">Máximo: {questions.length}</span>
                </div>
              </div>
            )}

            {questionMode === "demo" && selectionMode === "tag" && (
              <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                <Label htmlFor="tag-select" className="text-base font-medium">Seleccionar tema</Label>
                <Select value={selectedTag} onValueChange={setSelectedTag}>
                  <SelectTrigger id="tag-select">
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

            <div className="pt-6 border-t space-y-4">
              <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg">
                <span className="text-sm font-medium">Preguntas a realizar:</span>
                <span className="text-2xl font-bold text-primary">{getQuestionCountForMode()}</span>
              </div>
              <Button
                onClick={handleStartTest}
                disabled={getQuestionCountForMode() === 0}
                size="lg"
                className="w-full text-lg h-12 shadow-lg"
              >
                <Play className="mr-2 h-5 w-5 fill-current" />
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
