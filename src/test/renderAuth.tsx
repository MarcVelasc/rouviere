import { render } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { AuthLayout } from '@/app/layouts/AuthLayout';
import { AuthProvider } from '@/features/auth/model/AuthContext';
import { SignUpPage } from '@/features/auth/pages/SignUpPage';
import { WelcomePage } from '@/features/auth/pages/WelcomePage';

/** Monta las pantallas de acceso con el mismo esquema de rutas que la app. */
export function renderAuth(path: '/inicio' | '/registro') {
  const router = createMemoryRouter(
    [
      {
        element: <AuthLayout />,
        children: [
          { path: '/inicio', element: <WelcomePage /> },
          { path: '/registro', element: <SignUpPage /> },
        ],
      },
    ],
    { initialEntries: [path] },
  );
  return render(
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>,
  );
}
