"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { GraduationCap, User, LogOut, History, BarChart3, MessageSquare, Bookmark, HelpCircle, Home } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { ThemeToggle } from "@/components/theme-toggle"
import { FeedbackDialog } from "@/components/feedback-dialog"
import { FeedbackToast } from "@/components/feedback-toast"
import { useEffect, useState } from "react"

interface AppHeaderProps {
  user: SupabaseUser
}

export function AppHeader({ user }: AppHeaderProps) {
  const router = useRouter()
  const [displayName, setDisplayName] = useState(() => {
    const metadata = user.user_metadata as { username?: string; display_name?: string } | null
    return metadata?.username || metadata?.display_name || "Usuario"
  })

  useEffect(() => {
    let ignore = false
    const supabase = createClient()

    const loadProfile = async () => {
      const { data } = await supabase.from("profiles").select("username").eq("id", user.id).single()
      if (!ignore && data?.username) {
        setDisplayName(data.username)
      }
    }

    loadProfile()
    return () => {
      ignore = true
    }
  }, [user.id])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-sm">
      <FeedbackToast />
      <div className="container mx-auto px-4 h-16 max-w-6xl flex items-center justify-between">
        <Link href="/app" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity group">
          <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/15 transition-colors">
            <GraduationCap className="h-5 w-5 text-primary" />
          </div>
          <span className="font-bold text-lg tracking-tight hidden sm:inline">
            Diplo<span className="text-primary">Test</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild className="hidden md:flex">
            <Link href="/app">
              <Home className="h-4 w-4 mr-2" />
              Inicio
            </Link>
          </Button>

          <Button variant="ghost" size="sm" asChild className="hidden md:flex">
            <Link href="/stats">
              <BarChart3 className="h-4 w-4 mr-2" />
              Estadísticas
            </Link>
          </Button>

          <Button variant="ghost" size="sm" asChild className="hidden md:flex">
            <Link href="/history">
              <History className="h-4 w-4 mr-2" />
              Historial
            </Link>
          </Button>

          <Button variant="ghost" size="sm" asChild className="hidden md:flex">
            <Link href="/flashcards">
              <Bookmark className="h-4 w-4 mr-2" />
              Mis Flashcards
            </Link>
          </Button>

          <Button variant="ghost" size="sm" asChild className="hidden md:flex">
            <Link href="/guide">
              <HelpCircle className="h-4 w-4 mr-2" />
              Guía
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <div className="bg-primary/10 p-1 rounded-full">
                  <User className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="max-w-32 truncate text-sm">{displayName}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link href="/app">
                  <Home className="h-4 w-4 mr-2" />
                  Inicio
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <User className="h-4 w-4 mr-2" />
                  Mi perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/stats">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Mis estadísticas
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/history">
                  <History className="h-4 w-4 mr-2" />
                  Mi historial
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/flashcards">
                  <Bookmark className="h-4 w-4 mr-2" />
                  Mis Flashcards
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/guide">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Guía de uso
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="font-normal p-0">
                <ThemeToggle />
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <FeedbackDialog>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Enviar feedback
                </DropdownMenuItem>
              </FeedbackDialog>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
