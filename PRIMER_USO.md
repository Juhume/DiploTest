# 🚦 Instrucciones de Primer Uso

Sigue estos pasos para poner en marcha tu aplicación de tests de oposición.

---

## ⚡ Inicio Rápido (5 minutos)

### 1️⃣ Instalar Dependencias

```bash
cd oposicion-test-app
pnpm install
```

> Si no tienes pnpm: `npm install -g pnpm`

### 2️⃣ Configurar Supabase

#### Opción A: Crear Nuevo Proyecto

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Click en **"New Project"**
3. Completa:
   - **Name**: oposicion-test (o el que prefieras)
   - **Database Password**: [genera una segura y guárdala]
   - **Region**: Elige la más cercana a ti
4. Click **"Create new project"**
5. **Espera 2-3 minutos** mientras se inicializa

#### Opción B: Usar Proyecto Existente

Si ya tienes un proyecto de Supabase, úsalo directamente.

### 3️⃣ Ejecutar Script SQL

1. En Supabase, ve a **SQL Editor** (menú lateral)
2. Click en **"New query"**
3. Abre el archivo `scripts/003_complete_schema.sql` de este proyecto
4. Copia TODO el contenido
5. Pégalo en el editor de Supabase
6. Click en **"Run"** (botón verde abajo a la derecha)
7. Verifica que dice "Success. No rows returned"

**Verificación**: Ve a **Table Editor** y deberías ver la tabla `attempts`

### 4️⃣ Obtener Credenciales

1. En Supabase, ve a **Settings > API** (menú lateral)
2. Copia estos dos valores:
   - **Project URL** → `https://xxxxx.supabase.co`
   - **anon public** (en la sección "Project API keys") → `eyJhbG...`

### 5️⃣ Crear .env.local

En la raíz del proyecto, crea un archivo llamado `.env.local` con:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ IMPORTANTE**: Reemplaza con TUS valores reales de Supabase.

### 6️⃣ Ejecutar la Aplicación

```bash
pnpm dev
```

