/**
 * La app del equipo de diseño vive en public/app/ y se publica tal cual.
 * Después de ingresar, se pasa a ella con una navegación normal del navegador.
 */
export const APP_URL = `${import.meta.env.BASE_URL}app/`;

export function goToApp(): void {
  window.location.replace(APP_URL);
}
