"use client"

import React, { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { StatsOverview } from "@/components/stats/stats-overview"
import { WeaknessAnalysis } from "@/components/stats/weakness-analysis"

// Dynamic imports for heavy chart components (recharts ~300KB)
const ProgressChart = dynamic(
  () => import("@/components/stats/progress-chart").then(m => m.ProgressChart),
  { ssr: false }
)
const TopicPerformance = dynamic(
  () => import("@/components/stats/topic-performance").then(m => m.TopicPerformance),
  { ssr: false }
)
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { UserStats } from "@/lib/types"
import { BarChart3, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AppHeader } from "@/components/app-header"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { User as SupabaseUser } from "@supabase/supabase-js"

export default function StatsPage() {
  const router = useRouter()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true
    async function fetchUser() {
      try {
        const supabase = createClient()
        const { data, error: authError } = await supabase.auth.getUser()
        if (!isActive) return
        if (authError || !data.user) {
          router.push("/auth/login")
          setAuthLoading(false)
          return
        }
        setUser(data.user)
      } catch {
        if (!isActive) return
        router.push("/auth/login")
      } finally {
        if (isActive) setAuthLoading(false)
      }
    }

    fetchUser()
    return () => {
      isActive = false
    }
  }, [router])

  useEffect(() => {
    if (authLoading || !user) return
    async function fetchStats() {
      try {
        setLoading(true)
        setError(null)
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
  }, [authLoading, user])

  let content: React.ReactNode = null

  if (authLoading || loading) {
    content = (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="flex items-center gap-3 mb-8">
          <BarChart3 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mis Estadísticas</h1>
            <p className="text-muted-foreground">Análisis de tu rendimiento y progreso</p>
          </div>
        </div>

        <div className="space-y-6">
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

          <Card>
            <CardContent className="pt-6">
              <Skeleton className="h-[350px] w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  } else if (error) {
    content = (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  } else if (!stats) {
    content = (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Sin datos</AlertTitle>
          <AlertDescription>No se pudieron cargar las estadísticas</AlertDescription>
        </Alert>
      </div>
    )
  } else if (stats.totalAttempts === 0) {
    content = (
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
  } else {
    content = (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mis Estadísticas</h1>
            <p className="text-muted-foreground">Análisis de tu rendimiento y progreso</p>
          </div>
        </div>
        <Link href="/history">
          <Button variant="outline" className="w-full sm:w-auto">
            Ver Historial Completo
          </Button>
        </Link>
      </div>

      <div className="space-y-6">
        {/* Cards de métricas principales */}
        <StatsOverview stats={stats} />

        {/* Análisis de debilidades - destacado cuando hay temas a mejorar */}
        {stats.topicPerformance.length > 0 && (
          <WeaknessAnalysis topics={stats.topicPerformance} showMax={3} />
        )}

        {/* Gráfico de progreso temporal */}
        {stats.progressOverTime.length > 0 && (
          <ProgressChart data={stats.progressOverTime} />
        )}

        {/* Rendimiento por tema */}
        {stats.topicPerformance.length > 0 && (
          <div id="topic-performance">
            <TopicPerformance data={stats.topicPerformance} limit={10} />
          </div>
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

  if (!user && !authLoading) {
    return null
  }

  return (
    <main className="min-h-screen bg-background">
      {user && <AppHeader user={user} />}
      {content}
    </main>
  )
}
