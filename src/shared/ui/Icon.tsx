/** Íconos de línea propios (sin emojis). Se agregan nuevos en PATHS. */
const PATHS = {
  home: 'M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z',
  body: 'M12 3.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM12 8v7M7.5 10.5h9M10 21l2-6 2 6',
  cards:
    'M5 7h12a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1zM7 4h12a1 1 0 0 1 1 1v11',
  chart: 'M4 20V10M10 20V4M16 20v-7M21 20H3',
  mail: 'M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zM3.5 7l8.5 6 8.5-6',
  lock: 'M6 10.5h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1zM8 10.5V8a4 4 0 0 1 8 0v2.5',
  eye: 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  eyeOff:
    'M3 3l18 18M10.6 5.2A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4.1M6.6 6.6C3.8 8.4 2 12 2 12s3.6 7 10 7a9.7 9.7 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2',
  alert: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7.5V13M12 16.5v.1',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  arrowLeft: 'M19 12H5M11 6l-6 6 6 6',
  arrowRight: 'M5 12h14M13 6l6 6-6 6',
  logout: 'M15 4h3a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3M10 16l-4-4 4-4M6 12h10',
  brain:
    'M9 4.5a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 3 5 3 3 0 0 0 5 .5V5.5a3 3 0 0 0-3-1zM15 4.5a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-3 5 3 3 0 0 1-5 .5',
  bone: 'M7 17l10-10M5.5 15.5a2 2 0 1 0 2 3 2 2 0 1 0 3-2zM18.5 8.5a2 2 0 1 0-2-3 2 2 0 1 0-3 2z',
  heart: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z',
  lungs:
    'M12 4v8M12 12c-1.5 0-3-1-4-3-2 1-4 5-4 9 0 1.5 1 2 2.5 2S12 19 12 16M12 12c1.5 0 3-1 4-3 2 1 4 5 4 9 0 1.5-1 2-2.5 2S12 19 12 16',
  muscle: 'M6 18c0-5 3-6 5-9 1-1.6 1-3 3-3s3 2 2 4-3 2-3 4 4 1 5 3-1 3-3 3H8a2 2 0 0 1-2-2z',
  rotate: 'M20 12a8 8 0 1 1-2.3-5.7M20 4v4h-4',
  path: 'M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM8 17c4 0 2-6 8-9',
  user: 'M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM4 20c0-4 3.6-6 8-6s8 2 8 6',
  cap: 'M2 9l10-5 10 5-10 5zM6 11v5c3.5 2.2 8.5 2.2 12 0v-5',
  play: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM10 8.5l5.5 3.5-5.5 3.5z',
  chevronDown: 'M6 9l6 6 6-6',
  chevronLeft: 'M15 18l-6-6 6-6',
} as const;

export type IconName = keyof typeof PATHS;

interface IconProps {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function Icon({ name, size = 20, strokeWidth = 1.8, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
