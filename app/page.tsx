import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  GraduationCap,
  BookOpen,
  Trophy,
  History,
  ArrowRight,
  Sparkles,
  Bookmark,
  RefreshCw,
  BarChart3,
  Clock,
} from "lucide-react"
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
            Preparación para la Carrera Diplomática
          </p>
          <p className="text-base text-muted-foreground/80 max-w-xl mx-auto mb-8">
            Simula exámenes reales, repasa errores, guarda flashcards y mide tu progreso con estadísticas.
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

          <div className="mt-10 grid gap-3 sm:grid-cols-3 max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 rounded-xl border bg-card p-3 text-sm text-muted-foreground">
              <Trophy className="h-4 w-4 text-amber-600" />
              Exámenes reales 2021-2024
            </div>
            <div className="flex items-center justify-center gap-2 rounded-xl border bg-card p-3 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 text-primary" />
              Simulación con tiempo oficial
            </div>
            <div className="flex items-center justify-center gap-2 rounded-xl border bg-card p-3 text-sm text-muted-foreground">
              <BarChart3 className="h-4 w-4 text-green-600" />
              Estadísticas y rachas de estudio
            </div>
          </div>
        </header>

        {/* Practice Modes */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-3">Modos de práctica</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Tres formas de entrenar: flexibilidad, realismo y volumen de preguntas.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="hover:shadow-lg transition-shadow duration-300 border-muted">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl w-fit">
                  <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-xl">Modo Demo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center leading-relaxed">
                  Elige pool completo, aleatorio o por tema para reforzar puntos concretos.
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
                <CardTitle className="text-xl">Examen Real</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center leading-relaxed">
                  Preguntas oficiales 2021-2024 con tiempo y nota de corte reales.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300 border-muted">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl w-fit">
                  <GraduationCap className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-xl">Práctica Academia</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center leading-relaxed">
                  Banco amplio de preguntas de academia con dificultad similar al examen.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Study Tools */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-3">Herramientas de estudio</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Todo lo necesario para practicar, revisar y mejorar de forma continua.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="hover:shadow-lg transition-shadow duration-300 border-muted">
              <CardHeader className="pb-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg w-fit">
                  <Bookmark className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <CardTitle className="text-lg">Flashcards</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Guarda preguntas clave, estudia una a una o en modo lista y repásalas cuando quieras.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300 border-muted">
              <CardHeader className="pb-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg w-fit">
                  <RefreshCw className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle className="text-lg">Repaso de errores</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Revisa automáticamente las preguntas que fallaste y refuerza tus puntos débiles.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300 border-muted">
              <CardHeader className="pb-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg w-fit">
                  <BarChart3 className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-lg">Estadísticas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Gráficos de progreso, predicción de nota, rachas y rendimiento por tema.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300 border-muted">
              <CardHeader className="pb-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg w-fit">
                  <History className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <CardTitle className="text-lg">Historial</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Filtra tus intentos por modo y fechas, y abre el detalle de cada test.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <div className="text-center bg-card border rounded-2xl p-8 md:p-12 shadow-sm">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">¿Listo para empezar?</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Crea tu cuenta y comienza a entrenar con preguntas reales, flashcards y estadísticas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="shadow-lg">
              <Link href="/auth/sign-up">
                Empezar ahora
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/auth/login">Ya tengo cuenta</Link>
            </Button>
          </div>
        </div>

      </div>
      <footer className="mt-12 border-t bg-background/95">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          Creado con ❤️ por{" "}
          <Link
            href="https://www.linkedin.com/in/juhume"
            className="font-medium text-primary hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            @juhume
          </Link>{" "}
          para todos los opositores a la Carrera Diplomática.
        </div>
      </footer>
    </main>
  )
}
