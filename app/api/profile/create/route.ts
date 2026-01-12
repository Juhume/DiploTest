import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { createServiceRoleClient } from "@/lib/supabase/service-role"

const schema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "El nombre de usuario debe tener al menos 3 caracteres")
    .max(20, "El nombre de usuario no puede exceder 20 caracteres")
    .regex(/^[a-zA-Z0-9_-]+$/, "Solo letras, números, guiones y guiones bajos"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.errors },
        { status: 400 }
      )
    }

    const normalizedUsername = parsed.data.username.toLowerCase()

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = user.id

    const serviceRole = createServiceRoleClient()
    const { data, error } = await serviceRole.rpc("create_profile", {
      p_user_id: userId,
      p_username: normalizedUsername,
    })

    if (error) {
      if (error.code === "23505" || error.message?.includes("USERNAME_TAKEN")) {
        return NextResponse.json(
          { error: "Este nombre de usuario ya está en uso", code: "USERNAME_TAKEN" },
          { status: 409 }
        )
      }
      if (error.code === "22023" || error.message?.includes("USERNAME_INVALID")) {
        return NextResponse.json(
          { error: "Nombre de usuario inválido", code: "USERNAME_INVALID" },
          { status: 400 }
        )
      }
      if (error.code === "P0002" || error.message?.includes("USER_NOT_FOUND")) {
        return NextResponse.json(
          { error: "Usuario no encontrado", code: "USER_NOT_FOUND" },
          { status: 404 }
        )
      }

      return NextResponse.json(
        { error: "Failed to create profile", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    )
  }
}
