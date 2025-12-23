import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = await createClient()
    
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Error en signOut:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Error inesperado en logout:', error)
    return NextResponse.json(
      { error: error?.message || 'Error inesperado al cerrar sesión' },
      { status: 500 }
    )
  }
}
