"use client"

import { useEffect, useState } from "react"
import { StatsOverview } from "@/components/stats/stats-overview"
import { ProgressChart } from "@/components/stats/progress-chart"
import { TopicPerformance } from "@/components/stats/topic-performance"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { UserStats } from "@/lib/types"
import { BarChart3, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function StatsPage() {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/stats')
        
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('No autorizado. Por favor inicia sesión.')
          }
          throw new Error('Error al cargar las estadísticas')
        }

        const data = await response.json()
        setStats(data)
      } catch (err: any) {
        console.error('Error fetching stats:', err)
        setError(err.message || 'Error al cargar las estadísticas')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="flex items-center gap-3 mb-8">
          <BarChart3 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mis Estadísticas</h1>
            <p className="text-muted-foreground">Análisis de tu rendimiento y progreso</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Skeleton de cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-4 w-24 mb-4" />
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Skeleton de gráficos */}
          <Card>
            <CardContent className="pt-6">
              <Skeleton className="h-[350px] w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Sin datos</AlertTitle>
          <AlertDescription>No se pudieron cargar las estadísticas</AlertDescription>
        </Alert>
      </div>
    )
  }

  // Usuario sin intentos
  if (stats.totalAttempts === 0) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="flex items-center gap-3 mb-8">
          <BarChart3 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mis Estadísticas</h1>
            <p className="text-muted-foreground">Análisis de tu rendimiento y progreso</p>
          </div>
        </div>

        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <BarChart3 className="h-16 w-16 text-muted-foreground" />
            <div>
              <h3 className="text-xl font-semibold mb-2">Aún no hay estadísticas</h3>
              <p className="text-muted-foreground mb-6">
                Completa tu primer test para empezar a ver tu progreso y análisis detallado
              </p>
              <Link href="/app">
                <Button size="lg">
                  Comenzar Primer Test
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mis Estadísticas</h1>
            <p className="text-muted-foreground">Análisis de tu rendimiento y progreso</p>
          </div>
        </div>
        <Link href="/history">
          <Button variant="outline">
            Ver Historial Completo
          </Button>
        </Link>
      </div>

      <div className="space-y-6">
        {/* Cards de métricas principales */}
        <StatsOverview stats={stats} />

        {/* Gráfico de progreso temporal */}
        {stats.progressOverTime.length > 0 && (
          <ProgressChart data={stats.progressOverTime} />
        )}

        {/* Rendimiento por tema */}
        {stats.topicPerformance.length > 0 && (
          <TopicPerformance data={stats.topicPerformance} limit={10} />
        )}

        {/* Sección de recomendaciones */}
        {stats.totalAttempts >= 3 && (
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                Recomendaciones Personalizadas
              </h3>
              <div className="space-y-3">
                {/* Recomendación basada en predicción */}
                {stats.predictedScore < 5.8 && (
                  <Alert>
                    <AlertDescription>
                      Tu predicción actual ({stats.predictedScore.toFixed(2)}) está por debajo del corte.
                      Te recomendamos practicar más y enfocarte en tus áreas débiles.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Recomendación de racha */}
                {stats.currentStreak === 0 && stats.totalAttempts >= 5 && (
                  <Alert>
                    <AlertDescription>
                      No has estudiado hoy. ¡Mantén tu racha activa realizando al menos un test!
                    </AlertDescription>
                  </Alert>
                )}

                {/* Recomendación de tema débil */}
                {stats.topicPerformance.length > 0 && stats.topicPerformance[0].correctRate < 60 && (
                  <Alert>
                    <AlertDescription>
                      Tu tema más débil es "<strong>{stats.topicPerformance[0].topic}</strong>" 
                      con {stats.topicPerformance[0].correctRate.toFixed(1)}% de aciertos.
                      Considera practicar más este tema.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Recomendación positiva */}
                {stats.predictedScore >= 5.8 && stats.improvementRate > 10 && (
                  <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                    <AlertDescription className="text-green-800 dark:text-green-200">
                      ¡Excelente progreso! Has mejorado un {stats.improvementRate.toFixed(1)}% 
                      y tu predicción indica que aprobarías el examen. ¡Sigue así!
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
