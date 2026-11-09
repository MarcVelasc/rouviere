import { createHashRouter, Navigate } from 'react-router-dom';
import { AuthLayout } from './layouts/AuthLayout';
import { WelcomePage } from '@/features/auth/pages/WelcomePage';
import { SignUpPage } from '@/features/auth/pages/SignUpPage';
import { LogoutPage } from '@/features/auth/pages/LogoutPage';

/**
 * Esta parte en React solo maneja el acceso. Al entrar se pasa a la app original
 * (public/app/). Se usa HashRouter porque funciona en cualquier hosting estático,
 * incluido GitHub Pages, sin configurar redirecciones.
 */
export const router = createHashRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: '/inicio', element: <WelcomePage /> },
      { path: '/registro', element: <SignUpPage /> },
    ],
  },
  { path: '/salir', element: <LogoutPage /> },
  { path: '*', element: <Navigate to="/inicio" replace /> },
]);
