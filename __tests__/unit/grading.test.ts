import { describe, it, expect } from 'vitest'
import { gradeAttempt, getGradingConfig } from '@/lib/grading'
import type { Question } from '@/lib/types'

// Helper para crear preguntas de test
function createQuestion(
  id: string,
  correct: string[],
  options = ['A', 'B', 'C', 'D']
): Question {
  return {
    id,
    stem: `Pregunta ${id}`,
    options: options.map(opt => ({ id: opt, text: `Opción ${opt}` })),
    correct,
  }
}

// Crear un set de preguntas para tests
function createQuestionSet(count: number): Question[] {
  return Array.from({ length: count }, (_, i) =>
    createQuestion(`q${i + 1}`, ['A'])
  )
}

describe('gradeAttempt', () => {
  describe('Conteo básico de respuestas', () => {
    it('debería contar correctamente las respuestas correctas', () => {
      const questions = [
        createQuestion('q1', ['A']),
        createQuestion('q2', ['B']),
        createQuestion('q3', ['C']),
      ]
      const answers = {
        q1: ['A'], // Correcta
        q2: ['B'], // Correcta
        q3: ['C'], // Correcta
      }

      const result = gradeAttempt(questions, answers, 'demo')

      expect(result.correctCount).toBe(3)
      expect(result.wrongCount).toBe(0)
      expect(result.blankCount).toBe(0)
    })

    it('debería contar correctamente las respuestas incorrectas', () => {
      const questions = [
        createQuestion('q1', ['A']),
        createQuestion('q2', ['B']),
        createQuestion('q3', ['C']),
      ]
      const answers = {
        q1: ['B'], // Incorrecta
        q2: ['A'], // Incorrecta
        q3: ['D'], // Incorrecta
      }

      const result = gradeAttempt(questions, answers, 'demo')

      expect(result.correctCount).toBe(0)
      expect(result.wrongCount).toBe(3)
      expect(result.blankCount).toBe(0)
    })

    it('debería contar correctamente las respuestas en blanco', () => {
      const questions = [
        createQuestion('q1', ['A']),
        createQuestion('q2', ['B']),
        createQuestion('q3', ['C']),
      ]
      const answers = {
        q1: [], // Blanco
        q2: [], // Blanco
        // q3 no existe en answers -> Blanco
      }

      const result = gradeAttempt(questions, answers, 'demo')

      expect(result.correctCount).toBe(0)
      expect(result.wrongCount).toBe(0)
      expect(result.blankCount).toBe(3)
    })

    it('debería contar mezcla de correctas, incorrectas y blancos', () => {
      const questions = [
        createQuestion('q1', ['A']),
        createQuestion('q2', ['B']),
        createQuestion('q3', ['C']),
        createQuestion('q4', ['D']),
        createQuestion('q5', ['A']),
      ]
      const answers = {
        q1: ['A'], // Correcta
        q2: ['A'], // Incorrecta
        q3: [],    // Blanco
        q4: ['D'], // Correcta
        // q5 no existe -> Blanco
      }

      const result = gradeAttempt(questions, answers, 'demo')

      expect(result.correctCount).toBe(2)
      expect(result.wrongCount).toBe(1)
      expect(result.blankCount).toBe(2)
    })
  })

  describe('Preguntas de respuesta múltiple', () => {
    it('debería marcar como correcta si todas las opciones coinciden', () => {
      const questions = [createQuestion('q1', ['A', 'C'])]
      const answers = { q1: ['A', 'C'] }

      const result = gradeAttempt(questions, answers, 'demo')

      expect(result.correctCount).toBe(1)
      expect(result.details[0].isCorrect).toBe(true)
    })

    it('debería marcar como correcta independientemente del orden', () => {
      const questions = [createQuestion('q1', ['A', 'C'])]
      const answers = { q1: ['C', 'A'] } // Orden diferente

      const result = gradeAttempt(questions, answers, 'demo')

      expect(result.correctCount).toBe(1)
      expect(result.details[0].isCorrect).toBe(true)
    })

    it('debería marcar como incorrecta si falta una opción', () => {
      const questions = [createQuestion('q1', ['A', 'C'])]
      const answers = { q1: ['A'] } // Falta 'C'

      const result = gradeAttempt(questions, answers, 'demo')

      expect(result.wrongCount).toBe(1)
      expect(result.details[0].isCorrect).toBe(false)
    })

    it('debería marcar como incorrecta si hay una opción extra', () => {
      const questions = [createQuestion('q1', ['A', 'C'])]
      const answers = { q1: ['A', 'B', 'C'] } // 'B' extra

      const result = gradeAttempt(questions, answers, 'demo')

      expect(result.wrongCount).toBe(1)
      expect(result.details[0].isCorrect).toBe(false)
    })

    it('debería marcar como incorrecta si las opciones son completamente diferentes', () => {
      const questions = [createQuestion('q1', ['A', 'C'])]
      const answers = { q1: ['B', 'D'] }

      const result = gradeAttempt(questions, answers, 'demo')

      expect(result.wrongCount).toBe(1)
      expect(result.details[0].isCorrect).toBe(false)
    })
  })

  describe('Modo DEMO - Puntuación basada en porcentaje', () => {
    it('debería calcular 100% con todas las respuestas correctas', () => {
      const questions = createQuestionSet(10)
      const answers = Object.fromEntries(
        questions.map(q => [q.id, ['A']])
      )

      const result = gradeAttempt(questions, answers, 'demo')

      expect(result.percentage).toBe(100)
      expect(result.score).toBe(10) // 100% = 10 puntos
      expect(result.passed).toBe(true)
    })

    it('debería calcular 0% con todas las respuestas incorrectas', () => {
      const questions = createQuestionSet(10)
      const answers = Object.fromEntries(
        questions.map(q => [q.id, ['B']]) // Todas incorrectas
      )

      const result = gradeAttempt(questions, answers, 'demo')

      expect(result.percentage).toBe(0)
      expect(result.score).toBe(0)
      expect(result.passed).toBe(false)
    })

    it('debería calcular 60% con 6 de 10 correctas (límite de aprobado)', () => {
      const questions = createQuestionSet(10)
      const answers: Record<string, string[]> = {}
      questions.forEach((q, i) => {
        answers[q.id] = i < 6 ? ['A'] : ['B'] // 6 correctas, 4 incorrectas
      })

      const result = gradeAttempt(questions, answers, 'demo')

      expect(result.percentage).toBe(60)
      expect(result.score).toBe(6) // 60% = 6 puntos
      expect(result.passed).toBe(true)
      expect(result.passingScore).toBe(6) // 60% convertido a escala 0-10
    })

    it('debería calcular 50% con 5 de 10 correctas (suspenso)', () => {
      const questions = createQuestionSet(10)
      const answers: Record<string, string[]> = {}
      questions.forEach((q, i) => {
        answers[q.id] = i < 5 ? ['A'] : ['B'] // 5 correctas, 5 incorrectas
      })

      const result = gradeAttempt(questions, answers, 'demo')

      expect(result.percentage).toBe(50)
      expect(result.score).toBe(5)
      expect(result.passed).toBe(false)
    })

    it('debería manejar porcentajes con decimales', () => {
      const questions = createQuestionSet(3)
      const answers = {
        q1: ['A'], // Correcta
        q2: ['B'], // Incorrecta
        q3: ['B'], // Incorrecta
      }

      const result = gradeAttempt(questions, answers, 'demo')

      expect(result.percentage).toBeCloseTo(33.33, 1)
      expect(result.passed).toBe(false)
    })
  })

  describe('Modo REAL - Puntuación oficial', () => {
    it('debería calcular 10 puntos con 100 respuestas correctas', () => {
      const questions = createQuestionSet(100)
      const answers = Object.fromEntries(
        questions.map(q => [q.id, ['A']])
      )

      const result = gradeAttempt(questions, answers, 'real')

      expect(result.correctCount).toBe(100)
      expect(result.score).toBe(10) // 100 * 0.10 = 10
      expect(result.passed).toBe(true)
    })

    it('debería calcular 5.8 puntos con 58 respuestas correctas (límite aprobado)', () => {
      const questions = createQuestionSet(100)
      const answers: Record<string, string[]> = {}
      questions.forEach((q, i) => {
        answers[q.id] = i < 58 ? ['A'] : ['B']
      })

      const result = gradeAttempt(questions, answers, 'real')

      expect(result.correctCount).toBe(58)
      expect(result.score).toBe(5.8)
      expect(result.passed).toBe(true)
      expect(result.passingScore).toBe(5.8)
    })

    it('debería calcular 5.7 puntos con 57 respuestas correctas (suspenso)', () => {
      const questions = createQuestionSet(100)
      const answers: Record<string, string[]> = {}
      questions.forEach((q, i) => {
        answers[q.id] = i < 57 ? ['A'] : ['B']
      })

      const result = gradeAttempt(questions, answers, 'real')

      expect(result.correctCount).toBe(57)
      expect(result.score).toBe(5.7)
      expect(result.passed).toBe(false)
    })

    it('debería calcular 0 puntos con todas incorrectas', () => {
      const questions = createQuestionSet(100)
      const answers = Object.fromEntries(
        questions.map(q => [q.id, ['B']])
      )

      const result = gradeAttempt(questions, answers, 'real')

      expect(result.score).toBe(0)
      expect(result.passed).toBe(false)
    })

    it('debería funcionar con menos de 100 preguntas', () => {
      const questions = createQuestionSet(50)
      const answers = Object.fromEntries(
        questions.map(q => [q.id, ['A']])
      )

      const result = gradeAttempt(questions, answers, 'real')

      expect(result.correctCount).toBe(50)
      expect(result.score).toBe(5) // 50 * 0.10 = 5
      expect(result.passed).toBe(false) // < 5.8
    })
  })

  describe('Modo ACADEMY - Igual que REAL', () => {
    it('debería usar las mismas reglas que modo REAL', () => {
      const questions = createQuestionSet(100)
      const answers: Record<string, string[]> = {}
      questions.forEach((q, i) => {
        answers[q.id] = i < 60 ? ['A'] : ['B']
      })

      const realResult = gradeAttempt(questions, answers, 'real')
      const academyResult = gradeAttempt(questions, answers, 'academy')

      expect(academyResult.score).toBe(realResult.score)
      expect(academyResult.passed).toBe(realResult.passed)
      expect(academyResult.passingScore).toBe(realResult.passingScore)
    })
  })

  describe('Edge cases', () => {
    it('debería manejar un test vacío (sin preguntas)', () => {
      const questions: Question[] = []
      const answers = {}

      const result = gradeAttempt(questions, answers, 'demo')

      expect(result.correctCount).toBe(0)
      expect(result.wrongCount).toBe(0)
      expect(result.blankCount).toBe(0)
      expect(result.percentage).toBe(0)
      expect(result.score).toBe(0)
    })

    it('debería manejar respuestas para preguntas que no existen', () => {
      const questions = [createQuestion('q1', ['A'])]
      const answers = {
        q1: ['A'],
        q999: ['B'], // Esta pregunta no existe
      }

      const result = gradeAttempt(questions, answers, 'demo')

      // Solo debería evaluar q1
      expect(result.correctCount).toBe(1)
      expect(result.details.length).toBe(1)
    })

    it('debería manejar una sola pregunta', () => {
      const questions = [createQuestion('q1', ['A'])]
      const answers = { q1: ['A'] }

      const result = gradeAttempt(questions, answers, 'demo')

      expect(result.percentage).toBe(100)
      expect(result.correctCount).toBe(1)
    })

    it('debería usar modo demo por defecto si no se especifica', () => {
      const questions = createQuestionSet(10)
      const answers = Object.fromEntries(
        questions.map(q => [q.id, ['A']])
      )

      const result = gradeAttempt(questions, answers)

      expect(result.passingScore).toBe(6) // 60% en escala 0-10
    })
  })

  describe('Estructura del resultado (details y grading)', () => {
    it('debería incluir detalles correctos para cada pregunta', () => {
      const questions = [
        createQuestion('q1', ['A']),
        createQuestion('q2', ['B']),
      ]
      const answers = {
        q1: ['A'], // Correcta
        q2: ['C'], // Incorrecta
      }

      const result = gradeAttempt(questions, answers, 'demo')

      expect(result.details).toHaveLength(2)

      expect(result.details[0]).toEqual({
        questionId: 'q1',
        userAnswer: ['A'],
        correctAnswer: ['A'],
        isCorrect: true,
        isBlank: false,
      })

      expect(result.details[1]).toEqual({
        questionId: 'q2',
        userAnswer: ['C'],
        correctAnswer: ['B'],
        isCorrect: false,
        isBlank: false,
      })
    })

    it('debería incluir grading con status correcto', () => {
      const questions = [
        createQuestion('q1', ['A']),
        createQuestion('q2', ['B']),
        createQuestion('q3', ['C']),
      ]
      const answers = {
        q1: ['A'], // Correcta
        q2: ['D'], // Incorrecta
        q3: [],    // Blanco
      }

      const result = gradeAttempt(questions, answers, 'demo')

      expect(result.grading['q1'].status).toBe('correct')
      expect(result.grading['q2'].status).toBe('wrong')
      expect(result.grading['q3'].status).toBe('blank')
    })

    it('debería incluir respuestas correctas y elegidas en grading', () => {
      const questions = [createQuestion('q1', ['A', 'C'])]
      const answers = { q1: ['B', 'C'] }

      const result = gradeAttempt(questions, answers, 'demo')

      expect(result.grading['q1']).toEqual({
        correct: ['A', 'C'],
        chosen: ['B', 'C'],
        status: 'wrong',
      })
    })
  })

  describe('Redondeo de porcentaje y score', () => {
    it('debería redondear el porcentaje a 2 decimales', () => {
      const questions = createQuestionSet(7)
      const answers: Record<string, string[]> = {}
      questions.forEach((q, i) => {
        answers[q.id] = i < 3 ? ['A'] : ['B'] // 3/7 = 42.857142...%
      })

      const result = gradeAttempt(questions, answers, 'demo')

      expect(result.percentage).toBe(42.86)
    })

    it('debería redondear el score a 2 decimales', () => {
      const questions = createQuestionSet(7)
      const answers: Record<string, string[]> = {}
      questions.forEach((q, i) => {
        answers[q.id] = i < 3 ? ['A'] : ['B']
      })

      const result = gradeAttempt(questions, answers, 'demo')

      expect(result.score).toBe(4.29) // 42.86 / 10
    })
  })
})

describe('getGradingConfig', () => {
  it('debería retornar configuración correcta para modo demo', () => {
    const config = getGradingConfig('demo')

    expect(config.pointsPerCorrect).toBe(1)
    expect(config.passingScore).toBe(60)
    expect(config.maxQuestions).toBeNull()
  })

  it('debería retornar configuración correcta para modo real', () => {
    const config = getGradingConfig('real')

    expect(config.pointsPerCorrect).toBe(0.10)
    expect(config.passingScore).toBe(5.8)
    expect(config.maxQuestions).toBe(100)
    expect(config.totalQuestions).toBe(100)
  })

  it('debería retornar configuración correcta para modo academy', () => {
    const config = getGradingConfig('academy')

    expect(config.pointsPerCorrect).toBe(0.10)
    expect(config.passingScore).toBe(5.8)
    expect(config.maxQuestions).toBe(100)
  })
})
