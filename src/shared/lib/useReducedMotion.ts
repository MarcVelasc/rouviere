import { useMediaQuery } from './useMediaQuery';

/** true si la persona pidió menos movimiento en su sistema (accesibilidad). */
export function useReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}
