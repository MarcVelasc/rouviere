"""Convierte el banco de tarjetas del equipo de contenido (Word) a JSON para la app.

Origen: docs/contenido/ROUVIERE_Miologia_Final_Verificada.docx (responsable: Vanesa).
Salida: src/rouviere/data/bank-equipo.json

Cada apartado del Word es una tabla «Nivel | Anverso · Pregunta | Reverso · Respuesta».
El texto de preguntas y respuestas se copia tal cual: este script solo le asigna sistema,
tema y nivel para que la app lo filtre. Para volver a generarlo después de que el equipo
corrija el Word:  python3 scripts/tarjetas-equipo.py
Requiere python-docx (pip install python-docx).
"""
import json
import re
from pathlib import Path

from docx import Document
from docx.table import Table
from docx.text.paragraph import Paragraph

RAIZ = Path(__file__).resolve().parent.parent
ORIGEN = RAIZ / 'docs/contenido/ROUVIERE_Miologia_Final_Verificada.docx'
SALIDA = RAIZ / 'src/rouviere/data/bank-equipo.json'

# Bloque del Word -> sistema de la app (MODS en core/almacenamiento.js)
SISTEMA = {
    'ANATOMÍA GENERAL': 'reg',
    'OSTEOLOGÍA': 'oseo',
    'ARTROLOGÍA': 'oseo',  # la app agrupa articulaciones dentro del sistema óseo
    'MIOLOGÍA': 'musc',
}
NIVEL = {'Básico': 1, 'Intermedio': 2, 'Avanzado': 3, 'Experto': 4}


def leer():
    doc = Document(ORIGEN)
    bloque = apartado = None
    tarjetas = []
    for nodo in doc.element.body.iterchildren():
        tipo = nodo.tag.split('}')[1]
        if tipo == 'p':
            p = Paragraph(nodo, doc)
            estilo, texto = p.style.name, p.text.strip()
            if estilo.startswith('Heading 1'):
                bloque = texto
            elif estilo.startswith('Heading 2'):
                apartado = texto
        elif tipo == 'tbl' and bloque in SISTEMA:
            filas = Table(nodo, doc).rows
            if not filas[0].cells[0].text.strip().startswith('Nivel'):
                continue
            for fila in filas[1:]:
                nivel, q, a = (c.text.strip() for c in fila.cells[:3])
                tarjetas.append({'bloque': bloque, 'tema': apartado, 'nivel': nivel, 'q': q, 'a': a})
        if tipo == 'p' and bloque and bloque.startswith('Bibliograf'):
            break
    return tarjetas


def musculo_de(tema, tarjetas):
    """En Miología cada apartado gira en torno a un músculo; se toma de «¿Dónde se ubica el músculo X?»."""
    for t in tarjetas:
        m = re.match(r'¿Dónde se ubica el músculo (.+)\?$', t['q'])
        if t['tema'] == tema and m:
            return m.group(1)
    return None


def main():
    crudas = leer()
    salida = []
    for i, t in enumerate(crudas, 1):
        c = {
            'id': 'v%03d' % i,
            'm': SISTEMA[t['bloque']],
            't': t['tema'],
            'd': NIVEL[t['nivel']],
            'q': t['q'],
            'a': t['a'],
            'f': 'vanesa',
        }
        if t['bloque'] == 'MIOLOGÍA':
            mus = musculo_de(t['tema'], crudas)
            if mus:
                c['sub'] = mus
        salida.append(c)
    SALIDA.write_text(json.dumps(salida, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    print(len(salida), 'tarjetas ->', SALIDA.relative_to(RAIZ))


if __name__ == '__main__':
    main()
