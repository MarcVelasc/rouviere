import type { AuthError as SbAuthError, User as SbUser } from '@supabase/supabase-js';
import { AuthError, type AuthService, type Session, type User } from './AuthService';
import { DEMO_GUEST_USER, SESSION_KEY } from './mockAuthService';
import type { KeyValueStore } from '../storage/KeyValueStore';
import { supabase } from '../supabase/client';

/**
 * Cuentas reales con Supabase (correo y contraseña).
 * - La contraseña la guarda Supabase cifrada; la app nunca la ve.
 * - Nombre y año van en los metadatos de la cuenta.
 * - Además se escribe la sesión en 'rouviere.session', que es lo que lee la app de
 *   src/rouviere/ para saber quién entró.
 * - «Probar sin cuenta» no toca Supabase: es la cuenta de ejemplo local.
 * El progreso se sincroniza desde la app (src/rouviere/core/nube.js).
 */

/** Claves del progreso local; al cerrar sesión se borran porque ya están en la nube. */
export const CLAVES_PROGRESO = [
  'rv_s',
  'rv_ex',
  'rv_names',
  'rv_lib',
  'rv_lib_t',
  'rv_snc',
  'rv_sim_best',
  'rv_comp',
  'rv_nube_uid',
  'rv_nube_t',
];

function aUsuario(u: SbUser): User {
  const m = (u.user_metadata ?? {}) as { name?: string; year?: number };
  return {
    id: u.id,
    name: m.name || (u.email ?? '').split('@')[0] || 'Estudiante',
    email: u.email ?? '',
    provider: 'password',
    year: m.year,
  };
}

/** Traduce los errores de Supabase a los códigos que entienden las pantallas. */
export function traducirError(e: SbAuthError | Error | null | undefined): AuthError {
  const code = (e as SbAuthError | undefined)?.code ?? '';
  const msg = (e?.message ?? '').toLowerCase();
  if (
    code === 'user_already_exists' ||
    code === 'email_exists' ||
    msg.includes('already registered')
  )
    return new AuthError('email-taken', 'Ya existe una cuenta con ese correo.');
  if (code === 'invalid_credentials' || msg.includes('invalid login'))
    return new AuthError('invalid-credentials', 'Correo o contraseña incorrectos.');
  if (code === 'email_not_confirmed' || msg.includes('not confirmed'))
    return new AuthError('confirm-email', 'Falta confirmar el correo.');
  if (code === 'weak_password' || msg.includes('password should'))
    return new AuthError('weak-password', 'La contraseña es muy débil.');
  if (msg.includes('fetch') || msg.includes('network') || msg.includes('failed to'))
    return new AuthError('network', 'Sin conexión con el servidor.');
  return new AuthError('unknown', e?.message || 'Error desconocido.');
}

export function createSupabaseAuthService({ store }: { store: KeyValueStore }): AuthService {
  const guardar = (user: User): Session => {
    const session: Session = { user };
    store.set(SESSION_KEY, JSON.stringify(session));
    return session;
  };
  const leerLocal = (): Session | null => {
    try {
      return JSON.parse(store.get(SESSION_KEY) || 'null') as Session | null;
    } catch {
      return null;
    }
  };

  return {
    async signInAsGuest() {
      return guardar(DEMO_GUEST_USER);
    },

    async signIn(email, password) {
      try {
        const { data, error } = await supabase().auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });
        if (error || !data.user) throw traducirError(error);
        return guardar(aUsuario(data.user));
      } catch (e) {
        throw e instanceof AuthError ? e : traducirError(e as Error);
      }
    },

    async signUp({ name, email, password, year }) {
      try {
        const { data, error } = await supabase().auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: { data: { name: name.trim(), year, career: 'Medicina' } },
        });
        if (error) throw traducirError(error);
        // Supabase devuelve una cuenta «falsa» sin identidades si el correo ya existía.
        if (data.user && data.user.identities && data.user.identities.length === 0)
          throw new AuthError('email-taken', 'Ya existe una cuenta con ese correo.');
        if (!data.session || !data.user)
          throw new AuthError('confirm-email', 'Revisa tu correo para confirmar la cuenta.');
        return guardar(aUsuario(data.user));
      } catch (e) {
        throw e instanceof AuthError ? e : traducirError(e as Error);
      }
    },

    async signOut() {
      const local = leerLocal();
      if (local?.user.provider === 'password') {
        try {
          await supabase().auth.signOut();
        } catch {
          /* sin internet: igual se cierra en este dispositivo */
        }
        // El progreso ya está en la nube: no se deja en el teléfono para el siguiente usuario.
        CLAVES_PROGRESO.forEach((k) => store.remove(k));
      }
      store.remove(SESSION_KEY);
    },

    async getSession() {
      const local = leerLocal();
      if (local && local.user.provider !== 'password') return local;
      try {
        const { data } = await supabase().auth.getSession();
        if (data.session?.user) return guardar(aUsuario(data.session.user));
      } catch {
        /* sin internet: se usa lo que quedó guardado */
        return local;
      }
      if (local) store.remove(SESSION_KEY);
      return null;
    },
  };
}
