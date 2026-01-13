import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { AppHeader } from "@/components/app-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { KofiButton } from "@/components/kofi-button"
import {
  BookOpen,
  Trophy,
  GraduationCap,
  RefreshCw,
  Clock,
  Bookmark,
  BarChart3,
  History,
  Keyboard,
  HelpCircle,
  MessageSquare,
  ShieldCheck,
  LogOut,
  Filter,
  Heart,
} from "lucide-react"

export default async function GuidePage() {
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
      <div className="container mx-auto px-4 py-10 max-w-6xl space-y-10">
        <section className="space-y-4">
          <Badge variant="secondary">Guía de uso</Badge>
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Todo lo que puedes hacer en DiploTest</h1>
            <p className="text-lg text-muted-foreground">
              Esta guía resume las funciones clave para que aproveches al máximo tu preparación.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="#primeros-pasos">Primeros pasos</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="#modos">Modos</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="#configuracion">Configurar test</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="#test">Durante el test</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="#resultados">Resultados</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="#flashcards">Flashcards</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="#historial">Historial</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="#estadisticas">Estadísticas</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="#personalizacion">Personalización</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="#cuenta">Cuenta</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="#faq">FAQ</Link>
            </Button>
          </div>
        </section>

        <section id="primeros-pasos" className="scroll-mt-24">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <HelpCircle className="h-5 w-5 text-primary" />
                Guía rápida en 3 pasos
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border bg-background p-4">
                <p className="text-sm font-semibold text-primary mb-2">1. Elige un modo</p>
                <p className="text-sm text-muted-foreground">
                  Demo para práctica flexible, Real para simulación oficial, o Academia para banco ampliado.
                </p>
              </div>
              <div className="rounded-lg border bg-background p-4">
                <p className="text-sm font-semibold text-primary mb-2">2. Configura el test</p>
                <p className="text-sm text-muted-foreground">
                  Ajusta cantidad, tema o convocatoria según el modo y comienza cuando estés listo.
                </p>
              </div>
              <div className="rounded-lg border bg-background p-4">
                <p className="text-sm font-semibold text-primary mb-2">3. Revisa y guarda</p>
                <p className="text-sm text-muted-foreground">
                  Revisa respuestas, guarda dudas en flashcards y consulta tus estadísticas.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section id="modos" className="scroll-mt-24 space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Modos de práctica</h2>
            <p className="text-muted-foreground">
              Cada modo está pensado para un tipo de entrenamiento distinto.
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BookOpen className="h-4 w-4 text-primary" />
                  Modo Demo
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>90 preguntas de muestra con explicaciones detalladas.</p>
                <p>Incluye preguntas de respuesta múltiple. No computa en estadísticas.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Trophy className="h-4 w-4 text-green-600" />
                  Examen Real
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>Preguntas oficiales 2021-2024.</p>
                <p>100 preguntas, 2h 15min y nota de corte 5,8.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <GraduationCap className="h-4 w-4 text-purple-600" />
                  Práctica Academia
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>Más de 1400 preguntas de academias preparatorias.</p>
                <p>Elige cantidad de preguntas y practica con tiempo y puntuación realista.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="configuracion" className="scroll-mt-24 space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Configurar un test</h2>
            <p className="text-muted-foreground">
              Las opciones cambian según el modo seleccionado.
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Opciones en Demo</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <ul className="list-disc space-y-1 pl-5">
                  <li>Elige entre 10, 15, 25 o 50 preguntas de práctica.</li>
                  <li>Incluye preguntas de respuesta múltiple (varias correctas).</li>
                  <li>Todas las preguntas tienen explicaciones detalladas.</li>
                  <li>No afecta a tus estadísticas - ideal para aprender.</li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Opciones en Real y Academia</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <ul className="list-disc space-y-1 pl-5">
                  <li>En modo Real: 100 preguntas oficiales de convocatorias pasadas.</li>
                  <li>En modo Academia: elige entre 10, 25, 50, 75 o 100 preguntas.</li>
                  <li>Tiempo límite de 2h 15min con cronómetro activo.</li>
                  <li>Puntuación oficial: 0,10 por acierto, sin penalización.</li>
                </ul>
              </CardContent>
            </Card>
          </div>
          <Alert>
            <RefreshCw className="h-4 w-4" />
            <AlertTitle>Repaso de errores</AlertTitle>
            <AlertDescription>
              Cuando acumulas fallos, aparece una sección para repasar solo las preguntas que todavía no has corregido.
            </AlertDescription>
          </Alert>
        </section>

        <section id="test" className="scroll-mt-24 space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Durante el test</h2>
            <p className="text-muted-foreground">
              Controla el tiempo, navega rápido y decide cuándo finalizar.
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-4 w-4 text-primary" />
                  Temporizador
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>Activo en modos Real y Academia (135 minutos).</p>
                <p>Si el tiempo termina, el test se envía automáticamente.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Keyboard className="h-4 w-4 text-primary" />
                  Navegación y atajos
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>Enter avanza, Shift+Enter retrocede.</p>
                <p>1-4 o A-D seleccionan opciones en preguntas de respuesta única.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Filter className="h-4 w-4 text-primary" />
                  Panel de navegación
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>Salta directamente a cualquier pregunta y visualiza cuáles están respondidas.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <LogOut className="h-4 w-4 text-destructive" />
                  Salir del test
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>Usa "Salir" si quieres abandonar sin guardar el intento.</p>
                <p>El botón "Finalizar" sí guarda tu progreso y resultados.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="resultados" className="scroll-mt-24 space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Resultados y revisión</h2>
            <p className="text-muted-foreground">
              Analiza tu rendimiento y aprende de cada respuesta.
            </p>
          </div>
          <Card>
            <CardContent className="py-6 text-sm text-muted-foreground">
              <ul className="list-disc space-y-1 pl-5">
                <li>Resumen de aciertos, fallos, blancos y tiempo total.</li>
                <li>Filtros para revisar solo correctas, incorrectas o en blanco.</li>
                <li>Explicaciones detalladas y respuesta correcta resaltada.</li>
                <li>Botón para guardar preguntas en flashcards.</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        <section id="flashcards" className="scroll-mt-24 space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Flashcards</h2>
            <p className="text-muted-foreground">
              Guarda las preguntas clave y repásalas cuando quieras.
            </p>
          </div>
          <Card>
            <CardContent className="py-6 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <Bookmark className="h-4 w-4 text-primary" />
                Guarda desde los resultados y accede en "Mis Flashcards".
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Modo estudio con una tarjeta a la vez y opción de mostrar la respuesta.</li>
                <li>Modo lista para ver todas las tarjetas seguidas.</li>
                <li>Mezcla y elimina tarjetas según tu prioridad.</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        <section id="historial" className="scroll-mt-24 space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Historial de intentos</h2>
            <p className="text-muted-foreground">
              Accede a todos tus tests anteriores y filtra por modo o fechas.
            </p>
          </div>
          <Card>
            <CardContent className="py-6 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <History className="h-4 w-4 text-primary" />
                Consulta resultados pasados y abre el detalle de cada intento.
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Filtros por modo y rango de fechas.</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        <section id="estadisticas" className="scroll-mt-24 space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Estadísticas</h2>
            <p className="text-muted-foreground">
              Seguimiento de progreso, rendimiento por tema y recomendaciones.
            </p>
          </div>
          <Card>
            <CardContent className="py-6 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Métricas globales, evolución temporal y puntos débiles.
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Predicción de nota y rachas de estudio.</li>
                <li>Rendimiento por tema cuando hay suficientes intentos.</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        <section id="personalizacion" className="scroll-mt-24 space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Personalización</h2>
            <p className="text-muted-foreground">
              Ajusta la experiencia a tu forma de estudiar.
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tema claro/oscuro</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>Elige claro, oscuro o automático (según tu sistema).</p>
                <p>El modo automático indica si está usando claro u oscuro.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Feedback</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  Envía sugerencias, errores o mejoras desde el menú de usuario.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="cuenta" className="scroll-mt-24 space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Cuenta y acceso</h2>
            <p className="text-muted-foreground">
              Gestión de sesión y recuperación de acceso.
            </p>
          </div>
          <Card>
            <CardContent className="py-6 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Inicia sesión con email o nombre de usuario.
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Recuperación de contraseña desde la pantalla de acceso.</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        <section id="faq" className="scroll-mt-24 space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Preguntas frecuentes</h2>
          </div>
          <Card>
            <CardContent className="py-6">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>¿Se guarda un test si cierro la página?</AccordionTrigger>
                  <AccordionContent>
                    Solo se guarda cuando finalizas el test o cuando el tiempo expira en modo Real/Academia.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>¿Cómo repaso mis errores?</AccordionTrigger>
                  <AccordionContent>
                    En el panel de configuración aparece "Repaso de errores" cuando tienes fallos pendientes.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>¿Dónde encuentro mis flashcards?</AccordionTrigger>
                  <AccordionContent>
                    En el menú superior "Mis Flashcards" o desde los botones de resultados.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </section>

        <section id="apoyo" className="scroll-mt-24 space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Apoya el proyecto</h2>
            <p className="text-muted-foreground">
              DiploTest es un proyecto independiente que necesita tu ayuda para seguir creciendo.
            </p>
          </div>
          <Card className="border-2 border-pink-500/20 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20">
            <CardContent className="py-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1 text-center md:text-left">
                  <p className="flex items-center justify-center md:justify-start gap-2 text-lg font-semibold text-pink-700 dark:text-pink-400 mb-2">
                    <Heart className="h-5 w-5 fill-current" />
                    Ayúdanos a seguir mejorando
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Somos un proyecto pequeño que necesita de donaciones para seguir implementando
                    nuevas funcionalidades. Tu apoyo nos permite dedicar más tiempo a mejorar la plataforma.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <KofiButton />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="pb-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <p className="text-lg font-semibold">¿Listo para empezar?</p>
                <p className="text-sm text-muted-foreground">
                  Vuelve al panel y configura tu próximo test.
                </p>
              </div>
              <Button asChild>
                <Link href="/app">Ir al panel</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
      <footer className="border-t bg-background/95">
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
          para todos los opositores del Cuerpo Diplomático.
        </div>
      </footer>
    </main>
  )
}
