import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const attemptSchema = z.object({
  question_mode: z.enum(["demo", "real"]),
  selection_mode: z.enum(["all", "random", "tag"]),
  selection_meta: z
    .object({
      n: z.number().int().positive().optional(),
      tag: z.string().optional(),
    })
    .optional()
    .default({}),
  total_questions: z.number().int().positive(),
  correct_count: z.number().int().min(0),
  wrong_count: z.number().int().min(0),
  blank_count: z.number().int().min(0),
  percentage: z.number().min(0).max(100),
  duration_seconds: z.number().int().min(0),
  answers: z.record(z.string(), z.array(z.string())).optional().default({}),
  grading: z
    .record(
      z.string(),
      z.object({
        correct: z.array(z.string()),
        chosen: z.array(z.string()),
        status: z.enum(["correct", "wrong", "blank"]),
      }),
    )
    .optional()
    .default({}),
})

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse query parameters for filtering
    const { searchParams } = new URL(request.url)
    const mode = searchParams.get("mode")
    const from = searchParams.get("from")
    const to = searchParams.get("to")

    let query = supabase.from("attempts").select("*").eq("user_id", user.id).order("created_at", { ascending: false })

    // Filter by question mode if specified
    if (mode && (mode === "demo" || mode === "real")) {
      query = query.eq("question_mode", mode)
    }

    // Filter by date range
    if (from) {
      query = query.gte("created_at", from)
    }
    if (to) {
      query = query.lte("created_at", to)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: "Failed to fetch attempts", details: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: "Internal server error", details: String(err) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = attemptSchema.parse(body)

    const { data, error } = await supabase
      .from("attempts")
      .insert({
        ...validatedData,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "Failed to save attempt", details: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: err.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error", details: String(err) }, { status: 500 })
  }
}
