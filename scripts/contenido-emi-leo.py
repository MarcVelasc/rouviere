"""Convierte los bancos de Emi y Leo (PDF) a JSON para la app: tarjetas y fichas.

Origen (equipo de contenido):
  docs/contenido/ROUVIERE_Emi_Biblioteca_y_Flashcards.pdf  (cardiovascular, linfático,
      respiratorio, digestivo, urinario, reproductor)
  docs/contenido/ROUVIERE_Leo_Biblioteca_y_Flashcards.pdf  (endocrino, sentidos, nervioso
      periférico y autónomo, neuroanatomía)
Salida:
  src/rouviere/data/bank-emi-leo.json    640 + 640 tarjetas en 4 niveles
  src/rouviere/data/fichas-emi-leo.json  las fichas del anexo «Biblioteca anatómica» de cada uno

Las tablas «Nivel | Anverso · Pregunta | Reverso · Respuesta» se leen por la posición de las
columnas en la página. El texto se copia tal cual; el script solo asigna sistema y tema de la
app (TEMA) y guarda el apartado del PDF en «sub», que la app muestra junto al tema.
Para volver a generarlo:  python3 scripts/contenido-emi-leo.py   (requiere pdfplumber)
"""
import json
import re
import unicodedata
from collections import Counter
from pathlib import Path

import pdfplumber

RAIZ = Path(__file__).resolve().parent.parent
DOCS = RAIZ / 'docs/contenido'
FUENTES = [
    ('emi', 'e', DOCS / 'ROUVIERE_Emi_Biblioteca_y_Flashcards.pdf'),
    ('leo', 'l', DOCS / 'ROUVIERE_Leo_Biblioteca_y_Flashcards.pdf'),
]
SALIDA_T = RAIZ / 'src/rouviere/data/bank-emi-leo.json'
SALIDA_F = RAIZ / 'src/rouviere/data/fichas-emi-leo.json'
NIVEL = {'Básico': 1, 'Intermedio': 2, 'Avanzado': 3, 'Experto': 4}

# Apartado del PDF (inicio del título) -> (sistema de la app, tema de comp.json)
TEMA = [
    # Emi
    ('Corazón: posición', 'cardio', 'Anatomía del corazón'),
    ('Cavidades, tabiques', 'cardio', 'Anatomía del corazón'),
    ('Válvulas cardíacas', 'cardio', 'Anatomía del corazón'),
    ('Arterias y venas coronarias', 'cardio', 'Circulación coronaria'),
    ('Sistema de conducción', 'cardio', 'Sistema de conducción'),
    ('Grandes vasos', 'cardio', 'Grandes vasos'),
    ('Vasos sistémicos', 'cardio', 'Grandes vasos'),
    ('Linfa, capilares', 'cardio', 'Sistema linfático'),
    ('Conducto torácico', 'cardio', 'Sistema linfático'),
    ('Ganglios linfáticos', 'cardio', 'Sistema linfático'),
    ('Bazo', 'cardio', 'Sistema linfático'),
    ('Timo, amígdalas', 'cardio', 'Sistema linfático'),
    ('Cavidad nasal', 'resp', 'Vías aéreas superiores'),
    ('Faringe y laringe', 'resp', 'Vías aéreas superiores'),
    ('Tráquea, bronquios', 'resp', 'Tráquea y bronquios'),
    ('Pulmones', 'resp', 'Pulmones'),
    ('Pleuras', 'resp', 'Pleura y mediastino'),
    ('Alvéolos', 'resp', 'Pulmones'),
    ('Cavidad oral', 'dig', 'Boca y glándulas salivales'),
    ('Faringe digestiva', 'dig', 'Esófago'),
    ('Estómago', 'dig', 'Estómago'),
    ('Intestino delgado', 'dig', 'Intestino delgado'),
    ('Intestino grueso', 'dig', 'Intestino grueso'),
    ('Recto, canal anal', 'dig', 'Intestino grueso'),
    ('Hígado', 'dig', 'Hígado y vías biliares'),
    ('Páncreas, peritoneo', 'dig', 'Páncreas'),
    ('Riñones', 'uri', 'Riñón'),
    ('Arquitectura renal', 'uri', 'Riñón'),
    ('Irrigación renal', 'uri', 'Riñón'),
    ('Cálices', 'uri', 'Vías urinarias'),
    ('Vejiga', 'uri', 'Vías urinarias'),
    ('Uretra', 'uri', 'Vías urinarias'),
    ('Testículos', 'rep', 'Aparato reproductor masculino'),
    ('Cordón espermático', 'rep', 'Aparato reproductor masculino'),
    ('Vesículas seminales', 'rep', 'Aparato reproductor masculino'),
    ('Pene', 'rep', 'Aparato reproductor masculino'),
    ('Ovarios', 'rep', 'Aparato reproductor femenino'),
    ('Trompas uterinas', 'rep', 'Aparato reproductor femenino'),
    ('Útero', 'rep', 'Aparato reproductor femenino'),
    ('Vagina', 'rep', 'Aparato reproductor femenino'),
    # Leo
    ('Hipotálamo y relación', 'endo', 'Hipófisis'),
    ('Adenohipófisis', 'endo', 'Hipófisis'),
    ('Neurohipófisis', 'endo', 'Hipófisis'),
    ('Tiroides', 'endo', 'Tiroides y paratiroides'),
    ('Paratiroides', 'endo', 'Tiroides y paratiroides'),
    ('Glándulas suprarrenales', 'endo', 'Suprarrenales'),
    ('Páncreas endocrino', 'endo', 'Páncreas endocrino'),
    ('Glándula pineal', 'endo', 'Otras glándulas'),
    ('Tejidos endocrinos difusos', 'endo', 'Otras glándulas'),
    ('Receptores sensoriales', 'sent', 'Receptores sensoriales'),
    ('Globo ocular', 'sent', 'Ojo'),
    ('Retina', 'sent', 'Ojo'),
    ('Cristalino', 'sent', 'Ojo'),
    ('Vía visual', 'sent', 'Ojo'),
    ('Oído externo', 'sent', 'Oído'),
    ('Cóclea', 'sent', 'Oído'),
    ('Aparato vestibular', 'sent', 'Oído'),
    ('Olfato', 'sent', 'Olfato y gusto'),
    ('Gusto', 'sent', 'Olfato y gusto'),
    ('Nervios espinales', 'nerv', 'Plexos nerviosos'),
    ('Nervios craneales', 'nerv', 'Pares craneales'),
    ('Plexo', 'nerv', 'Plexos nerviosos'),
    ('Dermatomas', 'nerv', 'Plexos nerviosos'),
    ('Sistema simpático', 'nerv', 'Sistema nervioso autónomo'),
    ('Sistema parasimpático', 'nerv', 'Sistema nervioso autónomo'),
    ('Organización del sistema nervioso', 'nerv', 'Organización general'),
    ('Hemisferios', 'nerv', 'Encéfalo'),
    ('Corteza:', 'nerv', 'Encéfalo'),
    ('Núcleos basales', 'nerv', 'Encéfalo'),
    ('Diencéfalo', 'nerv', 'Encéfalo'),
    ('Tronco encefálico', 'nerv', 'Encéfalo'),
    ('Cerebelo', 'nerv', 'Encéfalo'),
    ('Irrigación cerebral', 'nerv', 'Encéfalo'),
    ('Médula espinal', 'nerv', 'Médula espinal'),
    ('Vías ascendentes', 'nerv', 'Médula espinal'),
    ('Meninges', 'nerv', 'Meninges y líquido cefalorraquídeo'),
]


