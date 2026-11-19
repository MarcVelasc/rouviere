import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Cliente de Supabase, compartido por el acceso (React) y por la app (src/rouviere/).
 * La URL y la clave publicable vienen de .env.production. La clave publicable puede ir en
 * el código: lo que protege los datos son las reglas (RLS) de supabase/esquema.sql.
 * NUNCA poner aquí la clave secreta ni la service_role.
 */
const URL = import.meta.env.VITE_SUPABASE_URL ?? '';
const KEY = import.meta.env.VITE_SUPABASE_KEY ?? '';

export const supabaseActivo = import.meta.env.VITE_AUTH_PROVIDER === 'supabase' && !!URL && !!KEY;

let cliente: SupabaseClient | null = null;

export function supabase(): SupabaseClient {
  if (!cliente) {
    cliente = createClient(URL, KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
    });
  }
  return cliente;
}
