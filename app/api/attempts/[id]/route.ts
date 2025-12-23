import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // RLS ensures user can only access their own attempts
    const { data, error } = await supabase.from("attempts").select("*").eq("id", id).eq("user_id", user.id).single()

    if (error) {
      return NextResponse.json({ error: "Attempt not found", details: error.message }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: "Internal server error", details: String(err) }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Attempts are immutable - deletion is blocked by RLS policy
    // This endpoint returns a 403 to be explicit about the policy
    return NextResponse.json(
      { error: "Attempts are immutable and cannot be deleted", policy: "RLS prevents deletion" }, 
      { status: 403 }
    )
    
    // RLS policy will prevent this from executing anyway
    // const { error } = await supabase.from("attempts").delete().eq("id", id).eq("user_id", user.id)
  } catch (err) {
    return NextResponse.json({ error: "Internal server error", details: String(err) }, { status: 500 })
  }
}
