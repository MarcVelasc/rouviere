import { describe, expect, it } from 'vitest';
/* Integridad del contenido: atrapa errores al editar los JSON de data/. */
import BANK from '../data/bank.json';
import BANK_EQ from '../data/bank-equipo.json';
import COMP from '../data/comp.json';
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
