#!/usr/bin/env python3
"""
Script para convertir preguntas desde un archivo de texto a JSON
Formato esperado del archivo de entrada:

1. Pregunta aquí
A) Opción A
B) Opción B
C) Opción C
D) Opción D
Respuesta: B

2. Otra pregunta
A) Opción A
...
"""

import json
import re
import sys

def parse_questions(text):
    """Parse questions from text format to JSON structure"""
    questions = []
    
    # Split by question numbers
    blocks = re.split(r'\n\d+\.\s+', text)
    blocks = [b.strip() for b in blocks if b.strip()]
    
    for idx, block in enumerate(blocks, 1):
        lines = block.split('\n')
        
        # Extract question stem (first line)
        stem = lines[0].strip()
        
        # Extract options
        options = []
        correct = None
        
        for line in lines[1:]:
            line = line.strip()
            
            # Match option format: A) text or A. text
            option_match = re.match(r'^([A-D])[).]\s*(.+)$', line)
            if option_match:
                option_id = option_match.group(1)
                option_text = option_match.group(2).strip()
                options.append({
                    "id": option_id,
                    "text": option_text
                })
            
            # Match correct answer: Respuesta: B or Correcta: B
            answer_match = re.match(r'^(?:Respuesta|Correcta|Correct|Answer):\s*([A-D])', line, re.IGNORECASE)
            if answer_match:
                correct = [answer_match.group(1)]
        
        # Only add if we have stem, 4 options, and correct answer
        if stem and len(options) == 4 and correct:
            questions.append({
                "id": f"real-q{idx}",
                "stem": stem,
                "options": options,
                "correct": correct
                # No tags needed for REAL mode
            })
        else:
            print(f"Warning: Question {idx} is incomplete (stem={bool(stem)}, options={len(options)}, correct={bool(correct)})", file=sys.stderr)
    
    return questions

def main():
    if len(sys.argv) < 2:
        print("Uso: python convert-questions.py <archivo-entrada.txt> [archivo-salida.json]")
        print("\nFormato esperado del archivo de entrada:")
        print("1. Pregunta aquí")
        print("A) Opción A")
        print("B) Opción B")
        print("C) Opción C")
        print("D) Opción D")
        print("Respuesta: B")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else "questions.real.json"
    
    # Read input file
    with open(input_file, 'r', encoding='utf-8') as f:
        text = f.read()
    
    # Parse questions
    questions = parse_questions(text)
    
    print(f"Parsed {len(questions)} questions")
    
    # Write output JSON
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)
    
    print(f"Questions saved to {output_file}")

if __name__ == "__main__":
    main()
