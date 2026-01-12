import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
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
    const serviceRole = createServiceRoleClient()
    const normalizedUsername = username.toLowerCase()

    // Intentar crear usuario con metadata
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: username,
        },
      },
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

    if (!data.user) {
      return NextResponse.json(
        { error: 'Error desconocido al crear la cuenta' },
        { status: 500 }
      )
    }

    const { error: profileError } = await serviceRole.rpc('create_profile', {
      p_user_id: data.user.id,
      p_username: normalizedUsername,
    })

    if (profileError) {
      if (profileError.code === '23505' || profileError.message?.includes('USERNAME_TAKEN')) {
        await serviceRole.auth.admin.deleteUser(data.user.id)
        return NextResponse.json(
          { error: 'Este nombre de usuario ya está en uso', code: 'USERNAME_TAKEN' },
          { status: 409 }
        )
      }
      if (profileError.code === '22023' || profileError.message?.includes('USERNAME_INVALID')) {
        await serviceRole.auth.admin.deleteUser(data.user.id)
        return NextResponse.json(
          { error: 'El nombre de usuario no es valido', code: 'USERNAME_INVALID' },
          { status: 400 }
        )
      }

      await serviceRole.auth.admin.deleteUser(data.user.id)
      return NextResponse.json(
        { error: 'No se pudo crear el perfil', details: profileError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      user: data.user,
      needsConfirmation: !data.user?.confirmed_at,
    })

  } catch (error: any) {
    console.error('Error inesperado en signup:', error)
    return NextResponse.json(
      { error: error?.message || 'Error inesperado al crear la cuenta' },
      { status: 500 }
    )
  }
}
