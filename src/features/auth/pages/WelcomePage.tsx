import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { goToApp } from '@/app/navigation';
import { AuthError } from '@/services';
import { Button } from '@/shared/ui/Button';
import { DESKTOP, useMediaQuery } from '@/shared/lib/useMediaQuery';
import { Icon } from '@/shared/ui/Icon';
import { GoogleButton } from '../components/GoogleButton';
import { RouAnatomy } from '../components/RouAnatomy';
import { useAuth } from '../model/AuthContext';
import styles from './WelcomePage.module.css';

/** Pantalla 0 · Inicio: Rou cambiando de capa, entrar con Google o crear una cuenta. */
export function WelcomePage() {
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  // En la compu, Rou y la marca van en el panel izquierdo (AuthLayout).
  const desktop = useMediaQuery(DESKTOP);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function continueWithGoogle() {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      goToApp();
    } catch (err) {
      setLoading(false);
      // Si la persona cerró la ventana de Google no es un error que haya que explicar.
      if (err instanceof AuthError && err.code === 'cancelled') return;
      setError('No pudimos conectar con Google. Revisa tu internet e intenta otra vez.');
    }
  }

  return (
    <div className={styles.page}>
      <span className={styles.glow} aria-hidden="true" />

      <header className={styles.top}>
        {/* Sin funcionalidad por ahora (pedido del equipo). */}
        <button className={styles.tutorial} type="button" aria-label="Tutorial (próximamente)">
          <Icon name="play" size={18} />
          Tutorial
        </button>
      </header>

      <main className={styles.main}>
        {desktop ? (
          <div className={styles.intro}>
            <h1 className={styles.introTitle}>Te damos la bienvenida</h1>
            <p className={styles.introText}>
              Entra con Google o crea tu cuenta para empezar a estudiar con Rou.
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
          <GoogleButton
            label="Continuar con Google"
            loading={loading}
            onClick={continueWithGoogle}
          />
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
            Al continuar aceptas los Términos y la Política de privacidad de Rouviere.
          </p>
        </div>
      </main>
    </div>
  );
}
