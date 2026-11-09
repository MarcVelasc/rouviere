import { $, el, msg, pad } from '../../core/dom.js';
export /* ===== exámenes (calendario) ===== */
function getEx() {
  try {
    return JSON.parse(localStorage.getItem('rv_ex') || '[]');
  } catch (e) {
    return [];
  }
}
export function setEx(a) {
  try {
    localStorage.setItem('rv_ex', JSON.stringify(a));
  } catch (e) {}
}
export function exMs(x) {
  return new Date(x.d + 'T' + (x.t || '08:00')).getTime();
}
export function nxt() {
  var n = Date.now();
  return getEx()
    .filter(function (x) {
      return exMs(x) >= n;
    })
    .sort(function (a, b) {
      return exMs(a) - exMs(b);
    })[0];
}
export function nextEx() {
  var e = $('nx'),
    x = nxt();
  if (!e) return;
  if (!x) {
    e.innerHTML =
      '<small>Tu próximo examen</small><strong>Prográmalo aquí</strong><span>Toca para elegir la fecha →</span>';
    return;
  }
  var ms = exMs(x) - Date.now(),
    d = Math.floor(ms / 864e5),
    h = Math.floor((ms % 864e5) / 36e5),
    m = Math.floor((ms % 36e5) / 6e4),
    s = Math.floor((ms % 6e4) / 1e3);
  e.innerHTML =
    '<small>Tu próximo examen</small><strong></strong><div class="cd"><div><b>' +
    d +
    '</b>días</div><div><b>' +
    pad(h) +
    '</b>horas</div><div><b>' +
    pad(m) +
    '</b>min</div><div><b>' +
    pad(s) +
    '</b>seg</div></div>';
  e.querySelector('strong').textContent = x.n;
}
export const MN = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];
export function cmv(d) {
  var c = window.cmo || new Date();
  window.cmo = new Date(c.getFullYear(), c.getMonth() + d, 1);
  renderEx();
}
export function addEx() {
  var n = $('exn').value.trim(),
    d = $('exd').value;
  if (!n || !d) {
    msg('exmm', 'Escribe el nombre y elige la fecha.');
    return;
  }
  var a = getEx();
  a.push({
    n: n,
    d: d,
    t: $('ext').value || '08:00',
    id: Date.now(),
  });
  setEx(a);
  $('exn').value = '';
  msg('exmm', 'Examen guardado en este dispositivo.');
  renderEx();
  nextEx();
}
export function renderEx() {
  var c = (window.cmo = window.cmo || new Date()),
    y = c.getFullYear(),
    m = c.getMonth();
  msg('exm', MN[m] + ' ' + y);
  var first = (new Date(y, m, 1).getDay() + 6) % 7,
    days = new Date(y, m + 1, 0).getDate(),
    ex = getEx(),
    g = $('cal'),
    td = new Date();
  g.innerHTML = '';
  ['L', 'M', 'M', 'J', 'V', 'S', 'D'].forEach(function (l) {
    var e = el('div', 'dh', l);
    g.appendChild(e);
  });
  for (var i = 0; i < first; i++) g.appendChild(document.createElement('div'));
  for (var k = 1; k <= days; k++) {
    (function (k) {
      var key = y + '-' + pad(m + 1) + '-' + pad(k),
        b = el('button', 'dc', String(k));
      b.type = 'button';
      if (
        ex.some(function (x) {
          return x.d === key;
        })
      )
        b.classList.add('ex');
      if (k === td.getDate() && m === td.getMonth() && y === td.getFullYear())
        b.classList.add('td');
      b.onclick = function () {
        $('exd').value = key;
        $('exn').focus();
      };
      g.appendChild(b);
    })(k);
  }
  var l = $('exl');
  l.innerHTML = '';
  ex.sort(function (a, b) {
    return exMs(a) - exMs(b);
  });
  if (!ex.length) {
    l.textContent = 'Aún no tienes exámenes. Toca un día del calendario y agrégalo.';
    return;
  }
  ex.forEach(function (x) {
    var ms = exMs(x) - Date.now(),
      dd = Math.ceil(ms / 864e5),
      it = el('div', 'item xi'),
      w = el('div'),
      t = el('b', 0, x.n),
      sm = el(
        'small',
        0,
        x.d +
          ' · ' +
          (x.t || '') +
          ' · ' +
          (ms < 0 ? 'ya pasó' : dd <= 1 ? '¡es hoy o mañana!' : 'faltan ' + dd + ' días'),
      );
    if (ms < 0) it.style.opacity = '.5';
    w.appendChild(t);
    w.appendChild(sm);
    it.appendChild(w);
    var del = el('button', 0, '×');
    del.type = 'button';
    del.setAttribute('aria-label', 'Eliminar');
    del.onclick = function () {
      setEx(
        getEx().filter(function (y) {
          return y.id !== x.id;
        }),
      );
      renderEx();
      nextEx();
    };
    it.appendChild(del);
    l.appendChild(it);
  });
}

/* Enlace de eventos sin atributos en linea */
