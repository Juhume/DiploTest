import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const feedbackSchema = z.object({
  feedback_type: z.enum(["feature", "bug", "improvement", "other"]),
  message: z.string().min(10, "El mensaje debe tener al menos 10 caracteres").max(2000),
  rating: z.number().int().min(1).max(5).optional(),
  page_context: z.string().max(200).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validationResult = feedbackSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation error", details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { feedback_type, message, rating, page_context } = validationResult.data

    const { data, error } = await supabase
      .from("feedback")
      .insert({
        user_id: user.id,
        feedback_type,
        message,
        rating,
        page_context,
      })
      .select()
      .single()

    if (error) {
      console.error("Error saving feedback:", error)
      return NextResponse.json(
        { error: "Failed to save feedback", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("Error in POST /api/feedback:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("feedback")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch feedback", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in GET /api/feedback:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
