/* ===== sesión =====
   El acceso (src/, en React) guarda la sesión con esta clave. La app solo la lee:
   para iniciar o cerrar sesión se va a las pantallas de acceso. */
const CLAVE = 'rouviere.session';

/* El usuario de la sesión ({ name, email, provider, year }) o null. */
export function usuarioSesion() {
  try {
    var s = JSON.parse(localStorage.getItem(CLAVE) || sessionStorage.getItem(CLAVE) || 'null');
    return s && s.user ? s.user : null;
  } catch (e) {
    return null;
  }
}

/* Solo el primer nombre ("Ana María Flores" → "Ana"). */
export function primerNombre(u) {
  var n = u && u.name ? String(u.name).trim().split(/\s+/)[0] : '';
  return n || '';
}

/* Ruta de las pantallas de acceso que cierra la sesión y vuelve al inicio. */
export const URL_SALIR = '../#/salir';
