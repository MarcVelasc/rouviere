"""Convierte la «Biblioteca anatómica» del equipo de contenido (Word) a JSON para la app.

Origen: docs/contenido/ROUVIERE_Biblioteca_Anatomica_Definitiva.docx (responsable: Vanesa),
desde «1. ANATOMÍA GENERAL» hasta el final (las tarjetas las lee scripts/tarjetas-equipo.py).
Salida: src/rouviere/data/fichas-equipo.json

- Cada título de nivel 3 es una ficha (hueso, articulación o músculo). Las filas de las tablas
  «por regiones» también son fichas.
- Los títulos de nivel 2 con texto corrido son resúmenes del tema.
- El texto se copia tal cual. El script solo agrupa por bloque y región, y quita duplicados:
  los músculos que aparecen en «4.1 Fichas musculares» y otra vez en «C. Miología» se quedan
  con la versión de C, que es la más completa.
- Se omiten las notas internas (secciones 5, 6 y D, y «Grupos que deben ampliarse»).
Para volver a generarlo:  python3 scripts/fichas-equipo.py   (requiere python-docx)
"""
import json
import re
import unicodedata
from pathlib import Path

from docx import Document
from docx.table import Table
from docx.text.paragraph import Paragraph

RAIZ = Path(__file__).resolve().parent.parent
ORIGEN = RAIZ / 'docs/contenido/ROUVIERE_Biblioteca_Anatomica_Definitiva.docx'
SALIDA = RAIZ / 'src/rouviere/data/fichas-equipo.json'

BLOQUES = [
    (r'^1\. ANATOM', 'Anatomía general'),
    (r'^2\. OSTEO', 'Osteología'),
    (r'^A\. OSTEO', 'Osteología'),
    (r'^3\. ARTRO', 'Artrología'),
    (r'^B\. ARTRO', 'Artrología'),
    (r'^4\. MIOLO', 'Miología'),
    (r'^C\. MIOLO', 'Miología'),
    (r'^AMPLIACI.N · T.RAX', 'Tórax'),
    (r'^AMPLIACI.N · ABDOMEN', 'Abdomen'),
    (r'^AMPLIACI.N · PELVIS', 'Pelvis'),
    (r'^AMPLIACI.N · SISTEMA NERVIOSO', 'Sistema nervioso'),
]
ORDEN_BLOQUES = ['Anatomía general', 'Osteología', 'Artrología', 'Miología', 'Tórax', 'Abdomen',
                 'Pelvis', 'Sistema nervioso']
OMITIR_H2 = ('grupos que deben ampliarse', 'flashcards adicionales')

