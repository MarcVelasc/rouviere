import { useEffect, useRef } from 'react';
import rouUrl from '@/assets/rou/rou.webp';
import styles from './Mascot.module.css';

export type MascotTone = 'neutral' | 'ok' | 'warn' | 'error';

interface MascotProps {
  message: string;
  tone?: MascotTone;
  /** Ancho de Rou en px (el alto sale de la proporción 3:4 de la ilustración). */
  size?: number;
}

/** Rou pequeño con un globo de diálogo. El globo se anuncia a lectores de pantalla. */
export function Mascot({ message, tone = 'neutral', size = 66 }: MascotProps) {
  const picRef = useRef<HTMLImageElement>(null);

  // Pequeño salto cada vez que cambia lo que dice.
  useEffect(() => {
    const el = picRef.current;
    const hop = styles.hop;
    if (!el || !hop) return;
    el.classList.remove(hop);
    void el.offsetWidth;
    el.classList.add(hop);
  }, [message]);

  return (
    <div className={styles.rou}>
      <img
        ref={picRef}
        className={styles.pic}
        src={rouUrl}
        alt=""
        width={size}
        height={Math.round((size * 4) / 3)}
      />
      <p className={styles.bubble} data-tone={tone} role="status" aria-live="polite">
        {message}
      </p>
    </div>
  );
}
