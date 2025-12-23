'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function signUp(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const repeatPassword = formData.get('repeatPassword') as string

  // Validaciones
  if (!email || !password || !repeatPassword) {
    return { error: 'Todos los campos son obligatorios' }
  }

  if (password !== repeatPassword) {
    return { error: 'Las contraseñas no coinciden' }
  }

  if (password.length < 6) {
    return { error: 'La contraseña debe tener al menos 6 caracteres' }
  }

  // Intentar crear usuario
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    console.error('Error en signUp:', error)
    return { error: error.message }
  }

  // Si el usuario se creó correctamente
  if (data.user) {
    revalidatePath('/', 'layout')
    
    // Si el email está confirmado, redirigir a app
    if (data.user.confirmed_at) {
      redirect('/app')
    } else {
      // Si necesita confirmar email, redirigir a página de éxito
      redirect('/auth/sign-up-success')
    }
  }

  return { error: 'Error desconocido al crear la cuenta' }
}

export async function signIn(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // Validaciones
  if (!email || !password) {
    return { error: 'Email y contraseña son obligatorios' }
  }

  // Intentar iniciar sesión
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('Error en signIn:', error)
    
    if (error.message.includes('Invalid login credentials')) {
      return { error: 'Email o contraseña incorrectos' }
    }
    if (error.message.includes('Email not confirmed')) {
      return { error: 'Por favor confirma tu email antes de iniciar sesión' }
    }
    
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/app')
}

export async function signOut() {
  const supabase = await createClient()
  
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    console.error('Error en signOut:', error)
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/auth/login')
}
