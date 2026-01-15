"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { UserStats } from "@/lib/types"
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  MinusCircle,
  Flame,
  Award,
  BarChart3
} from "lucide-react"

interface StatsOverviewProps {
  stats: UserStats
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  const passingScore = 5.8
  const isPassingAverage = stats.averageScore >= passingScore

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Card 1: Promedio General */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Nota Media</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.averageScore.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.averagePercentage.toFixed(1)}% de aciertos
          </p>
          <Progress 
            value={(stats.averageScore / 10) * 100} 
            className="mt-3"
          />
          <p className="text-xs text-muted-foreground mt-2">
            {isPassingAverage ? (
              <span className="text-green-600 font-medium">Por encima del corte (5.8)</span>
            ) : (
              <span className="text-amber-600 font-medium">Por debajo del corte (5.8)</span>
            )}
          </p>
        </CardContent>
      </Card>

      {/* Card 2: Mejor Resultado */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Mejor Resultado</CardTitle>
          <Trophy className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-600">{stats.bestScore.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.bestPercentage.toFixed(1)}% de aciertos
          </p>
          <Progress 
            value={(stats.bestScore / 10) * 100} 
            className="mt-3"
          />
          {stats.bestScore >= passingScore && (
            <p className="text-xs text-green-600 font-medium mt-2">
              ✓ Examen aprobado
            </p>
          )}
        </CardContent>
      </Card>

      {/* Card 3: Predicción */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Predicción</CardTitle>
          <Target className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{stats.predictedScore.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Basado en últimos intentos
          </p>
          <Progress 
            value={(stats.predictedScore / 10) * 100} 
            className="mt-3"
          />
          <p className="text-xs text-muted-foreground mt-2">
            {stats.predictedScore >= passingScore ? (
              <span className="text-green-600 font-medium">Probablemente aprobarías</span>
            ) : (
              <span className="text-amber-600 font-medium">Necesitas mejorar {(passingScore - stats.predictedScore).toFixed(1)} puntos</span>
            )}
          </p>
        </CardContent>
      </Card>

      {/* Card 4: Mejora */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tendencia</CardTitle>
          <TrendingUp className={`h-4 w-4 ${stats.improvementRate >= 0 ? 'text-green-600' : 'text-red-600'}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${stats.improvementRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {stats.improvementRate >= 0 ? '+' : ''}{stats.improvementRate.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Mejora respecto al inicio
          </p>
          <div className="mt-3 flex items-center gap-2">
            {stats.improvementRate >= 0 ? (
              <div className="flex items-center gap-1 text-xs text-green-600">
                <TrendingUp className="h-3 w-3" />
                <span>Progreso positivo</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-xs text-amber-600">
                <span>Mantén la práctica</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Card 5: Tests Completados */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tests Realizados</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalAttempts}</div>
          <div className="flex items-center gap-4 mt-3 text-xs">
            <div>
              <span className="text-muted-foreground">Demo: </span>
              <span className="font-medium">{stats.modeStats.demo.attempts}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Real: </span>
              <span className="font-medium">{stats.modeStats.real.attempts}</span>
            </div>
          </div>
          {stats.modeStats.real.attempts > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              Tasa de aprobado: <span className="font-medium">{stats.modeStats.real.passRate.toFixed(1)}%</span>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Card 6: Tiempo de Estudio */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tiempo Total</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatTime(stats.totalStudyTime)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Media por test: {formatTime(stats.averageDuration)}
          </p>
          <div className="mt-3 text-xs text-muted-foreground">
            {stats.totalQuestions > 0 && (
              <p>~{Math.round(stats.totalStudyTime / stats.totalQuestions)}s por pregunta</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Card 7: Racha Actual */}
      <Card className={stats.currentStreak >= 7 ? "border-orange-500/50 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30" : ""}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Racha de Estudio</CardTitle>
          <div className="relative">
            <Flame className={`h-5 w-5 ${stats.currentStreak > 0 ? 'text-orange-500' : 'text-muted-foreground'} ${stats.currentStreak >= 3 ? 'animate-pulse' : ''}`} />
            {stats.currentStreak >= 7 && (
              <Flame className="h-5 w-5 text-orange-500 absolute -top-1 -right-1 animate-bounce opacity-70" />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold ${stats.currentStreak > 0 ? 'text-orange-500' : ''}`}>
              {stats.currentStreak}
            </span>
            <span className="text-sm text-muted-foreground">
              {stats.currentStreak === 1 ? 'día' : 'días'}
            </span>
          </div>

          {/* Visual streak indicator */}
          <div className="flex gap-1 mt-3">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full transition-all ${
                  i < stats.currentStreak
                    ? stats.currentStreak >= 7
                      ? 'bg-gradient-to-r from-orange-400 to-amber-500'
                      : 'bg-orange-400'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-muted-foreground">
              Récord: <span className="font-semibold">{stats.longestStreak} días</span>
            </p>
            {stats.currentStreak > 0 && stats.currentStreak === stats.longestStreak && (
              <span className="text-xs font-medium text-amber-600">¡Nuevo récord!</span>
            )}
          </div>

          {stats.currentStreak > 0 && (
            <p className="text-xs text-orange-600 font-medium mt-2 flex items-center gap-1">
              {stats.currentStreak >= 7 ? "🔥🔥 ¡Racha épica!" :
               stats.currentStreak >= 3 ? "🔥 ¡Sigue así!" :
               "💪 ¡Buen comienzo!"}
            </p>
          )}
          {stats.currentStreak === 0 && stats.longestStreak > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              Realiza un test hoy para iniciar una nueva racha
            </p>
          )}
        </CardContent>
      </Card>

      {/* Card 8: Resumen de Respuestas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Resumen Total</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalQuestions}</div>
          <p className="text-xs text-muted-foreground mt-1">preguntas respondidas</p>
          <div className="space-y-2 mt-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle2 className="h-3 w-3" />
                <span>Correctas</span>
              </div>
              <span className="font-medium">{stats.totalCorrect}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-red-600">
                <XCircle className="h-3 w-3" />
                <span>Incorrectas</span>
              </div>
              <span className="font-medium">{stats.totalWrong}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-amber-600">
                <MinusCircle className="h-3 w-3" />
                <span>Sin responder</span>
              </div>
              <span className="font-medium">{stats.totalBlank}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  if (minutes > 0) {
    return `${minutes}m`
  }
  return `${seconds}s`
}
