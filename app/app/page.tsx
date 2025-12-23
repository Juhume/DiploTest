import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { TestSetup } from "@/components/test-setup"
import { AppHeader } from "@/components/app-header"

export default async function AppPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <AppHeader user={user} />
      <div className="container mx-auto px-4 py-10 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Panel de Control</h1>
          <p className="text-lg text-muted-foreground">Configura tu sesión de estudio y comienza a practicar.</p>
        </div>
        <TestSetup />
      </div>
    </main>
  )
}
