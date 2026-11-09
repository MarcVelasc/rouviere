import { estado } from '../../estado.js';
import { msg } from '../../core/dom.js';
/* ===== inicio: carrusel y tarjeta mini ===== */
export const SL = [
  [
    'Quien enseña Anatomía pidió algo claro: que la herramienta enseñe haciendo, no solo mostrando respuestas.',
    'Síntesis · docente de Anatomía Humana',
  ],
  [
    'El sistema nervioso central es lo que más se les complica a los estudiantes, según su experiencia.',
    'Síntesis · docente de Anatomía Humana',
  ],
  [
    'Anatomía, Histología y Embriología deben seguir separadas, pero avanzar juntas por órgano o sistema.',
    'Síntesis · docente de Anatomía Humana',
  ],
  [
    'Los estudiantes piden modelos 3D, ver el cuerpo por capas y saber de qué fuente viene cada dato.',
    'Síntesis · estudiantes de primer año',
  ],
];
export function sld(d) {
  estado.si = (estado.si + d + SL.length) % SL.length;
  msg('sdt', SL[estado.si][0]);
  msg('sda', SL[estado.si][1]);
  msg('sdn', estado.si + 1 + ' / ' + SL.length);
}
export function flipMini(b) {
  b.classList.toggle('fl');
}
/* ===== exámenes (calendario) ===== */
