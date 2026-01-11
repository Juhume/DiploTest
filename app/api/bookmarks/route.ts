import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"
import demoQuestions from "@/data/questions.demo.json"
import academyQuestions from "@/data/questions.academy.json"
import realExamQuestions from "@/data/examenes_reales.json"
import type { Question } from "@/lib/types"

const bookmarkSchema = z.object({
  question_id: z.string().min(1),
  question_mode: z.enum(["demo", "real", "academy"]),
  notes: z.string().optional(),
})

/**
 * GET /api/bookmarks
 * Returns all bookmarked questions for the authenticated user
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: bookmarks, error } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: "Failed to fetch bookmarks" }, { status: 500 })
    }

    // Enrich bookmarks with question data
    const allQuestions: Question[] = [
      ...(demoQuestions as Question[]),
      ...(academyQuestions as Question[]),
      ...(realExamQuestions as Question[]),
    ]
    const questionMap = new Map(allQuestions.map(q => [q.id, q]))

    const enrichedBookmarks = bookmarks.map(bookmark => ({
      ...bookmark,
      question: questionMap.get(bookmark.question_id) || null,
    }))

    return NextResponse.json(enrichedBookmarks)
  } catch (error) {
    console.error("Error in GET /api/bookmarks:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * POST /api/bookmarks
 * Add a question to bookmarks
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = bookmarkSchema.parse(body)

    // Check if already bookmarked
    const { data: existing } = await supabase
      .from("bookmarks")
      .select("id")
      .eq("user_id", user.id)
      .eq("question_id", validatedData.question_id)
      .single()

    if (existing) {
      return NextResponse.json({ error: "Question already bookmarked" }, { status: 409 })
    }

    const { data, error } = await supabase
      .from("bookmarks")
      .insert({
        user_id: user.id,
        ...validatedData,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "Failed to create bookmark" }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: err.errors }, { status: 400 })
    }
    console.error("Error in POST /api/bookmarks:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * DELETE /api/bookmarks
 * Remove a question from bookmarks
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const questionId = searchParams.get("question_id")

    if (!questionId) {
      return NextResponse.json({ error: "question_id is required" }, { status: 400 })
    }

    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("user_id", user.id)
      .eq("question_id", questionId)

    if (error) {
      return NextResponse.json({ error: "Failed to delete bookmark" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE /api/bookmarks:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
