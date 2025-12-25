# DiploTest - Preparación de Oposiciones

Aplicación web completa para realizar tests de oposición con dos modos: **Demo** (preguntas de práctica) y **Real** (preguntas oficiales de exámenes anteriores).

## 🚀 Características Principales

### Funcionalidades
- ✅ **Autenticación completa** con Supabase (registro, login, logout, sesión persistente)
- ✅ **Dos modos de preguntas**: Demo (práctica) y Real (exámenes oficiales)
- ✅ **Tres modos de selección**: Pool completo, Aleatorio (N preguntas), Por tema/tag
- ✅ **Test interactivo** con navegación, atajos de teclado, progreso visual
- ✅ **Evaluación automática** con corrección detallada
- ✅ **Historial completo** de intentos con filtros por modo y fechas
- ✅ **Revisión detallada** pregunta por pregunta con respuestas correctas/incorrectas
- ✅ **Responsive design** optimizado para móvil y escritorio

### UX/UI
- 📱 **Mobile-first** con diseño específico para dispositivos móviles
- 💻 **Layout de 2 columnas en desktop** (pregunta + panel de navegación)
- ⌨️ **Atajos de teclado**: 1-4/A-D para seleccionar, Enter/Shift+Enter para navegar
- 🎨 **Tema claro/oscuro** con soporte automático del sistema
- ♿ **Accesible** con labels, focus visible, y estructura semántica

### Tecnologías
- **Frontend**: Next.js 14 (App Router), React, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes + Supabase
- **Base de datos**: PostgreSQL (Supabase)
- **Autenticación**: Supabase Auth
- **Validación**: Zod
- **UI Components**: shadcn/ui + Radix UI
- **Iconos**: Lucide React

---

## 📋 Requisitos Previos

