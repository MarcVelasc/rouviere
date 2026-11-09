import { describe, expect, it } from 'vitest';
import { nz, pad, shuffle, el } from '../core/dom.js';

describe('utilidades del DOM', () => {
  it('nz normaliza para buscar: minúsculas, sin tildes ni espacios sobrantes', () => {
    expect(nz('  Fémur Ánterior ')).toBe('femur anterior');
    expect(nz('Nervio ÓPTICO')).toBe('nervio optico');
  });

  it('pad completa con cero a dos dígitos', () => {
    expect(pad(5)).toBe('05');
    expect(pad(12)).toBe('12');
  });

  it('shuffle cambia el orden pero conserva los elementos', () => {
    const a = [1, 2, 3, 4, 5, 6];
    const r = shuffle([...a]);
    expect([...r].sort()).toEqual(a);
  });

  it('el crea un elemento con clase y texto', () => {
    const e = el('p', 'nota', 'Hola');
    expect(e.tagName).toBe('P');
    expect(e.className).toBe('nota');
    expect(e.textContent).toBe('Hola');
  });
});
