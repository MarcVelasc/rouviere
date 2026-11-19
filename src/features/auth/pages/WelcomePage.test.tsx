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

  it('muestra a Rou, el tutorial y las dos formas de entrar', async () => {
    renderAuth('/inicio');
    expect(await screen.findByRole('heading', { name: 'Rouviere' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /Rou, la lechuza/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Tutorial/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Entrar con cuenta de prueba' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Crear cuenta' })).toBeInTheDocument();
  });

  it('con la cuenta de prueba entra a la app', async () => {
    renderAuth('/inicio');
    await userEvent.click(
      await screen.findByRole('button', { name: 'Entrar con cuenta de prueba' }),
    );
    expect(screen.getByRole('button', { name: /Entrando/ })).toBeDisabled();
    await waitFor(() => expect(goToApp).toHaveBeenCalledOnce(), { timeout: 3000 });
  });

  it('"Crear cuenta" lleva al formulario', async () => {
    renderAuth('/inicio');
    await userEvent.click(await screen.findByRole('button', { name: 'Crear cuenta' }));
    expect(await screen.findByRole('heading', { name: 'Crear cuenta' })).toBeInTheDocument();
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
