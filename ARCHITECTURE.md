# 🏗️ Arquitectura Técnica - Test Oposición

Documento técnico detallado de la arquitectura de la aplicación.

---

## 📐 Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  Next.js 14 (App Router) + React + TypeScript + Tailwind   │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Pages      │  │  Components  │  │     Hooks    │     │
│  │  (Server)    │  │   (Client)   │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      API LAYER                               │
│           Next.js API Routes (Serverless)                    │
│                                                              │
│  ┌─────────────────────────┐  ┌─────────────────────────┐  │
│  │   /api/questions        │  │   /api/attempts         │  │
│  │   GET (lista/filtros)   │  │   GET (lista) POST      │  │
│  │   OPTIONS (tags)        │  │   GET /:id DELETE /:id  │  │
│  └─────────────────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Supabase JS Client
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND / DATABASE                        │
│                  Supabase (PostgreSQL)                       │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Auth       │  │  Database    │  │   Storage    │     │
│  │ (Users, JWT) │  │ (attempts)   │  │  (Future)    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  Features: RLS, Triggers, Views, Indexes                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flujo de Datos

### 1. Autenticación

```
Usuario → Login Form
   ↓
Supabase Auth (signInWithPassword)
   ↓
JWT Token → Cookie httpOnly
   ↓
Middleware valida token en cada request
   ↓
Acceso concedido/denegado
```

### 2. Realizar Test

```
Usuario configura test → /app
   ↓
Server Component carga config
   ↓
TestSetup Component (client)
   ↓
GET /api/questions?mode=...&tag=...
   ↓
Questions JSON (demo/real)
   ↓
TestRunner muestra preguntas
   ↓
Usuario responde
   ↓
gradeAttempt() calcula resultados
   ↓
POST /api/attempts (guarda en BD)
   ↓
Redirect a /results/:id
```

### 3. Ver Historial

```
Usuario accede a /history
   ↓
Server Component autenticado
   ↓
Supabase query con RLS
   ↓
SELECT * FROM attempts WHERE user_id = ...
   ↓
AttemptsHistory Component con filtros (client)
   ↓
Usuario ve lista y puede filtrar
```

---

## 🗂️ Estructura de Carpetas Detallada

```
oposicion-test-app/
├── app/                           # Next.js App Router
│   ├── (root)/                    # Grupo de rutas públicas
│   │   └── page.tsx               # Landing page
│   ├── api/                       # API Routes (Backend)
│   │   ├── attempts/
│   │   │   ├── route.ts           # GET (lista), POST (crear)
│   │   │   └── [id]/route.ts      # GET (detalle), DELETE
│   │   └── questions/
│   │       └── route.ts           # GET (con filtros), OPTIONS
│   ├── auth/                      # Rutas de autenticación
│   │   ├── login/page.tsx
│   │   ├── sign-up/page.tsx
│   │   ├── sign-up-success/page.tsx
│   │   └── error/page.tsx
│   ├── app/                       # Configurar test (protegida)
│   │   └── page.tsx
│   ├── test/                      # Realizar test (protegida)
│   │   └── page.tsx
│   ├── results/[id]/              # Resultados (protegida)
│   │   └── page.tsx
│   ├── history/                   # Historial (protegida)
│   │   └── page.tsx
│   ├── layout.tsx                 # Root layout
│   └── globals.css                # Estilos globales
│
├── components/                    # Componentes React
│   ├── ui/                        # Primitivos de shadcn/ui
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ... (40+ componentes)
│   ├── app-header.tsx             # Header con user y logout
│   ├── test-setup.tsx             # Configuración del test
│   ├── test-runner.tsx            # Ejecutor del test
│   ├── question-card.tsx          # Tarjeta de pregunta
│   ├── navigation-panel.tsx       # Panel lateral (desktop)
│   ├── mobile-navigation.tsx      # Nav inferior (móvil)
│   ├── results-view.tsx           # Vista de resultados
│   ├── attempts-history.tsx       # Historial con filtros
│   └── theme-provider.tsx         # Proveedor de tema
│
├── lib/                           # Lógica de negocio
│   ├── supabase/
│   │   ├── client.ts              # Cliente para Client Components
│   │   └── server.ts              # Cliente para Server Components
│   ├── types.ts                   # Tipos TypeScript compartidos
│   ├── grading.ts                 # Lógica de corrección
│   └── utils.ts                   # Utilidades (cn, etc.)
│
├── data/                          # Datos estáticos
│   ├── questions.demo.json        # 20+ preguntas DEMO
│   └── questions.real.json        # 20+ preguntas REAL
│
├── scripts/                       # Scripts SQL
│   └── 003_complete_schema.sql    # Schema completo de BD
│
├── middleware.ts                  # Middleware de autenticación
├── .env.local                     # Variables de entorno (local)
├── .env.example                   # Template de env vars
├── next.config.mjs                # Config de Next.js
├── tailwind.config.ts             # Config de Tailwind
├── tsconfig.json                  # Config de TypeScript
├── package.json                   # Dependencias
├── README.md                      # Documentación principal
├── QUICKSTART.md                  # Guía rápida
├── DEPLOYMENT.md                  # Guía de despliegue
└── ARCHITECTURE.md                # Este archivo
```

