# 🎓 DiploTest - Plataforma de Preparación para Oposiciones

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Auth_+_DB-3ECF8E?style=for-the-badge&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)

**Una aplicación web moderna y completa para la preparación de exámenes tipo test de oposiciones.**

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
- [Changelog](#-changelog)

---

## 🎯 Sobre el Proyecto

**DiploTest** es una aplicación web full-stack diseñada para ayudar a opositores en su preparación para las pruebas del Cuerpo Diplomático. La plataforma ofrece una experiencia de práctica realista con tres modos de estudio (Demo, Real y Academia), evaluación automática, historial completo de intentos, flashcards y estadísticas de rendimiento.

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
- Registro con email y nombre de usuario
- Inicio de sesión con email o nombre de usuario
- Recuperación de contraseña
- Persistencia de sesión con cookies HTTP-only seguras
- Protección de rutas con middleware
- Rate limiting para prevenir ataques de fuerza bruta
- Validación de nombre de usuario en backend con unicidad sin distinción de mayúsculas

### 📚 Banco de Preguntas Inteligente
- **Modo DEMO**: Preguntas de práctica para familiarizarse con el sistema
- **Modo REAL**: Preguntas basadas en exámenes oficiales
- **Modo ACADEMIA**: Banco ampliado con preguntas tipo examen
- Soporte para preguntas de opción única y opción múltiple
- Sistema de etiquetas para organizar por temáticas
- Selección aleatoria o por categorías específicas

### 📝 Realización de Tests Avanzada
- Configuración flexible del test (modo, número de preguntas, filtros)
- Navegación completa entre preguntas (siguiente, anterior, saltar)
- Progreso visual con indicadores de estado
- Atajos de teclado para mayor agilidad (1-4/A-D, Enter, Shift+Enter)
- Timer de duración del intento
- Botón de salida para abandonar el test cuando lo necesites
- Vista previa antes de finalizar
- Evaluación automática con resultados detallados

### 🔖 Flashcards y marcadores
- Guardado de preguntas para repaso posterior
- Gestión desde la sección de Flashcards
- Eliminación rápida de tarjetas ya dominadas

### 💬 Feedback y soporte
- Envío de feedback desde la app
- Recordatorios no intrusivos para sugerencias
- Soporte a donaciones con Ko-fi

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
- **Guía de uso**: Página dedicada con atajos y funciones clave
- **Cuenta**: Inicio de sesión con email o nombre de usuario y perfil (edición temporalmente deshabilitada)
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
- Operaciones de perfil con service role en servidor para evitar enumeración de usuarios

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
│   ├── flashcards/          # Flashcards guardadas
│   ├── stats/               # Estadísticas de rendimiento
│   ├── guide/               # Guía de uso
│   ├── profile/             # Perfil de usuario
│   ├── results/[id]/        # Vista detallada de resultados
│   ├── api/                 # API Routes serverless
│   │   ├── auth/            # Endpoints de autenticación
│   │   ├── questions/       # Gestión de preguntas
│   │   ├── attempts/        # Gestión de intentos
│   │   ├── bookmarks/       # Flashcards/guardados
│   │   ├── feedback/        # Feedback de usuario
│   │   ├── profile/         # Perfil/nombre de usuario
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
│   │   ├── service-role.ts  # Cliente service role (server-only)
│   ├── logger.ts            # Sistema de logging seguro
│   ├── rate-limiter.ts      # Limitador de peticiones
│   ├── validation.ts        # Validaciones personalizadas
│   ├── grading.ts           # Lógica de evaluación
│   └── utils.ts             # Utilidades generales
├── data/                    # Archivos de datos
│   ├── questions.demo.json  # Banco de preguntas demo
│   ├── questions.academy.json # Banco de preguntas de academias
│   └── examenes_reales.json   # Banco de preguntas reales
├── public/                  # Recursos estáticos
├── scripts/                 # Scripts SQL locales (no versionados)
```
---

## 🎮 Uso de la Aplicación

### 1. Configurar Test (`/app`)
1. Selecciona **Modo**: Demo, Real o Academia
2. Elige **Selección**:
   - **Pool completo**: Todas las preguntas disponibles
   - **Aleatorio**: N preguntas al azar
   - **Por tema**: Filtrar por tag específico
3. Haz clic en **Comenzar Test**

### 2. Realizar Test (`/test`)
- **Móvil**: Una columna con navegación inferior fija
- **Desktop**: Dos columnas (pregunta izq. + panel navegación der.)
- Botón para salir del test cuando lo necesites

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

### 5. Flashcards (`/flashcards`)
- Guarda preguntas para repasar más tarde
- Elimina tarjetas cuando ya las domines

### 6. Estadísticas (`/stats`)
- Panel con progreso y rendimiento por tema
- Evolución histórica y métricas clave

### 7. Guía (`/guide`)
- Resumen de funciones y atajos disponibles

### 8. Perfil (`/profile`)
- Acceso desde el menú superior
- Edición temporalmente deshabilitada con aviso

### 9. Feedback
- Envío de comentarios desde el menú superior

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

## 🧾 Changelog

## [1.2.0] - 2026-01-12

### ✨ Added
- Login con email o nombre de usuario.
- Perfil con aviso informativo y soporte a donaciones (Ko-fi).
- Guía de uso y navegación mejorada en estadísticas.
- Feedback desde la aplicación.

### 🎨 Improved
- UI móvil y modo oscuro en gráficas.
- Experiencia de salida del test con confirmación.

---


## [1.1.0] – 2026-01-12

### ✨ Added
- Flashcards para repaso activo de preguntas.
- Sistema de marcadores (bookmarks) para preguntas importantes.
- Análisis de debilidades basado en resultados históricos del usuario.
- Estadísticas avanzadas de rendimiento.
- Sistema completo de recuperación de contraseña.

### 🎨 Improved
- Rediseño total del gráfico de progreso:
  - Agregación diaria y semanal.
  - Visualizaciones más claras y accionables.
  - Tooltips explicativos orientados al estudio.
- Mejora visual de los gráficos de estadísticas:
  - Gradientes.
  - Elementos más grandes y legibles.
  - Tooltips más informativos.
- Simplificación de la navegación eliminando el botón redundante **“Inicio”** en la página de resultados.

### 🐛 Fixed
- Error de renderizado del favicon.
- Error de sesión en el flujo de recuperación de contraseña.
- Las preguntas sin responder ahora se muestran correctamente en los resultados.
- Problemas de CORS en los flujos de autenticación y signup.

---

## [1.0.0] – 2025-12-30

### ✨ Added
- Plataforma completa de tests tipo oposición.
- Sistema de autenticación de usuarios.
- Monitorización del progreso del usuario.
- Resultados detallados por test.

### 🧱 Technical
- Refactor de autenticación usando Server Actions y API Routes según el caso.
- Uso de autenticación client-side de Supabase para flujos sensibles.
- Configuración completa de despliegue en Vercel.
- Eliminadas referencias innecesarias de entorno en `vercel.json`.

### 📝 Documentation
- README completo y estructurado.
- Guía de despliegue del proyecto.
- Renombrado oficial del proyecto a **DiploTest**.

---

## [0.2.0] – 2025-12-10

### ✨ Added
- Estadísticas básicas de resultados.
- Primeros gráficos de progreso.

### 🎨 Improved
- Mejoras visuales iniciales en gráficos y layout general.

---

## [0.1.0] – 2025-11-30

### 🎉 Initial Release
- Aplicación base de tests de oposición.
- Sistema inicial de preguntas tipo test.
- Visualización básica de resultados.

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
