import { describe, expect, it } from 'vitest';
/* Integridad del contenido: atrapa errores al editar los JSON de data/. */
import BANK from '../data/bank.json';
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
