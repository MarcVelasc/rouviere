import { useId } from 'react';
import { Icon } from '@/shared/ui/Icon';
import styles from './YearPicker.module.css';

interface YearPickerProps {
  idPrefix: string;
  years: readonly number[];
  value: string;
  error?: string;
  onChange: (year: string) => void;
}

/** "Año que cursas": botones de opción nativos (se manejan con flechas y lector de pantalla). */
export function YearPicker({ idPrefix, years, value, error, onChange }: YearPickerProps) {
  const msgId = useId();
  return (
    <fieldset
      className={[styles.field, error ? styles.invalid : ''].join(' ')}
      aria-describedby={error ? msgId : undefined}
    >
      <legend className={styles.legend}>Año que cursas</legend>
      <div className={styles.seg}>
        {years.map((year) => (
          <span key={year}>
            <input
              type="radio"
              id={`${idPrefix}-${year}`}
              name={idPrefix}
              value={year}
              checked={value === String(year)}
              onChange={(e) => onChange(e.target.value)}
            />
            <label htmlFor={`${idPrefix}-${year}`}>
              {year}°<span className="sr-only"> año</span>
            </label>
          </span>
        ))}
      </div>
      {error && (
        <div id={msgId} className={styles.msg}>
          <Icon name="alert" size={15} strokeWidth={2.2} />
          <span>{error}</span>
        </div>
      )}
    </fieldset>
  );
}
