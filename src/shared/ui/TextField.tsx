import { useId, useState, type InputHTMLAttributes, type KeyboardEvent } from 'react';
import { Icon, type IconName } from './Icon';
import styles from './TextField.module.css';

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  id: string;
  label: string;
  icon?: IconName;
  hint?: string;
  error?: string;
  /** Muestra un botón para ver u ocultar la contraseña y avisa si las mayúsculas están activadas. */
  revealable?: boolean;
  onCapsLockChange?: (on: boolean) => void;
}

export function TextField({
  id,
  label,
  icon,
  hint,
  error,
  revealable,
  onCapsLockChange,
  type = 'text',
  onKeyDown,
  onKeyUp,
  ...rest
}: TextFieldProps) {
  const [revealed, setRevealed] = useState(false);
  const [caps, setCaps] = useState(false);
  const msgId = useId();

  const checkCaps = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!revealable || !e.getModifierState) return;
    const on = e.getModifierState('CapsLock');
    if (on !== caps) {
      setCaps(on);
      onCapsLockChange?.(on);
    }
  };

  const message = error ?? (caps ? 'Tienes las mayúsculas activadas.' : hint);
  const tone = error ? styles.error : caps ? styles.warn : styles.hint;

  return (
    <div className={[styles.field, error ? styles.invalid : ''].join(' ')}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={styles.control}>
        {icon && <Icon name={icon} size={18} className={styles.lead} />}
        <input
          id={id}
          type={revealable ? (revealed ? 'text' : 'password') : type}
          aria-invalid={error ? true : undefined}
          aria-describedby={message ? msgId : undefined}
          className={[
            styles.input,
            icon ? styles.withIcon : '',
            revealable ? styles.withAction : '',
          ].join(' ')}
          onKeyDown={(e) => {
            checkCaps(e);
            onKeyDown?.(e);
          }}
          onKeyUp={(e) => {
            checkCaps(e);
            onKeyUp?.(e);
          }}
          {...rest}
        />
        {revealable && (
          <button
            type="button"
            className={styles.peek}
            aria-label={revealed ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            aria-pressed={revealed}
            onClick={() => setRevealed((v) => !v)}
          >
            <Icon name={revealed ? 'eyeOff' : 'eye'} />
          </button>
        )}
      </div>
      {message && (
        <div id={msgId} className={[styles.msg, tone].join(' ')}>
          {error && <Icon name="alert" size={15} strokeWidth={2.2} />}
          <span>{message}</span>
        </div>
      )}
    </div>
  );
}
