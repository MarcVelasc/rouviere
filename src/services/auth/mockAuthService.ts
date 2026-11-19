import { AuthError, type AuthService, type Session, type User } from './AuthService';
import type { KeyValueStore } from '../storage/KeyValueStore';

/**
 * Autenticación de prueba, sin servidor: sirve para presentar y desarrollar las pantallas.
 * - "Probar sin cuenta" entra siempre con esta misma cuenta de ejemplo.
 * - "Iniciar sesión" busca la cuenta por correo (la contraseña no se comprueba).
 * - "Crear cuenta" guarda la cuenta en este navegador. Las contraseñas NO se guardan:
 *   esta implementación no es segura y no debe usarse con datos reales.
 */
export const DEMO_GUEST_USER: User = {
  id: 'g-demo',
  name: 'Estudiante Rouviere',
  email: 'prueba@rouviere.app',
  provider: 'guest',
};

/** La app de public/app/ revisa esta misma clave para saber si hay sesión. */
export const SESSION_KEY = 'rouviere.session';
const ACCOUNTS_KEY = 'rouviere.accounts';

interface MockOptions {
  store: KeyValueStore;
  /** Demora simulada en ms, para ver los estados de carga. */
  delay?: number;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function createMockAuthService({ store, delay = 900 }: MockOptions): AuthService {
  const readJson = <T>(key: string, fallback: T): T => {
    const raw = store.get(key);
    if (!raw) return fallback;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  };

  const startSession = (user: User): Session => {
    const session: Session = { user };
    store.set(SESSION_KEY, JSON.stringify(session));
    return session;
  };

  return {
    async signInAsGuest() {
      await wait(delay);
      return startSession(DEMO_GUEST_USER);
    },

    async signIn(email) {
      await wait(delay);
      const normalized = email.trim().toLowerCase();
      const user = readJson<User[]>(ACCOUNTS_KEY, []).find((a) => a.email === normalized);
      if (!user) throw new AuthError('invalid-credentials', 'Correo o contraseña incorrectos.');
      return startSession(user);
    },

    async signUp({ name, email, year }) {
      await wait(delay);
      const normalized = email.trim().toLowerCase();
      const accounts = readJson<User[]>(ACCOUNTS_KEY, []);
      if (accounts.some((a) => a.email === normalized)) {
        throw new AuthError('email-taken', 'Ya existe una cuenta con ese correo.');
      }
      const user: User = {
        id: `u-${Date.now().toString(36)}`,
        name: name.trim(),
        email: normalized,
        provider: 'password',
        year,
      };
      store.set(ACCOUNTS_KEY, JSON.stringify([...accounts, user]));
      return startSession(user);
    },

    async signOut() {
      store.remove(SESSION_KEY);
    },

    async getSession() {
      return readJson<Session | null>(SESSION_KEY, null);
    },
  };
}
