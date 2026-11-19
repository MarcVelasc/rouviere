/**
 * Contrato de autenticación. Las pantallas solo conocen esta interfaz.
 * Para conectar un backend real (Firebase, Supabase, API propia) se crea otra
 * implementación en esta carpeta y se elige en src/services/index.ts.
 */
/** 'guest' = probar sin cuenta (todo queda en el dispositivo); 'google' queda para el futuro. */
export type AuthProvider = 'guest' | 'google' | 'password';

export interface User {
  id: string;
  name: string;
  email: string;
  provider: AuthProvider;
  /** Año de la carrera de Medicina: se pide al crear la cuenta con correo. */
  year?: number;
}

export interface Session {
  user: User;
}

export interface SignUpData {
  name: string;
  email: string;
  password: string;
  year: number;
}

export type AuthErrorCode =
  | 'email-taken'
  | 'invalid-credentials'
  | 'confirm-email'
  | 'weak-password'
  | 'cancelled'
  | 'network'
  | 'unknown';

export class AuthError extends Error {
  readonly code: AuthErrorCode;

  constructor(code: AuthErrorCode, message: string) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
  }
}

export interface AuthService {
  /** Entra sin cuenta: el progreso queda solo en este dispositivo. */
  signInAsGuest(): Promise<Session>;
  /** Entra con una cuenta ya creada. Falla con 'invalid-credentials' si no coinciden. */
  signIn(email: string, password: string): Promise<Session>;
  /** Crea la cuenta con correo y deja la sesión iniciada. Si el servidor pide confirmar el
   *  correo antes de entrar, falla con 'confirm-email' (la cuenta sí quedó creada). */
  signUp(data: SignUpData): Promise<Session>;
  signOut(): Promise<void>;
  getSession(): Promise<Session | null>;
}
