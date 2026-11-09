import { AuthError, type AuthService, type Session, type User } from './AuthService';
import type { KeyValueStore } from '../storage/KeyValueStore';

/**
 * Autenticación de prueba, sin servidor: sirve para presentar y desarrollar las pantallas.
 * - "Continuar con Google" entra siempre con la cuenta de Google de ejemplo.
 * - "Crear cuenta" guarda la cuenta en este navegador. Las contraseñas NO se guardan:
 *   esta implementación no es segura y no debe usarse con datos reales.
 */
export const DEMO_GOOGLE_USER: User = {
  id: 'g-demo',
  name: 'Estudiante Rouviere',
  email: 'estudiante.rouviere@gmail.com',
  provider: 'google',
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
    async signInWithGoogle() {
      await wait(delay);
      return startSession(DEMO_GOOGLE_USER);
    },

    async signUp({ name, email, career, year }) {
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
        career,
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
