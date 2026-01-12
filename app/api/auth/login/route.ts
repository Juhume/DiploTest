import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
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
    let profileId: string | null = null
    let profileEmail: string | null = null
    let serviceRole: ReturnType<typeof createServiceRoleClient> | null = null

    // Si no es email, buscar el email asociado al username
    if (!isEmail) {
      serviceRole = createServiceRoleClient()
      const { data: profile, error: profileError } = await serviceRole
        .from('profiles')
        .select('id,email')
        .eq('username', email.toLowerCase())
        .single()

      if (profile && !profileError) {
        loginEmail = profile.email
        profileId = profile.id
        profileEmail = profile.email
      } else {
        // Backfill: buscar en auth.users metadata para usuarios legacy sin profile
        const normalized = email.toLowerCase()
        const { data: legacyUsers, error: legacyError } = await serviceRole
          .schema('auth')
          .from('users')
          .select('id,email')
          .or(
            `raw_user_meta_data->>username.ilike.${normalized},raw_user_meta_data->>display_name.ilike.${normalized}`
          )

        if (legacyError || !legacyUsers || legacyUsers.length === 0) {
          return NextResponse.json(
            { error: 'Usuario o contraseña incorrectos' },
            { status: 401 }
          )
        }

        if (legacyUsers.length > 1) {
          return NextResponse.json(
            { error: 'Usuario o contraseña incorrectos' },
            { status: 401 }
          )
        }

        const legacyUser = legacyUsers[0]
        const { error: profileCreateError } = await serviceRole.rpc('create_profile', {
          p_user_id: legacyUser.id,
          p_username: normalized,
        })

        if (profileCreateError) {
          return NextResponse.json(
            { error: 'Usuario o contraseña incorrectos' },
            { status: 401 }
          )
        }

        loginEmail = legacyUser.email
      }
    }

    // Intentar iniciar sesión con el email
    const signIn = async (emailToUse: string) =>
      supabase.auth.signInWithPassword({
        email: emailToUse,
        password,
      })

    let { data, error } = await signIn(loginEmail)

    if (
      error &&
      !isEmail &&
      error.message.includes('Invalid login credentials') &&
      profileId &&
      serviceRole
    ) {
      const { data: authUser, error: authUserError } = await serviceRole
        .schema('auth')
        .from('users')
        .select('email')
        .eq('id', profileId)
        .single()

      if (!authUserError && authUser?.email && authUser.email !== loginEmail) {
        loginEmail = authUser.email
        const retry = await signIn(loginEmail)
        data = retry.data
        error = retry.error

        if (!error) {
          await serviceRole
            .from('profiles')
            .update({ email: loginEmail })
            .eq('id', profileId)
        }
      }
    }

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

    if (profileId && serviceRole && data?.user?.email && profileEmail !== data.user.email) {
      await serviceRole.from('profiles').update({ email: data.user.email }).eq('id', profileId)
    }

    return NextResponse.json({
      success: true,
      user: data.user,
    })

  } catch (error: any) {
    console.error('Error inesperado en login:', error)
    return NextResponse.json(
      { error: error?.message || 'Error inesperado al iniciar sesión' },
      { status: 500 }
    )
  }
}
