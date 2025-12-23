# 🚀 Quick Start - Test Oposición

Guía rápida para poner la aplicación en funcionamiento en **5 minutos**.

---

## ✅ Requisitos

- Node.js 18+ instalado
- pnpm instalado (`npm install -g pnpm`)
- Cuenta de Supabase (gratuita)

---

## 📝 Pasos

### 1. Instalar Dependencias

```bash
cd oposicion-test-app
pnpm install
```

### 2. Configurar Supabase

#### a) Crear Proyecto
1. Ve a [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto (anota la contraseña de la BD)
3. Espera 2-3 minutos a que se inicialice

#### b) Ejecutar Schema SQL
1. En Supabase, ve a **SQL Editor**
2. Copia y pega el contenido de `scripts/003_complete_schema.sql`
3. Haz clic en **Run**
4. Verifica que se creó la tabla `attempts` en **Table Editor**

#### c) Obtener Credenciales
1. Ve a **Settings > API**
2. Copia:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Configurar Variables de Entorno

Crea `.env.local` en la raíz:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Ejecutar la Aplicación

```bash
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000)

---

## 🎯 Probar la Aplicación

### 1. Registrarse
1. Ve a `/auth/sign-up`
2. Ingresa email y contraseña
3. Confirma el email (revisa inbox o spam)
4. Inicia sesión

### 2. Configurar Test
1. Selecciona **Modo**: Demo o Real
2. Elige **Selección**: Pool completo, Aleatorio, o Por tema
3. Haz clic en **Comenzar Test**

### 3. Realizar Test
- **Desktop**: Usa atajos de teclado (1-4 o A-D para seleccionar, Enter para siguiente)
- **Móvil**: Tap en opciones y botones de navegación
- Haz clic en **Finalizar Test** cuando termines

### 4. Ver Resultados
- Revisa tu puntuación y desglose
- Analiza pregunta por pregunta qué fallaste
- Ve a **Historial** para ver todos tus intentos

---

## 🔧 Configuración Adicional (Opcional)

### Personalizar Preguntas

#### Modo DEMO
Edita `data/questions.demo.json`:
```json
{
  "id": "demo-q99",
  "stem": "Nueva pregunta de ejemplo",
  "options": [
    { "id": "A", "text": "Opción A" },
    { "id": "B", "text": "Opción B" }
  ],
  "correct": ["A"],
  "tags": ["tema-nuevo"],
  "multi": false
}
```

#### Modo REAL
Edita `data/questions.real.json` con preguntas oficiales.

### Cambiar Tema de Colores

Edita `app/globals.css`:
```css
:root {
  --primary: 220 90% 56%;  /* Cambia el color primario */
}
```

---

## 🐛 Problemas Comunes

### "Unauthorized" al intentar guardar
→ Verifica que RLS esté configurado correctamente (ejecuta el script SQL completo)

### Build falla con errores de TypeScript
→ Los errores son normales antes de instalar dependencias. Ejecuta `pnpm install`

### No se envían emails de confirmación
→ En desarrollo, Supabase usa un sistema mock. Para producción, configura SMTP en Supabase.

---

## 📚 Siguientes Pasos

- Lee el [README.md](./README.md) completo para entender la arquitectura
- Revisa [DEPLOYMENT.md](./DEPLOYMENT.md) para desplegar en producción
- Personaliza preguntas y tema según tus necesidades

---

## 🆘 Ayuda

¿Problemas? Revisa los logs de:
- **Terminal**: Errores de Next.js
- **Browser Console**: Errores del cliente
- **Supabase Logs**: Errores de API/Auth

---

**¡Listo! Ahora puedes empezar a practicar para tu oposición 🎓**
