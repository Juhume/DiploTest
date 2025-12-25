import type { Question, GradeResult, QuestionResult, QuestionGrading, QuestionMode } from "./types"

// Grading configuration for different modes
const GRADING_CONFIG = {
  demo: {
    pointsPerCorrect: 1, // Simple 1 point per correct answer
    passingScore: 60, // 60% to pass
    maxQuestions: null, // No limit
  },
  real: {
    pointsPerCorrect: 0.10, // 0.10 points per correct answer
    passingScore: 5.8, // Minimum score of 5.8 out of 10 to pass
    maxQuestions: 100, // 100 questions + 5 reserve
    totalQuestions: 100, // Only 100 questions count for scoring
  },
}

/**
 * Compare two arrays as sets (same elements, order doesn't matter)
 */
function setsEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false
  const sortedA = [...a].sort()
  const sortedB = [...b].sort()
  return sortedA.every((val, idx) => val === sortedB[idx])
}

/**
 * Grade an attempt - pure function for testability
 * Supports both DEMO and REAL modes with different grading rules
 */
export function gradeAttempt(
  questions: Question[],
  answers: Record<string, string[]>,
  mode: QuestionMode = "demo"
): GradeResult {
  let correctCount = 0
  let wrongCount = 0
  let blankCount = 0
  const details: QuestionResult[] = []
  const grading: Record<string, QuestionGrading> = {}

  const config = GRADING_CONFIG[mode]

  for (const question of questions) {
    const userAnswer = answers[question.id] || []
    const correctAnswer = question.correct
    const isBlank = userAnswer.length === 0
    const isCorrect = !isBlank && setsEqual(userAnswer, correctAnswer)

    let status: "correct" | "wrong" | "blank"
    if (isBlank) {
      blankCount++
      status = "blank"
    } else if (isCorrect) {
      correctCount++
      status = "correct"
    } else {
      wrongCount++
      status = "wrong"
    }

    details.push({
      questionId: question.id,
      userAnswer,
      correctAnswer,
      isCorrect,
      isBlank,
    })

    grading[question.id] = {
      correct: correctAnswer,
      chosen: userAnswer,
      status,
    }
  }

  const total = questions.length
  const percentage = total > 0 ? (correctCount / total) * 100 : 0

  // Calculate score based on mode
  let score: number
  let passingScore: number
  let passed: boolean

  if (mode === "real") {
    // Real mode scoring: 0.10 points per correct answer
    score = correctCount * config.pointsPerCorrect
    passingScore = config.passingScore
    passed = score >= passingScore
  } else {
    // DEMO mode: percentage-based
    score = percentage / 10 // Convert percentage to 0-10 scale
    passingScore = config.passingScore / 10 // Convert to 0-10 scale
    passed = percentage >= config.passingScore
  }

  return {
    correctCount,
    wrongCount,
    blankCount,
    percentage: Math.round(percentage * 100) / 100,
    score: Math.round(score * 100) / 100,
    passingScore,
    passed,
    details,
    grading,
  }
}

/**
 * Get grading configuration for a specific mode
 */
export function getGradingConfig(mode: QuestionMode) {
  return GRADING_CONFIG[mode]
}
