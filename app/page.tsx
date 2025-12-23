import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, BookOpen, Trophy, History, ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Hero Section */}
        <header className="mb-20 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-6 shadow-sm">
            <GraduationCap className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-foreground mb-4 tracking-tight">
            Diplo<span className="text-primary">Test</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-3 max-w-2xl mx-auto">
            Preparación para el Cuerpo Diplomático
          </p>
          <p className="text-base text-muted-foreground/80 max-w-xl mx-auto mb-8">
            Practica con preguntas reales, analiza tu progreso y prepárate con confianza para tu oposición.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg h-12 px-8 shadow-lg hover:shadow-xl transition-all">
              <Link href="/auth/login">
                Iniciar Sesión
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg h-12 px-8 border-2">
              <Link href="/auth/sign-up">
                Crear Cuenta
              </Link>
            </Button>
          </div>
        </header>

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-3 mb-16">
          <Card className="hover:shadow-lg transition-shadow duration-300 border-muted">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl w-fit">
                <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-xl">Modo Demo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center leading-relaxed">
                Practica con preguntas de ejemplo para familiarizarte con el formato del examen.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300 border-primary/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-bl-lg flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              REAL
            </div>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl w-fit">
                <Trophy className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
              <CardTitle className="text-xl">Modo Real</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center leading-relaxed">
                Preguntas oficiales de exámenes anteriores. Simula las condiciones reales del test.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300 border-muted">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-3 bg-green-100 dark:bg-green-900/30 rounded-xl w-fit">
                <History className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-xl">Historial</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center leading-relaxed">
                Revisa tus intentos anteriores, analiza tus errores y sigue tu progreso.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section
        <div className="text-center bg-card border rounded-2xl p-8 md:p-12 shadow-sm">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">¿Listo para comenzar?</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Únete a cientos de opositores que ya están preparándose con DiploTest.
          </p>
          <Button asChild size="lg" className="shadow-lg">
            <Link href="/auth/sign-up">
              Empezar Gratis
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div> */}
      </div>
    </main>
  )
}
