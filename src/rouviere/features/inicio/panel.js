import { estado } from '../../estado.js';
import { W } from '../../core/almacenamiento.js';

/* La última sección visitada, para poder retomarla. Se guarda solo cuando cambia. */
export function ultSet(h) {
  if (!h || h === 'home' || !estado.S) return;
  if (estado.S.ult === h) return;
  estado.S.ult = h;
  W();
}
export function ultNom(h) {
  var r = null;
  if (typeof estado.GSEC !== 'undefined')
    estado.GSEC.forEach(function (c) {
      if (c[0] === h) r = c;
    });
  return r;
}
