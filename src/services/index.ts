/**
 * Contenedor de servicios: el único lugar donde se decide qué implementación usa la app.
 * Las funcionalidades importan `services` desde aquí y nunca una implementación concreta
 * (ESLint lo controla). Para cambiar de backend, basta con agregar otra opción abajo.
 */
import type { AuthService } from './auth/AuthService';
import { createMockAuthService } from './auth/mockAuthService';
import { persistentStore } from './storage/KeyValueStore';

export type { AuthService, Session, SignUpData, User } from './auth/AuthService';
export { AuthError } from './auth/AuthService';

function createAuthService(): AuthService {
  const provider = import.meta.env.VITE_AUTH_PROVIDER ?? 'mock';
  switch (provider) {
    // case 'firebase': return createFirebaseAuthService(...);
    case 'mock':
    default:
      return createMockAuthService({ store: persistentStore() });
  }
}

export const services = {
  auth: createAuthService(),
};
