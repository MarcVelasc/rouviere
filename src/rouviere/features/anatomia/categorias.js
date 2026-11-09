import { estado } from '../../estado.js';
import { BANK, QB, mn } from '../../core/almacenamiento.js';
import { $, el, msg, nz } from '../../core/dom.js';
import { renderComp } from './anatomia.js';
import { apAbrir } from '../atlas/apartados.js';
import { haLoad } from '../atlas/human-atlas.js';
import { LIB, LIBCAT, renderLib } from '../biblioteca/biblioteca.js';
import { AN_IMG, anAvance } from '../embriologia/histologia-embriologia.js';
import { mvpVale } from '../mvp/mvp.js';
import { XC, exSetup } from '../simulacros/simulacros.js';
import { renderCards } from '../tarjetas/tarjetas.js';
/* ===== categorías anatómicas =====
   Las cinco primeras son las ramas clásicas de la anatomía descriptiva que pide el
   documento de organización. Las tres últimas no son invento: son las otras ramas
   clásicas, y están porque entre las cinco primeras solo caben cuatro de los doce
   sistemas del temario; sin ellas, 156 de las 335 tarjetas se quedarían sin entrada.
   Ningún contenido aparece en dos categorías a la vez: Artrología se lleva el tema
   «Articulaciones» y Osteología lo excluye.

   k  clave · n nombre · d qué abarca · sis sistemas del temario que entran
   t  único tema incluido · xt tema excluido · at qué abre en el Atlas 3D
   lib materia de la biblioteca que lo cubre */
