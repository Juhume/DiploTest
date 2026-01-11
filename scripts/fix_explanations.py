#!/usr/bin/env python3
"""
Script para reescribir explicaciones tautológicas en questions.real.json
Solo detecta patrones específicos del archivo original, no los generados.
"""

import json
import re
import sys

def needs_rewrite(explanation: str) -> bool:
    """Determina si una explicación necesita ser reescrita (patrones originales)."""
    if not explanation:
        return False
    exp_lower = explanation.strip().lower()
    # Solo patrones tautológicos originales
    patterns = [
        r'^la respuesta es\b',           # "La respuesta es X"
        r'^corresponde a\b',              # "Corresponde a X"
        r'^se trata de\b',                # "Se trata de X"
    ]
    return any(re.match(p, exp_lower) for p in patterns)

def get_correct_option_text(question: dict) -> str:
    """Obtiene el texto de la opción correcta."""
    correct_ids = question.get('correct', [])
    if not correct_ids:
        return ""
    correct_id = correct_ids[0]
    for opt in question.get('options', []):
        if opt.get('id') == correct_id:
            return opt.get('text', '')
    return ""

def clean_text(text: str) -> str:
    """Limpia el texto de puntuación extra."""
    text = text.rstrip('.')
    text = re.sub(r'\.{2,}', '.', text)  # Múltiples puntos
    return text.strip()

