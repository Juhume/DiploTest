/**
 * Funciones de cálculo de estadísticas extraídas para testing
 */

import type { Attempt, TopicStats, ModeStats, AttemptSummary, ProgressDataPoint } from "./types"
import { parseISO, differenceInDays, format } from "date-fns"

/**
 * Calcula las rachas de estudio (días consecutivos)
 */
export function calculateStreaks(attempts: Attempt[]): { currentStreak: number; longestStreak: number } {
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

/**
 * Calcula el rendimiento por tema (solo modo demo)
 */
export function calculateTopicPerformance(attempts: Attempt[]): TopicStats[] {
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

/**
 * Calcula estadísticas por modo (demo vs real)
 */
export function calculateModeStats(attempts: Attempt[]): ModeStats {
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

/**
 * Calcula la predicción de nota basada en intentos recientes
 */
export function calculatePredictedScore(attempts: Attempt[]): number {
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

/**
 * Calcula la tasa de mejora comparando primeros 5 vs últimos 5 intentos
 */
export function calculateImprovementRate(attempts: Attempt[]): number {
  if (attempts.length < 5) return 0

  const firstFive = attempts.slice(0, 5)
  const lastFive = attempts.slice(-5)
  const firstAvg = firstFive.reduce((sum, a) => sum + a.percentage, 0) / 5
  const lastAvg = lastFive.reduce((sum, a) => sum + a.percentage, 0) / 5

  if (firstAvg === 0) return 0

  return ((lastAvg - firstAvg) / firstAvg) * 100
}

/**
 * Genera resúmenes de intentos recientes
 */
export function getRecentAttempts(attempts: Attempt[], limit = 10): AttemptSummary[] {
  return attempts.slice(-limit).reverse().map(a => ({
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
}

/**
 * Genera puntos de datos para gráficos de progreso
 */
export function getProgressOverTime(attempts: Attempt[]): ProgressDataPoint[] {
  return attempts.map(a => ({
    date: a.created_at,
    score: a.correct_count * 0.10,
    percentage: a.percentage,
    correct: a.correct_count,
    wrong: a.wrong_count,
    blank: a.blank_count,
    duration: a.duration_seconds,
    questionMode: a.question_mode
  }))
}
