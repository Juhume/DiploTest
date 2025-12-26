# 🎓 DiploTest - Plataforma de Preparación para Oposiciones

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Auth_+_DB-3ECF8E?style=for-the-badge&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)

**Una aplicación web moderna y completa para la preparación de exámenes tipo test de oposiciones.**

[🚀 Demo en Vivo](#) · [📚 Documentación](./RESUMEN_PROYECTO.md) · [🏗️ Arquitectura](./ARCHITECTURE.md)

</div>

---

## 📋 Tabla de Contenidos

- [Sobre el Proyecto](#-sobre-el-proyecto)
- [Características Principales](#-características-principales)
- [Stack Tecnológico](#️-stack-tecnológico)
- [Arquitectura](#️-arquitectura)
- [Instalación](#-instalación)
- [Uso de la Aplicación](#-uso-de-la-aplicación)
- [Seguridad](#-seguridad)
- [Rendimiento](#-rendimiento)
- [Roadmap](#️-roadmap)

---

## 🎯 Sobre el Proyecto

**DiploTest** es una aplicación web full-stack diseñada para ayudar a opositores en su preparación para las pruebas del Cuerpo Diplomático. La plataforma ofrece una experiencia de práctica realista con dos modos de estudio (Demo y Real), sistema de evaluación automática, historial completo de intentos y estadísticas de rendimiento.

### 🌟 ¿Por qué DiploTest?

- **💯 Experiencia realista**: Interfaz que simula el entorno de examen oficial
- **📊 Seguimiento completo**: Historial detallado de todos tus intentos con análisis de resultados
- **🎨 Diseño moderno**: UI/UX profesional con soporte para temas claro/oscuro
- **📱 Responsive**: Funciona perfectamente en móvil, tablet y desktop
- **⚡ Alto rendimiento**: Optimizado con Next.js 16 y Turbopack
- **🔒 Seguro**: Autenticación robusta y protección de datos con Supabase

---

## ✨ Características Principales

### 🔐 Sistema de Autenticación Completo
- Registro e inicio de sesión con email/contraseña
- Recuperación de contraseña
- Persistencia de sesión con cookies HTTP-only seguras
- Protección de rutas con middleware
- Rate limiting para prevenir ataques de fuerza bruta

### 📚 Banco de Preguntas Inteligente
- **Modo DEMO**: Preguntas de práctica para familiarizarse con el sistema
- **Modo REAL**: Preguntas basadas en exámenes oficiales
- Soporte para preguntas de opción única y opción múltiple
- Sistema de etiquetas para organizar por temáticas
- Selección aleatoria o por categorías específicas

### 📝 Realización de Tests Avanzada
- Configuración flexible del test (modo, número de preguntas, filtros)
- Navegación completa entre preguntas (siguiente, anterior, saltar)
- Progreso visual con indicadores de estado
- Atajos de teclado para mayor agilidad (1-4/A-D, Enter, Shift+Enter)
- Timer de duración del intento
- Vista previa antes de finalizar
- Evaluación automática con resultados detallados

### 📊 Historial y Estadísticas
- Registro completo de todos los intentos realizados
- Análisis detallado: aciertos, fallos, preguntas en blanco, porcentaje
- Visualización de respuestas correctas e incorrectas
- Filtrado por modo y fecha
- Estadísticas globales de rendimiento

### 🎨 Experiencia de Usuario
- **Diseño Responsive**: Layout adaptativo según dispositivo
  - **Móvil**: Vista de una columna con navegación inferior flotante
  - **Desktop**: Vista de dos columnas con panel lateral de navegación
- **Temas**: Soporte para modo claro y oscuro
- **Accesibilidad**: Componentes accesibles con Radix UI
- **Animaciones**: Transiciones suaves y feedback visual
- **Feedback en tiempo real**: Estados de carga, errores y éxitos

---

## 🛠️ Stack Tecnológico

### Frontend
- **[Next.js 16](https://nextjs.org/)** - Framework React con App Router y Turbopack
- **[React 19](https://react.dev/)** - Biblioteca UI con Server Components
- **[TypeScript 5](https://www.typescriptlang.org/)** - Tipado estático para mayor robustez
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Framework CSS utility-first moderno
- **[Radix UI](https://www.radix-ui.com/)** - Componentes accesibles sin estilo
- **[Shadcn/ui](https://ui.shadcn.com/)** - Colección de componentes reutilizables

### Backend & Base de Datos
- **[Supabase](https://supabase.com/)** - Backend as a Service
  - **Auth**: Sistema de autenticación completo
  - **PostgreSQL**: Base de datos relacional con Row Level Security
  - **Realtime**: Suscripciones en tiempo real (preparado para futuras features)

### Validación & Formularios
- **[Zod 3](https://zod.dev/)** - Validación de esquemas con TypeScript
- **[React Hook Form](https://react-hook-form.com/)** - Gestión eficiente de formularios

### Herramientas de Desarrollo
- **[ESLint](https://eslint.org/)** - Linter para mantener código consistente
- **[Vercel Analytics](https://vercel.com/analytics)** - Analíticas de uso y rendimiento
- **[Speed Insights](https://vercel.com/docs/speed-insights)** - Métricas de rendimiento web

### Seguridad
- Sistema de logging personalizado - Registro seguro de eventos sin exponer datos sensibles
- Rate limiting - Protección contra ataques de fuerza bruta
- Validación robusta - Sanitización de inputs y validación de contraseñas
- CORS personalizado - Control de orígenes permitidos
- CSP Headers - Content Security Policy para prevenir XSS
- HSTS - HTTP Strict Transport Security

---

## 🏗️ Arquitectura

### Estructura del Proyecto

```
diplotest/
├── app/                      # Next.js App Router
│   ├── auth/                # Rutas de autenticación
│   │   ├── login/           # Página de inicio de sesión
│   │   ├── sign-up/         # Página de registro
│   │   └── reset-password/  # Recuperación de contraseña
│   ├── app/                 # Dashboard principal (protegido)
│   ├── test/                # Interfaz de realización de tests
│   ├── history/             # Historial de intentos
│   ├── results/[id]/        # Vista detallada de resultados
│   ├── api/                 # API Routes serverless
│   │   ├── auth/            # Endpoints de autenticación
│   │   ├── questions/       # Gestión de preguntas
│   │   ├── attempts/        # Gestión de intentos
│   │   └── stats/           # Estadísticas
│   ├── layout.tsx           # Layout raíz con metadata
│   └── globals.css          # Estilos globales
├── components/              # Componentes React reutilizables
│   ├── ui/                  # Componentes base de Shadcn
│   ├── test-runner.tsx      # Componente principal del test
│   ├── test-setup.tsx       # Configuración del test
│   ├── results-view.tsx     # Vista de resultados
│   └── ...                  # Otros componentes
├── lib/                     # Utilidades y helpers
│   ├── supabase/            # Cliente y configuración de Supabase
│   ├── logger.ts            # Sistema de logging seguro
│   ├── rate-limiter.ts      # Limitador de peticiones
│   ├── validation.ts        # Validaciones personalizadas
│   ├── grading.ts           # Lógica de evaluación
│   └── utils.ts             # Utilidades generales
├── data/                    # Archivos de datos
│   ├── questions.demo.json  # Banco de preguntas demo
│   └── questions.real.json  # Banco de preguntas reales
├── public/                  # Recursos estáticos
├── scripts/                 # Scripts SQL y utilidades
└── proxy.ts                 # Middleware de autenticación
```

### Base de Datos

#### Tabla: `attempts`
```sql
CREATE TABLE attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('demo', 'real')),
  selection_type TEXT NOT NULL,
  selected_tag TEXT,
  questions JSONB NOT NULL,
  user_answers JSONB NOT NULL,
  grading JSONB NOT NULL,
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Row Level Security (RLS)**:
- Los usuarios solo pueden ver y crear sus propios intentos
- No se permite editar ni eliminar intentos (registro inmutable)

---

## � Instalación

### Prerrequisitos

- **Node.js** 18.17 o superior
- **pnpm** 8.0 o superior (recomendado) o npm
- Cuenta en **[Supabase](https://supabase.com/)** (gratuita)

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/Juhume/DiploTest.git
   cd diplotest
   ```

2. **Instalar dependencias**
   ```bash
   pnpm install
   ```

3. **Configurar variables de entorno**
   
   Crear un archivo `.env.local` en la raíz del proyecto:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
   
   # Opcional: Base URL
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

4. **Configurar Supabase**
   
   Ejecutar los scripts SQL en tu proyecto Supabase (en orden):
   ```
   scripts/001_create_attempts_table.sql
   scripts/002_update_attempts_with_user_and_mode.sql
   scripts/003_complete_schema.sql
   scripts/004_fix_schema.sql
   ```

5. **Ejecutar en desarrollo**
   ```bash
   pnpm dev
   ```

   La aplicación estará disponible en `http://localhost:3000`

6. **Build para producción**
   ```bash
   pnpm build
   pnpm start
   ```

---

## 🎮 Uso de la Aplicación

### 1. Configurar Test (`/app`)
1. Selecciona **Modo**: Demo o Real
2. Elige **Selección**:
   - **Pool completo**: Todas las preguntas disponibles
   - **Aleatorio**: N preguntas al azar
   - **Por tema**: Filtrar por tag específico
3. Haz clic en **Comenzar Test**

### 2. Realizar Test (`/test`)
- **Móvil**: Una columna con navegación inferior fija
- **Desktop**: Dos columnas (pregunta izq. + panel navegación der.)

**Atajos de Teclado** (desktop):
- `1-4` o `A-D`: Seleccionar opción
- `Enter`: Siguiente pregunta
- `Shift+Enter`: Pregunta anterior

### 3. Ver Resultados (`/results/[id]`)
- Puntuación global y desglose
- Revisión pregunta por pregunta
- Identificación de respuestas correctas/incorrectas

### 4. Historial (`/history`)
- Lista completa de todos tus intentos
- Filtros por modo y fecha
- Acceso a resultados de intentos anteriores

---

## ⚡ Rendimiento

### Métricas Objetivo

- **Lighthouse Score**: 95+ en todas las categorías
- **First Contentful Paint**: < 1.2s
- **Time to Interactive**: < 2.5s
- **Core Web Vitals**: Todos en verde

### Optimizaciones Aplicadas

- ✅ **Server Components** de React 19 para reducir JavaScript en cliente
- ✅ **Turbopack** para builds ultra rápidos
- ✅ **Code splitting** automático con Next.js
- ✅ **Lazy loading** de componentes pesados
- ✅ **Optimización de imágenes** con next/image
- ✅ **Caching estratégico** de API calls
- ✅ **Bundle size optimizado**
- ✅ **CSS moderno** con Tailwind 4
- ✅ **Compresión Gzip/Brotli** en producción

---

## �️ Roadmap

### ✅ Fase 1 - MVP (Completado)
- [x] Sistema de autenticación
- [x] Banco de preguntas (Demo y Real)
- [x] Realización de tests
- [x] Evaluación y resultados
- [x] Historial de intentos
- [x] Diseño responsive

### 🔄 Fase 2 - Mejoras (En Progreso)
- [ ] Comparador de intentos (evolución del rendimiento)
- [ ] Gráficos de estadísticas con Chart.js
- [ ] Sistema de logros y badges
- [ ] Modo práctica por categorías débiles

### 🔮 Fase 3 - Avanzado (Planificado)
- [ ] Modo examen cronometrado
- [ ] Tests colaborativos (compartir con otros usuarios)
- [ ] Sistema de comentarios en preguntas
- [ ] Preguntas con imágenes/diagramas
- [ ] API pública para integraciones
- [ ] Aplicación móvil nativa (React Native)
- [ ] Modo offline con Service Workers
- [ ] Gamificación completa (ranking, competiciones)

---

## 🤝 Contribuciones

Este proyecto no admite contribuciones.

---

## 📄 Licencia

Este proyecto es privado y está bajo desarrollo activo.

---

## � Contacto

**Desarrollado por**: Juhume

- 🌐 Portfolio: En construcción
- 💼 LinkedIn: En construcción
- 🐙 GitHub: [@Juhume](https://github.com/Juhume)
- 📧 Email: juhume.exe@gmail.com
