import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Validaciones
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email/Usuario y contraseña son obligatorios' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Determinar si el input es un email o un username
    const isEmail = email.includes('@')
    let loginEmail = email

    // Si no es email, buscar el email asociado al username
    if (!isEmail) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('username', email.toLowerCase())
        .single()

      if (profileError || !profile) {
        return NextResponse.json(
          { error: 'Usuario o contraseña incorrectos' },
          { status: 401 }
        )
      }

      loginEmail = profile.email
    }

    // Intentar iniciar sesión con el email
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password,
    })

    if (error) {
      console.error('Error en login:', error)
      
      if (error.message.includes('Invalid login credentials')) {
        return NextResponse.json(
          { error: 'Email o contraseña incorrectos' },
          { status: 401 }
        )
      }
      
      if (error.message.includes('Email not confirmed')) {
        return NextResponse.json(
          { error: 'Por favor confirma tu email antes de iniciar sesión' },
          { status: 401 }
        )
      }
      
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ 
      success: true,
      user: data.user 
    })

  } catch (error: any) {
    console.error('Error inesperado en login:', error)
    return NextResponse.json(
      { error: error?.message || 'Error inesperado al iniciar sesión' },
      { status: 500 }
    )
  }
}