Abre tu navegador en [http://localhost:3000](http://localhost:3000)

---

## ✅ Verificar que Todo Funciona

### Test 1: Registro
1. Ve a `/auth/sign-up`
2. Ingresa un email y contraseña (mín. 6 caracteres)
3. Click en **"Crear Cuenta"**
4. Deberías ver un mensaje de éxito

### Test 2: Confirmar Email
1. Revisa tu email (incluye spam)
2. Click en el link de confirmación de Supabase
3. Serás redirigido a la app

### Test 3: Iniciar Sesión
1. Ve a `/auth/login`
2. Ingresa tu email y contraseña
3. Click en **"Iniciar Sesión"**
4. Deberías ver la página de configuración del test

### Test 4: Realizar un Test
1. Selecciona **Modo**: Demo
2. Selecciona **Pool completo**
3. Click en **"Comenzar Test"**
4. Responde algunas preguntas
5. Click en **"Finalizar Test"**
6. Verifica que veas tus resultados

### Test 5: Ver Historial
1. Click en **"Historial"** en el header
2. Deberías ver tu intento anterior
3. Prueba los filtros
4. Click en **"Ver detalles"** de un intento

---

## 🐛 Solución de Problemas Comunes

### ❌ Error: "Module not found"
```bash
# Reinstalar dependencias
rm -rf node_modules .next
pnpm install
```

### ❌ Error: "Unauthorized" en API
**Causa**: RLS no configurado o script SQL no ejecutado.

**Solución**:
1. Ve a Supabase SQL Editor
2. Ejecuta `scripts/003_complete_schema.sql` completo
3. Verifica en **Authentication > Policies** que existan policies

### ❌ Error: "Failed to fetch questions"
**Causa**: Archivos JSON no encontrados o corruptos.

**Solución**:
1. Verifica que existan `data/questions.demo.json` y `data/questions.real.json`
2. Verifica que el JSON sea válido (usa [jsonlint.com](https://jsonlint.com))

### ❌ No recibo email de confirmación
**Solución**:
1. Revisa carpeta de spam
2. En Supabase, ve a **Authentication > Email Templates**
3. Para desarrollo, puedes desactivar confirmación en **Settings > Auth Settings**

### ❌ Build falla con errores de TypeScript
**Causa**: Los errores actuales son normales antes de instalar dependencias.

**Solución**:
```bash
pnpm install
# Ahora los errores deberían desaparecer
```

### ❌ Layout se ve mal en móvil
**Causa**: Cache del navegador o CSS no cargado.

**Solución**:
1. Recarga con Ctrl+Shift+R (Windows) o Cmd+Shift+R (Mac)
2. Limpia caché del navegador
3. Verifica que `app/globals.css` exista

---

## 📱 Probar en Móvil

### Opción 1: Desde tu PC
1. Averigua tu IP local: `ipconfig` (Windows) o `ifconfig` (Mac/Linux)
2. En el móvil, abre `http://TU_IP_LOCAL:3000`
3. Ejemplo: `http://192.168.1.10:3000`

### Opción 2: DevTools
1. Abre Chrome DevTools (F12)
2. Click en el icono de móvil (Toggle device toolbar)
3. Selecciona un dispositivo (iPhone, Samsung, etc.)

---

## 🎨 Personalizar (Opcional)

### Cambiar Colores

Edita `app/globals.css`:

```css
@layer base {
  :root {
    --primary: 220 90% 56%;     /* Azul primario */
    --secondary: 240 5% 96%;    /* Gris secundario */
    /* ... más colores */
  }
}
```

### Añadir Más Preguntas DEMO

Edita `data/questions.demo.json`:

```json
{
  "id": "demo-q99",
  "stem": "¿Nueva pregunta de ejemplo?",
  "options": [
    { "id": "A", "text": "Opción A" },
    { "id": "B", "text": "Opción B" },
    { "id": "C", "text": "Opción C" },
    { "id": "D", "text": "Opción D" }
  ],
  "correct": ["B"],
  "tags": ["tema-ejemplo"],
  "multi": false
}
```

### Añadir Preguntas REALES

Edita `data/questions.real.json` con el mismo formato.

---

## 📚 Siguientes Pasos

Una vez que todo funcione:

1. **Lee el README.md** para entender la arquitectura completa
2. **Revisa DEPLOYMENT.md** si quieres desplegarlo en producción
3. **Personaliza preguntas** según tus necesidades
4. **Añade más usuarios** y prueba con amigos

---

## 💡 Tips Útiles

### Atajos de Teclado (Desktop)
- `1`, `2`, `3`, `4` → Seleccionar opciones A, B, C, D
- `A`, `B`, `C`, `D` → Seleccionar opciones
- `Enter` → Siguiente pregunta
- `Shift + Enter` → Pregunta anterior

### Datos de Prueba
Para pruebas rápidas:
- Email: `test@example.com`
- Contraseña: `password123`

(Regístralo manualmente en `/auth/sign-up`)

### Ver Logs en Tiempo Real
```bash
# Terminal 1: App
pnpm dev

# Terminal 2: Supabase Logs (si usas CLI)
supabase logs
```

---

## 🆘 ¿Necesitas Ayuda?

Si algo no funciona después de seguir estos pasos:

1. **Revisa la consola del navegador** (F12) para ver errores
2. **Revisa la terminal** donde ejecutas `pnpm dev`
3. **Verifica los logs de Supabase** en el dashboard
4. **Consulta TROUBLESHOOTING.md** (si existe) o README.md

---

## ✨ ¡Todo Listo!

Si llegaste hasta aquí y todo funciona:

🎉 **¡Felicidades! Tu aplicación de tests está lista para usar.**

Ahora puedes:
- Practicar con preguntas DEMO
- Realizar tests con preguntas REAL
- Ver tu progreso en el historial
- Revisar detalladamente qué fallaste

**¡Mucha suerte en tu preparación para la oposición! 📚🚀**

---

**¿Todo funcionó?** → Lee `README.md` para aprovechar al máximo la app
**¿Algún problema?** → Revisa "Solución de Problemas" arriba
