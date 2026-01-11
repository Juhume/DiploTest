import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { FlashcardsView } from "@/components/flashcards-view"

export default async function FlashcardsPage() {
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
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Mis Flashcards</h1>
          <p className="text-lg text-muted-foreground">
            Preguntas guardadas para repasar. Estudia las que más te cuestan.
          </p>
        </div>
        <FlashcardsView />
      </div>
    </main>
  )
}
