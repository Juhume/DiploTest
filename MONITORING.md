# 📊 Sistema de Monitorización - Oposición Test App

## 🎯 Herramientas Implementadas

### 1. **Vercel Analytics** (Tráfico y Eventos)
- ✅ **Instalado y configurado**
- 📈 Métricas incluidas:
  - Páginas vistas
  - Visitantes únicos
  - Fuentes de tráfico
  - Conversiones
  - Eventos personalizados

### 2. **Vercel Speed Insights** (Rendimiento)
- ✅ **Instalado y configurado**
- ⚡ Métricas Core Web Vitals:
  - **LCP** (Largest Contentful Paint) - Carga visual
  - **FID** (First Input Delay) - Interactividad
  - **CLS** (Cumulative Layout Shift) - Estabilidad visual
  - **TTFB** (Time to First Byte) - Respuesta del servidor
  - **FCP** (First Contentful Paint) - Primera pintura

### 3. **Error Logging** (Errores del Cliente)
- ✅ **Componente personalizado**: `ErrorLogger`
- 🐛 Captura:
  - Errores no manejados (`window.error`)
  - Rechazos de promesas (`unhandledrejection`)
  - Stack traces completos
  - Contexto de la página

### 4. **Analytics Hooks** (Eventos Personalizados)
- ✅ **Hooks personalizados**: `useAnalytics`, `useTestAnalytics`
- 📊 Eventos trackeados:
  - `test_started` - Inicio de test
  - `test_completed` - Test completado
  - `test_abandoned` - Test abandonado
  - `question_answered` - Pregunta respondida
  - `results_viewed` - Resultados vistos
  - `signup_completed` - Registro completado
  - `login_completed` - Login exitoso

---

## 📈 Cómo Usar los Analytics

### En Componentes React

```typescript
import { useAnalytics, useTestAnalytics } from "@/hooks/use-analytics"

function MyComponent() {
  const { trackEvent } = useAnalytics()
  const { trackTestStart, trackTestComplete } = useTestAnalytics()

  const handleStartTest = () => {
    trackTestStart("real", 100)
    // ... lógica del test
  }

  const handleFinishTest = () => {
    trackTestComplete("real", 7.5, 3600, true)
    // ... lógica de finalización
  }

  return <button onClick={handleStartTest}>Iniciar Test</button>
}
```

### Eventos Disponibles

| Evento | Descripción | Propiedades |
|--------|-------------|-------------|
| `test_started` | Usuario inicia un test | `mode`, `question_count` |
| `test_completed` | Usuario completa un test | `mode`, `score`, `duration_seconds`, `passed` |
| `test_abandoned` | Usuario abandona un test | `mode`, `questions_answered`, `completion_rate` |
| `results_viewed` | Usuario ve resultados | `attempt_id`, `mode` |
| `signup_completed` | Registro exitoso | `method` (email, OAuth) |
| `login_completed` | Login exitoso | `method` |

---

## 🔍 Dónde Ver los Datos

### Vercel Dashboard
1. Ve a https://vercel.com/dashboard
2. Selecciona tu proyecto
3. Ve a **Analytics** → Verás:
   - Tráfico por página
   - Eventos personalizados
   - Tasas de conversión
4. Ve a **Speed Insights** → Verás:
   - Core Web Vitals por página
   - Distribución de rendimiento
   - Comparación con benchmarks

### Eventos Personalizados en Vercel
- Todos los eventos trackeados con `trackEvent()` aparecen en:
  - **Analytics** → **Events**
- Puedes crear funnels y conversiones

---

## 🚀 Mejoras Futuras (Opcionales)

### Opción A: Sentry (Errores Detallados) 🐛
Para errores más detallados con source maps:

```bash
pnpm add @sentry/nextjs
```

**Beneficios**:
- Stack traces con código fuente
- Sesiones de usuario
- Contexto completo de errores
- Alertas por email/Slack

### Opción B: Posthog (Product Analytics) 📊
Para analytics de producto más avanzados:

```bash
pnpm add posthog-js
```

**Beneficios**:
- Session recordings
- Feature flags
- A/B testing
- Funnels avanzados
- Heatmaps

### Opción C: Google Analytics 4 (Marketing)
Si necesitas tracking de marketing:

```bash
pnpm add @next/third-parties
```

---

## 📊 KPIs Sugeridos a Monitorear

### Rendimiento
- ⚡ **LCP < 2.5s** (Bueno)
- ⚡ **FID < 100ms** (Bueno)
- ⚡ **CLS < 0.1** (Bueno)

### Uso
- 📈 **Tests completados vs iniciados** (tasa de finalización)
- 📈 **Tiempo promedio por test**
- 📈 **Porcentaje de aprobados** (score ≥ 5.8)
- 📈 **Tests por usuario** (engagement)
- 📈 **Retención** (usuarios que vuelven)

### Errores
- 🐛 **Tasa de errores < 1%**
- 🐛 **Errores críticos = 0**
- 🐛 **Tiempo de respuesta de API < 500ms**

---

## 🔧 Configuración Adicional

### Variables de Entorno (Producción)

Para Vercel, estas variables ya están configuradas automáticamente:
- `VERCEL_ANALYTICS_ID` (automático)
- `VERCEL_SPEED_INSIGHTS_ID` (automático)

Para Sentry (si lo instalas):
```env
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
```

---

## 📱 Monitoreo en Producción

### Checklist de Deploy
- [ ] Verificar que Analytics esté habilitado en Vercel
- [ ] Verificar que Speed Insights esté habilitado
- [ ] Comprobar que los eventos se registran correctamente
- [ ] Configurar alertas en Vercel (opcional)
- [ ] Revisar dashboard después de 24h de tráfico

### Alertas Recomendadas
1. **Errores críticos** (> 10 en 1 hora)
2. **Caída de rendimiento** (LCP > 4s)
3. **Aumento de abandonos** (> 50%)

---

## 🎯 Métricas de Éxito

Para una app de oposiciones, considera monitorear:

1. **Engagement**:
   - Tests por usuario/semana
   - Tiempo en la plataforma
   - Retención a 7 y 30 días

2. **Educación**:
   - Mejora de puntuaciones con el tiempo
   - Temas más difíciles (más fallos)
   - Tasa de finalización de tests

3. **Técnico**:
   - Uptime > 99.9%
   - Errores < 0.1%
   - P95 response time < 1s

---

## 📞 Soporte

Para problemas con analytics:
- Vercel: https://vercel.com/docs/analytics
- Speed Insights: https://vercel.com/docs/speed-insights

---

**Estado**: ✅ **Sistema de Monitorización Completo Implementado**

Todo está listo para trackear el uso, rendimiento y errores de tu aplicación en producción.
