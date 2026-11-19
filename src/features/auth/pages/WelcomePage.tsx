import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { goToApp } from '@/app/navigation';
import { AuthError } from '@/services';
import { Button } from '@/shared/ui/Button';
import { DESKTOP, useMediaQuery } from '@/shared/lib/useMediaQuery';
import { Icon } from '@/shared/ui/Icon';
import { RouAnatomy } from '../components/RouAnatomy';
import { useAuth } from '../model/AuthContext';
import styles from './WelcomePage.module.css';

/** Pantalla 0 · Inicio: Rou cambiando de capa, iniciar sesión, crear una cuenta o probar sin
 *  cuenta. Evaluación heurística (problemas 2, 4 y 6): no se usa el logo de Google, el botón
 *  «Tutorial» sin función se quitó y no se mencionan Términos que no existen; el aviso de abajo
 *  dice dónde se guarda el progreso en cada caso. */
export function WelcomePage() {
  const { signInAsGuest } = useAuth();
  const navigate = useNavigate();
  // En la compu, Rou y la marca van en el panel izquierdo (AuthLayout).
  const desktop = useMediaQuery(DESKTOP);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enterAsGuest() {
    setLoading(true);
    setError(null);
    try {
      await signInAsGuest();
      goToApp();
    } catch (err) {
      setLoading(false);
      if (err instanceof AuthError && err.code === 'cancelled') return;
      setError('No pudimos entrar. Intenta otra vez.');
    }
  }

  return (
    <div className={styles.page}>
      <span className={styles.glow} aria-hidden="true" />

      <header className={styles.top} />

      <main className={styles.main}>
        {desktop ? (
          <div className={styles.intro}>
            <h1 className={styles.introTitle}>Te damos la bienvenida</h1>
            <p className={styles.introText}>
              Inicia sesión o crea tu cuenta para empezar a estudiar con Rou.
            </p>
          </div>
        ) : (
          <div className={styles.stage}>
            <RouAnatomy />
            <div className={styles.brand}>
              <h1 className={styles.name}>Rouviere</h1>
              <p className={styles.tag}>De memorizar a dominar</p>
            </div>
          </div>
        )}

        <div className={styles.actions}>
          <Button onClick={() => navigate('/entrar')}>Iniciar sesión</Button>
          {error && (
            <p className={styles.error} role="alert">
              <Icon name="alert" size={16} strokeWidth={2.2} />
              {error}
            </p>
          )}
          <div className={styles.or}>o</div>
          <Button variant="outline" onClick={() => navigate('/registro')}>
            Crear cuenta
          </Button>
          <button className={styles.guest} type="button" disabled={loading} onClick={enterAsGuest}>
            {loading ? 'Entrando…' : 'Probar sin cuenta'}
          </button>
          <p className={styles.legal}>
            Con una cuenta, tu progreso se guarda en la nube y lo ves en cualquier dispositivo. Sin
            cuenta, se guarda solo en este.
          </p>
        </div>
      </main>
    </div>
  );
}