# Huesos de «A. Osteología» que vienen sin subtítulo de región.
HUESO_ZONA = {
    'Frontal': 'Cráneo', 'Parietal': 'Cráneo', 'Temporal': 'Cráneo', 'Occipital': 'Cráneo',
    'Esfenoides': 'Cráneo', 'Etmoides': 'Cráneo', 'Mandíbula': 'Cara', 'Maxilar': 'Cara',
    'Cigomático': 'Cara', 'Atlas C1': 'Columna vertebral', 'Axis C2': 'Columna vertebral',
    'Sacro': 'Columna vertebral', 'Esternón': 'Tórax óseo', 'Costilla típica': 'Tórax óseo',
    'Clavícula': 'Miembro superior', 'Escápula': 'Miembro superior', 'Húmero': 'Miembro superior',
    'Radio': 'Miembro superior', 'Ulna (ulna)': 'Miembro superior', 'Hueso coxal': 'Pelvis ósea',
    'Fémur': 'Miembro inferior', 'Patela (rótula)': 'Miembro inferior',
    'Tibia': 'Miembro inferior', 'Fíbula (peroné)': 'Miembro inferior',
    'Talus (astrágalo)': 'Tarso y pie', 'Calcáneo': 'Tarso y pie',
}
GRUPO_OSTEO = {
    'COLUMNA VERTEBRAL': 'Columna vertebral', 'HUESOS DE LA CARA': 'Cara', 'MANO Y CARPO':
    'Mano y carpo', 'PELVIS ÓSEA': 'Pelvis ósea', 'TARSO Y PIE': 'Tarso y pie', 'TÓRAX ÓSEO':
    'Tórax óseo', 'Fichas por regiones': 'Resumen por regiones',
    'GENERALIDADES DE OSTEOLOGÍA · Complemento descriptivo': 'Generalidades',
}
ZONA_MIO = {
    'Cabeza / cara': 'Cara', 'Cara': 'Cara', 'Masticación': 'Masticación', 'Cuello': 'Cuello',
    'Espalda/cuello': 'Espalda', 'Espalda': 'Espalda', 'Tórax': 'Tórax', 'Abdomen': 'Abdomen',
    'Pelvis': 'Pelvis y periné', 'Pelvis/periné': 'Pelvis y periné',
    'Pelvis y periné': 'Pelvis y periné', 'Hombro': 'Hombro y brazo', 'Brazo': 'Hombro y brazo',
    'Hombro y brazo': 'Hombro y brazo', 'Antebrazo': 'Antebrazo y mano',
    'Mano': 'Antebrazo y mano', 'Antebrazo y mano': 'Antebrazo y mano',
    'Cadera': 'Cadera y muslo', 'Muslo': 'Cadera y muslo', 'Cadera y muslo': 'Cadera y muslo',
    'Pierna': 'Pierna y pie', 'Pierna y pie': 'Pierna y pie', 'Pie': 'Pierna y pie',
}
ZONA_ARTRO = {
    'General': 'General', 'Cráneo': 'Cráneo', 'Columna': 'Columna', 'Columna cervical': 'Columna',
    'Columna lumbosacra': 'Columna', 'Columna terminal': 'Columna', 'Tórax': 'Tórax',
    'Cintura escapular': 'Hombro', 'Hombro': 'Hombro', 'Codo': 'Codo y antebrazo',
    'Antebrazo': 'Codo y antebrazo', 'Muñeca': 'Muñeca y mano', 'Mano': 'Muñeca y mano',
    'Pelvis': 'Pelvis', 'Cadera': 'Cadera', 'Rodilla': 'Rodilla', 'Pierna': 'Tobillo y pie',
    'Tobillo': 'Tobillo y pie', 'Pie': 'Tobillo y pie',
}


def clave(s):
    s = unicodedata.normalize('NFD', s.lower())
    return ''.join(c for c in s if unicodedata.category(c) != 'Mn')


def slug(s):
    return re.sub(r'[^a-z0-9]+', '-', clave(s)).strip('-')


def leer():
    doc = Document(ORIGEN)
    bloque = h2 = cur = None
    crudas = []

    def cerrar():
        nonlocal cur
        if cur and cur['p']:
            crudas.append(cur)
        cur = None

    for nodo in doc.element.body.iterchildren():
        tipo = nodo.tag.split('}')[1]
        if tipo == 'p':
            p = Paragraph(nodo, doc)
            estilo, x = p.style.name, p.text.strip()
            if estilo.startswith('Heading 1'):
                cerrar()
                h2 = None
                bloque = next((b for r, b in BLOQUES if re.match(r, x)), None)
                if bloque:
                    cur = {'tipo': 'res', 'b': bloque, 'g': '', 'n': 'Introducción', 'r': '', 'p': []}
                continue
            if not bloque:
                continue
            if estilo.startswith('Heading 2'):
                cerrar()
                h2 = re.sub(r'^\d+\.\d+\s*', '', x)
                if clave(h2).startswith(OMITIR_H2):
                    h2 = '__omitir__'
                    continue
                cur = {'tipo': 'res', 'b': bloque, 'g': h2, 'n': h2, 'r': '', 'p': []}
            elif estilo.startswith('Heading 3'):
                cerrar()
                n, _, r = x.partition(' · ')
                cur = {'tipo': 'ficha', 'b': bloque, 'g': h2 or '', 'n': n.strip(), 'r': r.strip(), 'p': []}
            elif x and cur is not None and h2 != '__omitir__':
                cur['p'].append(x)
        elif tipo == 'tbl' and bloque:
            filas = [[c.text.strip() for c in f.cells] for f in Table(nodo, doc).rows]
            if filas[0][0].startswith('Nivel'):
                continue
            cerrar()
            cab = filas[0]
            for f in filas[1:]:
                crudas.append({'tipo': 'ficha', 'b': bloque, 'g': h2 or '', 'n': f[0], 'r': '',
                               'p': [cab[i] + ': ' + f[i] for i in range(1, len(f)) if f[i]]})
    cerrar()
    return crudas


