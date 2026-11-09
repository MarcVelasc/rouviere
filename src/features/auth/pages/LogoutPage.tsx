import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../model/AuthContext';

/** Ruta #/salir: cierra la sesión y vuelve al inicio. */
export function LogoutPage() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    void signOut().then(() => navigate('/inicio', { replace: true }));
  }, [signOut, navigate]);

  return null;
}
