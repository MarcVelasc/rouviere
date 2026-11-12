"""Recorta el atlas 3D por competencia.

Lee public/app/atlas/atlas-index.json y los .bin de cada sistema, y escribe
public/app/atlas/comp-<k>.json (y comp-<k>.bin si hace falta) con solo las piezas de la zona de cada
competencia (por ejemplo, la 1 solo trae cabeza y cuello). La geometría no se toca:
se copian los mismos bytes con nuevos desplazamientos.

Uso, desde la raíz del proyecto:  python3 scripts/atlas-competencias.py
"""

import json
from pathlib import Path

ATLAS = Path('public/app/atlas')


def cy(p):
    return (p['b'][1] + p['b'][4]) / 2


def cx(p):
    return (p['b'][0] + p['b'][3]) / 2


def alto(p):
    return p['b'][4] - p['b'][1]


# Zona de cada competencia: [sistema del atlas, condición sobre la caja de la pieza].
# Las alturas van en metros sobre el suelo (el modelo mide unos 1,7 m).
def cabeza(p):
    return p['b'][1] >= 1.375 and cy(p) >= 1.42


ZONAS = {
    'c1': [('oseo', cabeza), ('muscular', cabeza), ('sent', lambda p: cy(p) >= 1.42)],
    'c2': [('oseo', lambda p: True)],
    'c3': [
        ('oseo', lambda p: 1.02 <= cy(p) <= 1.45 and abs(cx(p)) < 0.2 and alto(p) < 0.5),
        ('resp', lambda p: cy(p) < 1.47),
        ('cardio', lambda p: p['s'] == 'cardiac' or (1.05 <= cy(p) <= 1.42 and abs(cx(p)) < 0.12 and alto(p) < 0.4)),
        ('dig', lambda p: 1.05 <= cy(p) <= 1.42),
    ],
    'c4': [
        ('oseo', lambda p: 0.78 <= cy(p) <= 1.12 and abs(cx(p)) < 0.2 and alto(p) < 0.4),
        ('dig', lambda p: cy(p) < 1.25),
        ('uri', lambda p: True),
        ('repro', lambda p: True),
    ],
    'c5': [('nerv', lambda p: True)],
    'base': [('otros', lambda p: True)],
}


def main():
    ix = json.loads((ATLAS / 'atlas-index.json').read_text(encoding='utf-8'))
    grupos = {g['k']: g for g in ix['grupos']}
    bins = {}
    for k, reglas in ZONAS.items():
        out = bytearray()
        partes = []

        def pega(trozo):
            while len(out) % 4:
                out.append(0)
            ini = len(out)
            out.extend(trozo)
            return ini

        # Si la competencia usa un sistema entero, se reutiliza su .bin tal cual.
        if len(reglas) == 1 and all(reglas[0][1](p) for p in grupos[reglas[0][0]]['parts']):
            g = reglas[0][0]
            partes = [{key: p[key] for key in ('i', 'n', 'c', 's', 'v', 'k', 'w', 'p', 'm', 'x')} for p in grupos[g]['parts']]
            meta = {'bin': f'atlas-{g}.bin', 'origin': ix['origin'], 'scale': ix['scale'], 'parts': partes}
            (ATLAS / f'comp-{k}.json').write_text(
                json.dumps(meta, ensure_ascii=False, separators=(',', ':')), encoding='utf-8'
            )
            print(f'{k}: {len(partes)} piezas, usa atlas-{g}.bin')
            continue
        for g, vale in reglas:
            if g not in bins:
                bins[g] = (ATLAS / f'atlas-{g}.bin').read_bytes()
            buf = bins[g]
            for p in grupos[g]['parts']:
                if not vale(p):
                    continue
                q = {key: p[key] for key in ('i', 'n', 'c', 's', 'v', 'k', 'w')}
                q['p'] = pega(buf[p['p']:p['p'] + p['v'] * 6])
                q['m'] = pega(buf[p['m']:p['m'] + p['v'] * 6])
                q['x'] = pega(buf[p['x']:p['x'] + p['k'] * (4 if p['w'] else 2)])
                partes.append(q)
        (ATLAS / f'comp-{k}.bin').write_bytes(out)
        meta = {'bin': f'comp-{k}.bin', 'origin': ix['origin'], 'scale': ix['scale'], 'parts': partes}
        (ATLAS / f'comp-{k}.json').write_text(
            json.dumps(meta, ensure_ascii=False, separators=(',', ':')), encoding='utf-8'
        )
        print(f'{k}: {len(partes)} piezas, {len(out) / 1e6:.1f} MB')


if __name__ == '__main__':
    main()
