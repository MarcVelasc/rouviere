"""Convierte el banco de casos clínicos del equipo (Word) a JSON para la app.

Origen: docs/contenido/Banco_casos_clinicos_Anatomia_Humana.docx (14 casos, cinco opciones).
Salida: src/rouviere/data/casos.json  (formato: docs/ARQUITECTURA.md · casos clínicos)

Cada caso del Word tiene: «Caso N. Título» (título 1), «Tema: …», Viñeta clínica, Pregunta con
opciones A–E, «Respuesta correcta: X. …», «Por qué no son correctas las otras opciones» e
«Imagen sugerida» (solo una descripción; todavía no hay imagen). El texto se copia tal cual.
Cada tema del Word es una fase del camino de su competencia (FASE).
Para volver a generarlo:  python3 scripts/casos-equipo.py   (requiere python-docx)
"""
import json
import re
from pathlib import Path

from docx import Document

RAIZ = Path(__file__).resolve().parent.parent
ORIGEN = RAIZ / 'docs/contenido/Banco_casos_clinicos_Anatomia_Humana.docx'
SALIDA = RAIZ / 'src/rouviere/data/casos.json'

# Tema del Word -> (competencia, nombre de la fase en el camino)
FASE = {
    'Sistema nervioso central': ('c5', 'Encéfalo'),
    'Médula espinal': ('c5', 'Médula espinal'),
    'Vía espinotalámica lateral': ('c5', 'Vía espinotalámica'),
    'Arco reflejo': ('c5', 'Arco reflejo'),
    'Músculos del antebrazo': ('c2', 'Músculos del antebrazo'),
    'Cabeza y cuello': ('c1', 'Cabeza y cuello'),
    'Corazón e irrigación': ('c3', 'Corazón e irrigación'),
}


def leer():
    casos, c, sec = [], None, None
    for p in Document(ORIGEN).paragraphs:
        est, x = p.style.name, p.text.strip()
        if est.startswith('Heading 1'):
            m = re.match(r'Caso (\d+)\. (.+)', x)
            c = {'n': int(m.group(1)), 'titulo': m.group(2), 'vin': [], 'ops': [], 'no': [],
                 'img': {}} if m else None
            if c:
                casos.append(c)
            sec = None
            continue
        if not c or not x:
            continue
        if est.startswith('Heading'):
            sec = x
            continue
        if x.startswith('Tema:'):
            c['tema'] = x.split(':', 1)[1].strip()
        elif sec == 'Viñeta clínica':
            c['vin'].append(x)
        elif sec == 'Pregunta':
            m = re.match(r'([A-E])\. (.+)', x)
            if m:
                c['ops'].append(m.group(2))
            else:
                c['pregunta'] = x
        elif sec == 'Respuesta y razonamiento anatómico':
            m = re.match(r'Respuesta correcta: ([A-E])\. (.+)', x)
            c['correcta'] = 'ABCDE'.index(m.group(1))
            c['porque'] = m.group(2)
        elif sec and sec.startswith('Por qué no'):
            c['no'].append(x)
        elif sec == 'Imagen sugerida':
            if x.startswith('Texto alternativo:'):
                c['img']['alt'] = x.split(':', 1)[1].strip()
            elif not x.startswith('Términos de búsqueda'):
                c['img']['esquema'] = x
    return casos


def main():
    casos = leer()
    if len(casos) != 14:
        raise SystemExit(f'Se esperaban 14 casos y hay {len(casos)}')
    salida = {}
    for c in casos:
        if len(c['ops']) != 5 or 'correcta' not in c or not c.get('pregunta'):
            raise SystemExit(f'Caso {c["n"]} incompleto')
        comp, tema = FASE[c['tema']]
        fases = salida.setdefault(comp, [])
        fase = next((f for f in fases if f['tema'] == tema), None)
        if not fase:
            fase = {'tema': tema, 'casos': []}
            fases.append(fase)
        fase['casos'].append({
            'n': c['n'],
            'titulo': c['titulo'],
            'caso': ' '.join(c['vin']),
            'pregunta': c['pregunta'],
            'opciones': c['ops'],
            'correcta': c['correcta'],
            # Las opciones van en el orden del Word: la explicación las nombra por letra.
            'explicacion': c['porque'],
            'descartes': c['no'],
            'imagen': '',
            'imagenTxt': c['img'].get('alt', ''),
        })
    SALIDA.write_text(json.dumps(salida, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    print(len(casos), 'casos ->', SALIDA.relative_to(RAIZ),
          {k: [(f['tema'], len(f['casos'])) for f in v] for k, v in salida.items()})


if __name__ == '__main__':
    main()