def generate_explanation(question: dict) -> str:
    """Genera una nueva explicación basada en el enunciado y la respuesta correcta."""
    stem = question.get('stem', '')
    correct_text = get_correct_option_text(question)

    if not correct_text:
        return question.get('explanation', '')

    stem_lower = stem.lower()
    correct_lower = correct_text.lower()
    correct_text = clean_text(correct_text)

    # =====================================================
    # REGLAS ESPECIALES PARA OPCIONES COMBINADAS
    # =====================================================

    # "Todas son correctas" o similar
    if 'todas' in correct_lower and ('correcta' in correct_lower or 'verdadera' in correct_lower or 'son' in correct_lower):
        return "Todas las opciones anteriores cumplen con lo indicado en el enunciado."

    # "Ninguna" o similar
    if 'ninguna' in correct_lower:
        return "Ninguna de las opciones anteriores encaja con el criterio del enunciado."

    # "Ni la respuesta a) ni la b)" o similar
    if 'ni la respuesta' in correct_lower or ('no son correctas' in correct_lower and 'ni' in correct_lower):
        return "Ninguna de las opciones mencionadas es correcta según el enunciado."

    # "Tanto a como b" o similar
    if 'tanto' in correct_lower and ('como' in correct_lower or 'y' in correct_lower) and 'correcta' in correct_lower:
        return "Ambas opciones mencionadas son correctas según el criterio del enunciado."

    # "Letras a y b" o similar
    if re.search(r'letras?\s+[a-d]\s+y\s+[a-d]', correct_lower):
        return "Ambas opciones indicadas son correctas."

    # "a) y c) son correctas" o similar
    if re.search(r'[a-d]\)?\s+y\s+[a-d]\)?\s+son\s+correctas', correct_lower):
        return "Ambas opciones mencionadas son correctas."

    # =====================================================
    # REGLAS POR TIPO DE PREGUNTA
    # =====================================================

    # Pregunta por año/fecha
    if any(word in stem_lower for word in ['qué año', 'en qué fecha', 'cuándo tuvo', 'cuándo se', 'año de']):
        year_match = re.search(r'\b(1[0-9]{3}|20[0-9]{2})\b', correct_text)
        if year_match:
            return f"El evento mencionado ocurrió en {year_match.group(1)}."
        return f"La fecha correcta es {correct_text}."

    # Pregunta por artículo específico
    if re.search(r'(qué artículo|en qué artículo)', stem_lower):
        art_match = re.search(r'(?:artículo|art\.?)\s*(\d+)', correct_text, re.IGNORECASE)
        if art_match:
            return f"Se regula en el artículo {art_match.group(1)}."
        num_match = re.search(r'^(\d+)', correct_text)
        if num_match:
            return f"Se regula en el artículo {correct_text}."

    # Pregunta por lugar/ciudad/país/sede
    if any(word in stem_lower for word in ['dónde', 'en qué ciudad', 'en qué país', 'sede de', 'capital de', 'se firmó', 'se celebró', 'tiene sede', 'ubicad']):
        if len(correct_text) <= 40:
            return f"El lugar indicado es {correct_text}."
        return "Esta opción identifica correctamente el lugar mencionado."

    # Pregunta por persona
    if any(word in stem_lower for word in ['quién', 'qué persona', 'qué presidente', 'qué primer ministro', 'qué líder']):
        if len(correct_text) <= 50:
            return f"La persona indicada es {correct_text}."
        return "Esta opción identifica correctamente a la persona mencionada."

    # Pregunta por cantidad/número
    if any(word in stem_lower for word in ['cuántos', 'cuántas', 'número de', 'cantidad de']):
        return f"La cantidad correcta es {correct_text}."

    # Pregunta por batalla/conflicto/guerra
    if any(word in stem_lower for word in ['batalla', 'guerra civil', 'conflicto', 'operación militar', 'ofensiva']):
        if len(correct_text) <= 50:
            return f"El evento bélico indicado es {correct_text}."
        return "Esta opción identifica correctamente el evento bélico."

    # Pregunta por tratado/acuerdo/pacto
    if any(word in stem_lower for word in ['qué tratado', 'qué acuerdo', 'qué pacto', 'qué convenio', 'qué protocolo']):
        if len(correct_text) <= 50:
            return f"El instrumento indicado es {correct_text}."
        return "Esta opción identifica correctamente el instrumento mencionado."

    # Pregunta por congreso/conferencia/cumbre
    if any(word in stem_lower for word in ['qué congreso', 'qué conferencia', 'qué cumbre', 'qué reunión']):
        if len(correct_text) <= 50:
            return f"El evento diplomático es {correct_text}."
        return "Esta opción identifica correctamente el evento diplomático."

    # Pregunta por concepto económico
    if any(word in stem_lower for word in ['balanza', 'déficit', 'superávit', 'mercado de', 'precio']):
        if len(correct_text) <= 50:
            return f"El concepto económico es {correct_text}."
        return "Esta opción describe correctamente el concepto económico."

    # Pregunta por organismo/institución
    if any(word in stem_lower for word in ['qué organismo', 'qué institución', 'qué órgano', 'qué organización']):
        if len(correct_text) <= 50:
            return f"El organismo indicado es {correct_text}."
        return "Esta opción identifica correctamente el organismo mencionado."

    # =====================================================
    # CASO GENÉRICO
    # =====================================================
    if len(correct_text) <= 35:
        return f"La opción correcta es {correct_text}."
    elif len(correct_text) <= 55:
        return f"La respuesta válida es: {correct_text}."
    else:
        return "Esta opción cumple con el criterio especificado en el enunciado."

def process_file(input_path: str, output_path: str):
    """Procesa el archivo JSON y reescribe las explicaciones."""
    with open(input_path, 'r', encoding='utf-8') as f:
        questions = json.load(f)

    count = 0
    for q in questions:
        old_exp = q.get('explanation', '')
        if needs_rewrite(old_exp):
            new_exp = generate_explanation(q)
            q['explanation'] = new_exp
            count += 1
            print(f"[{count}] {q.get('id', 'unknown')}")
            print(f"  Antes: {old_exp[:80]}...")
            print(f"  Después: {new_exp}")
            print()

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)

    print(f"\nTotal de explicaciones reescritas: {count}")
    return count

if __name__ == '__main__':
    input_file = '/home/juliopc/Developer/diplotest/data/questions.real.json'
    output_file = input_file

    if len(sys.argv) > 1:
        input_file = sys.argv[1]
    if len(sys.argv) > 2:
        output_file = sys.argv[2]

    process_file(input_file, output_file)
