import { memoryStore } from '../storage/KeyValueStore';
import { SESSION_KEY } from './mockAuthService';
import { createSupabaseAuthService, traducirError } from './supabaseAuthService';

const auth = {
  signUp: vi.fn(),
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
  getSession: vi.fn(),
};
vi.mock('../supabase/client', () => ({ supabase: () => ({ auth }), supabaseActivo: true }));

const sbUser = {
  id: 'uuid-1',
  email: 'ana@gmail.com',
  user_metadata: { name: 'Ana Flores', year: 2 },
  identities: [{}],
};

describe('supabaseAuthService', () => {
  beforeEach(() => Object.values(auth).forEach((f) => f.mockReset()));

  it('traduce los errores de Supabase a los de las pantallas', () => {
    expect(traducirError({ code: 'invalid_credentials', message: '' } as never).code).toBe(
      'invalid-credentials',
    );
    expect(traducirError(new Error('User already registered')).code).toBe('email-taken');
    expect(traducirError(new Error('Email not confirmed')).code).toBe('confirm-email');
    expect(traducirError(new Error('Failed to fetch')).code).toBe('network');
  });

  it('al crear la cuenta guarda nombre y año, y deja la sesión para la app', async () => {
    const store = memoryStore();
    auth.signUp.mockResolvedValue({ data: { user: sbUser, session: {} }, error: null });
    const s = await createSupabaseAuthService({ store }).signUp({
      name: ' Ana Flores ',
      email: 'Ana@Gmail.com',
      password: 'rouviere1',
      year: 2,
    });
    expect(auth.signUp).toHaveBeenCalledWith({
      email: 'ana@gmail.com',
      password: 'rouviere1',
      options: { data: { name: 'Ana Flores', year: 2, career: 'Medicina' } },
    });
    expect(s.user).toMatchObject({ id: 'uuid-1', name: 'Ana Flores', provider: 'password' });
    expect(store.get(SESSION_KEY)).not.toContain('rouviere1');
  });

  it('si Supabase pide confirmar el correo, avisa con confirm-email', async () => {
    auth.signUp.mockResolvedValue({ data: { user: sbUser, session: null }, error: null });
    const p = createSupabaseAuthService({ store: memoryStore() }).signUp({
      name: 'Ana',
      email: 'ana@gmail.com',
      password: 'rouviere1',
      year: 1,
    });
    await expect(p).rejects.toMatchObject({ code: 'confirm-email' });
  });

  it('al cerrar sesión borra del teléfono el progreso de esa cuenta', async () => {
    const store = memoryStore();
    store.set(SESSION_KEY, JSON.stringify({ user: { ...sbUser, provider: 'password' } }));
    store.set('rv_s', '{"known":{}}');
    auth.signOut.mockResolvedValue({ error: null });
    await createSupabaseAuthService({ store }).signOut();
    expect(store.get('rv_s')).toBeNull();
    expect(store.get(SESSION_KEY)).toBeNull();
  });
});
