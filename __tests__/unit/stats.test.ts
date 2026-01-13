import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  calculateStreaks,
  calculateTopicPerformance,
  calculateModeStats,
  calculatePredictedScore,
  calculateImprovementRate,
  getRecentAttempts,
  getProgressOverTime,
} from '@/lib/stats'
import type { Attempt } from '@/lib/types'

// Helper para crear intentos de prueba
function createAttempt(overrides: Partial<Attempt> = {}): Attempt {
  return {
    id: `attempt-${Math.random().toString(36).substr(2, 9)}`,
    user_id: 'user-123',
    created_at: new Date().toISOString(),
    question_mode: 'demo',
    selection_mode: 'random',
    selection_meta: {},
    total_questions: 10,
    correct_count: 7,
    wrong_count: 2,
    blank_count: 1,
    percentage: 70,
    duration_seconds: 600,
    answers: {},
    grading: {},
    ...overrides,
  }
}

// Helper para crear fecha ISO string
function createDate(daysAgo: number): string {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date.toISOString()
}

describe('calculateStreaks', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-15'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('debería retornar 0 para un array vacío', () => {
    const result = calculateStreaks([])
    expect(result.currentStreak).toBe(0)
    expect(result.longestStreak).toBe(0)
  })

  it('debería retornar racha de 1 para un solo intento hoy', () => {
    const attempts = [createAttempt({ created_at: '2024-01-15T10:00:00Z' })]
    const result = calculateStreaks(attempts)
    expect(result.currentStreak).toBe(1)
    expect(result.longestStreak).toBe(1)
  })

  it('debería calcular racha consecutiva correctamente', () => {
    const attempts = [
      createAttempt({ created_at: '2024-01-13T10:00:00Z' }),
      createAttempt({ created_at: '2024-01-14T10:00:00Z' }),
      createAttempt({ created_at: '2024-01-15T10:00:00Z' }),
    ]
    const result = calculateStreaks(attempts)
    expect(result.currentStreak).toBe(3)
    expect(result.longestStreak).toBe(3)
  })

  it('debería detectar racha rota', () => {
    const attempts = [
      createAttempt({ created_at: '2024-01-10T10:00:00Z' }),
      createAttempt({ created_at: '2024-01-11T10:00:00Z' }),
      createAttempt({ created_at: '2024-01-12T10:00:00Z' }),
      // Día 13 sin intentos
      // Día 14 sin intentos
      createAttempt({ created_at: '2024-01-15T10:00:00Z' }),
    ]
    const result = calculateStreaks(attempts)
    expect(result.currentStreak).toBe(1)
    expect(result.longestStreak).toBe(3)
  })

  it('debería manejar múltiples intentos en el mismo día', () => {
    const attempts = [
      createAttempt({ created_at: '2024-01-14T08:00:00Z' }),
      createAttempt({ created_at: '2024-01-14T12:00:00Z' }),
      createAttempt({ created_at: '2024-01-14T18:00:00Z' }),
      createAttempt({ created_at: '2024-01-15T10:00:00Z' }),
    ]
    const result = calculateStreaks(attempts)
    expect(result.currentStreak).toBe(2)
    expect(result.longestStreak).toBe(2)
  })

  it('debería marcar racha como 0 si no hay intento reciente', () => {
    vi.setSystemTime(new Date('2024-01-20'))
    const attempts = [
      createAttempt({ created_at: '2024-01-10T10:00:00Z' }),
      createAttempt({ created_at: '2024-01-11T10:00:00Z' }),
    ]
    const result = calculateStreaks(attempts)
    expect(result.currentStreak).toBe(0)
    expect(result.longestStreak).toBe(2)
  })
})

