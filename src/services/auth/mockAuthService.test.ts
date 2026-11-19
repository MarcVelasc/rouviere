import { createMockAuthService, DEMO_GUEST_USER, SESSION_KEY } from './mockAuthService';
import { memoryStore } from '../storage/KeyValueStore';
import { AuthError, type SignUpData } from './AuthService';

const ana: SignUpData = {
  name: '  Ana Flores ',
  email: 'Ana.Flores@Gmail.com',
  password: 'rouviere1',
  year: 2,
};

const setup = () => {
  const store = memoryStore();
  return { store, auth: createMockAuthService({ store, delay: 0 }) };
};

describe('mockAuthService', () => {
  it('sin cuenta entra con la cuenta de ejemplo y guarda la sesión', async () => {
    const { auth, store } = setup();
    const s = await auth.signInAsGuest();
    expect(s.user).toEqual(DEMO_GUEST_USER);
    expect(store.get(SESSION_KEY)).not.toBeNull();
  });

  it('al crear la cuenta normaliza el nombre y el correo, y deja la sesión iniciada', async () => {
    const { auth } = setup();
    const s = await auth.signUp(ana);
    expect(s.user).toMatchObject({
      name: 'Ana Flores',
      email: 'ana.flores@gmail.com',
      provider: 'password',
      year: 2,
    });
    expect(await auth.getSession()).toEqual(s);
  });

  it('no guarda la contraseña en ningún lado', async () => {
    const { auth, store } = setup();
    await auth.signUp(ana);
    expect(store.get('rouviere.accounts')).not.toContain(ana.password);
    expect(store.get(SESSION_KEY)).not.toContain(ana.password);
  });

  it('no deja crear dos cuentas con el mismo correo', async () => {
    const { auth } = setup();
    await auth.signUp(ana);
    const again = auth.signUp({ ...ana, email: 'ana.flores@gmail.com' });
    await expect(again).rejects.toBeInstanceOf(AuthError);
    await expect(again).rejects.toMatchObject({ code: 'email-taken' });
  });

  it('inicia sesión con una cuenta creada y rechaza un correo desconocido', async () => {
    const { auth } = setup();
    await auth.signUp(ana);
    await auth.signOut();
    const s = await auth.signIn('ANA.flores@gmail.com ', 'rouviere1');
    expect(s.user.email).toBe('ana.flores@gmail.com');
    await expect(auth.signIn('nadie@gmail.com', 'x')).rejects.toMatchObject({
      code: 'invalid-credentials',
    });
  });

  it('al cerrar sesión ya no hay sesión', async () => {
    const { auth } = setup();
    await auth.signInAsGuest();
    await auth.signOut();
    expect(await auth.getSession()).toBeNull();
  });
});
