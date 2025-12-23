# Guía de Despliegue - Test Oposición

Esta guía detalla cómo desplegar la aplicación en diferentes plataformas.

## 📋 Requisitos Previos

Antes de desplegar, asegúrate de tener:
- ✅ Proyecto de Supabase creado y configurado
- ✅ Schema de base de datos ejecutado (scripts SQL)
- ✅ Variables de entorno configuradas
- ✅ Aplicación probada en local

---

## 🚀 Opción 1: Vercel (Recomendado)

Vercel es la plataforma oficial para Next.js y ofrece la mejor experiencia.

### Paso 1: Preparar el Proyecto

```bash
# Asegúrate de que el build funciona
pnpm build

# Verifica que no haya errores
pnpm start
```

### Paso 2: Conectar con Vercel

**Opción A: Desde la CLI**

```bash
# Instalar Vercel CLI
npm install -g vercel

# Iniciar sesión
vercel login

# Desplegar
vercel --prod
```

**Opción B: Desde el Dashboard**

1. Ve a [vercel.com/new](https://vercel.com/new)
2. Importa tu repositorio de Git (GitHub/GitLab/Bitbucket)
3. Vercel detectará Next.js automáticamente
4. Haz clic en **Deploy**

### Paso 3: Configurar Variables de Entorno

En el dashboard de Vercel:

1. Ve a **Settings > Environment Variables**
2. Añade las siguientes variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

3. Aplica a: **Production**, **Preview**, y **Development**
4. Redespliega el proyecto

### Paso 4: Configurar Supabase para Producción

En tu proyecto de Supabase:

1. Ve a **Authentication > URL Configuration**
2. **Site URL**: `https://tu-dominio.vercel.app`
3. **Redirect URLs**: Añade:
   ```
   https://tu-dominio.vercel.app/auth/login
   https://tu-dominio.vercel.app/auth/callback
   https://tu-dominio.vercel.app/app
   ```
4. Guarda los cambios

### Paso 5: Configurar Dominio Personalizado (Opcional)

1. Ve a **Settings > Domains** en Vercel
2. Añade tu dominio personalizado
3. Configura los DNS según las instrucciones
4. Actualiza las URLs en Supabase

### Verificación

- Accede a tu URL de Vercel
- Prueba el registro y login
- Realiza un test completo
- Verifica que se guarden los intentos

---

## 🐳 Opción 2: Docker (Self-Hosted)

### Crear Dockerfile

```dockerfile
# Dockerfile
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build Next.js app
RUN npm install -g pnpm
RUN pnpm build

# Production image
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
    restart: unless-stopped
```

### Desplegar

```bash
# Construir imagen
docker build -t oposicion-app .

# Ejecutar
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your-url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key \
  oposicion-app

# O con docker-compose
docker-compose up -d
```

---

## ☁️ Opción 3: Railway

Railway ofrece despliegue sencillo con Git.

### Paso 1: Crear Proyecto

1. Ve a [railway.app](https://railway.app)
2. Inicia sesión con GitHub
3. **New Project > Deploy from GitHub repo**
4. Selecciona tu repositorio

### Paso 2: Configurar

Railway detectará Next.js automáticamente. Añade variables de entorno:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### Paso 3: Desplegar

Railway desplegará automáticamente en cada push a main.

### Paso 4: Configurar Dominio

1. Ve a **Settings > Networking**
2. **Generate Domain** o añade dominio personalizado
3. Actualiza URLs en Supabase

---

## 🌐 Opción 4: Netlify

### netlify.toml

Crea en la raíz:

```toml
[build]
  command = "pnpm build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### Desplegar

1. Ve a [netlify.com](https://netlify.com)
2. **Add new site > Import from Git**
3. Selecciona tu repositorio
4. Añade variables de entorno
5. Despliega

**Nota**: Netlify tiene soporte limitado para Next.js App Router. Vercel es más recomendado.

---

## 🔐 Seguridad Post-Despliegue

### Checklist de Seguridad

- [ ] RLS (Row Level Security) activado en todas las tablas
- [ ] Variables de entorno NO commitadas en Git
- [ ] CORS configurado correctamente en Supabase
- [ ] Rate limiting configurado (opcional, via Supabase)
- [ ] HTTPS habilitado (automático en Vercel/Railway/Netlify)
- [ ] Backups automáticos configurados en Supabase

### Configurar CORS en Supabase

1. Ve a **Settings > API**
2. **CORS Allowed Origins**: Añade tu dominio de producción
   ```
   https://tu-dominio.vercel.app
   ```

### Habilitar Email Confirmación

1. Ve a **Authentication > Settings**
2. **Email Confirmations**: Habilitado
3. Configura plantillas de email (opcional)

---

## 📊 Monitoreo

### Vercel Analytics

```bash
# Ya instalado en el proyecto
# Ver en Vercel Dashboard > Analytics
```

### Supabase Logs

1. Ve a **Logs** en el dashboard de Supabase
2. Revisa errores de API, Auth, y Database

### Error Tracking (Opcional)

Integra Sentry:

```bash
pnpm add @sentry/nextjs

# Configurar en next.config.mjs
```

---

## 🔄 Actualizaciones

### Actualizar en Producción

**Vercel/Railway/Netlify** (con Git):
```bash
git add .
git commit -m "Update: ..."
git push origin main
# Despliegue automático
```

**Docker**:
```bash
# Reconstruir imagen
docker build -t oposicion-app .

# Parar contenedor actual
docker stop oposicion-app-container

# Iniciar nuevo
docker run -d --name oposicion-app-container -p 3000:3000 oposicion-app
```

---

## 🆘 Troubleshooting

### Build Falla en Producción

```bash
# Verificar build localmente
pnpm build

# Si falla, revisar:
# 1. Tipos TypeScript
# 2. Imports/exports
# 3. Variables de entorno
```

### Errores de Autenticación

- Verifica que las URLs de redirect estén en Supabase
- Comprueba que las variables de entorno estén correctas
- Revisa que CORS esté configurado

### Base de Datos No Accesible

- Verifica conexión con `psql` o Supabase Studio
- Comprueba RLS policies
- Revisa logs de Supabase

---

## 📞 Soporte

Para problemas específicos de plataforma:
- **Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **Railway**: [docs.railway.app](https://docs.railway.app)
- **Netlify**: [docs.netlify.com](https://docs.netlify.com)
- **Supabase**: [supabase.com/docs](https://supabase.com/docs)

---

**¡Tu aplicación ya está en producción! 🎉**