describe('calculateTopicPerformance', () => {
  it('debería retornar array vacío sin intentos', () => {
    const result = calculateTopicPerformance([])
    expect(result).toEqual([])
  })

  it('debería ignorar intentos sin tag', () => {
    const attempts = [
      createAttempt({ question_mode: 'demo', selection_meta: {} }),
    ]
    const result = calculateTopicPerformance(attempts)
    expect(result).toEqual([])
  })

  it('debería ignorar intentos en modo real (no tienen tags)', () => {
    const attempts = [
      createAttempt({
        question_mode: 'real',
        selection_meta: { tag: 'ONU' },
      }),
    ]
    const result = calculateTopicPerformance(attempts)
    expect(result).toEqual([])
  })

  it('debería calcular estadísticas por tema correctamente', () => {
    const attempts = [
      createAttempt({
        question_mode: 'demo',
        selection_meta: { tag: 'ONU' },
        correct_count: 8,
        wrong_count: 2,
        total_questions: 10,
        percentage: 80,
        created_at: '2024-01-10T10:00:00Z',
      }),
      createAttempt({
        question_mode: 'demo',
        selection_meta: { tag: 'ONU' },
        correct_count: 6,
        wrong_count: 4,
        total_questions: 10,
        percentage: 60,
        created_at: '2024-01-15T10:00:00Z',
      }),
    ]
    const result = calculateTopicPerformance(attempts)

    expect(result).toHaveLength(1)
    expect(result[0].topic).toBe('ONU')
    expect(result[0].attempts).toBe(2)
    expect(result[0].totalQuestions).toBe(20)
    expect(result[0].correctAnswers).toBe(14)
    expect(result[0].wrongAnswers).toBe(6)
    expect(result[0].correctRate).toBe(70) // 14/20 * 100
    expect(result[0].averageScore).toBe(70) // (80 + 60) / 2
  })

  it('debería ordenar por tasa de acierto (peor primero)', () => {
    const attempts = [
      createAttempt({
        question_mode: 'demo',
        selection_meta: { tag: 'ONU' },
        correct_count: 9,
        total_questions: 10,
        percentage: 90,
      }),
      createAttempt({
        question_mode: 'demo',
        selection_meta: { tag: 'UE' },
        correct_count: 5,
        total_questions: 10,
        percentage: 50,
      }),
      createAttempt({
        question_mode: 'demo',
        selection_meta: { tag: 'Tratados' },
        correct_count: 7,
        total_questions: 10,
        percentage: 70,
      }),
    ]
    const result = calculateTopicPerformance(attempts)

    expect(result[0].topic).toBe('UE') // 50% - peor
    expect(result[1].topic).toBe('Tratados') // 70%
    expect(result[2].topic).toBe('ONU') // 90% - mejor
  })
})

describe('calculateModeStats', () => {
  it('debería retornar stats vacías sin intentos', () => {
    const result = calculateModeStats([])

    expect(result.demo.attempts).toBe(0)
    expect(result.demo.averageScore).toBe(0)
    expect(result.real.attempts).toBe(0)
    expect(result.real.passRate).toBe(0)
  })

  it('debería calcular stats de modo demo correctamente', () => {
    const attempts = [
      createAttempt({ question_mode: 'demo', correct_count: 70, percentage: 70 }),
      createAttempt({ question_mode: 'demo', correct_count: 80, percentage: 80 }),
    ]
    const result = calculateModeStats(attempts)

    expect(result.demo.attempts).toBe(2)
    expect(result.demo.averageScore).toBe(7.5) // (7 + 8) / 2
    expect(result.demo.averagePercentage).toBe(75)
    expect(result.demo.bestScore).toBe(8)
  })

  it('debería calcular stats de modo real con pass rate', () => {
    const attempts = [
      createAttempt({ question_mode: 'real', correct_count: 60, percentage: 60 }), // 6.0 - aprobado
      createAttempt({ question_mode: 'real', correct_count: 50, percentage: 50 }), // 5.0 - suspenso
      createAttempt({ question_mode: 'real', correct_count: 70, percentage: 70 }), // 7.0 - aprobado
    ]
    const result = calculateModeStats(attempts)

    expect(result.real.attempts).toBe(3)
    expect(result.real.passRate).toBeCloseTo(66.67, 1) // 2 de 3 aprobados
    expect(result.real.bestScore).toBe(7)
  })

  it('debería separar intentos por modo correctamente', () => {
    const attempts = [
      createAttempt({ question_mode: 'demo', correct_count: 50 }),
      createAttempt({ question_mode: 'real', correct_count: 60 }),
      createAttempt({ question_mode: 'demo', correct_count: 70 }),
    ]
    const result = calculateModeStats(attempts)

    expect(result.demo.attempts).toBe(2)
    expect(result.real.attempts).toBe(1)
  })
})

