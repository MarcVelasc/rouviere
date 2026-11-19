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

/** Pantalla 0 · Inicio: Rou cambiando de capa, entrar con la cuenta de prueba o crear una cuenta.
 *  Evaluación heurística (problemas 2, 4 y 6): mientras no haya inicio de sesión real no se
 *  usa el botón ni el logo de Google, el botón «Tutorial» sin función se quitó y la frase de
 *  Términos se cambió por un aviso de que todo se guarda en el dispositivo. */
export function WelcomePage() {
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  // En la compu, Rou y la marca van en el panel izquierdo (AuthLayout).
  const desktop = useMediaQuery(DESKTOP);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enterWithTestAccount() {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
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
              Entra con la cuenta de prueba o crea tu cuenta para empezar a estudiar con Rou.
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
          <Button loading={loading} loadingText="Entrando…" onClick={enterWithTestAccount}>
            Entrar con cuenta de prueba
          </Button>
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
          <p className={styles.legal}>
            Versión de prueba: tu cuenta y tu progreso se guardan solo en este dispositivo.
          </p>
        </div>
      </main>
    </div>
  );
}
