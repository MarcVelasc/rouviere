import { useState, type FormEvent } from 'react';
import { goToApp } from '@/app/navigation';
import { AuthError, type User } from '@/services';
import { Button } from '@/shared/ui/Button';
import { Icon } from '@/shared/ui/Icon';
import { Mascot, type MascotTone } from '@/shared/ui/Mascot';
import { SelectField } from '@/shared/ui/SelectField';
import { TextField } from '@/shared/ui/TextField';
import { useAuth } from '../model/AuthContext';
import { ROU } from '../model/rouMessages';
import {
  CAREERS,
  EMPTY_SIGN_UP,
  FIELD_ORDER,
  passwordRules,
  validateField,
  validateSignUp,
  YEARS,
  type SignUpErrors,
  type SignUpField,
  type SignUpValues,
} from '../model/signUp';
import { GoogleButton } from './GoogleButton';
import { YearPicker } from './YearPicker';
import styles from './SignUpForm.module.css';

/** id del control al que se lleva el foco cuando ese dato tiene un error. */
const FOCUS_ID: Record<SignUpField, string> = {
  name: 'su-name',
  email: 'su-email',
  password: 'su-password',
  career: 'su-career',
  year: 'su-year-1',
  terms: 'su-terms',
};

interface SignUpFormProps {
  onCreated: (user: User) => void;
}

export function SignUpForm({ onCreated }: SignUpFormProps) {
  const { signUp, signInWithGoogle } = useAuth();
  const [values, setValues] = useState<SignUpValues>(EMPTY_SIGN_UP);
  const [errors, setErrors] = useState<SignUpErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [rou, setRou] = useState<{ message: string; tone: MascotTone }>({
    message: ROU.hello,
    tone: 'neutral',
  });
  const say = (message: string, tone: MascotTone = 'neutral') => setRou({ message, tone });
  const rules = passwordRules(values.password);

  /** Cambia un dato y, si ya estaba marcado en rojo y ahora está bien, quita la marca. */
  function update<K extends SignUpField>(field: K, value: SignUpValues[K]) {
    const next = { ...values, [field]: value };
    setValues(next);
    setFormError(null);
    if (errors[field] && !validateField(field, next)) {
      setErrors((e) => ({ ...e, [field]: undefined }));
    }
    return next;
  }

  function focusField(field: SignUpField) {
    const el = document.getElementById(FOCUS_ID[field]);
    el?.focus();
    el?.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const found = validateSignUp(values);
    setErrors(found);
    const wrong = FIELD_ORDER.filter((f) => found[f]);
    const first = wrong[0];
    if (first) {
      // Primero el foco (que cambia lo que dice Rou) y después el aviso de error.
      focusField(first);
      say(wrong.length > 1 ? ROU.missing(wrong.length) : (found[first] ?? ''), 'error');
      return;
    }

    setSubmitting(true);
    setFormError(null);
    say(ROU.loading);
    try {
      const session = await signUp({
        name: values.name,
        email: values.email,
        password: values.password,
        career: values.career,
        year: Number(values.year),
      });
      onCreated(session.user);
    } catch (err) {
      setSubmitting(false);
      if (err instanceof AuthError && err.code === 'email-taken') {
        setErrors((x) => ({ ...x, email: 'Ya existe una cuenta con este correo.' }));
        focusField('email');
        say(ROU.emailTaken, 'error');
        return;
      }
      setFormError('No pudimos crear tu cuenta. Revisa tu internet e intenta otra vez.');
      say(ROU.network, 'error');
    }
  }

  async function registerWithGoogle() {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      goToApp();
    } catch (err) {
      setGoogleLoading(false);
      if (err instanceof AuthError && err.code === 'cancelled') return;
      say(ROU.network, 'error');
    }
  }

  return (
    <>
      <div className={styles.guide}>
        <Mascot message={rou.message} tone={rou.tone} />
      </div>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {formError && (
          <div className={styles.alert} role="alert">
            <Icon name="alert" size={18} strokeWidth={2} />
            <span>{formError}</span>
          </div>
        )}

        <p className={styles.group}>Tus datos</p>
        <TextField
          id="su-name"
          label="Nombre y apellido"
          icon="user"
          autoComplete="name"
          autoCapitalize="words"
          placeholder="Ej. Ana Flores"
          value={values.name}
          error={errors.name}
          onFocus={() => say(ROU.name)}
          onChange={(e) => update('name', e.target.value)}
        />
        <TextField
          id="su-email"
          label="Correo electrónico"
          icon="mail"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="off"
          spellCheck={false}
          placeholder="tucorreo@gmail.com"
          value={values.email}
          error={errors.email}
          onFocus={() => say(ROU.email)}
          onChange={(e) => update('email', e.target.value)}
          onBlur={() => {
            const err = values.email.trim() ? validateField('email', values) : undefined;
            if (err) {
              setErrors((x) => ({ ...x, email: err }));
              say(ROU.emailBad, 'error');
            }
          }}
        />
        <div>
          <TextField
            id="su-password"
            label="Contraseña"
            icon="lock"
            revealable
            autoComplete="new-password"
            placeholder="Crea una contraseña"
            value={values.password}
            error={errors.password}
            onFocus={() => say(ROU.password)}
            onCapsLockChange={(on) => say(on ? ROU.caps : ROU.password, on ? 'warn' : 'neutral')}
            onChange={(e) => {
              const next = update('password', e.target.value);
              const r = passwordRules(next.password);
              if (r.length && r.number) say(ROU.passwordOk, 'ok');
            }}
          />
          <ul className={styles.rules} aria-label="Requisitos de la contraseña">
            <li data-ok={rules.length}>
              8 caracteres o más<span className="sr-only">{rules.length ? ': cumple' : ''}</span>
            </li>
            <li data-ok={rules.number}>
              Un número<span className="sr-only">{rules.number ? ': cumple' : ''}</span>
            </li>
          </ul>
        </div>

        <p className={styles.group}>Tus estudios</p>
        <SelectField
          id="su-career"
          label="Carrera"
          icon="cap"
          placeholder="Elige tu carrera"
          options={CAREERS}
          value={values.career}
          error={errors.career}
          onFocus={() => say(ROU.career)}
          onChange={(e) => update('career', e.target.value)}
        />
        <YearPicker
          idPrefix="su-year"
          years={YEARS}
          value={values.year}
          error={errors.year}
          onChange={(year) => {
            update('year', year);
            say(Number(year) >= 4 ? ROU.yearLate : ROU.yearEarly, 'ok');
          }}
        />

        <div>
          <label className={styles.terms} htmlFor="su-terms">
            <input
              id="su-terms"
              type="checkbox"
              checked={values.terms}
              aria-invalid={errors.terms ? true : undefined}
              aria-describedby={errors.terms ? 'su-terms-error' : undefined}
              onChange={(e) => update('terms', e.target.checked)}
            />
            <span>
              Acepto los <b>Términos</b> y la <b>Política de privacidad</b> de Rouviere.
            </span>
          </label>
          {errors.terms && (
            <div id="su-terms-error" className={styles.msg}>
              <Icon name="alert" size={15} strokeWidth={2.2} />
              <span>{errors.terms}</span>
            </div>
          )}
        </div>

        <Button type="submit" loading={submitting} loadingText="Creando tu cuenta…">
          Crear mi cuenta
        </Button>
        <div className={styles.or}>o</div>
        <GoogleButton
          label="Registrarme con Google"
          loading={googleLoading}
          onClick={registerWithGoogle}
        />
      </form>
    </>
  );
}