describe('calculatePredictedScore', () => {
  it('debería retornar 0 sin intentos', () => {
    expect(calculatePredictedScore([])).toBe(0)
  })

  it('debería usar intentos demo si no hay reales', () => {
    const attempts = [
      createAttempt({ question_mode: 'demo', correct_count: 60 }),
      createAttempt({ question_mode: 'demo', correct_count: 70 }),
    ]
    const result = calculatePredictedScore(attempts)
    expect(result).toBe(6.5) // (6 + 7) / 2
  })

  it('debería preferir intentos reales sobre demo', () => {
    const attempts = [
      createAttempt({ question_mode: 'demo', correct_count: 50 }),
      createAttempt({ question_mode: 'real', correct_count: 70 }),
    ]
    const result = calculatePredictedScore(attempts)
    expect(result).toBe(7) // Solo usa el real
  })

  it('debería usar últimos 5 intentos reales con pesos', () => {
    const attempts = [
      createAttempt({ question_mode: 'real', correct_count: 60 }), // 6.0 - peso 1
      createAttempt({ question_mode: 'real', correct_count: 65 }), // 6.5 - peso 1.2
      createAttempt({ question_mode: 'real', correct_count: 70 }), // 7.0 - peso 1.4
      createAttempt({ question_mode: 'real', correct_count: 75 }), // 7.5 - peso 1.6
      createAttempt({ question_mode: 'real', correct_count: 80 }), // 8.0 - peso 2
    ]
    const result = calculatePredictedScore(attempts)

    // Cálculo manual: (6*1 + 6.5*1.2 + 7*1.4 + 7.5*1.6 + 8*2) / (1 + 1.2 + 1.4 + 1.6 + 2)
    // = (6 + 7.8 + 9.8 + 12 + 16) / 7.2 = 51.6 / 7.2 = 7.166...
    expect(result).toBeCloseTo(7.17, 1)
  })

  it('debería manejar menos de 5 intentos reales', () => {
    const attempts = [
      createAttempt({ question_mode: 'real', correct_count: 60 }),
      createAttempt({ question_mode: 'real', correct_count: 80 }),
    ]
    const result = calculatePredictedScore(attempts)

    // Con 2 intentos usa pesos 1.6 y 2
    // (6*1.6 + 8*2) / (1.6 + 2) = (9.6 + 16) / 3.6 = 7.11...
    expect(result).toBeCloseTo(7.11, 1)
  })
})

describe('calculateImprovementRate', () => {
  it('debería retornar 0 con menos de 5 intentos', () => {
    const attempts = [
      createAttempt({ percentage: 50 }),
      createAttempt({ percentage: 60 }),
    ]
    expect(calculateImprovementRate(attempts)).toBe(0)
  })

  it('debería calcular mejora positiva correctamente', () => {
    const attempts = [
      // Primeros 5: promedio 50%
      createAttempt({ percentage: 40 }),
      createAttempt({ percentage: 50 }),
      createAttempt({ percentage: 50 }),
      createAttempt({ percentage: 50 }),
      createAttempt({ percentage: 60 }),
      // Últimos 5: promedio 70%
      createAttempt({ percentage: 60 }),
      createAttempt({ percentage: 70 }),
      createAttempt({ percentage: 70 }),
      createAttempt({ percentage: 70 }),
      createAttempt({ percentage: 80 }),
    ]
    const result = calculateImprovementRate(attempts)

    // Mejora: ((70 - 50) / 50) * 100 = 40%
    expect(result).toBe(40)
  })

  it('debería calcular deterioro (mejora negativa)', () => {
    const attempts = [
      // Primeros 5: promedio 80%
      createAttempt({ percentage: 80 }),
      createAttempt({ percentage: 80 }),
      createAttempt({ percentage: 80 }),
      createAttempt({ percentage: 80 }),
      createAttempt({ percentage: 80 }),
      // Últimos 5: promedio 60%
      createAttempt({ percentage: 60 }),
      createAttempt({ percentage: 60 }),
      createAttempt({ percentage: 60 }),
      createAttempt({ percentage: 60 }),
      createAttempt({ percentage: 60 }),
    ]
    const result = calculateImprovementRate(attempts)

    // Mejora: ((60 - 80) / 80) * 100 = -25%
    expect(result).toBe(-25)
  })

  it('debería retornar 0 si el promedio inicial es 0', () => {
    const attempts = Array(10).fill(null).map(() =>
      createAttempt({ percentage: 0 })
    )
    expect(calculateImprovementRate(attempts)).toBe(0)
  })
})