export const ANAT = [
  [
    'general',
    'Anatomía general',
    'La posición anatómica, los planos, las cavidades, las regiones del cuerpo, la piel y el tejido conectivo.',
    ['piel', 'reg'],
    null,
    null,
    [['ha', 'otros', 'Tejido conectivo y piel']],
    'reg',
  ],
  [
    'osteo',
    'Osteología',
    'Los huesos: su forma, sus accidentes y cómo se arman el esqueleto axial y el apendicular.',
    ['oseo'],
    null,
    'Articulaciones',
    [['ha', 'oseo', 'Sistema óseo']],
    'gen',
  ],
  [
    'artro',
    'Artrología',
    'Las articulaciones: cómo se unen los huesos, de qué tipo es cada unión y cuánto se mueve.',
    ['oseo'],
    'Articulaciones',
    null,
    [['ha', 'oseo', 'Sistema óseo']],
    'gen',
  ],
  [
    'mio',
    'Miología',
    'Los músculos: de dónde salen, dónde se insertan y qué movimiento producen.',
    ['musc'],
    null,
    null,
    [['ha', 'muscular', 'Sistema muscular']],
    'gen',
  ],
  [
    'angio',
    'Angiología',
    'El corazón y los vasos: arterias, venas y vasos linfáticos.',
    ['cardio'],
    null,
    null,
    [
      ['ha', 'cardio', 'Sistema cardiovascular'],
      ['ha', 'otros', 'Linfático y conectivo'],
    ],
    'gen',
  ],
  [
    'esplac',
    'Esplacnología',
    'Las vísceras: aparatos digestivo, respiratorio, urinario y reproductor, y las glándulas endocrinas.',
    ['dig', 'resp', 'uri', 'rep', 'endo'],
    null,
    null,
    [
      ['ha', 'dig', 'Digestivo'],
      ['ha', 'resp', 'Respiratorio'],
      ['ha', 'uri', 'Urinario'],
      ['ap', 'repro-m', 'Reproductor masculino'],
      ['ap', 'repro-f', 'Reproductor femenino'],
      ['ha', 'endo', 'Endocrino'],
    ],
    'gen',
  ],
  [
    'neuro',
    'Neuroanatomía',
    'El sistema nervioso y los órganos de los sentidos: encéfalo, médula, meninges, pares craneales, el autónomo y los órganos de la vista, la audición, el olfato, el gusto y el tacto con sus vías.',
    ['nerv', 'sent'],
    null,
    null,
    [
      ['sec', 'snc', 'Encéfalo rotulado (283 estructuras)'],
      ['ha', 'nerv', 'Sistema nervioso'],
      ['ap', 'vista', 'Vista'],
      ['ap', 'oido', 'Audición y equilibrio'],
      ['ap', 'olfato', 'Olfato'],
      ['ap', 'gusto', 'Gusto'],
      ['ap', 'tacto', 'Tacto'],
    ],
    'neu',
  ],
];
export function anGet(k) {
  for (var i = 0; i < ANAT.length; i++) if (ANAT[i][0] === k) return ANAT[i];
  return null;
}
/* ¿Esta tarjeta o pregunta cae en esta categoría? Una sola regla para las dos. */
export function anCasa(c, a) {
  if (!a) return true;
  if (a[3].indexOf(c.m) < 0) return false;
  if (a[4] && (c.t || '') !== a[4]) return false;
  if (a[5] && (c.t || '') === a[5]) return false;
  return true;
}
export function anCuenta(k) {
  var a = anGet(k);
  if (!a)
    return {
      c: 0,
      q: 0,
    };
  var c = 0,
    q = 0,
    i;
  for (i = 0; i < BANK.length; i++) if (anCasa(BANK[i], a)) c++;
  for (i = 0; i < QB.length; i++) if (anCasa(QB[i], a)) q++;
  return {
    c: c,
    q: q,
  };
}
/* Los temas que trae cada categoría, tal como están escritos en las tarjetas. */
export function anTemas(k) {
  var a = anGet(k);
  if (!a) return [];
  var r = {};
  BANK.forEach(function (c) {
    if (anCasa(c, a)) r[c.t || 'Sin tema'] = 1;
  });
  QB.forEach(function (c) {
    if (anCasa(c, a)) r[c.t || 'Sin tema'] = 1;
  });
  return Object.keys(r).sort(function (x, y) {
    return x.localeCompare(y, 'es');
  });
}
export function anHay(a) {
  return nz(a[1] + ' ' + a[2] + ' ' + a[3].map(mn).join(' ') + ' ' + anTemas(a[0]).join(' '));
}
export function renderAn() {
  var sw = $('anmodo');
  if (sw)
    sw.querySelectorAll('button').forEach(function (x) {
      x.classList.toggle('on', x.getAttribute('data-m') === estado.AN_MODO);
      x.setAttribute(
        'aria-pressed',
        x.getAttribute('data-m') === estado.AN_MODO ? 'true' : 'false',
      );
    });
  if (estado.AN_MODO === 'comp') return renderComp();
  var w = $('anlist');
  if (!w) return;
  w.textContent = '';
  var n = nz(estado.anQ),
    vis = 0;
  ANAT.forEach(function (a) {
    if (n.length > 1 && anHay(a).indexOf(n) < 0) return;
    vis++;
    var c = anCuenta(a[0]);
    var b = el('button', 'anc');
    b.type = 'button';
    b.setAttribute('data-hc', '136');
    b.setAttribute('data-k', a[0]);
    var h = el('div', 'anch');
    h.appendChild(el('b', 0, a[1]));
    b.appendChild(h);
    b.appendChild(el('p', 'ancd', a[2]));
    var f = el('div', 'ancf');
    /* De qué sistema sale, como una etiqueta más y no enfrentada al título: en
       pantalla ancha «Órganos de los sentidos» y su sistema chocaban. Si la etiqueta
       repetiría el nombre de la categoría, no se pone. */
    var et = a[3].length === 1 ? mn(a[3][0]) : a[3].length + ' sistemas';
    if (nz(et) !== nz(a[1])) f.appendChild(el('span', 'anct anar', et));
    f.appendChild(el('span', 'anct', c.c + (c.c === 1 ? ' tarjeta' : ' tarjetas')));
    f.appendChild(el('span', 'anct', c.q + (c.q === 1 ? ' pregunta' : ' preguntas')));
    f.appendChild(
      el('span', 'anct', a[6].length + (a[6].length === 1 ? ' modelo 3D' : ' modelos 3D')),
    );
    b.appendChild(f);
    /* una barra fina con lo que llevas dominado del área */
    var av = anAvance(a[0]);
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
  if (!vis) w.appendChild(el('p', 'bqe', 'Ninguna área coincide con «' + estado.anQ + '».'));
  msg(
    'annota',
    'Las tarjetas y las preguntas son las mismas de siempre: aquí solo se ' +
      'agrupan por área. Ninguna aparece en dos áreas a la vez.',
  );
}
export function anBuscar(v) {
  estado.anQ = String(v || '');
  renderAn();
}
export function anAbrir(k) {
  var a = anGet(k);
  if (!a) return;
  estado.AN_CUR = k;
  var c = anCuenta(k);
  $('anw').style.display = 'none';
  $('and').style.display = '';
  msg('anest', a[3].map(mn).join(' · '));
  $('ant').textContent = a[1];
  msg('ani', a[2]);
  /* ilustración del área */
  var fig = $('anfig');
  if (fig) {
    fig.textContent = '';
    var im = AN_IMG[k];
    if (im) {
      var g = document.createElement('img');
      g.src = 'img/' + im[0];
      g.alt = im[1];
      g.loading = 'lazy';
      g.width = 1280;
      g.height = 720;
      fig.appendChild(g);
      fig.hidden = false;
    } else fig.hidden = true;
  }
  /* avance real del área */
  var av = anAvance(k),
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
  /* qué entra */
  var u = $('ancont');
  u.textContent = '';
  var tds = anTemas(k);
  if (!tds.length) u.appendChild(el('li', 0, 'Todavía sin temas cargados.'));
  else if (a[3].length === 1)
    tds.forEach(function (t) {
      u.appendChild(el('li', 0, t));
    });
  else
    a[3].forEach(function (sis) {
      /* un renglón por sistema, con sus temas seguidos: veinticuatro viñetas sueltas
       dejaban los botones de practicar fuera de la pantalla */
      var ts = {};
      BANK.forEach(function (c) {
        if (c.m === sis && anCasa(c, a)) ts[c.t || 'Sin tema'] = 1;
      });
      QB.forEach(function (c) {
        if (c.m === sis && anCasa(c, a)) ts[c.t || 'Sin tema'] = 1;
      });
      var lista = Object.keys(ts).sort(function (x, y) {
        return x.localeCompare(y, 'es');
      });
      if (!lista.length) return;
      var li = el('li');
      li.appendChild(el('b', 0, mn(sis)));
      li.appendChild(el('span', 's', ' · ' + lista.join(' · ')));
      u.appendChild(li);
    });
  /* practicar */
  var p = $('anprac');
  p.textContent = '';
  p.appendChild(el('p', 's', 'Se abre con el filtro de esta área ya puesto.'));
  var b1 = el('button', 'pill', 'Estudiar ' + c.c + (c.c === 1 ? ' tarjeta ' : ' tarjetas '));
  b1.type = 'button';
  b1.setAttribute('data-hc', '137');
  b1.setAttribute('data-w', 't');
  b1.appendChild(el('span', 0, '→'));
  p.appendChild(b1);
  var b2 = el('button', 'pill', 'Practicar ' + c.q + (c.q === 1 ? ' pregunta ' : ' preguntas '));
  b2.type = 'button';
  b2.setAttribute('data-hc', '137');
  b2.setAttribute('data-w', 'q');
  b2.appendChild(el('span', 0, '→'));
  p.appendChild(b2);
  /* atlas */
  var t3 = $('anatl');
  t3.textContent = '';
  a[6].forEach(function (x) {
    var b = el('button', 'pill sm', x[2] + ' ');
    b.type = 'button';
    b.setAttribute('data-hc', '139');
    b.setAttribute('data-k', x[0] + ':' + x[1]);
    b.appendChild(el('span', 0, '→'));
    t3.appendChild(b);
  });
  /* Con el modo MVP encendido, el Atlas y la Biblioteca están fuera del recorrido que
     se prueba: en vez de ofrecer botones que caen en un aviso, sus bloques se esconden. */
  var cjAt = $('anatl').parentNode;
  if (cjAt) cjAt.hidden = !mvpVale('atlas');
  var cjLb = $('anlib').parentNode;
  if (cjLb) cjLb.hidden = !mvpVale('biblioteca');
  /* biblioteca */
  var lb = $('anlib');
  lb.textContent = '';
  var mat = a[7],
    nm = '',
    cnt = 0;
  if (typeof LIBCAT !== 'undefined')
    LIBCAT.forEach(function (x) {
      if (x[0] === mat) nm = x[1];
    });
  if (typeof LIB !== 'undefined')
    LIB.forEach(function (r) {
      if (r.cat === mat) cnt++;
    });
  lb.appendChild(
    el(
      'p',
      's',
      'La biblioteca está ordenada por materia, no por área, así que ' +
        'esta área se apoya en «' +
        (nm || mat) +
        '».',
    ),
  );
  var b4 = el('button', 'pill sm', cnt + ' recursos de ' + (nm || mat) + ' ');
  b4.type = 'button';
  b4.setAttribute('data-hc', '137');
  b4.setAttribute('data-w', 'b');
  b4.appendChild(el('span', 0, '→'));
  lb.appendChild(b4);
  window.scrollTo(0, 0);
}
export function anBack() {
  $('and').style.display = 'none';
  $('anw').style.display = '';
  estado.AN_CUR = null;
  window.scrollTo(0, 0);
}
export function anGo(w) {
  var a = anGet(estado.AN_CUR);
  if (!a) return;
  if (w === 't') {
    estado.CF.cat = a[0];
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
    XC.cat = a[0];
    XC.sis = 'all';
    XC.tema = 'all';
    location.hash = '#simulacros';
    setTimeout(function () {
      if (typeof exSetup === 'function') exSetup();
    }, 60);
    return;
  }
  if (w === 'b') {
    estado.lbcat = a[7];
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

/* Abre en el Atlas lo que corresponde: un sistema entero, un apartado o la sección
   propia del encéfalo. La carga de Three.js ya se encola sola si hace falta. */
export function anAtlas(v) {
  var p = String(v || '').split(':'),
    tipo = p[0],
    k = p[1];
  if (tipo === 'sec') {
    location.hash = '#' + k;
    return;
  }
  location.hash = '#atlas';
  setTimeout(function () {
    if (tipo === 'ap') {
      apAbrir(k);
    } else {
      haLoad(k);
    }
  }, 320);
}

/* ===== voces ===== */
