import { estado } from '../../estado.js';
import { NM_PROC } from '../../core/almacenamiento.js';
import { $, el, fmt, msg } from '../../core/dom.js';
import { atLabel } from '../atlas/atlas-sistemas.js';
import { HA_AVISO, haLeyenda } from '../atlas/human-atlas.js';
import { PINTXT, pinNext } from '../atlas/rotulos.js';
import { applyColors } from '../nombres/nombres-anatomicos.js';
import { allCards } from '../tarjetas/tarjetas.js';
export function avgSc() {
  var h = estado.S.hist;
  return h.length
    ? Math.round(
        (h.reduce(function (a, x) {
          return a + x.s / x.n;
        }, 0) /
          h.length) *
          100,
      )
    : null;
}
export function homeP() {
  var c = allCards(),
    k = c.filter(function (x) {
      return estado.S.known[x.id] === 'k';
    }).length,
    h = estado.S.hist,
    d = $('hp'),
    av = avgSc();
  if (!d) return;
  d.textContent = '';
  function bar(l, p) {
    d.appendChild(document.createTextNode(l));
    var b = el('div', 'pb'),
      i = document.createElement('i');
    i.style.setProperty('--w', p + '%');
    b.appendChild(i);
    d.appendChild(b);
  }
  if (!k && !h.length) {
    d.appendChild(
      el(
        'p',
        's',
        'Aún sin actividad. Marca tarjetas como conocidas o haz un simulacro para ver tu avance.',
      ),
    );
  } else {
    bar('Tarjetas conocidas: ' + k + ' de ' + c.length, Math.round((k / c.length) * 100));
    if (h.length) bar('Promedio en simulacros: ' + av + '%', av);
  }
  var l = h[0];
  $('clk').textContent = l ? l.s + '/' + l.n : '—';
  msg('hs', l ? 'Último simulacro · ' + fmt(l.t) : 'Aún no hay intentos');
}
export function atColorToggle() {
  if (!estado.AT3 || !estado.AT3.meshes.length) {
    msg('amsg', 'Carga un modelo primero.');
    return;
  }
  estado.atColor = estado.atColor === 'orig' ? 'pal' : 'orig';
  applyColors(estado.AT3.meshes, estado.atColor);
  $('acol').textContent = estado.atColor === 'pal' ? 'Colores del archivo' : 'Colorear estructuras';
  var esHA = !!(estado.atCur && /^ha-/.test(estado.atCur.id || ''));
  msg(
    'acolw',
    estado.atColor === 'pal'
      ? 'Colores asignados por la plataforma para distinguir estructuras. NO son colores anatómicos reales.'
      : esHA
        ? HA_AVISO
        : 'Mostrando los colores que trae el archivo original.',
  );
  if (estado.atCur && estado.atCur.kind === 'single' && estado.atColor === 'pal')
    msg(
      'acolw',
      'Este archivo es una sola malla: el color se aplica al conjunto, no a cada órgano. El color no es anatómico.',
    );
  var ly = $('haley');
  if (ly) {
    if (esHA && estado.atColor !== 'pal') haLeyenda();
    else ly.hidden = true;
  }
}
export function atLabToggle() {
  estado.atPin = pinNext(estado.atPin);
  $('albt').textContent = PINTXT[estado.atPin];
  estado.atLab = estado.atPin !== 'off';
  $('albl').style.display = 'none';
  if (estado.AT3) atLabel();
  msg(
    'amsg',
    estado.atPin === 'top'
      ? 'Se rotulan las estructuras con nombre más grandes en pantalla.'
      : estado.atPin === 'all'
        ? 'Se rotulan hasta 30 estructuras con nombre a la vez.'
        : estado.atPin === 'sel'
          ? 'Solo se rotula la estructura que elijas.'
          : 'Rótulos ocultos.',
  );
}
export function atProc(m) {
  var b = $('aproc');
  b.textContent = '';
  var p = m ? NM_PROC[m.id] : null;
  if (!m) {
    b.appendChild(el('p', 's', 'Elige un modelo.'));
    return;
  }
  if (!p) {
    b.appendChild(
      el(
        'p',
        's',
        'Este modelo trae los nombres de sus estructuras dentro del archivo. Sigue pendiente confirmar su autor y su licencia en la entrada original.',
      ),
    );
    return;
  }
  [
    ['Título', p.t],
    ['Entrada', p.id],
    ['Autor', p.aut],
    ['Licencia', p.lic],
    ['Origen de los datos', p.src],
    ['Contenido', p.cont],
    ['Versión segmentada', p.seg],
  ].forEach(function (r) {
    var q = el('p', 'srcmini');
    q.appendChild(el('b', 0, r[0] + ': '));
    q.appendChild(document.createTextNode(r[1]));
    b.appendChild(q);
  });
  if (p.url) {
    var q = el('p', 'srcmini');
    var a = el('a', 0, 'Abrir la entrada original');
    a.href = p.url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    q.appendChild(a);
    b.appendChild(q);
  }
}
/* ===== nombres puestos por el usuario (quedan en su dispositivo) ===== */
