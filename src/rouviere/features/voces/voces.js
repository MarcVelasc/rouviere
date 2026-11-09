import { estado } from '../../estado.js';
import { W } from '../../core/almacenamiento.js';
import { $, copyTxt, dlFile, el, fmt, msg } from '../../core/dom.js';
export /* ===== voces ===== */
function addCm() {
  var t = $('cmt').value.trim();
  if (t.length < 10) {
    msg('cmm', 'Escribe al menos 10 caracteres.');
    return;
  }
  estado.S.cm.unshift({
    t: Date.now(),
    r: $('cmr').value,
    x: t.slice(0, 800),
  });
  W();
  $('cmt').value = '';
  msg(
    'cmm',
    'Comentario guardado en este dispositivo. No se envía a ningún servidor: cópialo o descárgalo para compartirlo.',
  );
  renderCm();
}
export function renderCm() {
  var l = $('cml');
  l.textContent = '';
  if (!estado.S.cm.length) {
    l.appendChild(el('p', 's', 'Aún no hay comentarios guardados.'));
    return;
  }
  estado.S.cm.forEach(function (c, i) {
    var d = el('div', 'item xi'),
      w = el('div');
    w.appendChild(el('b', 0, c.r + ' · ' + fmt(c.t)));
    w.appendChild(el('small', 0, c.x));
    d.appendChild(w);
    var b = el('button', 0, '×');
    b.type = 'button';
    b.setAttribute('aria-label', 'Eliminar comentario');
    b.onclick = function () {
      estado.S.cm.splice(i, 1);
      W();
      renderCm();
    };
    d.appendChild(b);
    l.appendChild(d);
  });
}
export function cmTxt() {
  return estado.S.cm
    .map(function (c) {
      return '[' + c.r + ' · ' + fmt(c.t) + '] ' + c.x;
    })
    .join('\n\n');
}
export function cmCopy() {
  if (!estado.S.cm.length) {
    msg('cmm', 'No hay comentarios para copiar.');
    return;
  }
  copyTxt(cmTxt(), 'cmm');
}
export function cmDl() {
  if (!estado.S.cm.length) {
    msg('cmm', 'No hay comentarios para descargar.');
    return;
  }
  dlFile(
    'comentarios-rouviere.txt',
    new Blob([cmTxt()], {
      type: 'text/plain',
    }),
    'cmm',
  );
}
export function wipe() {
  try {
    localStorage.removeItem('rv_s');
    localStorage.removeItem('rv_ex');
  } catch (e) {}
  estado.S = {
    cards: [],
    known: {},
    hist: [],
    act: [],
    bank: [],
    cm: [],
    fav: {},
    sr: {},
    est: [],
    goal: {
      c: 0,
    },
    ruta: {
      done: {},
      xp: 0,
    },
  };
  estado.CF = {
    m: 'all',
    t: 'all',
    d: 'all',
    st: 'all',
    q: '',
    fav: false,
  };
  msg('wm', 'Tus datos se borraron de este dispositivo.');
}
/* ===== inicio: carrusel y tarjeta mini ===== */
