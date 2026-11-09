import { estado } from '../../estado.js';
import { $, copyTxt, msg } from '../../core/dom.js';
import { atParts, atSelect } from '../atlas/atlas-sistemas.js';
export /* ===== nombres puestos por el usuario (quedan en su dispositivo) ===== */
function userNames() {
  try {
    return JSON.parse(localStorage.getItem('rv_names') || '{}');
  } catch (e) {
    return {};
  }
}
export function userNamesSave(o) {
  try {
    localStorage.setItem('rv_names', JSON.stringify(o));
  } catch (e) {}
}
export function unKey(mid, raw) {
  return mid + '|' + raw;
}
export function unGet(mid, raw) {
  var o = userNames();
  return o[unKey(mid, raw)] || null;
}
export function unSet(mid, raw, v) {
  var o = userNames();
  if (v) o[unKey(mid, raw)] = v;
  else delete o[unKey(mid, raw)];
  userNamesSave(o);
}
export function unCount(mid) {
  var o = userNames(),
    n = 0;
  for (var k in o) if (k.indexOf(mid + '|') === 0) n++;
  return n;
}
export function askName(mesh) {
  var mid = estado.atCur ? estado.atCur.id : 'local',
    act = unGet(mid, mesh.name) || '';
  var v = prompt(
    'Nombre anatómico para esta estructura\n(archivo: ' +
      mesh.name +
      ')\n\nDéjalo vacío para borrarlo.',
    act,
  );
  if (v === null) return;
  unSet(mid, mesh.name, v.trim());
  atParts($('aq').value);
  if (estado.AT3.sel === mesh) atSelect(mesh);
  msg('amsg', v.trim() ? 'Nombre guardado en este dispositivo: ' + v.trim() : 'Nombre borrado.');
}
export function exportNames() {
  var o = userNames(),
    out = [];
  for (var k in o) {
    var p = k.split('|');
    out.push(p[0] + '\t' + p[1] + '\t' + o[k]);
  }
  if (!out.length) {
    msg('amsg', 'Todavía no has nombrado ninguna estructura.');
    return;
  }
  copyTxt('modelo\tmalla\tnombre\n' + out.join('\n'), 'amsg');
}
/* ===== nombres anatómicos en español y color ===== */
