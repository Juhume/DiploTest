import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email es requerido" },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    
    // URL de redirección después de hacer clic en el enlace del email
    const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password`

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo
    })

    // Por seguridad, siempre devolvemos éxito aunque el email no exista
    // Esto evita que alguien pueda verificar qué emails están registrados
    if (error) {
      console.error("Error al enviar email de recuperación:", error)
    }

    return NextResponse.json({
      success: true,
      message: "Si el correo existe en nuestro sistema, recibirás un enlace de recuperación"
    })
  } catch (error: any) {
    console.error("Error en forgot-password:", error)
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    )
  }
}
