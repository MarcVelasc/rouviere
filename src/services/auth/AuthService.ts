/**
 * Contrato de autenticación. Las pantallas solo conocen esta interfaz.
 * Para conectar un backend real (Firebase, Supabase, API propia) se crea otra
 * implementación en esta carpeta y se elige en src/services/index.ts.
 */
export type AuthProvider = 'google' | 'password';

export interface User {
  id: string;
  name: string;
  email: string;
  provider: AuthProvider;
  /** Carrera y año: se piden al crear la cuenta con correo. */
  career?: string;
  year?: number;
}

export interface Session {
  user: User;
}

export interface SignUpData {
  name: string;
  email: string;
  password: string;
  career: string;
  year: number;
}

export type AuthErrorCode = 'email-taken' | 'cancelled' | 'network' | 'unknown';

export class AuthError extends Error {
  readonly code: AuthErrorCode;

  constructor(code: AuthErrorCode, message: string) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
  }
}

export interface AuthService {
  /** Abre la ventana de Google. Si la persona la cierra, falla con el código 'cancelled'. */
  signInWithGoogle(): Promise<Session>;
  /** Crea la cuenta con correo y deja la sesión iniciada. */
  signUp(data: SignUpData): Promise<Session>;
  signOut(): Promise<void>;
  getSession(): Promise<Session | null>;
}
