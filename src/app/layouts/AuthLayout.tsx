import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { goToApp } from '@/app/navigation';
import { RouAnatomy } from '@/features/auth/components/RouAnatomy';
import { useAuth } from '@/features/auth/model/AuthContext';
import { DESKTOP, useMediaQuery } from '@/shared/lib/useMediaQuery';
import styles from './AuthLayout.module.css';

/**
 * Pantallas sin sesión (inicio y crear cuenta).
 * - Celular: una sola columna.
 * - Compu: a la izquierda Rou y la marca (no se reinicia al pasar de una pantalla a otra),
 *   a la derecha la pantalla actual.
 */
export function AuthLayout() {
  const { status } = useAuth();
  const desktop = useMediaQuery(DESKTOP);
  // Se decide una sola vez, al abrir: si ya había sesión se pasa directo a la app.
  // Después, cada pantalla decide (por ejemplo, "Crear cuenta" muestra su mensaje final).
  const [hadSession, setHadSession] = useState<boolean | null>(null);

  useEffect(() => {
    if (status !== 'loading' && hadSession === null) setHadSession(status === 'signed-in');
  }, [status, hadSession]);

  useEffect(() => {
    if (hadSession) goToApp();
  }, [hadSession]);

  if (hadSession !== false) return null;

  return (
    <div className={styles.shell}>
      {desktop && (
        <aside className={styles.panel}>
          <RouAnatomy className={styles.bigRou} />
          <div className={styles.brand}>
            <p className={styles.name}>Rouviere</p>
            <p className={styles.tag}>De memorizar a dominar</p>
          </div>
        </aside>
      )}
      <div className={styles.screen}>
        <Outlet />
      </div>
    </div>
  );
}
