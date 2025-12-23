# Guía de Despliegue en Vercel

## 🚀 Despliegue Paso a Paso

### Opción 1: Despliegue desde el Dashboard de Vercel (Recomendado)

#### 1. Subir el Código a GitHub

Primero, crea un repositorio en GitHub:

1. Ve a [github.com/new](https://github.com/new)
2. Nombre del repositorio: `oposicion-test-app` (o el que prefieras)
3. Marca como **privado** (recomendado por temas de seguridad)
4. **NO** inicialices con README, .gitignore o licencia
5. Haz clic en "Create repository"

Luego, desde tu terminal ejecuta:

```bash
git remote add origin https://github.com/TU_USUARIO/oposicion-test-app.git
git branch -M main
git push -u origin main
```

#### 2. Importar en Vercel

1. Ve a [vercel.com/new](https://vercel.com/new)
2. Haz clic en "Import Git Repository"
3. Selecciona tu repositorio `oposicion-test-app`
4. Configura las variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL`: `https://vtexwjhoojfaboriuqhi.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0ZXh3amhvb2pmYWJvcml1cWhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ3ODY2MzcsImV4cCI6MjA1MDM2MjYzN30.rCkPZzFm7x9OzqYQAiQ-ILXx8VGDqh_teTrXjBH-OYg`
5. Framework Preset: **Next.js** (se detecta automáticamente)
6. Build Command: `pnpm build` (se detecta automáticamente)
7. Output Directory: `.next` (se detecta automáticamente)
8. Install Command: `pnpm install` (se detecta automáticamente)
9. Haz clic en **Deploy**

#### 3. Configurar Analytics (Automático)

Una vez desplegado:
- ✅ **Vercel Analytics** se habilita automáticamente (ya está instalado)
- ✅ **Speed Insights** se habilita automáticamente (ya está instalado)
- Los datos aparecerán en la pestaña "Analytics" de tu proyecto en Vercel

---

### Opción 2: Despliegue con Vercel CLI

Si prefieres usar la línea de comandos:

#### 1. Instalar Vercel CLI

```bash
npm i -g vercel
```

#### 2. Login en Vercel

```bash
vercel login
```

#### 3. Desplegar

Desde el directorio del proyecto:

```bash
vercel
```

Sigue las instrucciones:
- Set up and deploy? **Yes**
- Which scope? Selecciona tu cuenta
- Link to existing project? **No**
- What's your project's name? `oposicion-test-app`
- In which directory is your code located? `./`
- Want to override settings? **No**

#### 4. Configurar Variables de Entorno

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
# Pega: https://vtexwjhoojfaboriuqhi.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# Pega: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0ZXh3amhvb2pmYWJvcml1cWhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ3ODY2MzcsImV4cCI6MjA1MDM2MjYzN30.rCkPZzFm7x9OzqYQAiQ-ILXx8VGDqh_teTrXjBH-OYg
```

#### 5. Redesplegar con las Variables

```bash
vercel --prod
```

---

## ✅ Verificaciones Post-Despliegue

### 1. Verificar que la aplicación funciona

Visita tu URL de Vercel (algo como `https://oposicion-test-app.vercel.app`):

- [ ] La página de inicio carga correctamente
- [ ] El login funciona
- [ ] Puedes crear una cuenta nueva
- [ ] Los tests DEMO funcionan
- [ ] Los tests REAL funcionan
- [ ] El historial carga correctamente
- [ ] Los resultados se muestran bien

### 2. Verificar Analytics

1. Ve a tu proyecto en [vercel.com](https://vercel.com)
2. Pestaña **Analytics**
3. Espera unos minutos y verás:
   - Pageviews en tiempo real
   - Eventos personalizados (test_started, test_completed, etc.)
4. Pestaña **Speed Insights**
   - Core Web Vitals (LCP, FID, CLS)
   - Puntuación de rendimiento

### 3. Verificar Supabase

Asegúrate de que Supabase permite las conexiones desde tu dominio de Vercel:

1. Ve a [supabase.com](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Settings → API → Configuration
4. En **Site URL**, añade: `https://tu-dominio.vercel.app`
5. En **Redirect URLs**, añade:
   - `https://tu-dominio.vercel.app/auth/callback`
   - `https://tu-dominio.vercel.app/**`

---

## 🔧 Configuración Opcional

### Dominio Personalizado

1. En Vercel, ve a tu proyecto → Settings → Domains
2. Añade tu dominio personalizado
3. Configura los registros DNS según las instrucciones
4. Actualiza las Redirect URLs en Supabase con tu dominio personalizado

### Límite de Rate Limiting

Si esperas mucho tráfico, considera añadir rate limiting con Vercel Edge Config:

```bash
vercel env add EDGE_CONFIG
```

### Webhooks para Despliegues Automáticos

En tu repositorio de GitHub:
1. Settings → Webhooks → Add webhook
2. Payload URL: La webhook URL que te da Vercel
3. Content type: `application/json`
4. Events: "Just the push event"

---

## 🚨 Solución de Problemas

### Error: "Invalid Environment Variables"

- Verifica que las variables en Vercel coincidan exactamente con las de `.env.local`
- No incluyas comillas en los valores

### Error: "Supabase Auth Error"

- Verifica que el **Site URL** y **Redirect URLs** en Supabase incluyan tu dominio de Vercel
- Asegúrate de que las RLS policies están habilitadas

### Error: "Build Failed"

- Verifica que `pnpm-lock.yaml` esté en el repositorio
- Verifica que no haya errores de TypeScript en local: `pnpm build`

### Analytics no muestra datos

- Espera 5-10 minutos después del primer despliegue
- Verifica que los componentes `<Analytics />` y `<SpeedInsights />` estén en `layout.tsx`
- Visita la aplicación desde diferentes dispositivos para generar eventos

---

## 📊 Monitoreo de la Aplicación en Producción

Una vez desplegado, puedes monitorear:

### En Vercel Dashboard
- **Analytics**: Pageviews, eventos personalizados, usuarios únicos
- **Speed Insights**: Core Web Vitals, puntuación de rendimiento
- **Logs**: Errores de servidor, logs de build
- **Deployments**: Historial de despliegues

### En Supabase Dashboard
- **Database → Table Editor**: Ver intentos guardados en tiempo real
- **Authentication → Users**: Usuarios registrados
- **Logs → Auth Logs**: Intentos de login, registros
- **Logs → Postgres Logs**: Queries ejecutadas

### Eventos Personalizados Que Se Rastrean

Revisa en Vercel Analytics → Events:
- `test_started`: Cada vez que alguien inicia un test
- `test_completed`: Cuando finalizan un test
- `test_abandoned`: Cuando salen sin terminar
- `signup_completed`: Nuevos registros
- `error`: Errores client-side capturados

---

## 🎯 Próximos Pasos Después del Despliegue

1. ✅ **Añadir preguntas reales**: Usa el script `scripts/convert-questions.py` para convertir tus 100+ preguntas
2. ✅ **Probar en móvil**: Verifica que todo funcione en dispositivos móviles
3. ✅ **Monitorear métricas**: Revisa Analytics después de unos días de uso
4. ✅ **Backup de base de datos**: Configura backups automáticos en Supabase
5. ✅ **Optimizar imágenes**: Si añades logos o imágenes, usa Next.js Image optimization

---

## 📞 Soporte

Si tienes problemas:
- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs

¡Tu aplicación ya está lista para producción! 🎉
