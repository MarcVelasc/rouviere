import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { goToApp } from '@/app/navigation';
import { AuthError } from '@/services';
import { Button } from '@/shared/ui/Button';
import { Icon } from '@/shared/ui/Icon';
import { TextField } from '@/shared/ui/TextField';
import { useAuth } from '../model/AuthContext';
import page from './SignUpPage.module.css';
import form from '../components/SignUpForm.module.css';

/** Pantalla · Iniciar sesión con una cuenta ya creada (correo y contraseña). */
export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  // Al llegar, el foco va al título: así el lector de pantalla anuncia la pantalla nueva.
  useEffect(() => {
    titleRef.current?.focus({ preventScroll: true });
  }, []);

  const back = () => (location.key !== 'default' ? navigate(-1) : navigate('/inicio'));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const found = {
      email: email.trim() ? undefined : 'Escribe tu correo.',
      password: password ? undefined : 'Escribe tu contraseña.',
    };
    setErrors(found);
    setFormError(null);
    if (found.email || found.password) {
      document.getElementById(found.email ? 'li-email' : 'li-password')?.focus();
      return;
    }
    setSending(true);
    try {
      await signIn(email, password);
      goToApp();
    } catch (err) {
      setSending(false);
      const code = err instanceof AuthError ? err.code : 'unknown';
      setFormError(
        code === 'invalid-credentials'
          ? 'El correo o la contraseña no coinciden. Revísalos e intenta otra vez.'
          : code === 'confirm-email'
            ? 'Todavía no confirmaste tu correo. Abre el mensaje que te enviamos y luego vuelve a entrar.'
            : 'No pudimos conectarnos. Revisa tu internet e intenta otra vez.',
      );
    }
  }

  return (
    <div className={page.page}>
      <header className={page.bar}>
        <button className={page.back} type="button" aria-label="Volver al inicio" onClick={back}>
          <Icon name="chevronLeft" size={20} strokeWidth={2} />
        </button>
        <h1 ref={titleRef} className={page.title} tabIndex={-1}>
          Iniciar sesión
        </h1>
      </header>

      <form className={form.form} onSubmit={handleSubmit} noValidate>
        {formError && (
          <div className={form.alert} role="alert">
            <Icon name="alert" size={18} strokeWidth={2} />
            <span>{formError}</span>
          </div>
        )}
        <TextField
          id="li-email"
          label="Correo electrónico"
          icon="mail"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="off"
          spellCheck={false}
          placeholder="tucorreo@gmail.com"
          value={email}
          error={errors.email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          id="li-password"
          label="Contraseña"
          icon="lock"
          revealable
          autoComplete="current-password"
          placeholder="Tu contraseña"
          value={password}
          error={errors.password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" loading={sending} loadingText="Entrando…">
          Entrar
        </Button>
        <p className={form.login}>
          ¿No tienes cuenta? <Link to="/registro">Crear cuenta</Link>
        </p>
      </form>
    </div>
  );
}
