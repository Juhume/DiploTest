# Conversión de Preguntas del Cuerpo Diplomático

Este script convierte preguntas de exámenes del Cuerpo Diplomático desde formato texto plano a JSON.

## 📋 Formato de entrada

El archivo de texto debe seguir este formato:

```
1. ¿Pregunta aquí?
A) Primera opción
B) Segunda opción
C) Tercera opción
D) Cuarta opción
Respuesta: B

2. ¿Siguiente pregunta?
A) Opción A
B) Opción B
C) Opción C
D) Opción D
Respuesta: C
```

## 🚀 Cómo usar

### Opción 1: Convertir desde Word/PDF

1. **Abre tu documento** con las preguntas reales
2. **Copia todo el contenido** (Cmd+A, Cmd+C)
3. **Pega en un archivo de texto** nuevo llamado `preguntas-reales.txt`
4. **Guarda el archivo** en la carpeta `scripts/`
5. **Ejecuta el script**:

```bash
cd /Users/E056465/Documents/oposicion-test-app
python3 scripts/convert-questions.py scripts/preguntas-reales.txt data/questions.real.json
```

### Opción 2: Usar el ejemplo

Para probar con el archivo de ejemplo incluido:

```bash
python3 scripts/convert-questions.py scripts/ejemplo-preguntas.txt data/questions.real.json
```

## ✅ Verificación

Después de la conversión, verifica que:

1. El script muestre: `Parsed 100 questions` (o el número correcto)
2. El archivo `data/questions.real.json` se haya creado
3. Cada pregunta tenga:
   - `id`: "real-q1", "real-q2", etc.
   - `stem`: el enunciado
   - `options`: 4 opciones (A, B, C, D)
   - `correct`: array con 1 opción correcta

## 🔍 Formato JSON generado

```json
[
  {
    "id": "real-q1",
    "stem": "¿Cuál es el órgano principal de las Naciones Unidas?",
    "options": [
      { "id": "A", "text": "La Asamblea General" },
      { "id": "B", "text": "El Consejo de Seguridad" },
      { "id": "C", "text": "La Corte Internacional de Justicia" },
      { "id": "D", "text": "El Consejo Económico y Social" }
    ],
    "correct": ["B"]
  }
]
```

## 🎯 Requisitos para el Cuerpo Diplomático

- **100 preguntas oficiales** + 5 de reserva = 105 total
- **4 opciones** por pregunta (A, B, C, D)
- **1 respuesta correcta** por pregunta
- **Sin tags** (no necesarios en modo REAL)
- **Sin multi-selección** (todas son selección única)

## 🐛 Solución de problemas

### El script no encuentra todas las preguntas

- Verifica que cada pregunta empiece con un número seguido de punto: `1.`, `2.`, etc.
- Asegúrate de que las opciones usen el formato `A)` o `A.`
- Verifica que la respuesta use el formato `Respuesta: B`

### Preguntas incompletas

Si el script dice "Warning: Question X is incomplete":

- Revisa que la pregunta tenga exactamente 4 opciones
- Verifica que todas las opciones sean A, B, C, D
- Asegúrate de que hay una línea `Respuesta: X`

## 📝 Notas adicionales

- El script **elimina automáticamente** el campo `multi` (no necesario para modo REAL)
- El script **no añade tags** (no necesarios para modo REAL)
- Puedes editar manualmente el JSON después si necesitas hacer ajustes
- Las 5 últimas preguntas (101-105) pueden marcarse como "de reserva" manualmente si lo deseas

## 🆘 ¿Necesitas ayuda?

Si tienes problemas, puedes:

1. Pegar aquí 3-4 preguntas de ejemplo de tu documento
2. Usar Claude/ChatGPT para convertir manualmente
3. Editar directamente el archivo JSON siguiendo el formato
