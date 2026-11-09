import { useId, type SelectHTMLAttributes } from 'react';
import { Icon, type IconName } from './Icon';
import styles from './TextField.module.css';

interface SelectFieldProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
  id: string;
  label: string;
  placeholder: string;
  options: readonly string[];
  icon?: IconName;
  error?: string;
}

/** Lista desplegable nativa: en el celular abre el selector del sistema, que es el más cómodo. */
export function SelectField({
  id,
  label,
  placeholder,
  options,
  icon,
  error,
  value,
  ...rest
}: SelectFieldProps) {
  const msgId = useId();
  return (
    <div className={[styles.field, error ? styles.invalid : ''].join(' ')}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={styles.control}>
        {icon && <Icon name={icon} size={18} className={styles.lead} />}
        <select
          id={id}
          value={value}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? msgId : undefined}
          className={[
            styles.input,
            styles.select,
            icon ? styles.withIcon : '',
            value ? '' : styles.empty,
          ].join(' ')}
          {...rest}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <Icon name="chevronDown" size={18} className={styles.trail} />
      </div>
      {error && (
        <div id={msgId} className={[styles.msg, styles.error].join(' ')}>
          <Icon name="alert" size={15} strokeWidth={2.2} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
