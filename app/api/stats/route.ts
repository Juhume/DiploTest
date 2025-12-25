import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { 
  UserStats, 
  ProgressDataPoint, 
  TopicStats, 
  ModeStats, 
  AttemptSummary,
  Attempt 
} from "@/lib/types"
import { parseISO, differenceInDays, format } from "date-fns"
import demoQuestions from "@/data/questions.demo.json"
import realQuestions from "@/data/questions.real.json"

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Obtener todos los intentos del usuario
    const { data: attempts, error: attemptsError } = await supabase
      .from("attempts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })

    if (attemptsError) {
      console.error("Error fetching attempts:", attemptsError)
      return NextResponse.json({ error: "Error fetching attempts" }, { status: 500 })
    }

    if (!attempts || attempts.length === 0) {
      // Usuario sin intentos - retornar estadísticas vacías
      const emptyStats: UserStats = {
        userId: user.id,
        totalAttempts: 0,
        averageScore: 0,
        averagePercentage: 0,
        bestScore: 0,
        bestPercentage: 0,
        totalQuestions: 0,
        totalCorrect: 0,
        totalWrong: 0,
        totalBlank: 0,
        averageDuration: 0,
        totalStudyTime: 0,
        improvementRate: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastAttemptDate: "",
        progressOverTime: [],
        topicPerformance: [],
        modeStats: {
          demo: { attempts: 0, averageScore: 0, averagePercentage: 0, bestScore: 0 },
          real: { attempts: 0, averageScore: 0, averagePercentage: 0, bestScore: 0, passRate: 0 }
        },
        recentAttempts: [],
        predictedScore: 0
      }
      return NextResponse.json(emptyStats)
    }

    // Calcular estadísticas
    const stats = calculateUserStats(attempts as Attempt[], user.id)
    
    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error in GET /api/stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function calculateUserStats(attempts: Attempt[], userId: string): UserStats {
  const totalAttempts = attempts.length
  
  // Métricas básicas
  const totalQuestions = attempts.reduce((sum, a) => sum + a.total_questions, 0)
  const totalCorrect = attempts.reduce((sum, a) => sum + a.correct_count, 0)
  const totalWrong = attempts.reduce((sum, a) => sum + a.wrong_count, 0)
  const totalBlank = attempts.reduce((sum, a) => sum + a.blank_count, 0)
  const totalDuration = attempts.reduce((sum, a) => sum + a.duration_seconds, 0)
  
  const averageScore = totalAttempts > 0 
    ? attempts.reduce((sum, a) => sum + (a.correct_count * 0.10), 0) / totalAttempts 
    : 0
  
  const averagePercentage = totalAttempts > 0
    ? attempts.reduce((sum, a) => sum + a.percentage, 0) / totalAttempts
    : 0
  
  const bestScore = Math.max(...attempts.map(a => a.correct_count * 0.10), 0)
  const bestPercentage = Math.max(...attempts.map(a => a.percentage), 0)
  const averageDuration = totalAttempts > 0 ? totalDuration / totalAttempts : 0

  // Progreso temporal
  const progressOverTime: ProgressDataPoint[] = attempts.map(a => ({
    date: a.created_at,
    score: a.correct_count * 0.10,
    percentage: a.percentage,
    correct: a.correct_count,
    wrong: a.wrong_count,
    blank: a.blank_count,
    duration: a.duration_seconds,
    questionMode: a.question_mode
  }))

  // Calcular tasa de mejora (comparar últimos 5 con primeros 5)
  let improvementRate = 0
  if (totalAttempts >= 5) {
    const firstFive = attempts.slice(0, 5)
    const lastFive = attempts.slice(-5)
    const firstAvg = firstFive.reduce((sum, a) => sum + a.percentage, 0) / 5
    const lastAvg = lastFive.reduce((sum, a) => sum + a.percentage, 0) / 5
    improvementRate = ((lastAvg - firstAvg) / firstAvg) * 100
  }

  // Calcular rachas (streaks)
  const { currentStreak, longestStreak } = calculateStreaks(attempts)

  // Rendimiento por tema (solo para modo demo)
  const topicPerformance = calculateTopicPerformance(attempts)

  // Estadísticas por modo
  const modeStats = calculateModeStats(attempts)

  // Últimos intentos (máximo 10)
  const recentAttempts: AttemptSummary[] = attempts.slice(-10).reverse().map(a => ({
    id: a.id,
    date: a.created_at,
    mode: a.question_mode,
    score: a.correct_count * 0.10,
    percentage: a.percentage,
    correct: a.correct_count,
    wrong: a.wrong_count,
    blank: a.blank_count,
    duration: a.duration_seconds,
    passed: a.question_mode === "real" ? (a.correct_count * 0.10) >= 5.8 : undefined
  }))

  // Predicción de nota (basada en últimos 5 intentos en modo real)
  const predictedScore = calculatePredictedScore(attempts)

  const lastAttemptDate = attempts.length > 0 
    ? attempts[attempts.length - 1].created_at 
    : ""

  return {
    userId,
    totalAttempts,
    averageScore: Math.round(averageScore * 100) / 100,
    averagePercentage: Math.round(averagePercentage * 100) / 100,
    bestScore: Math.round(bestScore * 100) / 100,
    bestPercentage: Math.round(bestPercentage * 100) / 100,
    totalQuestions,
    totalCorrect,
    totalWrong,
    totalBlank,
    averageDuration: Math.round(averageDuration),
    totalStudyTime: totalDuration,
    improvementRate: Math.round(improvementRate * 100) / 100,
    currentStreak,
    longestStreak,
    lastAttemptDate,
    progressOverTime,
    topicPerformance,
    modeStats,
    recentAttempts,
    predictedScore: Math.round(predictedScore * 100) / 100
  }
}

function calculateStreaks(attempts: Attempt[]): { currentStreak: number; longestStreak: number } {
  if (attempts.length === 0) return { currentStreak: 0, longestStreak: 0 }

  const dates = attempts.map(a => format(parseISO(a.created_at), 'yyyy-MM-dd'))
  const uniqueDates = Array.from(new Set(dates)).sort()

  let currentStreak = 1
  let longestStreak = 1
  let tempStreak = 1

  const today = format(new Date(), 'yyyy-MM-dd')
  const lastDate = uniqueDates[uniqueDates.length - 1]
  
  // Verificar si la racha actual está activa
  const daysSinceLastAttempt = differenceInDays(new Date(today), new Date(lastDate))
  if (daysSinceLastAttempt > 1) {
    currentStreak = 0
  } else {
    // Calcular racha actual
    for (let i = uniqueDates.length - 1; i > 0; i--) {
      const diff = differenceInDays(new Date(uniqueDates[i]), new Date(uniqueDates[i - 1]))
      if (diff === 1) {
        currentStreak++
      } else {
        break
      }
    }
  }

  // Calcular racha más larga
  for (let i = 1; i < uniqueDates.length; i++) {
    const diff = differenceInDays(new Date(uniqueDates[i]), new Date(uniqueDates[i - 1]))
    if (diff === 1) {
      tempStreak++
      longestStreak = Math.max(longestStreak, tempStreak)
    } else {
      tempStreak = 1
    }
  }

  return { currentStreak, longestStreak }
}

function calculateTopicPerformance(attempts: Attempt[]): TopicStats[] {
  const topicMap = new Map<string, {
    attempts: number
    totalCorrect: number
    totalQuestions: number
    totalWrong: number
    lastAttempt: string
    scores: number[]
  }>()

  // Solo analizar intentos en modo demo (que tienen tags)
  const demoAttempts = attempts.filter(a => a.question_mode === "demo")

  demoAttempts.forEach(attempt => {
    if (attempt.selection_meta?.tag) {
      const tag = attempt.selection_meta.tag
      const existing = topicMap.get(tag) || {
        attempts: 0,
        totalCorrect: 0,
        totalQuestions: 0,
        totalWrong: 0,
        lastAttempt: attempt.created_at,
        scores: []
      }

      existing.attempts++
      existing.totalCorrect += attempt.correct_count
      existing.totalQuestions += attempt.total_questions
      existing.totalWrong += attempt.wrong_count
      existing.lastAttempt = attempt.created_at
      existing.scores.push(attempt.percentage)

      topicMap.set(tag, existing)
    }
  })

  const topicStats: TopicStats[] = Array.from(topicMap.entries()).map(([topic, data]) => ({
    topic,
    attempts: data.attempts,
    averageScore: data.scores.reduce((a, b) => a + b, 0) / data.scores.length,
    correctRate: (data.totalCorrect / data.totalQuestions) * 100,
    totalQuestions: data.totalQuestions,
    correctAnswers: data.totalCorrect,
    wrongAnswers: data.totalWrong,
    lastAttempt: data.lastAttempt
  }))

  // Ordenar por tasa de acierto (peor a mejor)
  return topicStats.sort((a, b) => a.correctRate - b.correctRate)
}

function calculateModeStats(attempts: Attempt[]): ModeStats {
  const demoAttempts = attempts.filter(a => a.question_mode === "demo")
  const realAttempts = attempts.filter(a => a.question_mode === "real")

  const demoStats = {
    attempts: demoAttempts.length,
    averageScore: demoAttempts.length > 0
      ? demoAttempts.reduce((sum, a) => sum + (a.correct_count * 0.10), 0) / demoAttempts.length
      : 0,
    averagePercentage: demoAttempts.length > 0
      ? demoAttempts.reduce((sum, a) => sum + a.percentage, 0) / demoAttempts.length
      : 0,
    bestScore: demoAttempts.length > 0
      ? Math.max(...demoAttempts.map(a => a.correct_count * 0.10))
      : 0
  }

  const realPassed = realAttempts.filter(a => (a.correct_count * 0.10) >= 5.8).length
  const realStats = {
    attempts: realAttempts.length,
    averageScore: realAttempts.length > 0
      ? realAttempts.reduce((sum, a) => sum + (a.correct_count * 0.10), 0) / realAttempts.length
      : 0,
    averagePercentage: realAttempts.length > 0
      ? realAttempts.reduce((sum, a) => sum + a.percentage, 0) / realAttempts.length
      : 0,
    bestScore: realAttempts.length > 0
      ? Math.max(...realAttempts.map(a => a.correct_count * 0.10))
      : 0,
    passRate: realAttempts.length > 0
      ? (realPassed / realAttempts.length) * 100
      : 0
  }

  return {
    demo: {
      ...demoStats,
      averageScore: Math.round(demoStats.averageScore * 100) / 100,
      averagePercentage: Math.round(demoStats.averagePercentage * 100) / 100,
      bestScore: Math.round(demoStats.bestScore * 100) / 100
    },
    real: {
      ...realStats,
      averageScore: Math.round(realStats.averageScore * 100) / 100,
      averagePercentage: Math.round(realStats.averagePercentage * 100) / 100,
      bestScore: Math.round(realStats.bestScore * 100) / 100,
      passRate: Math.round(realStats.passRate * 100) / 100
    }
  }
}

function calculatePredictedScore(attempts: Attempt[]): number {
  const realAttempts = attempts.filter(a => a.question_mode === "real")
  
  if (realAttempts.length === 0) {
    // Si no hay intentos reales, usar demos como predicción aproximada
    const demoAttempts = attempts.filter(a => a.question_mode === "demo")
    if (demoAttempts.length === 0) return 0
    
    const lastFive = demoAttempts.slice(-Math.min(5, demoAttempts.length))
    return lastFive.reduce((sum, a) => sum + (a.correct_count * 0.10), 0) / lastFive.length
  }

  // Usar últimos 5 intentos reales
  const lastFive = realAttempts.slice(-Math.min(5, realAttempts.length))
  const scores = lastFive.map(a => a.correct_count * 0.10)
  
  // Calcular media ponderada (más peso a intentos recientes)
  const weights = [1, 1.2, 1.4, 1.6, 2] // Más peso a los más recientes
  const weightedSum = scores.reduce((sum, score, i) => {
    const weight = weights[weights.length - scores.length + i] || 1
    return sum + (score * weight)
  }, 0)
  const totalWeight = weights.slice(-scores.length).reduce((a, b) => a + b, 0)
  
  return weightedSum / totalWeight
}
