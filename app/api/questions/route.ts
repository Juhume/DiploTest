import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { z } from "zod"
import demoQuestions from "@/data/questions.demo.json"
import academyQuestions from "@/data/questions.academy.json"
import realExamQuestions from "@/data/examenes_reales.json"
import type { Question } from "@/lib/types"
import { createClient } from "@/lib/supabase/server"

// Validation schema
const querySchema = z.object({
  mode: z.enum(["demo", "real", "academy"]).default("demo"),
  tag: z.string().optional().nullable(),
  limit: z.coerce.number().int().positive().max(200).optional().nullable(),
  random: z.enum(["true", "false"]).optional().nullable(),
  selectionMode: z.enum(["all", "random", "tag", "review"]).optional().nullable(),
  examYear: z.coerce.number().int().min(2000).max(2100).optional().nullable(),
})

/**
 * Fisher-Yates shuffle algorithm for better randomization
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export async function GET(request: NextRequest) {
  try {
    // Authentication check - protects question pool from unauthorized access
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    
    // Validate query parameters
    const validation = querySchema.safeParse({
      mode: searchParams.get("mode"),
      tag: searchParams.get("tag"),
      limit: searchParams.get("limit"),
      random: searchParams.get("random"),
      selectionMode: searchParams.get("selectionMode"),
      examYear: searchParams.get("examYear"),
    })

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: validation.error.issues },
        { status: 400 }
      )
    }

    const { mode, tag, limit, random, selectionMode, examYear } = validation.data

    // Handle review mode - fetch failed questions
    if (selectionMode === "review") {
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
        return NextResponse.json([])
      }

      // Collect failed question IDs
      const failedQuestionsMap = new Map<string, { count: number; mode: string }>()
      const correctedQuestions = new Set<string>()

      attempts.forEach((attempt) => {
        const grading = attempt.grading as Record<string, { status: string }> | null
        if (!grading) return

        Object.entries(grading).forEach(([questionId, grade]) => {
          if (grade.status === "wrong") {
            if (!correctedQuestions.has(questionId)) {
              const existing = failedQuestionsMap.get(questionId)
              if (existing) {
                existing.count++
              } else {
                failedQuestionsMap.set(questionId, { count: 1, mode: attempt.question_mode })
              }
            }
          } else if (grade.status === "correct") {
            correctedQuestions.add(questionId)
          }
        })
      })

      correctedQuestions.forEach((qId) => failedQuestionsMap.delete(qId))

      if (failedQuestionsMap.size === 0) {
        return NextResponse.json([])
      }

      // Get the actual question objects
      const allQuestions: Question[] = [
        ...(demoQuestions as Question[]),
        ...(academyQuestions as Question[]),
        ...(realExamQuestions as Question[]),
      ]

      const questionMap = new Map(allQuestions.map((q) => [q.id, q]))
      const failedQuestionsList = Array.from(failedQuestionsMap.keys())
        .map((id) => questionMap.get(id))
        .filter((q): q is Question => q !== undefined)

      // Shuffle for variety
      return NextResponse.json(shuffleArray(failedQuestionsList))
    }

    // Select question pool based on mode
    let questions: Question[]

    switch (mode) {
      case "real":
        // Real exam questions from official past exams
        questions = realExamQuestions as Question[]
        break
      case "academy":
        // Academy questions (approximation to real exam)
        questions = academyQuestions as Question[]
        break
      case "demo":
      default:
        // Demo questions for practice
        questions = demoQuestions as Question[]
        break
    }

    if (questions.length === 0) {
      return NextResponse.json(
        { error: `No questions available for mode: ${mode}` },
        { status: 404 }
      )
    }

    // For REAL mode, filter by year if specified, then shuffle and limit to 100 questions
    if (mode === "real") {
      // Filter by exam year if specified
      if (examYear) {
        questions = questions.filter((q) => {
          // Extract year from id like "examen_real_2021_q1"
          const yearMatch = q.id.match(/examen_real_(\d{4})/)
          return yearMatch && parseInt(yearMatch[1]) === examYear
        })
      }

      questions = shuffleArray(questions).slice(0, 100)
      return NextResponse.json(questions)
    }

    // For ACADEMY mode, shuffle and limit to 100 questions (like real exam simulation)
    if (mode === "academy") {
      questions = shuffleArray(questions).slice(0, 100)
      return NextResponse.json(questions)
    }

    // Filter by tag if specified (only for DEMO mode)
    if (tag && tag.trim()) {
      questions = questions.filter((q) => q.tags?.includes(tag))

      if (questions.length === 0) {
        return NextResponse.json(
          { error: `No questions found for tag: ${tag}` },
          { status: 404 }
        )
      }
    }

    // Shuffle if random (before limiting)
    if (random === "true") {
      questions = shuffleArray(questions)
    }

    // Limit results if specified
    if (limit && limit > 0) {
      questions = questions.slice(0, limit)
    }

    return NextResponse.json(questions)
  } catch (error) {
    console.error("Error in GET /api/questions:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * Get available tags and metadata for a given mode
 */
export async function OPTIONS(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const mode = searchParams.get("mode") || "demo"

    let questions: Question[]
    switch (mode) {
      case "real":
        questions = realExamQuestions as Question[]
        break
      case "academy":
        questions = academyQuestions as Question[]
        break
      case "demo":
      default:
        questions = demoQuestions as Question[]
        break
    }

    // Extract unique tags
    const tagsSet = new Set<string>()
    questions.forEach((q) => {
      q.tags?.forEach((tag) => tagsSet.add(tag))
    })

    const tags = Array.from(tagsSet).sort()

    // For real mode, also return available exam years
    let examYears: number[] = []
    if (mode === "real") {
      const yearsSet = new Set<number>()
      questions.forEach((q) => {
        const yearMatch = q.id.match(/examen_real_(\d{4})/)
        if (yearMatch) {
          yearsSet.add(parseInt(yearMatch[1]))
        }
      })
      examYears = Array.from(yearsSet).sort((a, b) => b - a) // Most recent first
    }

    return NextResponse.json({ tags, count: questions.length, examYears })
  } catch (error) {
    console.error("Error in OPTIONS /api/questions:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
