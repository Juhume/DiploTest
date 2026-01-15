import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import demoQuestions from "@/data/questions.demo.json"
import academyQuestions from "@/data/questions.academy.json"
import realExamQuestions from "@/data/examenes_reales.json"
import type { Question, Attempt } from "@/lib/types"

/**
 * GET /api/questions/failed
 * Returns questions that the user has answered incorrectly in previous attempts
 * Used for the "Review Mistakes" feature
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all user attempts with grading data
    const { data: attempts, error } = await supabase
      .from("attempts")
      .select("grading, question_mode")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: "Failed to fetch attempts" }, { status: 500 })
    }

    if (!attempts || attempts.length === 0) {
      return NextResponse.json({
        questions: [],
        stats: { total: 0, corrected: 0 },
        message: "No tienes intentos previos"
      })
    }

    // Track the most recent status for each question (first occurrence = most recent)
    const questionLatestStatus = new Map<string, { status: string, mode: string, attemptIndex: number }>()

    // Process attempts from newest to oldest - only record first occurrence (most recent)
    attempts.forEach((attempt, attemptIndex: number) => {
      const grading = attempt.grading as Record<string, { status: string }> | null
      if (!grading) return

      Object.entries(grading).forEach(([questionId, grade]) => {
        // Only record if we haven't seen this question yet (first = most recent)
        if (!questionLatestStatus.has(questionId)) {
          questionLatestStatus.set(questionId, {
            status: grade.status,
            mode: attempt.question_mode,
            attemptIndex
          })
        }
      })
    })

    // Separate into failed and corrected based on most recent status
    const failedQuestionsMap = new Map<string, { count: number, lastFailed: number, mode: string }>()
    const correctedQuestions = new Set<string>()

    questionLatestStatus.forEach((data, questionId) => {
      if (data.status === "wrong") {
        failedQuestionsMap.set(questionId, {
          count: 1,
          lastFailed: data.attemptIndex,
          mode: data.mode
        })
      } else if (data.status === "correct") {
        correctedQuestions.add(questionId)
      }
    })

    if (failedQuestionsMap.size === 0) {
      return NextResponse.json({
        questions: [],
        stats: { total: 0, corrected: correctedQuestions.size },
        message: "No tienes preguntas pendientes de corregir"
      })
    }

    // Get the actual question objects
    const allQuestions: Question[] = [
      ...(demoQuestions as Question[]),
      ...(academyQuestions as Question[]),
      ...(realExamQuestions as Question[]),
    ]

    // Create a map for quick lookup
    const questionMap = new Map(allQuestions.map(q => [q.id, q]))

    // Build the failed questions array with metadata
    const failedQuestions = Array.from(failedQuestionsMap.entries())
      .map(([id, data]) => {
        const question = questionMap.get(id)
        if (!question) return null
        return {
          ...question,
          _failCount: data.count,
          _lastFailed: data.lastFailed,
          _mode: data.mode
        }
      })
      .filter((q): q is Question & { _failCount: number; _lastFailed: number; _mode: string } => q !== null)
      // Sort by failure count (most failed first)
      .sort((a, b) => b._failCount - a._failCount)

    return NextResponse.json({
      questions: failedQuestions,
      stats: {
        total: failedQuestions.length,
        corrected: correctedQuestions.size,
        totalAttempts: attempts.length
      }
    })
  } catch (error) {
    console.error("Error in GET /api/questions/failed:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
