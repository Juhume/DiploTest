import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { password, accessToken, refreshToken } = await request.json()

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

    if (!accessToken || !refreshToken) {
      return NextResponse.json(
        { error: "Token de recuperación no válido o expirado" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Establecer la sesión con los tokens de recuperación
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    })

    if (sessionError) {
      console.error("Error al establecer sesión:", sessionError)
      return NextResponse.json(
        { error: "Token de recuperación inválido o expirado. Solicita un nuevo enlace." },
        { status: 400 }
      )
    }

    // Actualizar la contraseña del usuario autenticado
    const { error } = await supabase.auth.updateUser({
      password
    })

    if (error) {
      console.error("Error al actualizar contraseña:", error)
      return NextResponse.json(
        { error: "Error al actualizar la contraseña. Intenta de nuevo." },
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
