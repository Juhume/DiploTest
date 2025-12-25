import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json(
        { error: "Contraseña es requerida" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Actualizar la contraseña del usuario autenticado
    const { error } = await supabase.auth.updateUser({
      password
    })

    if (error) {
      console.error("Error al actualizar contraseña:", error)
      return NextResponse.json(
        { error: "Error al actualizar la contraseña. El enlace puede haber expirado." },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Contraseña actualizada correctamente"
    })
  } catch (error: any) {
    console.error("Error en reset-password:", error)
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    )
  }
}
