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
    <main className="min-h-screen bg-background">
      <AppHeader user={user} />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <TestSetup />
      </div>
    </main>
  )
}