def tema_de(apartado):
    for ini, m, t in TEMA:
        if apartado.startswith(ini):
            return m, t
    raise SystemExit('Apartado sin tema asignado: ' + apartado)


def unir(palabras):
    s = ' '.join(palabras)
    return re.sub(r'(\w)- (\w)', r'\1-\2', s)  # «hipotálamo- hipofisario» partido entre líneas


def lineas(pg):
    ws = sorted(pg.extract_words(x_tolerance=1.5), key=lambda w: (round(w['top']), w['x0']))
    out = []
    for w in ws:
        if out and abs(out[-1][0] - w['top']) < 3:
            out[-1][1].append(w)
        else:
            out.append([w['top'], [w]])
    return [ws for _, ws in out]


def leer_tarjetas(pdf):
    cols = apartado = actual = None
    tarjetas = []
    for pg in pdf.pages:
        for ws in lineas(pg):
            texto = ' '.join(w['text'] for w in ws)
            if texto.startswith('ANEXO'):
                if actual:
                    tarjetas.append(actual)
                return tarjetas
            if ws[0]['text'] == 'Nivel' and any(w['text'].startswith('Anverso') for w in ws):
                a = next(w for w in ws if w['text'].startswith('Anverso'))
                r = next(w for w in ws if w['text'].startswith('Reverso'))
                cols = (a['x0'] - 2, r['x0'] - 2)
                continue
            if cols and ws[0]['text'] in NIVEL and ws[0]['x0'] < cols[0]:
                if actual:
                    tarjetas.append(actual)
                actual = {'tema': apartado, 'd': NIVEL[ws[0]['text']], 'q': [], 'a': []}
                resto = ws[1:]
            elif cols and actual and ws[0]['x0'] >= cols[0] - 1:
                resto = ws
            else:
                if actual:
                    tarjetas.append(actual)
                    actual = None
                if not texto.isupper() and not re.match(r'^(Responsable|Banco|ROUVI|Cómo|Cada|Nota)', texto):
                    apartado = texto
                continue
            for w in resto:
                (actual['q'] if w['x0'] < cols[1] else actual['a']).append(w['text'])
    return tarjetas


# ---------- fichas del anexo ----------
# Emi usa ocho campos; Leo, en neuroanatomía, cambia algunos (División anatómica, Conexiones…).
ETIQ = ['Nombre', 'Ubicación', 'Partes anatómicas', 'División anatómica',
        'Características principales', 'Relaciones anatómicas', 'Conexiones nerviosas',
        'Irrigación cuando corresponda', 'Irrigación', 'Inervación', 'Función']
