import { useEffect, useState, type CSSProperties } from 'react';
import rouUrl from '@/assets/rou/rou.webp';
import huesosUrl from '@/assets/rou/huesos.svg';
import musculosUrl from '@/assets/rou/musculos.svg';
import nerviosUrl from '@/assets/rou/nervios.svg';
import { useReducedMotion } from '@/shared/lib/useReducedMotion';
import styles from './RouAnatomy.module.css';

const ROU_LAYERS = ['huesos', 'musculos', 'nervios', 'completo'] as const;
type RouLayer = (typeof ROU_LAYERS)[number];

/**
 * Cómo se dibuja cada capa:
 * - 'ilustracion': una ilustración propia del equipo de diseño (huesos y músculos).
 * - 'sobre-rou': rou.webp teñido con un dibujo encima, recortado a su silueta. Lo usa
 *   nervios mientras no llegue su ilustración final.
 */
type Capa = { tipo: 'ilustracion'; src: string } | { tipo: 'sobre-rou'; src: string } | null;

const CAPAS: Record<RouLayer, Capa> = {
  huesos: { tipo: 'ilustracion', src: huesosUrl },
  musculos: { tipo: 'ilustracion', src: musculosUrl },
  nervios: { tipo: 'sobre-rou', src: nerviosUrl },
  completo: null,
};

interface RouAnatomyProps {
  /** Milisegundos entre capa y capa. */
  interval?: number;
  /** Para cambiar el tamaño desde afuera (por ejemplo, más grande en la compu). */
  className?: string;
}

/**
 * Rou mostrando sus capas: huesos → músculos → nervios → completo, en bucle.
 * Cada capa anatómica es la ilustración teñida más un dibujo (SVG) recortado a su silueta.
 * Con "reducir movimiento" activado se queda quieto en "completo".
 */
export function RouAnatomy({ interval = 2200, className }: RouAnatomyProps) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduce) return;
    let timer: number | undefined;
    const start = () => {
      window.clearInterval(timer);
      timer = window.setInterval(() => setIndex((i) => (i + 1) % ROU_LAYERS.length), interval);
    };
    const stop = () => window.clearInterval(timer);
    // No gasta batería mientras la pestaña no se ve.
    const onVisibility = () => (document.hidden ? stop() : start());
    start();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [reduce, interval]);

  const current: RouLayer = reduce ? 'completo' : (ROU_LAYERS[index] ?? 'completo');
  const silhouette = { '--silueta': `url("${rouUrl}")` } as CSSProperties;

  return (
    <div
      className={[styles.rou, className ?? ''].join(' ')}
      style={silhouette}
      role="img"
      aria-label="Rou, la lechuza de Rouviere, mostrando sus huesos, músculos y nervios"
      data-layer={current}
    >
      <span className={styles.halo} aria-hidden="true" />
      <span className={styles.float}>
        {ROU_LAYERS.map((layer) => (
          <span
            key={layer}
            className={[styles.layer, layer === current ? styles.on : ''].join(' ')}
            data-testid={`rou-${layer}`}
          >
            <RouCapa layer={layer} />
          </span>
        ))}
      </span>
    </div>
  );
}

function RouCapa({ layer }: { layer: RouLayer }) {
  const capa = CAPAS[layer];
  if (!capa) return <img className={styles.art} src={rouUrl} alt="" />;
  if (capa.tipo === 'ilustracion') return <img className={styles.art} src={capa.src} alt="" />;
  return (
    <>
      <img className={[styles.art, styles[layer]].join(' ')} src={rouUrl} alt="" />
      <img className={[styles.art, styles.overlay].join(' ')} src={capa.src} alt="" />
    </>
  );
}
