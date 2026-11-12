import { createMockAuthService, DEMO_GOOGLE_USER, SESSION_KEY } from './mockAuthService';
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
  it('con Google entra con la cuenta de ejemplo y guarda la sesión', async () => {
    const { auth, store } = setup();
    const s = await auth.signInWithGoogle();
    expect(s.user).toEqual(DEMO_GOOGLE_USER);
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

  it('al cerrar sesión ya no hay sesión', async () => {
    const { auth } = setup();
    await auth.signInWithGoogle();
    await auth.signOut();
    expect(await auth.getSession()).toBeNull();
  });
});
