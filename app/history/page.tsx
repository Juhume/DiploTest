import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { AttemptsHistory } from "@/components/attempts-history"
import type { Attempt } from "@/lib/types"

export default async function HistoryPage() {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch attempts - RLS ensures user only sees their own
  const { data: attempts, error } = await supabase
    .from("attempts")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching attempts:", error)
  }

  return (
    <main className="min-h-screen bg-background">
      <AppHeader user={user} />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Historial de Intentos</h1>
          <p className="text-muted-foreground mt-2">Revisa tus intentos anteriores y analiza tus resultados</p>
        </div>
        <AttemptsHistory attempts={(attempts as Attempt[]) || []} />
      </div>
    </main>
  )
}

