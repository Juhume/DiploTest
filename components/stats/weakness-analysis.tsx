"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import type { TopicStats } from "@/lib/types"
import { AlertTriangle, Target, TrendingUp, Play, ArrowRight, Lightbulb } from "lucide-react"

interface WeaknessAnalysisProps {
  topics: TopicStats[]
  showMax?: number
}

export function WeaknessAnalysis({ topics, showMax = 3 }: WeaknessAnalysisProps) {
  // Filtrar temas con tasa < 70% y ordenar por peor rendimiento
  const weakTopics = topics
    .filter((t) => t.correctRate < 70)
    .sort((a, b) => a.correctRate - b.correctRate)
    .slice(0, showMax)

  // Calcular estadísticas generales
  const avgRate = topics.length > 0
    ? topics.reduce((sum, t) => sum + t.correctRate, 0) / topics.length
    : 0

  const strongTopics = topics.filter((t) => t.correctRate >= 80)
  const needsWorkTopics = topics.filter((t) => t.correctRate < 60)

  if (weakTopics.length === 0) {
    return (
      <Card className="border-2 border-green-500/30 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
        <CardContent className="py-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-full">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-green-700 dark:text-green-400">
                Excelente rendimiento por temas
              </h3>
              <p className="text-muted-foreground">
                Todos tus temas están por encima del 70%. Sigue practicando para mantener tu nivel.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-orange-500/30">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
              Temas a Reforzar
            </CardTitle>
            <CardDescription className="mt-2">
              Estos temas necesitan más práctica. Te recomendamos enfocar tu estudio aquí.
            </CardDescription>
          </div>
          <div className="text-right">
            <Badge variant="outline" className="mb-1">
              {needsWorkTopics.length} temas &lt;60%
            </Badge>
            <p className="text-xs text-muted-foreground">
              Media general: {avgRate.toFixed(0)}%
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {weakTopics.map((topic, index) => (
          <div
            key={topic.topic}
            className={`p-4 rounded-xl border-2 transition-colors ${
              topic.correctRate < 50
                ? "border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/30"
                : topic.correctRate < 60
                  ? "border-orange-200 bg-orange-50/50 dark:border-orange-900 dark:bg-orange-950/30"
                  : "border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/30"
            }`}
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    #{index + 1} Prioridad
                  </span>
                  {topic.correctRate < 50 && (
                    <Badge variant="destructive" className="text-xs">
                      Crítico
                    </Badge>
                  )}
                </div>
                <h4 className="font-semibold text-lg capitalize">{topic.topic.replace(/-/g, " ")}</h4>
              </div>
              <div className="text-right">
                <div
                  className={`text-2xl font-bold ${
                    topic.correctRate < 50
                      ? "text-red-600"
                      : topic.correctRate < 60
                        ? "text-orange-600"
                        : "text-amber-600"
                  }`}
                >
                  {topic.correctRate.toFixed(0)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {topic.correctAnswers}/{topic.correctAnswers + topic.wrongAnswers} aciertos
                </p>
              </div>
            </div>

            <Progress
              value={topic.correctRate}
              className="h-2 mb-3"
            />

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{topic.attempts} intentos</span>
                <span>Último: {new Date(topic.lastAttempt).toLocaleDateString("es-ES")}</span>
              </div>
              <Button asChild size="sm" variant={index === 0 ? "default" : "outline"}>
                <Link href={`/test?questionMode=demo&selectionMode=tag&tag=${encodeURIComponent(topic.topic)}`}>
                  <Play className="mr-1 h-3 w-3" />
                  Practicar
                </Link>
              </Button>
            </div>
          </div>
        ))}

        {/* Sugerencias de estudio */}
        <div className="mt-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Consejos para mejorar
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1.5">
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>Practica primero los temas con menos del 50% antes de pasar a otros.</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>Usa las explicaciones de cada pregunta para entender mejor los conceptos.</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>Guarda en flashcards las preguntas que más te cuestan para repasarlas.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Botón para ver todos */}
        {topics.filter((t) => t.correctRate < 70).length > showMax && (
          <div className="text-center pt-2">
            <Link href="#topic-performance">
              <Button variant="ghost" size="sm">
                Ver los {topics.filter((t) => t.correctRate < 70).length} temas a mejorar
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
