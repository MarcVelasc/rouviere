import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { goToApp } from '@/app/navigation';
import { renderAuth } from '@/test/renderAuth';

vi.mock('@/app/navigation', () => ({ goToApp: vi.fn() }));

async function fillValid(email = 'ana.flores@gmail.com') {
  await userEvent.type(await screen.findByLabelText('Nombre y apellido'), 'Ana Flores');
  await userEvent.type(screen.getByLabelText('Correo electrónico'), email);
  await userEvent.type(screen.getByLabelText('Contraseña'), 'rouviere1');
  await userEvent.click(screen.getByLabelText('2° año'));
  await userEvent.click(screen.getByRole('checkbox', { name: /Acepto los Términos/ }));
}

describe('crear cuenta', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(goToApp).mockClear();
  });

  it('sin datos marca los cinco y Rou avisa cuántos faltan', async () => {
    renderAuth('/registro');
    await userEvent.click(await screen.findByRole('button', { name: 'Crear mi cuenta' }));
    expect(screen.getByText('Escribe tu nombre.')).toBeInTheDocument();
    expect(screen.getByText('Escribe tu correo.')).toBeInTheDocument();
    expect(screen.getByText(/necesita 8 caracteres/)).toBeInTheDocument();
    expect(screen.getByText('Elige el año que cursas.')).toBeInTheDocument();
    expect(screen.getByText('Acepta los términos para continuar.')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Faltan 5 datos');
    expect(screen.getByLabelText('Nombre y apellido')).toHaveFocus();
  });

  it('marca los requisitos de la contraseña mientras se escribe', async () => {
    renderAuth('/registro');
    await userEvent.type(await screen.findByLabelText('Contraseña'), 'rouviere1');
    const rules = screen.getByRole('list', { name: 'Requisitos de la contraseña' });
    expect(within(rules).getByText(/8 caracteres o más/)).toHaveTextContent('cumple');
    expect(within(rules).getByText(/Un número/)).toHaveTextContent('cumple');
    expect(screen.getByRole('status')).toHaveTextContent('¡Buena contraseña!');
  });

  it('con todo completo saluda por el nombre y "Empezar" entra a la app', async () => {
    renderAuth('/registro');
    await fillValid();
    await userEvent.click(screen.getByRole('button', { name: 'Crear mi cuenta' }));
    expect(
      await screen.findByRole('heading', { name: '¡Listo, Ana!' }, { timeout: 3000 }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Tu cuenta ya está creada/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Empezar a estudiar' }));
    expect(goToApp).toHaveBeenCalledOnce();
  });

  it('avisa si el correo ya tiene una cuenta', async () => {
    localStorage.setItem(
      'rouviere.accounts',
      JSON.stringify([
        { id: 'u1', name: 'Ana', email: 'ana.flores@gmail.com', provider: 'password' },
      ]),
    );
    renderAuth('/registro');
    await fillValid('Ana.Flores@gmail.com');
    await userEvent.click(screen.getByRole('button', { name: 'Crear mi cuenta' }));
    expect(
      await screen.findByText('Ya existe una cuenta con este correo.', {}, { timeout: 3000 }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Correo electrónico')).toHaveFocus();
    expect(goToApp).not.toHaveBeenCalled();
  });
});