- **Node.js** 18.x o superior
- **pnpm** (recomendado) o npm
- **Cuenta de Supabase** (gratuita en [supabase.com](https://supabase.com))

---

## 🛠️ Instalación y Configuración

### 1. Clonar e Instalar Dependencias

```bash
git clone https://github.com/Juhume/DiploTest.git
cd DiploTest
pnpm install
```

### 2. Configurar Supabase

#### 2.1 Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Espera a que se complete la inicialización del proyecto
4. Ve a **Settings > API** para obtener tus credenciales

#### 2.2 Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui

# Opcional: para redirección después de sign-up
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/app
```

**⚠️ IMPORTANTE**: Reemplaza los valores con los de tu proyecto de Supabase.

#### 2.3 Ejecutar Scripts SQL

Ve a **SQL Editor** en tu proyecto de Supabase y ejecuta los siguientes scripts en orden:

1. **scripts/001_create_attempts_table.sql** (si no se ejecutó automáticamente)
2. **scripts/002_update_attempts_with_user_and_mode.sql** (si existe)
3. **scripts/003_complete_schema.sql** ← **Script completo y actualizado**

El script `003_complete_schema.sql` crea:
- Tabla `attempts` con todos los campos necesarios
- Tabla `profiles` para información adicional de usuarios
- Índices para mejorar el rendimiento
- Row Level Security (RLS) policies para seguridad
- Trigger para crear perfil automáticamente al registrarse
- Vista `attempt_stats` para estadísticas

---

## 🚀 Ejecutar en Desarrollo

```bash
pnpm dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

### Rutas Principales

- `/` - Landing page (redirige a `/app` si está autenticado)
- `/auth/login` - Iniciar sesión
- `/auth/sign-up` - Registro de usuario
- `/app` - Configurar y comenzar test (protegida)
- `/test` - Realizar test (protegida)
- `/results/[id]` - Ver resultados detallados de un intento (protegida)
- `/history` - Historial de intentos (protegida)

---

## 📁 Estructura del Proyecto

```
DiploTest/
├── app/                        # Next.js App Router
│   ├── api/                    # API Routes (backend)
│   │   ├── attempts/           # CRUD de intentos
│   │   │   ├── route.ts        # GET (lista) y POST (crear)
│   │   │   └── [id]/route.ts   # GET (detalle) y DELETE
│   │   └── questions/          # Endpoint de preguntas
│   │       └── route.ts        # GET (con filtros) y OPTIONS (tags)
│   ├── auth/                   # Páginas de autenticación
│   │   ├── login/page.tsx
│   │   ├── sign-up/page.tsx
│   │   ├── sign-up-success/page.tsx
│   │   └── error/page.tsx
│   ├── app/page.tsx            # Configurar test
│   ├── test/page.tsx           # Realizar test
│   ├── results/[id]/page.tsx   # Resultados detallados
│   ├── history/page.tsx        # Historial de intentos
│   ├── layout.tsx              # Layout global
│   └── globals.css             # Estilos globales
├── components/                 # Componentes React
│   ├── ui/                     # Componentes de shadcn/ui
│   ├── app-header.tsx          # Header con usuario y logout
│   ├── test-setup.tsx          # Configuración del test
│   ├── test-runner.tsx         # Ejecutor del test (2 columnas desktop)
│   ├── question-card.tsx       # Tarjeta de pregunta
│   ├── navigation-panel.tsx    # Panel de navegación (desktop)
│   ├── mobile-navigation.tsx   # Navegación inferior (móvil)
│   ├── results-view.tsx        # Vista de resultados
│   ├── attempts-history.tsx    # Historial con filtros
│   └── theme-provider.tsx      # Proveedor de tema
├── lib/                        # Librerías y utilidades
│   ├── supabase/               # Clientes de Supabase
│   │   ├── client.ts           # Cliente para componentes
│   │   └── server.ts           # Cliente para Server Components
│   ├── types.ts                # Tipos TypeScript
│   ├── grading.ts              # Lógica de corrección
│   └── utils.ts                # Utilidades generales
├── data/                       # Datos de preguntas
│   ├── questions.demo.json     # Preguntas DEMO (práctica)
│   └── questions.real.json     # Preguntas REAL (exámenes oficiales)
├── scripts/                    # Scripts SQL para Supabase
│   └── 003_complete_schema.sql # Schema completo de la BD
├── middleware.ts               # Middleware de Next.js (protección rutas)
├── .env.local                  # Variables de entorno (crear manualmente)
├── next.config.mjs             # Configuración de Next.js
├── tailwind.config.ts          # Configuración de Tailwind
├── tsconfig.json               # Configuración de TypeScript
└── package.json                # Dependencias
```

---

## 📊 Esquema de Base de Datos

### Tabla: `attempts`

Almacena cada intento de test realizado por un usuario.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | uuid | PK, auto-generado |
| `user_id` | uuid | FK a `auth.users` |
| `created_at` | timestamptz | Fecha/hora del intento (UTC) |
| `question_mode` | text | "demo" o "real" |
| `selection_mode` | text | "all", "random", o "tag" |
| `selection_meta` | jsonb | `{ n?: number, tag?: string }` |
| `total_questions` | int | Total de preguntas |
| `correct_count` | int | Preguntas correctas |
| `wrong_count` | int | Preguntas incorrectas |
| `blank_count` | int | Preguntas en blanco |
| `percentage` | numeric(5,2) | Porcentaje de acierto |
| `duration_seconds` | int | Duración en segundos |
| `answers` | jsonb | `{ [questionId]: string[] }` |
| `grading` | jsonb | Detalles de corrección |
| `snapshot_questions` | jsonb | Copia de preguntas (opcional) |

### Row Level Security (RLS)

- ✅ Los usuarios **solo pueden ver, crear y editar sus propios intentos**
- ✅ Los intentos **no se pueden eliminar** (registro inmutable)
- ✅ Supabase Auth gestiona automáticamente el `user_id`

---

## 🔐 Autenticación

### Flujo de Autenticación

1. **Registro** (`/auth/sign-up`):
   - Email + contraseña
   - Supabase envía email de confirmación
   - Se crea automáticamente un perfil en `profiles`

2. **Login** (`/auth/login`):
   - Email + contraseña
   - Sesión persistente con cookies httpOnly

3. **Protección de Rutas** (`middleware.ts`):
   - Rutas protegidas: `/app`, `/test`, `/results`, `/history`
   - Redirección automática a `/auth/login` si no autenticado
   - Redirección a `/app` si ya autenticado e intenta acceder a `/auth/*`

4. **Logout**:
   - Botón en `AppHeader`
   - Cierra sesión y redirige a `/`

---

## 📝 Gestión de Preguntas

### Formato de Preguntas (JSON)

```json
{
  "id": "demo-q1",
  "stem": "¿Cuál es la pregunta?",
  "options": [
    { "id": "A", "text": "Opción A" },
    { "id": "B", "text": "Opción B" },
    { "id": "C", "text": "Opción C" },
    { "id": "D", "text": "Opción D" }
  ],
  "correct": ["B"],
  "tags": ["tema1", "tema2"],
  "multi": false
}
```

### Archivos de Preguntas

- **`data/questions.demo.json`**: Preguntas de práctica (inventadas/curadas)
- **`data/questions.real.json`**: Preguntas oficiales de exámenes anteriores

### Añadir/Actualizar Preguntas

1. Edita el archivo JSON correspondiente
2. Respeta el formato exacto
3. Para preguntas multi-respuesta: `"multi": true` y `"correct": ["A", "C"]`
4. Asigna tags para facilitar la selección por tema

**⚠️ Importante**: 
- Los IDs deben ser únicos dentro de cada modo
- Usa prefijo `demo-` para Demo y `real-YYYY-` para Real
- Mantén coherencia en los tags

---

## 🎮 Uso de la Aplicación

### 1. Configurar Test

En `/app`:
1. Selecciona **Modo**: Demo o Real
2. Elige **Selección**:
   - **Pool completo**: Todas las preguntas disponibles
   - **Aleatorio**: N preguntas al azar
   - **Por tema**: Filtrar por tag específico
3. Haz clic en **Comenzar Test**

### 2. Realizar Test

En `/test`:
- **Móvil**: Una columna con navegación inferior fija
- **Desktop**: Dos columnas (pregunta izq. + panel navegación der.)

**Atajos de Teclado** (desktop):
- `1-4` o `A-D`: Seleccionar opción (preguntas simples)
- `Enter`: Siguiente pregunta
- `Shift+Enter`: Pregunta anterior

### 3. Finalizar y Ver Resultados

- Haz clic en **Finalizar Test**
- Se guarda automáticamente en la BD
- Redirige a `/results/[id]` con:
  - Puntuación global
  - Desglose de aciertos/fallos/blanco
  - Revisión pregunta por pregunta
  - Filtros para ver solo correctas/incorrectas/blanco

### 4. Historial

En `/history`:
- Tabla/tarjetas con todos tus intentos
- **Filtros**:
  - Por modo (Demo/Real)
  - Por rango de fechas
- Haz clic en **Ver detalles** para revisar cualquier intento anterior

---

## 🧪 Testing

### Tests Unitarios (grading.ts)

```bash
# Instalar Vitest (opcional, si quieres añadir tests)
pnpm add -D vitest @testing-library/react @testing-library/jest-dom

# Ejecutar tests
pnpm test
```

Ejemplo de test para `gradeAttempt`:

```typescript
// lib/__tests__/grading.test.ts
import { describe, it, expect } from 'vitest'
import { gradeAttempt } from '../grading'

describe('gradeAttempt', () => {
  it('should grade correctly', () => {
    const questions = [
      { id: 'q1', correct: ['A'] },
      { id: 'q2', correct: ['B'] },
    ]
    const answers = { q1: ['A'], q2: ['C'] }
    const result = gradeAttempt(questions, answers)
    
    expect(result.correctCount).toBe(1)
    expect(result.wrongCount).toBe(1)
    expect(result.percentage).toBe(50)
  })
})
```

---

## 🚢 Despliegue

### Desplegar en Vercel (Recomendado)

1. **Conecta tu repositorio** en [vercel.com](https://vercel.com)
2. **Configura las variables de entorno**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Vercel detectará automáticamente Next.js y desplegará
4. **Configura el dominio** de producción en Supabase:
   - Ve a **Authentication > URL Configuration**
   - Añade tu dominio de Vercel a **Site URL** y **Redirect URLs**

### Otras Plataformas

- **Netlify**: Funciona con Next.js
- **Railway/Render**: Soportan Node.js y Next.js
- **Self-hosted**: Usa `pnpm build` y `pnpm start`

---

## 🔧 Configuración Avanzada

### Personalizar Tema

Edita `app/globals.css` para cambiar colores, fuentes, etc.

```css
@layer base {
  :root {
    --primary: ...;
    --secondary: ...;
  }
}
```

### Añadir Campos Personalizados

1. Edita el schema SQL (`scripts/003_complete_schema.sql`)
2. Ejecuta `ALTER TABLE` en Supabase SQL Editor
3. Actualiza tipos en `lib/types.ts`
4. Modifica componentes según necesidad

### Integrar con Otros Servicios

- **Analytics**: Añade Vercel Analytics, Google Analytics, etc.
- **Emails personalizados**: Configura SMTP en Supabase Auth
- **Backups**: Configura backups automáticos en Supabase

---

## 📚 API Reference

### GET `/api/questions`

Obtiene preguntas según filtros.

**Query Params**:
- `mode`: "demo" | "real" (default: "demo")
- `tag`: string (opcional, filtra por tag)
- `limit`: number (opcional, max 200)
- `random`: "true" | "false" (opcional, aleatoriza)

**Response**: `Question[]`

### OPTIONS `/api/questions`

Obtiene tags disponibles y conteo.

**Response**: `{ tags: string[], count: number }`

### GET `/api/attempts`

Obtiene intentos del usuario autenticado.

**Query Params**:
- `mode`: "demo" | "real" (opcional)
- `from`: ISO date (opcional)
- `to`: ISO date (opcional)

**Response**: `Attempt[]`

### POST `/api/attempts`

Crea un nuevo intento.

**Body**: Ver esquema en `app/api/attempts/route.ts` (validación con Zod)

**Response**: `Attempt` (201 Created)

### GET `/api/attempts/[id]`

Obtiene un intento específico (solo si pertenece al usuario).

**Response**: `Attempt`

---

## 🐛 Solución de Problemas

### Error: "Unauthorized" en API

- Verifica que estás autenticado (`/auth/login`)
- Revisa que las cookies de Supabase se estén enviando
- Comprueba RLS policies en Supabase

### Error: "No questions found"

- Verifica que los archivos JSON existan en `data/`
- Comprueba que el formato JSON sea válido
- Asegúrate de que haya preguntas para el modo/tag seleccionado

### Error: Middleware no protege rutas

- Verifica que `middleware.ts` esté en la raíz
- Revisa el `config.matcher` en middleware
- Asegúrate de que Next.js se reinició después de cambios

### Build Errors

```bash
# Limpia caché y reinstala
rm -rf .next node_modules pnpm-lock.yaml
pnpm install
pnpm build
```

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit: `git commit -m 'Add: nueva funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto es privado. Todos los derechos reservados.

---

## 👨‍💻 Autor

Desarrollado para la preparación de oposiciones.

---

## 📧 Soporte

Para preguntas o problemas, abre un issue en el repositorio o contacta a [tu-email@ejemplo.com].

---

**¡Buena suerte en tu preparación! 🎓🚀**
