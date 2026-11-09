/** Datos y reglas del formulario "Crear cuenta". Sin React: se prueban solos. */

export const CAREERS = [
  'Medicina',
  'Odontología',
  'Enfermería',
  'Fisioterapia y Kinesiología',
  'Bioquímica y Farmacia',
  'Nutrición',
  'Otra',
] as const;

export const YEARS = [1, 2, 3, 4, 5, 6] as const;

export interface SignUpValues {
  name: string;
  email: string;
  password: string;
  career: string;
  /** Vacío mientras no se elige. */
  year: string;
  terms: boolean;
}

export type SignUpField = keyof SignUpValues;
export type SignUpErrors = Partial<Record<SignUpField, string>>;

export const EMPTY_SIGN_UP: SignUpValues = {
  name: '',
  email: '',
  password: '',
  career: '',
  year: '',
  terms: false,
};

/** Orden en que se revisan (y en que se enfoca el primer error). */
export const FIELD_ORDER: SignUpField[] = ['name', 'email', 'password', 'career', 'year', 'terms'];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function passwordRules(password: string) {
  return { length: password.length >= 8, number: /\d/.test(password) };
}

const CHECKS: Record<SignUpField, (v: SignUpValues) => string | undefined> = {
  name: (v) => (v.name.trim().length < 2 ? 'Escribe tu nombre.' : undefined),
  email: (v) => {
    const email = v.email.trim();
    if (!email) return 'Escribe tu correo.';
    return EMAIL_RE.test(email) ? undefined : 'Revisa tu correo, parece incompleto.';
  },
  password: (v) => {
    const r = passwordRules(v.password);
    return r.length && r.number
      ? undefined
      : 'Tu contraseña necesita 8 caracteres o más y un número.';
  },
  career: (v) => (v.career ? undefined : 'Elige tu carrera.'),
  year: (v) => (v.year ? undefined : 'Elige el año que cursas.'),
  terms: (v) => (v.terms ? undefined : 'Acepta los términos para continuar.'),
};

export function validateField(field: SignUpField, values: SignUpValues): string | undefined {
  return CHECKS[field](values);
}

export function validateSignUp(values: SignUpValues): SignUpErrors {
  const errors: SignUpErrors = {};
  for (const field of FIELD_ORDER) {
    const error = CHECKS[field](values);
    if (error) errors[field] = error;
  }
  return errors;
}

/** "Ana María Flores" → "Ana" (para saludar en la pantalla final). */
export const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? '';
