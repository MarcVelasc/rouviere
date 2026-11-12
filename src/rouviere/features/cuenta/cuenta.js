import { $ } from '../../core/dom.js';
import { primerNombre, usuarioSesion } from '../../core/sesion.js';

/* ===== cuenta =====
   Nombre y correo de quien entró, en el menú lateral y en Perfil, junto al botón
   para cerrar sesión. */
export function renderCuenta() {
  var u = usuarioSesion();
  var nombre = (u && u.name) || 'Tu cuenta';
  var correo = u ? (u.provider === 'google' ? 'Google · ' : '') + (u.email || '') : '';
  var inicial = (primerNombre(u) || 'R').charAt(0).toUpperCase();
  ['mcu', 'pfc'].forEach(function (p) {
    var n = $(p + 'Nom'),
      m = $(p + 'Mail'),
      a = $(p + 'Av');
    if (n) n.textContent = nombre;
    if (m) m.textContent = correo;
    if (a) a.textContent = inicial;
  });
}