OBLIGATORIAS = ['Nombre', 'Ubicación', 'Función']
BLOQUE = {
    'SISTEMA CARDIOVASCULAR': 'Cardiovascular', 'SISTEMA LINFÁTICO': 'Linfático',
    'SISTEMA RESPIRATORIO': 'Respiratorio', 'SISTEMA DIGESTIVO': 'Digestivo',
    'SISTEMA URINARIO': 'Urinario', 'SISTEMA REPRODUCTOR': 'Reproductor',
    'SISTEMA ENDOCRINO': 'Endocrino', 'ÓRGANOS DE LOS SENTIDOS': 'Órganos de los sentidos',
    'SISTEMA NERVIOSO PERIFÉRICO': 'Sistema nervioso', 'NEUROANATOMÍA': 'Sistema nervioso',
}
ZONA_NERV = {'SISTEMA NERVIOSO PERIFÉRICO': 'Periférico y autónomo', 'NEUROANATOMÍA': 'Neuroanatomía'}


def clave(s):
    s = unicodedata.normalize('NFD', s.lower())
    return ''.join(c for c in s if unicodedata.category(c) != 'Mn')


def leer_fichas(pdf, quien):
    texto = '\n'.join(pg.extract_text() or '' for pg in pdf.pages)
    texto = texto[texto.index('ANEXO · BIBLIOTECA'):texto.index('CONTROL DE REVISIÓN')]
    fichas, sis = [], None
    # Cada ficha empieza con «E05-01 · Corazón» o «L11-F01 · Hipotálamo»; el sistema, con «5. SISTEMA …».
    partes = re.split(r'\n(?=(?:\d{1,2}\. [A-ZÁÉÍÓÚÑ]{4,}|[EL]\d{2}-F?\d{2} · ))', texto)
    for p in partes:
        m = re.match(r'\d{1,2}\. (.+)', p)
        if m:
            sis = next(k for k in BLOQUE if m.group(1).startswith(k))
            continue
        m = re.match(r'([EL]\d{2}-F?\d{2}) · (.+?)\n(.*)', p, re.S)
        if not m:
            continue
        cod, nombre, cuerpo = m.groups()
        cuerpo = re.sub(r'(\w)-\n(\w)', r'\1\2', cuerpo)
        cuerpo = re.sub(r'\s*\n\s*', ' ', cuerpo).strip()
        cuerpo = re.sub(r'\s+\d{1,2}\s*$', '', cuerpo)  # número de página al pie
        pat = '(' + '|'.join(re.escape(e) for e in ETIQ) + '): '
        trozos = re.split(pat, cuerpo)
        campos = [(trozos[i], trozos[i + 1].strip()) for i in range(1, len(trozos) - 1, 2)]
        faltan = [e for e in OBLIGATORIAS if e not in [c[0] for c in campos]]
        if faltan:
            raise SystemExit(f'{cod} {nombre}: faltan {faltan}')
        texto_f = ' '.join(f'{e.replace(" cuando corresponda", "")}: {v.rstrip(".")}.'
                           for e, v in campos if e != 'Nombre')
        b = BLOQUE[sis]
        z = ZONA_NERV.get(sis) or ('Masculino' if cod >= 'E10-01' and cod <= 'E10-06' else
                                   'Femenino' if cod.startswith('E10') else b)
        fichas.append({'id': quien + '-' + cod.lower(), 'tipo': 'ficha', 'b': b, 'z': z,
                       'n': nombre.strip(), 'p': [texto_f], 'cod': cod})
    return fichas


def main():
    tarjetas, fichas = [], []
    for quien, pref, ruta in FUENTES:
        with pdfplumber.open(ruta) as pdf:
            crudas = leer_tarjetas(pdf)
            por_apartado = Counter(c['tema'] for c in crudas)
            mal = {k: n for k, n in por_apartado.items() if n != 16}
            if len(crudas) != 640 or mal:
                raise SystemExit(f'{quien}: {len(crudas)} tarjetas; apartados incompletos {mal}')
            for i, c in enumerate(crudas, 1):
                m, t = tema_de(c['tema'])
                tarjetas.append({'id': '%s%03d' % (pref, i), 'm': m, 't': t, 'd': c['d'],
                                 'q': unir(c['q']), 'a': unir(c['a']), 'f': quien, 'sub': c['tema']})
            fichas += leer_fichas(pdf, quien)
    SALIDA_T.write_text(json.dumps(tarjetas, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    datos = {
        'fuente': 'Bibliotecas anatómicas de Emi y Leo (equipo de contenido de ROUVIÈRE)',
        'bloques': ['Cardiovascular', 'Linfático', 'Respiratorio', 'Digestivo', 'Urinario',
                    'Reproductor', 'Endocrino', 'Órganos de los sentidos', 'Sistema nervioso'],
        'fichas': fichas,
    }
    SALIDA_F.write_text(json.dumps(datos, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    print(len(tarjetas), 'tarjetas ->', SALIDA_T.relative_to(RAIZ))
    print(len(fichas), 'fichas ->', SALIDA_F.relative_to(RAIZ), Counter(f['b'] for f in fichas))


if __name__ == '__main__':
    main()
