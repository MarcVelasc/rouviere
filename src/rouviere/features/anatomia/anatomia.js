import { estado } from '../../estado.js';
import { mn } from '../../core/almacenamiento.js';
import { $, el, msg, nz } from '../../core/dom.js';
import { anBack, renderAn } from './categorias.js';
import { COMP, compAreas, compAvance, compCuenta, compGet, compHay } from './competencias.js';
import { LIB, LIBCAT, renderLib } from '../biblioteca/biblioteca.js';
import { fueraRec } from '../embriologia/histologia-embriologia.js';
import { mvpVale } from '../mvp/mvp.js';
import { XC, exSetup } from '../simulacros/simulacros.js';
import { renderCards } from '../tarjetas/tarjetas.js';
export /* comp · area */
function anModo(m) {
  estado.AN_MODO = m === 'area' ? 'area' : 'comp';
  anBack();
  renderAn();
}
export function renderComp() {
  var w = $('anlist');
  if (!w) return;
  w.textContent = '';
  var n = nz(estado.anQ),
    vis = 0;
  COMP.forEach(function (a) {
    if (n.length > 1 && compHay(a).indexOf(n) < 0) return;
    vis++;
    var c = compCuenta(a[0]),
      av = compAvance(a[0]);
    var b = el('button', 'anc');
    b.type = 'button';
    b.setAttribute('data-hc', '145');
    b.setAttribute('data-k', a[0]);
    var h = el('div', 'anch');
    h.appendChild(el('b', 0, a[1]));
    b.appendChild(h);
    b.appendChild(el('p', 'ancd', a[2]));
    var f = el('div', 'ancf');
    f.appendChild(el('span', 'anct anar', a[3].length + ' temas'));
    f.appendChild(el('span', 'anct', c.c + (c.c === 1 ? ' tarjeta' : ' tarjetas')));
    f.appendChild(el('span', 'anct', c.q + (c.q === 1 ? ' pregunta' : ' preguntas')));
    b.appendChild(f);
    if (av.k) {
      var bb = el('div', 'pbar anpb'),
        ii = document.createElement('i');
      ii.style.width = Math.max(2, av.pc) + '%';
      bb.appendChild(ii);
      b.appendChild(bb);
      b.appendChild(el('span', 'anpl', av.k + ' de ' + av.n + ' dominadas'));
    }
    w.appendChild(b);
  });
  if (!vis) w.appendChild(el('p', 'bqe', 'Ninguna competencia coincide con «' + estado.anQ + '».'));
  msg(
    'annota',
    'Reparto propuesto a partir del nombre de cada tema, pendiente de que lo ' +
      'confirme el docente. Cada competencia enseña de qué temas se compone. Ninguna ' +
      'tarjeta aparece en dos competencias.',
  );
}
export function compAbrir(k) {
  var a = compGet(k);
  if (!a) return;
  estado.AN_CUR = null;
  estado.COMP_CUR = k;
  $('anw').style.display = 'none';
  $('and').style.display = '';
  var fig = $('anfig');
  if (fig) {
    fig.textContent = '';
    var g = document.createElement('img');
    g.src = 'img/' + a[5];
    g.alt = 'Ilustración de ' + a[1].split('·').pop().trim();
    g.loading = 'lazy';
    g.width = 1280;
    g.height = 720;
    fig.appendChild(g);
    fig.hidden = false;
  }
  msg('anest', compAreas(k).join(' · '));
  $('ant').textContent = a[1];
  msg('ani', a[2]);
  var av = compAvance(k),
    pr = $('anprog');
  if (pr) {
    pr.textContent = '';
    var t = el('div', 'anpt');
    t.appendChild(el('b', 0, av.k + ' de ' + av.n + ' tarjetas dominadas'));
    t.appendChild(el('span', 0, av.pc + '%'));
    pr.appendChild(t);
    var bb = el('div', 'pbar'),
      ii = document.createElement('i');
    ii.style.width = Math.max(av.pc ? 2 : 0, av.pc) + '%';
    bb.appendChild(ii);
    pr.appendChild(bb);
    if (!av.k)
      pr.appendChild(
        el('p', 's mini', 'Todavía no has marcado ninguna como conocida en este dispositivo.'),
      );
  }

  /* los temas, agrupados por el área de la que vienen */
  var u = $('ancont');
  u.textContent = '';
  var porA = {};
  a[3].forEach(function (p) {
    (porA[p[0]] = porA[p[0]] || []).push(p[1]);
  });
  Object.keys(porA).forEach(function (sis) {
    var li = el('li');
    li.appendChild(el('b', 0, mn(sis)));
    li.appendChild(el('span', 's', ' · ' + porA[sis].join(' · ')));
    u.appendChild(li);
  });
  var c = compCuenta(k),
    p2 = $('anprac');
  p2.textContent = '';
  p2.appendChild(el('p', 's', 'Se abre con el filtro de esta competencia ya puesto.'));
  var b1 = el('button', 'pill', 'Estudiar ' + c.c + (c.c === 1 ? ' tarjeta ' : ' tarjetas '));
  b1.type = 'button';
  b1.setAttribute('data-hc', '146');
  b1.setAttribute('data-w', 't');
  b1.appendChild(el('span', 0, '→'));
  p2.appendChild(b1);
  var b2 = el('button', 'pill', 'Practicar ' + c.q + (c.q === 1 ? ' pregunta ' : ' preguntas '));
  b2.type = 'button';
  b2.setAttribute('data-hc', '146');
  b2.setAttribute('data-w', 'q');
  b2.appendChild(el('span', 0, '→'));
  p2.appendChild(b2);
  var t3 = $('anatl');
  t3.textContent = '';
  var cjAt = t3.parentNode;
  if (cjAt) cjAt.hidden = !mvpVale('atlas');
  a[4].forEach(function (x) {
    var b = el('button', 'pill sm', x[2] + ' ');
    b.type = 'button';
    b.setAttribute('data-hc', '139');
    b.setAttribute('data-k', x[0] + ':' + x[1]);
    b.appendChild(el('span', 0, '→'));
    t3.appendChild(b);
  });
  var lb = $('anlib');
  lb.textContent = '';
  var cjLb = lb.parentNode;
  if (cjLb) cjLb.hidden = !mvpVale('biblioteca');
  var mat = a[6],
    nm = '',
    cnt = 0;
  if (typeof LIBCAT !== 'undefined')
    LIBCAT.forEach(function (x) {
      if (x[0] === mat) nm = x[1];
    });
  if (typeof LIB !== 'undefined')
    LIB.forEach(function (r) {
      if (r.cat === mat && !fueraRec(r)) cnt++;
    });
  lb.appendChild(
    el(
      'p',
      's',
      'La biblioteca está ordenada por materia, así que esta ' +
        'competencia se apoya en «' +
        (nm || mat) +
        '».',
    ),
  );
  var b4 = el('button', 'pill sm', cnt + ' recursos de ' + (nm || mat) + ' ');
  b4.type = 'button';
  b4.setAttribute('data-hc', '146');
  b4.setAttribute('data-w', 'b');
  b4.appendChild(el('span', 0, '→'));
  lb.appendChild(b4);
  window.scrollTo(0, 0);
}
export function compGo(w) {
  var a = compGet(estado.COMP_CUR);
  if (!a) return;
  if (w === 't') {
    estado.CF.comp = a[0];
    estado.CF.cat = 'all';
    estado.CF.m = 'all';
    estado.CF.t = 'all';
    estado.CF.d = 'all';
    estado.CF.st = 'all';
    estado.CF.q = '';
    estado.CF.fav = false;
    location.hash = '#tarjetas';
    setTimeout(function () {
      var e = $('cq2');
      if (e) e.value = '';
      renderCards();
    }, 60);
    return;
  }
  if (w === 'q') {
    XC.comp = a[0];
    XC.cat = 'all';
    XC.sis = 'all';
    XC.tema = 'all';
    location.hash = '#simulacros';
    setTimeout(function () {
      if (typeof exSetup === 'function') exSetup();
    }, 60);
    return;
  }
  if (w === 'b') {
    estado.lbcat = a[6];
    estado.lbkind = 'all';
    estado.lbidi = 'all';
    estado.lbview = 'all';
    estado.lbq = '';
    estado.lbPage = 1;
    location.hash = '#biblioteca';
    setTimeout(function () {
      var e = $('lbq');
      if (e) e.value = '';
      renderLib();
    }, 60);
    return;
  }
}

/* ===== panel de inicio =====
   Sustituye al catálogo de herramientas, que repetía el menú lateral. Todo lo que
   enseña sale del estado guardado en este dispositivo; cuando no hay nada, lo dice.
   Ninguna cifra es de ejemplo. */

/* La última sección visitada, para poder retomarla. Se guarda solo cuando cambia. */
