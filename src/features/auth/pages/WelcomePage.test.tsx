import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { goToApp } from '@/app/navigation';
import { renderAuth } from '@/test/renderAuth';

vi.mock('@/app/navigation', () => ({ goToApp: vi.fn() }));

describe('pantalla de inicio', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(goToApp).mockClear();
  });

  it('muestra a Rou y las tres formas de entrar, sin botón de tutorial', async () => {
    renderAuth('/inicio');
    expect(await screen.findByRole('heading', { name: 'Rouviere' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /Rou, la lechuza/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Tutorial/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Crear cuenta' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Probar sin cuenta' })).toBeInTheDocument();
  });

  it('sin cuenta entra a la app', async () => {
    renderAuth('/inicio');
    await userEvent.click(await screen.findByRole('button', { name: 'Probar sin cuenta' }));
    expect(screen.getByRole('button', { name: /Entrando/ })).toBeDisabled();
    await waitFor(() => expect(goToApp).toHaveBeenCalledOnce(), { timeout: 3000 });
  });

  it('"Crear cuenta" lleva al formulario', async () => {
    renderAuth('/inicio');
    await userEvent.click(await screen.findByRole('button', { name: 'Crear cuenta' }));
    expect(await screen.findByRole('heading', { name: 'Crear cuenta' })).toBeInTheDocument();
  });

  it('iniciar sesión con una cuenta creada entra a la app', async () => {
    localStorage.setItem(
      'rouviere.accounts',
      JSON.stringify([{ id: 'u1', name: 'Ana', email: 'ana@gmail.com', provider: 'password' }]),
    );
    renderAuth('/inicio');
    await userEvent.click(await screen.findByRole('button', { name: 'Iniciar sesión' }));
    expect(await screen.findByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText('Correo electrónico'), 'ana@gmail.com');
    await userEvent.type(screen.getByLabelText('Contraseña'), 'rouviere1');
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    await waitFor(() => expect(goToApp).toHaveBeenCalledOnce(), { timeout: 3000 });
  });

  it('iniciar sesión con datos que no coinciden muestra el aviso', async () => {
    renderAuth('/entrar');
    await userEvent.type(await screen.findByLabelText('Correo electrónico'), 'nadie@gmail.com');
    await userEvent.type(screen.getByLabelText('Contraseña'), 'x');
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    expect(await screen.findByRole('alert', {}, { timeout: 3000 })).toHaveTextContent(
      /no coinciden/,
    );
    expect(goToApp).not.toHaveBeenCalled();
  });

  it('si ya había sesión pasa directo a la app', async () => {
    localStorage.setItem(
      'rouviere.session',
      JSON.stringify({ user: { id: 'x', name: 'Ana', email: 'a@b.co', provider: 'google' } }),
    );
    renderAuth('/inicio');
    await waitFor(() => expect(goToApp).toHaveBeenCalledOnce());
    expect(screen.queryByRole('heading', { name: 'Rouviere' })).not.toBeInTheDocument();
  });
});
