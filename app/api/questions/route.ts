import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { z } from "zod"
import demoQuestions from "@/data/questions.demo.json"
import realQuestions from "@/data/questions.real.json"
import type { Question } from "@/lib/types"
import { createClient } from "@/lib/supabase/server"

// Validation schema
const querySchema = z.object({
  mode: z.enum(["demo", "real"]).default("demo"),
  tag: z.string().optional().nullable(),
  limit: z.coerce.number().int().positive().max(200).optional().nullable(),
  random: z.enum(["true", "false"]).optional().nullable(),
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
    })

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: validation.error.issues },
        { status: 400 }
      )
    }

    const { mode, tag, limit, random } = validation.data

    // Select question pool based on mode
    let questions: Question[] = mode === "real" ? (realQuestions as Question[]) : (demoQuestions as Question[])

    if (questions.length === 0) {
      return NextResponse.json(
        { error: `No questions available for mode: ${mode}` },
        { status: 404 }
      )
    }

    // For REAL mode, always shuffle and limit to 100 questions
    if (mode === "real") {
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
 * Get available tags for a given mode
 */
export async function OPTIONS(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const mode = searchParams.get("mode") || "demo"

    const questions: Question[] = mode === "real" ? (realQuestions as Question[]) : (demoQuestions as Question[])
    
    // Extract unique tags
    const tagsSet = new Set<string>()
    questions.forEach((q) => {
      q.tags?.forEach((tag) => tagsSet.add(tag))
    })

    const tags = Array.from(tagsSet).sort()

    return NextResponse.json({ tags, count: questions.length })
  } catch (error) {
    console.error("Error in OPTIONS /api/questions:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
