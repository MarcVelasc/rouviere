import { useCallback, useSyncExternalStore } from 'react';

/** Pantallas de compu: el acceso pasa de una columna (celular) a dos. Igual que en los CSS (960px). */
export const DESKTOP = '(min-width: 960px)';

/** true mientras la consulta CSS se cumpla; se actualiza al cambiar el tamaño de la ventana. */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mq = window.matchMedia?.(query);
      mq?.addEventListener('change', onChange);
      return () => mq?.removeEventListener('change', onChange);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia?.(query).matches ?? false,
    () => false,
  );
}
