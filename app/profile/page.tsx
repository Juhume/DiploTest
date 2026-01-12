import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { ProfileSettings } from "@/components/profile-settings"
import { KofiButton } from "@/components/kofi-button"

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username,email")
    .eq("id", user.id)
    .single()

  const metadata = user.user_metadata as { username?: string; display_name?: string } | null
  const username = profile?.username || metadata?.username || metadata?.display_name || ""
  const email = user.email || profile?.email || ""

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <AppHeader user={user} />
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Perfil</h1>
          <p className="text-lg text-muted-foreground">
            Actualiza tu nombre de usuario, correo y contrasena de forma segura.
          </p>
        </div>
        <div className="relative">
          <div className="pointer-events-none select-none blur-sm opacity-60" aria-hidden="true">
            <ProfileSettings initialUsername={username} initialEmail={email} />
          </div>
          <div className="absolute inset-0 flex items-center justify-center px-4">
            <div className="max-w-lg rounded-2xl border bg-background/95 p-6 text-center shadow-lg backdrop-blur">
              <h2 className="text-xl font-semibold mb-3">Modificaciones de perfil temporalmente inactivas</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Actualmente la funcion de modificacion del perfil no está disponible, somos un proyecto pequeño que
                necesita de donaciones para seguir implementando ideas que tenemos pendientes
              </p>
              <KofiButton />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
