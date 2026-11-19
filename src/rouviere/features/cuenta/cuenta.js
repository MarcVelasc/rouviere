import { $ } from '../../core/dom.js';
import { primerNombre, usuarioSesion } from '../../core/sesion.js';
import { estadoNube } from '../../core/nube.js';

/* ===== cuenta =====
   Nombre y correo de quien entró, en el menú lateral y en Perfil, junto al botón
   para cerrar sesión. */
export function renderCuenta() {
  var u = usuarioSesion();
  var nombre = (u && u.name) || 'Tu cuenta';
  var correo = !u
    ? ''
    : u.provider === 'password'
      ? u.email || ''
      : 'Sin cuenta · solo en este dispositivo';
  var inicial = (primerNombre(u) || 'R').charAt(0).toUpperCase();
  ['mcu', 'pfc'].forEach(function (p) {
    var n = $(p + 'Nom'),
      m = $(p + 'Mail'),
      a = $(p + 'Av');
    if (n) n.textContent = nombre;
    if (m) m.textContent = correo;
    if (a) a.textContent = inicial;
  });
  pintaNube();
}

/* Dónde está el progreso, debajo del correo en Perfil (evaluación heurística, problemas 7 y 15:
   que se vea si se guardó). Se actualiza con el evento «rv-nube» de core/nube.js. */
const TXT_NUBE = {
  cargando: 'Trayendo tu progreso…',
  guardando: 'Guardando en tu cuenta…',
  guardado: 'Progreso guardado en tu cuenta',
  'sin-conexion': 'Sin conexión: se guardará al volver internet',
};
export function pintaNube() {
  var el = $('pfcNube');
  if (!el) return;
  var t = TXT_NUBE[estadoNube()] || '';
  el.textContent = t;
  el.hidden = !t;
}
window.addEventListener('rv-nube', pintaNube);
