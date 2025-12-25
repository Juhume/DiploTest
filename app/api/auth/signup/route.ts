import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { username, email, password, repeatPassword } = await request.json()

    // Validaciones
    if (!username || !email || !password || !repeatPassword) {
      return NextResponse.json(
        { error: 'Todos los campos son obligatorios' },
        { status: 400 }
      )
    }

    // Validar formato del username
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        { error: 'El nombre de usuario debe tener entre 3 y 20 caracteres y solo puede contener letras, números, guiones y guiones bajos' },
        { status: 400 }
      )
    }

    if (password !== repeatPassword) {
      return NextResponse.json(
        { error: 'Las contraseñas no coinciden' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verificar si el username ya existe
    const { data: existingUsers } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username.toLowerCase())
      .single()

    if (existingUsers) {
      return NextResponse.json(
        { error: 'Este nombre de usuario ya está en uso' },
        { status: 400 }
      )
    }

    // Intentar crear usuario con metadata
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username.toLowerCase(),
          display_name: username
        }
      }
    })

    if (error) {
      console.error('Error en signUp:', error)
      
      if (error.message.includes('User already registered')) {
        return NextResponse.json(
          { error: 'Este email ya está registrado. Por favor inicia sesión.' },
          { status: 400 }
        )
      }
      
      if (error.message.includes('Email rate limit exceeded')) {
        return NextResponse.json(
          { error: 'Demasiados intentos. Por favor espera unos minutos.' },
          { status: 429 }
        )
      }
      
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ 
      success: true,
      user: data.user,
      needsConfirmation: !data.user?.confirmed_at
    })

  } catch (error: any) {
    console.error('Error inesperado en signup:', error)
    return NextResponse.json(
      { error: error?.message || 'Error inesperado al crear la cuenta' },
      { status: 500 }
    )
  }
}
