import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, BookOpen, Trophy, History } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <header className="mb-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-2 text-primary">
              <GraduationCap className="h-12 w-12" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-3">Test de Oposición</h1>
          <p className="text-lg text-muted-foreground">Preparación para el Cuerpo Diplomático</p>
        </header>

        <div className="grid gap-6 md:grid-cols-3 mb-12">
          <Card>
            <CardHeader className="text-center">
              <BookOpen className="h-8 w-8 mx-auto text-primary mb-2" />
              <CardTitle className="text-lg">Modo Demo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Practica con preguntas de ejemplo para familiarizarte con el formato
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Trophy className="h-8 w-8 mx-auto text-primary mb-2" />
              <CardTitle className="text-lg">Modo Real</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Preguntas oficiales de exámenes de años anteriores
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <History className="h-8 w-8 mx-auto text-primary mb-2" />
              <CardTitle className="text-lg">Historial</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Revisa tus intentos anteriores y analiza tus errores
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/auth/login">Iniciar Sesión</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/auth/sign-up">Crear Cuenta</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