def zona(f, previa):
    b, g, r, n = f['b'], f['g'], f['r'], f['n']
    if f['tipo'] == 'intro':
        return ZONA_MIO[n]
    if f['tipo'] == 'res':
        return 'Resumen del tema'
    if b == 'Osteología':
        return GRUPO_OSTEO.get(g) or HUESO_ZONA.get(n) or 'Otros huesos'
    if b == 'Artrología':
        if g == 'Articulaciones por región':
            return 'Resumen por regiones'
        if n == 'Temporomandibular':
            return 'Cráneo'
        return ZONA_ARTRO.get(r) or previa or 'General'
    if b == 'Miología':
        return ZONA_MIO.get(r) or ZONA_MIO.get(g) or 'General'
    return g or 'General'


def main():
    crudas = leer()
    # Músculos repetidos: se queda la versión de «C. Miología» (sin el subtítulo 4.1).
    vistos = {}
    for i, f in enumerate(crudas):
        if f['tipo'] == 'ficha' and f['b'] == 'Miología':
            vistos.setdefault(clave(f['n']), []).append(i)
    fuera = {ix[0] for ix in vistos.values() if len(ix) > 1}

    salida, usados, previa = [], set(), None
    for i, f in enumerate(crudas):
        if i in fuera:
            continue
        # En Miología, el texto bajo «Cara», «Cuello»… presenta esa región: va arriba de sus fichas.
        if f['tipo'] == 'res' and f['b'] == 'Miología' and f['n'] in ZONA_MIO:
            f = dict(f, tipo='intro')
        z = zona(f, previa)
        if f['b'] == 'Artrología' and f['tipo'] == 'ficha' and z not in ('Resumen por regiones', 'General'):
            previa = z
        n = f['n'] if f['n'] != 'Introducción' else 'Introducción a ' + f['b'].lower()
        base = slug(f['b'] + '-' + n)
        fid, k = base, 2
        while fid in usados:
            fid, k = f'{base}-{k}', k + 1
        usados.add(fid)
        salida.append({'id': fid, 'tipo': f['tipo'], 'b': f['b'], 'z': z, 'n': n, 'p': f['p']})
    salida.sort(key=lambda f: ORDEN_BLOQUES.index(f['b']))  # estable: respeta el orden del Word
    datos = {
        'fuente': 'Biblioteca anatómica de Vanesa (equipo de contenido de ROUVIÈRE)',
        'estado': 'En revisión: falta confirmar con la bibliografía.',
        'bibliografia': [
            'Moore, Dalley y Agur. Anatomía con orientación clínica.',
            'Drake, Vogl y Mitchell. Gray. Anatomía para estudiantes.',
            'Netter. Atlas de anatomía humana.',
            'Rouvière y Delmas. Anatomía humana: descriptiva, topográfica y funcional.',
        ],
        'bloques': ORDEN_BLOQUES,
        'fichas': salida,
    }
    SALIDA.write_text(json.dumps(datos, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    n_f = sum(1 for f in salida if f['tipo'] == 'ficha')
    print(n_f, 'fichas +', len(salida) - n_f, 'resúmenes e introducciones ->', SALIDA.relative_to(RAIZ))


if __name__ == '__main__':
    main()
