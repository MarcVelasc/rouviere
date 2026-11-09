import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import rouUrl from '@/assets/rou/rou.webp';
import { goToApp } from '@/app/navigation';
import type { User } from '@/services';
import { Button } from '@/shared/ui/Button';
import { Icon } from '@/shared/ui/Icon';
import { SignUpForm } from '../components/SignUpForm';
import { firstName } from '../model/signUp';
import styles from './SignUpPage.module.css';

/** Pantalla 1 · Crear cuenta. Al terminar muestra un mensaje de bienvenida y entra a la app. */
export function SignUpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [created, setCreated] = useState<User | null>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const doneRef = useRef<HTMLHeadingElement>(null);

  // Al llegar, el foco va al título: así el lector de pantalla anuncia la pantalla nueva.
  useEffect(() => {
    titleRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    if (!created) return;
    window.scrollTo(0, 0);
    doneRef.current?.focus({ preventScroll: true });
  }, [created]);

  // Si se llegó desde el inicio, "atrás" vuelve en el historial; si se abrió el link directo, va al inicio.
  const back = () => (location.key !== 'default' ? navigate(-1) : navigate('/inicio'));

  return (
    <div className={styles.page}>
      <header className={styles.bar}>
        {!created && (
          <button
            className={styles.back}
            type="button"
            aria-label="Volver al inicio"
            onClick={back}
          >
            <Icon name="chevronLeft" size={20} strokeWidth={2} />
          </button>
        )}
        <h1 ref={titleRef} className={styles.title} tabIndex={-1}>
          Crear cuenta
        </h1>
      </header>

      {created ? (
        <section className={styles.done} aria-labelledby="su-done-title">
          <img className={styles.doneRou} src={rouUrl} alt="" />
          <h2 id="su-done-title" ref={doneRef} className={styles.doneTitle} tabIndex={-1}>
            ¡Listo, {firstName(created.name)}!
          </h2>
          <p className={styles.doneText}>
            Tu cuenta{created.career ? ` de ${created.career}` : ''} ya está creada. Rou te espera
            para estudiar.
          </p>
          <Button className={styles.wide} onClick={goToApp}>
            Empezar a estudiar
          </Button>
        </section>
      ) : (
        <SignUpForm onCreated={setCreated} />
      )}
    </div>
  );
}