---

## 🔐 Seguridad

### Row Level Security (RLS)

Todas las queries a la BD pasan por RLS policies:

```sql
-- Los usuarios solo ven sus propios intentos
CREATE POLICY "Users can view own attempts"
  ON attempts FOR SELECT
  USING (auth.uid() = user_id);

-- Los usuarios solo pueden crear sus propios intentos
CREATE POLICY "Users can insert own attempts"
  ON attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- NO se pueden actualizar o eliminar intentos (inmutables)
CREATE POLICY "Users cannot update attempts"
  ON attempts FOR UPDATE USING (false);

CREATE POLICY "Users cannot delete attempts"
  ON attempts FOR DELETE USING (false);
```

### Middleware de Autenticación

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  // Verifica token de Supabase en cada request
  const { user } = await supabase.auth.getUser()
  
  // Protege rutas
  if (isProtectedRoute && !user) {
    return NextResponse.redirect('/auth/login')
  }
  
  return NextResponse.next()
}
```

### Validación de Datos

```typescript
// Todas las APIs validan con Zod
const attemptSchema = z.object({
  question_mode: z.enum(["demo", "real"]),
  selection_mode: z.enum(["all", "random", "tag"]),
  // ...
})

const validatedData = attemptSchema.parse(body)
```

---

## 📊 Modelo de Datos

### Tabla: attempts

```typescript
interface Attempt {
  id: string                           // UUID (PK)
  user_id: string                      // UUID (FK → auth.users)
  created_at: string                   // timestamptz
  question_mode: "demo" | "real"       // Tipo de preguntas
  selection_mode: "all"|"random"|"tag" // Modo de selección
  selection_meta: {                    // Metadatos de selección
    n?: number                         // Para modo random
    tag?: string                       // Para modo tag
  }
  total_questions: number              // Total de preguntas
  correct_count: number                // Aciertos
  wrong_count: number                  // Fallos
  blank_count: number                  // En blanco
  percentage: number                   // Porcentaje (0-100)
  duration_seconds: number             // Duración en segundos
  answers: Record<string, string[]>    // { qId: [optionIds] }
  grading: Record<string, {            // Detalles de corrección
    correct: string[]
    chosen: string[]
    status: "correct"|"wrong"|"blank"
  }>
  snapshot_questions?: Question[]      // Copia de preguntas (opcional)
}
```

### Formato de Preguntas

```typescript
interface Question {
  id: string                    // "demo-q1", "real-2023-q1"
  stem: string                  // Enunciado de la pregunta
  options: QuestionOption[]     // Opciones de respuesta
  correct: string[]             // IDs de opciones correctas
  tags?: string[]               // Tags para filtrar
  multi?: boolean               // ¿Múltiple respuesta?
}

