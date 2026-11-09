/**
 * Almacenamiento clave-valor. Las funcionalidades guardan datos a través de esta
 * interfaz y no tocan localStorage directamente: así se puede cambiar por otro
 * almacenamiento (o uno en memoria para los tests) sin modificar las pantallas.
 */
export interface KeyValueStore {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
}

/** Envuelve localStorage/sessionStorage: en modo privado o con datos bloqueados pueden fallar. */
function fromWebStorage(getStorage: () => Storage): KeyValueStore {
  return {
    get(key) {
      try {
        return getStorage().getItem(key);
      } catch {
        return null;
      }
    },
    set(key, value) {
      try {
        getStorage().setItem(key, value);
      } catch {
        /* sin almacenamiento disponible: la app sigue funcionando sin recordar */
      }
    },
    remove(key) {
      try {
        getStorage().removeItem(key);
      } catch {
        /* ignorar */
      }
    },
  };
}

export const persistentStore = (): KeyValueStore => fromWebStorage(() => window.localStorage);
export const sessionStore = (): KeyValueStore => fromWebStorage(() => window.sessionStorage);

export function memoryStore(): KeyValueStore {
  const data = new Map<string, string>();
  return {
    get: (key) => data.get(key) ?? null,
    set: (key, value) => void data.set(key, value),
    remove: (key) => void data.delete(key),
  };
}