describe('getRecentAttempts', () => {
  it('debería retornar array vacío sin intentos', () => {
    expect(getRecentAttempts([])).toEqual([])
  })

  it('debería retornar máximo 10 intentos por defecto', () => {
    const attempts = Array(15).fill(null).map((_, i) =>
      createAttempt({ id: `attempt-${i}` })
    )
    const result = getRecentAttempts(attempts)
    expect(result).toHaveLength(10)
  })

  it('debería retornar intentos en orden inverso (más recientes primero)', () => {
    const attempts = [
      createAttempt({ id: 'first', created_at: '2024-01-01T00:00:00Z' }),
      createAttempt({ id: 'second', created_at: '2024-01-02T00:00:00Z' }),
      createAttempt({ id: 'third', created_at: '2024-01-03T00:00:00Z' }),
    ]
    const result = getRecentAttempts(attempts)

    expect(result[0].id).toBe('third')
    expect(result[1].id).toBe('second')
    expect(result[2].id).toBe('first')
  })

  it('debería incluir passed solo para modo real', () => {
    const attempts = [
      createAttempt({ question_mode: 'demo', correct_count: 60 }),
      createAttempt({ question_mode: 'real', correct_count: 60 }), // 6.0 - aprobado
      createAttempt({ question_mode: 'real', correct_count: 50 }), // 5.0 - suspenso
    ]
    const result = getRecentAttempts(attempts)

    expect(result[0].passed).toBe(false) // 5.0 suspenso
    expect(result[1].passed).toBe(true) // 6.0 aprobado
    expect(result[2].passed).toBeUndefined() // demo no tiene passed
  })

  it('debería calcular score correctamente', () => {
    const attempts = [
      createAttempt({ correct_count: 75 }),
    ]
    const result = getRecentAttempts(attempts)
    expect(result[0].score).toBe(7.5) // 75 * 0.10
  })

  it('debería respetar el límite personalizado', () => {
    const attempts = Array(10).fill(null).map(() => createAttempt({}))
    const result = getRecentAttempts(attempts, 5)
    expect(result).toHaveLength(5)
  })
})

describe('getProgressOverTime', () => {
  it('debería retornar array vacío sin intentos', () => {
    expect(getProgressOverTime([])).toEqual([])
  })

  it('debería mapear todos los campos correctamente', () => {
    const attempts = [
      createAttempt({
        created_at: '2024-01-15T10:00:00Z',
        correct_count: 70,
        wrong_count: 20,
        blank_count: 10,
        percentage: 70,
        duration_seconds: 3600,
        question_mode: 'real',
      }),
    ]
    const result = getProgressOverTime(attempts)

    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      date: '2024-01-15T10:00:00Z',
      score: 7, // 70 * 0.10
      percentage: 70,
      correct: 70,
      wrong: 20,
      blank: 10,
      duration: 3600,
      questionMode: 'real',
    })
  })

  it('debería mantener el orden original de intentos', () => {
    const attempts = [
      createAttempt({ created_at: '2024-01-01T00:00:00Z' }),
      createAttempt({ created_at: '2024-01-02T00:00:00Z' }),
      createAttempt({ created_at: '2024-01-03T00:00:00Z' }),
    ]
    const result = getProgressOverTime(attempts)

    expect(result[0].date).toBe('2024-01-01T00:00:00Z')
    expect(result[2].date).toBe('2024-01-03T00:00:00Z')
  })
})