interface QuestionOption {
  id: string                    // "A", "B", "C", "D"
  text: string                  // Texto de la opción
}
```

---

## 🎨 Sistema de Diseño

### Tailwind + shadcn/ui

- **Base**: Tailwind CSS 3.x con soporte para dark mode
- **Componentes**: shadcn/ui (Radix UI primitives)
- **Colores**: Sistema de tokens CSS variables
- **Tipografía**: Sans-serif system fonts
- **Responsive**: Mobile-first con breakpoints:
  - `sm`: 640px
  - `md`: 768px
  - `lg`: 1024px (cambio a 2 columnas)
  - `xl`: 1280px
  - `2xl`: 1536px

### Breakpoint Principal: `lg` (1024px)

```tsx
{/* Mobile: 1 columna */}
<div className="lg:hidden">
  <QuestionCard />
  <MobileNavigation />
</div>

{/* Desktop: 2 columnas */}
<div className="hidden lg:flex">
  <div className="flex-1">
    <QuestionCard />
  </div>
  <div className="w-80">
    <NavigationPanel />
  </div>
</div>
```

---

## ⚡ Optimizaciones de Performance

### Server Components por Defecto

```tsx
// app/history/page.tsx (Server Component)
export default async function HistoryPage() {
  const attempts = await fetchAttempts() // Server-side
  return <AttemptsHistory attempts={attempts} />
}
```

### Client Components Solo Cuando Necesario

```tsx
// components/test-runner.tsx
"use client" // Solo porque usa state, effects, etc.

export function TestRunner() {
  const [answers, setAnswers] = useState({})
  // ...
}
```

### Lazy Loading de Rutas

Next.js carga rutas automáticamente con code-splitting.

### Imágenes Optimizadas

```tsx
import Image from "next/image"

<Image 
  src="/logo.svg" 
  alt="Logo"
  width={100}
  height={100}
/>
```

---

## 🧪 Testing (Futuro)

### Setup de Tests

```bash
pnpm add -D vitest @testing-library/react @testing-library/jest-dom
```

### Estructura de Tests

```
lib/
└── __tests__/
    ├── grading.test.ts
    ├── utils.test.ts
    └── ...

components/
└── __tests__/
    ├── QuestionCard.test.tsx
    ├── TestRunner.test.tsx
    └── ...
```

### Ejemplo de Test

```typescript
// lib/__tests__/grading.test.ts
import { describe, it, expect } from 'vitest'
import { gradeAttempt } from '../grading'

describe('gradeAttempt', () => {
  it('calcula correctamente los aciertos', () => {
    const questions = [
      { id: 'q1', correct: ['A'], /* ... */ },
      { id: 'q2', correct: ['B'], /* ... */ },
    ]
    const answers = { q1: ['A'], q2: ['B'] }
    
    const result = gradeAttempt(questions, answers)
    
    expect(result.correctCount).toBe(2)
    expect(result.percentage).toBe(100)
  })
})
```

---

## 🔄 CI/CD (Recomendado)

### GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm build
      - run: pnpm test
```

---

## 📈 Escalabilidad

### Horizontalmente

- Next.js serverless functions escalan automáticamente en Vercel
- Supabase escala con plan de pago

### Caching

- Next.js cache automático de Server Components
- Supabase PostgREST cache de queries repetitivas

### Posibles Mejoras Futuras

1. **Redis** para cache de preguntas frecuentes
2. **CDN** para assets estáticos
3. **Edge Functions** para latencia ultra-baja
4. **Replication** de Supabase para multi-región

---

## 🛠️ Stack Tecnológico Completo

| Capa | Tecnología | Versión |
|------|-----------|---------|
| **Frontend Framework** | Next.js | 15.x |
| **UI Library** | React | 19.x |
| **Language** | TypeScript | 5.x |
| **Styling** | Tailwind CSS | 3.x |
| **UI Components** | shadcn/ui + Radix UI | Latest |
| **Icons** | Lucide React | Latest |
| **Backend** | Next.js API Routes | 15.x |
| **Database** | PostgreSQL (Supabase) | 15.x |
| **Auth** | Supabase Auth | Latest |
| **Validation** | Zod | 3.x |
| **Package Manager** | pnpm | 8.x |
| **Deployment** | Vercel | N/A |

---

## 📞 Contacto Técnico

Para preguntas técnicas o contribuciones, contacta a [tu-email@ejemplo.com].

---

**Última actualización**: Diciembre 2024
