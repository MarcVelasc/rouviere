import { describe, expect, it } from 'vitest';
/* Integridad del contenido: atrapa errores al editar los JSON de data/. */
import BANK from '../data/bank.json';
import BANK_EQ from '../data/bank-equipo.json';
import BANK_EL from '../data/bank-emi-leo.json';
import CASOS from '../data/casos.json';
import COMP from '../data/comp.json';
import FICHAS from '../data/fichas-equipo.json';
import FICHAS_EL from '../data/fichas-emi-leo.json';
import { campos } from '../features/fichas/fichas.js';
import QB from '../data/qb.json';
import RUTA from '../data/ruta.json';
import LIB from '../data/lib.json';

const unicos = (xs) => new Set(xs).size === xs.length;

describe('tarjetas (data/bank.json)', () => {
  it('cada tarjeta tiene id único, pregunta y respuesta', () => {
    expect(unicos(BANK.map((c) => c.id))).toBe(true);
    for (const c of BANK) {
      expect(c.q, c.id).toBeTruthy();
      expect(c.a, c.id).toBeTruthy();
    }
  });
});

describe('tarjetas del equipo (data/bank-equipo.json)', () => {
  it('no repiten id con el banco base y traen nivel del 1 al 4', () => {
    expect(unicos(BANK.concat(BANK_EQ).map((c) => c.id))).toBe(true);
    for (const c of BANK_EQ) {
      expect(c.q && c.a, c.id).toBeTruthy();
      expect([1, 2, 3, 4], c.id).toContain(c.d);
    }
  });
  it('cada tema cae en alguna competencia', () => {
    const pares = new Set(COMP.flatMap((k) => k[3].map((p) => p[0] + '|' + p[1])));
    for (const c of BANK_EQ) expect(pares.has(c.m + '|' + c.t), c.id + ' ' + c.t).toBe(true);
  });
});

describe('tarjetas de Emi y Leo (data/bank-emi-leo.json)', () => {
  it('son 640 de cada uno, sin repetir id y con nivel del 1 al 4', () => {
    expect(BANK_EL.filter((c) => c.f === 'emi').length).toBe(640);
    expect(BANK_EL.filter((c) => c.f === 'leo').length).toBe(640);
    expect(unicos(BANK.concat(BANK_EQ, BANK_EL).map((c) => c.id))).toBe(true);
    for (const c of BANK_EL) {
      expect(c.q && c.a && c.sub, c.id).toBeTruthy();
      expect([1, 2, 3, 4], c.id).toContain(c.d);
    }
  });
  it('cada tema cae en alguna competencia', () => {
    const pares = new Set(COMP.flatMap((k) => k[3].map((p) => p[0] + '|' + p[1])));
    for (const c of BANK_EL) expect(pares.has(c.m + '|' + c.t), c.id + ' ' + c.t).toBe(true);
  });
});

describe('fichas de Emi y Leo (data/fichas-emi-leo.json)', () => {
  it('tienen id único entre todas las fichas, bloque conocido y campos', () => {
    const todas = FICHAS.fichas.concat(FICHAS_EL.fichas);
    expect(unicos(todas.map((f) => f.id))).toBe(true);
    for (const f of FICHAS_EL.fichas) {
      expect(FICHAS_EL.bloques, f.id).toContain(f.b);
      expect(f.n && f.z, f.id).toBeTruthy();
      const c = campos(f.p[0]);
      expect(c && c[0][0], f.id).toBe('Ubicación');
      expect(
        c.map((x) => x[0]),
        f.id,
      ).toContain('Función');
    }
  });
});

describe('casos clínicos (data/casos.json)', () => {
  it('son 14, con una correcta que existe y competencia conocida', () => {
    const claves = COMP.map((k) => k[0]);
    let n = 0;
    for (const [k, fases] of Object.entries(CASOS)) {
      expect(claves, k).toContain(k);
      for (const f of fases)
        for (const c of f.casos) {
          n++;
          expect(c.caso && c.pregunta && c.explicacion, k + ' ' + c.n).toBeTruthy();
          expect(c.opciones[c.correcta], k + ' ' + c.n).toBeTruthy();
        }
    }
    expect(n).toBe(14);
  });
});

describe('fichas del equipo (data/fichas-equipo.json)', () => {
  it('tienen id único, bloque conocido y texto', () => {
    expect(unicos(FICHAS.fichas.map((f) => f.id))).toBe(true);
    for (const f of FICHAS.fichas) {
      expect(FICHAS.bloques, f.id).toContain(f.b);
      expect(f.n && f.z && f.p.length, f.id).toBeTruthy();
    }
  });
  it('separa «Etiqueta: texto» en campos', () => {
    expect(campos('Origen: Arco cigomático. Inserción: Rama mandibular. Acción: Eleva.')).toEqual([
      ['Origen', 'Arco cigomático.'],
      ['Inserción', 'Rama mandibular.'],
      ['Acción', 'Eleva.'],
    ]);
    expect(campos('Texto corrido sin etiquetas.')).toBeNull();
  });
});

describe('preguntas de simulacro (data/qb.json)', () => {
  it('cada pregunta tiene id único y una respuesta correcta que existe entre sus opciones', () => {
    expect(unicos(QB.map((q) => q.id))).toBe(true);
    for (const q of QB) {
      expect(Array.isArray(q.o), q.id).toBe(true);
      expect(q.o.length, q.id).toBeGreaterThanOrEqual(2);
      expect(Number.isInteger(q.a) && q.a >= 0 && q.a < q.o.length, q.id).toBe(true);
    }
  });
});

describe('ruta de aprendizaje (data/ruta.json)', () => {
  it('cada tramo tiene id único y nodos', () => {
    expect(unicos(RUTA.map((r) => r.id))).toBe(true);
    for (const r of RUTA) expect(r.nodos.length, r.id).toBeGreaterThan(0);
  });
});

describe('biblioteca (data/lib.json)', () => {
  it('cada recurso tiene id único, título y enlace', () => {
    expect(unicos(LIB.map((l) => l.id))).toBe(true);
    for (const l of LIB) {
      expect(l.tit, l.id).toBeTruthy();
      expect(l.url, l.id).toMatch(/^https?:\/\//);
    }
  });
});
