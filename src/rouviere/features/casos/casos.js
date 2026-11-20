import CASOS_DATA from '../../data/casos.json';
import { COMP } from '../anatomia/competencias.js';

/* ===== casos clínicos =====
   Se abre desde la tarjeta «Casos clínicos» del inicio (#casos).
   Cada competencia tiene un camino de fases (una por tema) y cada fase sus casos. Una fase
   se abre al terminar la anterior. Al final de cada fase: puntaje, estrellas y lo que se falló.

   El contenido sale de data/casos.json, que genera scripts/casos-equipo.py desde el banco
   de casos del equipo (14 casos, cinco opciones). Las opciones se muestran en el orden del
   Word porque la explicación las nombra por letra. Mientras una competencia no tenga
   contenido, se muestra la estructura con textos de ejemplo (5 fases de 5 casos). */

const FASES_EJ = 5;
const POR_FASE_EJ = 5;
const CLAVE = 'rv_casos2'; // «2»: el avance hecho con el contenido de ejemplo no cuenta
const LETRAS = 'ABCDE';
/* Posición de cada fase dentro del camino, en % (x, y): zigzag de arriba abajo y la
   última al centro. Con 5 fases da 30/8, 70/28, 30/49, 70/70, 50/91. */
function posiciones(n) {
  if (n <= 1) return [[50, 34]];
  var out = [];
  for (var i = 0; i < n; i++)
    out.push([i === n - 1 ? 50 : i % 2 ? 70 : 30, Math.round(8 + (i * 83) / (n - 1))]);
  return out;
}
var POS = posiciones(FASES_EJ);

const ICON = {
  star: '<svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z"/></svg>',
  check:
    '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  lock: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7.5a4 4 0 0 1 8 0V11"/></svg>',
  trophy:
    '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/></svg>',
  ok: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  x: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  reset:
    '<svg class="ri" width="18" height="18" aria-hidden="true"><use href="#ri-reiniciar"/></svg>',
  imagen:
    '<svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/></svg>',
};

/* ---------- datos ---------- */

function competencias() {
  return COMP.map(function (c) {
    return {
      k: c[0],
      n: c[0] === 'base' ? 'B' : c[0].replace('c', ''),
      t: c[1].replace(/^Competencia \d+ · /, ''),
    };
  });
}

/* Estructura de ejemplo para las competencias que todavía no tienen casos. */
function ejemplo() {
  var fases = [];
  for (var f = 0; f < FASES_EJ; f++) {
    var casos = [];
    for (var c = 0; c < POR_FASE_EJ; c++)
      casos.push({
        caso:
          'Aquí va el caso clínico ' +
          (c + 1) +
          ': quién es el paciente, qué le pasó, qué síntomas tiene y qué se encuentra al examinarlo.',
        pregunta: 'Aquí va la pregunta del caso ' + (c + 1) + '.',
        opciones: [
          'Respuesta correcta',
          'Opción incorrecta',
          'Opción incorrecta',
          'Opción incorrecta',
        ],
        correcta: 0,
        explicacion:
          'Aquí va la explicación: por qué esa es la respuesta correcta y qué estructura anatómica está en juego.',
        imagen: '',
      });
    fases.push({ tema: 'Tema de la fase ' + (f + 1), casos: casos });
  }
  return fases;
}

/* Mezcla fija (siempre igual para el mismo caso), para que la correcta no sea siempre la A. */
function rnd(seed) {
  var x = Math.sin(seed) * 43758.5453;
  return x - Math.floor(x);
}
function orden(fi, ci) {
  var a = [0, 1, 2, 3];
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(rnd(fi * 12.9898 + ci * 78.233 + 1 + i * 1.7) * (i + 1));
    var t = a[i];
    a[i] = a[j];
    a[j] = t;
  }
  return a;
}

var cache = {};
function fasesDe(k) {
  if (cache[k]) return cache[k];
  var real = !!(CASOS_DATA && CASOS_DATA[k] && CASOS_DATA[k].length),
    datos = real ? CASOS_DATA[k] : ejemplo();
  cache[k] = datos.map(function (f, fi) {
    return {
      tema: f.tema,
      casos: f.casos.map(function (c, ci) {
        // Solo el ejemplo se mezcla; los casos reales citan sus opciones por letra.
        var o = real
          ? c.opciones.map(function (_, i) {
              return i;
            })
          : orden(fi, ci);
        return {
          caso: c.caso,
          pregunta: c.pregunta,
          opciones: o.map(function (i) {
            return c.opciones[i];
          }),
          correcta: o.indexOf(c.correcta),
          explicacion: c.explicacion,
          descartes: c.descartes || [],
          imagen: c.imagen || '',
          imagenTxt: c.imagenTxt || '',
        };
      }),
    };
  });
  return cache[k];
}

/* ---------- avance (se sincroniza con la cuenta en core/nube.js) ---------- */

var st = { comp: 'c5', prog: {} };
function cargar() {
  try {
    var g = JSON.parse(localStorage.getItem(CLAVE) || 'null');
    if (g && g.prog) st = g;
  } catch (e) {}
}
function guardar() {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(st));
  } catch (e) {}
}
function prog() {
  return st.prog[st.comp] || (st.prog[st.comp] = []);
}

/* ---------- utilidades ---------- */

function $(id) {
  return document.getElementById(id);
}
function esc(s) {
  return String(s).replace(/[&<>"]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
  });
}
var reduce = function () {
  return !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
};
function estrellas(score, total) {
  var r = total ? score / total : 0,
    n = r >= 1 ? 3 : r >= 0.6 ? 2 : r > 0 ? 1 : 0,
    h = '';
  for (var k = 0; k < 3; k++)
    h +=
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z" fill="' +
      (k < n ? '#D9A441' : 'none') +
      '" stroke="#D9A441" stroke-width="1.6" stroke-linejoin="round"/></svg>';
  return '<span class="cc-stars" role="img" aria-label="' + n + ' de 3 estrellas">' + h + '</span>';
}
function etiqueta(i, n) {
  if (n === 1) return 'Fase única';
  return i === 0 ? 'Inicio' : i === n - 1 ? 'Final' : 'Fase ' + (i + 1);
}
function mostrar(id) {
  ['ccCamino', 'ccCaso', 'ccRes'].forEach(function (v) {
    $(v).hidden = v !== id;
  });
  var el = $(id);
  el.classList.remove('cc-enter');
  void el.offsetWidth;
  el.classList.add('cc-enter');
  window.scrollTo(0, 0);
}

/* ---------- camino ---------- */

var guiaEn = null;
/* Rou va al lado libre de la fase; en la final, encima a la izquierda. */
function lugarGuia(i) {
  var x = POS[i][0],
    y = POS[i][1];
  if (POS.length === 1) return [x + 30, y + 4, 'cc-der'];
  if (i === POS.length - 1) return [20, y - 2, 'cc-arriba'];
  return x > 50 ? [x - 26, y + 4, 'cc-izq'] : [x + 26, y + 4, 'cc-der'];
}
function compActual() {
  var cs = competencias();
  return (
    cs.filter(function (c) {
      return c.k === st.comp;
    })[0] || cs[0]
  );
}

function renderCamino() {
  var c = compActual(),
    fases = fasesDe(c.k),
    p = prog();
  st.comp = c.k;
  var FASES = fases.length;
  POS = posiciones(FASES);
  var hechas = p.slice(0, FASES).filter(Boolean).length;
  var nCasos = fases.reduce(function (s, f) {
    return s + f.casos.length;
  }, 0);
  $('ccChip').textContent = 'Competencia ' + c.n + ' · ' + c.t;
  var intro =
    FASES === 1
      ? 'Una fase de ' + nCasos + ' casos para razonar con la anatomía.'
      : FASES +
        ' fases, una por tema, con ' +
        nCasos +
        ' casos en total. Termina una para abrir la siguiente.';
  var head =
    '<h1 id="ccT">Casos <em>clínicos</em></h1><p>' +
    intro +
    '</p>' +
    '<div class="cc-prog"><div class="cc-track"><i style="width:' +
    (hechas / FASES) * 100 +
    '%"></i></div><b>' +
    hechas +
    ' de ' +
    FASES +
    (FASES === 1 ? ' fase' : ' fases') +
    '</b></div>';
  $('ccHead').innerHTML = head;
  var tot = p.reduce(function (s, x) {
    return s + (x ? x.score : 0);
  }, 0);
  $('ccSide').innerHTML =
    '<div class="cc-head">' +
    head.replace(' id="ccT"', '') +
    '</div>' +
    '<div class="cc-card"><p class="cc-kick">Competencia ' +
    c.n +
    '</p><p style="margin:0;font-weight:800;font-size:17px">' +
    esc(c.t) +
    '</p><p style="margin:6px 0 0;color:var(--cc-muted)">Aciertos acumulados: <b style="color:var(--gold)">' +
    tot +
    ' de ' +
    fases.reduce(function (s, f, i) {
      return s + (p[i] ? f.casos.length : 0);
    }, 0) +
    '</b></p></div>' +
    '<button class="cc-reset" type="button" data-cc-reset>' +
    ICON.reset +
    'Reiniciar</button>';

  var w = $('ccPath');
  w.innerHTML = '';
  // El camino de ejemplo (5 fases) usa la altura de la hoja de estilos; uno más corto, menos.
  w.style.height = FASES < 5 ? Math.max(260, FASES * 124 + 40) + 'px' : '';
  var d = '';
  POS.forEach(function (q, i) {
    if (!i) {
      d = 'M' + q[0] + ' ' + q[1];
      return;
    }
    var pr = POS[i - 1],
      my = (pr[1] + q[1]) / 2;
    d += ' C' + pr[0] + ' ' + my + ' ' + q[0] + ' ' + my + ' ' + q[0] + ' ' + q[1];
  });
  w.insertAdjacentHTML(
    'beforeend',
    '<svg class="cc-road" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="' +
      d +
      '" fill="none" stroke="rgba(101,195,181,.18)" stroke-linecap="round" vector-effect="non-scaling-stroke" style="stroke-width:14px"/><path d="' +
      d +
      '" fill="none" stroke="rgba(217,164,65,.55)" stroke-width="4" stroke-dasharray="2 10" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg>',
  );
  for (var i = 0; i < FASES; i++) {
    var f = fases[i],
      r = p[i],
      abierta = i === 0 || p[i - 1],
      cls = r ? 'cc-done' : abierta ? 'cc-open' : 'cc-locked';
    var icon = r
      ? ICON.check
      : !abierta
        ? ICON.lock
        : i === 0
          ? ICON.star
          : i === FASES - 1
            ? ICON.trophy
            : String(i + 1);
    var node = document.createElement('div');
    node.className = 'cc-node ' + cls;
    node.style.left = POS[i][0] + '%';
    node.style.top = POS[i][1] + '%';
    node.innerHTML =
      (cls === 'cc-open' ? '<span class="cc-start" aria-hidden="true">Empezar</span>' : '') +
      '<button class="cc-nb" type="button" data-fase="' +
      i +
      '" ' +
      (cls === 'cc-locked' ? 'aria-disabled="true"' : '') +
      ' aria-label="' +
      etiqueta(i, FASES) +
      ': ' +
      esc(f.tema) +
      (r
        ? ', ' + r.score + ' de ' + f.casos.length + ' aciertos'
        : cls === 'cc-locked'
          ? ', bloqueada'
          : '') +
      '">' +
      icon +
      '</button>' +
      '<span class="cc-nl"><b>' +
      etiqueta(i, FASES) +
      '</b>' +
      esc(f.tema) +
      (r ? estrellas(r.score, f.casos.length) : '') +
      '</span>';
    w.appendChild(node);
  }

  var actual = Math.min(hechas, FASES - 1),
    todo = hechas >= FASES;
  var msg = todo
    ? '¡Terminaste el camino!'
    : hechas === 0
      ? '¡Empecemos! Toca la estrella.'
      : '¡Vamos con la fase ' + (hechas + 1) + '!';
  var lugar = lugarGuia(actual);
  var g = document.createElement('div');
  g.className = 'cc-guia ' + lugar[2];
  g.setAttribute('aria-hidden', 'true');
  g.innerHTML = '<img src="img/rou.webp" alt=""><span class="cc-globo">' + msg + '</span>';
  var desde = guiaEn === null || reduce() ? actual : guiaEn,
    p0 = lugarGuia(desde);
  g.style.left = p0[0] + '%';
  g.style.top = p0[1] + '%';
  w.appendChild(g);
  if (desde !== actual)
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        g.classList.add('cc-salta');
        g.style.left = lugar[0] + '%';
        g.style.top = lugar[1] + '%';
      });
    });
  guiaEn = actual;
  $('ccLive').textContent = msg;
}

var resetArmado = null;
function reiniciar(b) {
  if (resetArmado !== b) {
    resetArmado = b;
    b.classList.add('cc-warn');
    b.innerHTML = ICON.reset + '¿Seguro? Toca otra vez para borrar';
    setTimeout(function () {
      if (resetArmado === b) {
        resetArmado = null;
        renderCamino();
      }
    }, 3500);
    return;
  }
  resetArmado = null;
  st.prog[st.comp] = [];
  guardar();
  renderCamino();
}

/* ---------- fase ---------- */

var F = { fase: 0, i: 0, res: [] };
var avance = null;
function empezar(fi) {
  F = { fase: fi, i: 0, res: [] };
  mostrar('ccCaso');
  pintarCaso();
}
function pintarCaso() {
  var fases = fasesDe(st.comp),
    fase = fases[F.fase],
    c = fase.casos[F.i],
    total = fase.casos.length;
  var segs = '';
  for (var k = 0; k < total; k++) {
    var r = F.res[k];
    segs +=
      '<i class="' +
      (r === undefined ? (k === F.i ? 'cc-cur' : '') : r.ok ? 'cc-ok' : 'cc-bad') +
      '"></i>';
  }
  $('ccSegs').innerHTML = segs;
  $('ccSegs').setAttribute('aria-valuenow', String(F.i + 1));
  $('ccSegs').setAttribute('aria-valuemax', String(total));
  $('ccCount').textContent = F.i + 1 + '/' + total;
  $('ccFig').innerHTML = c.imagen
    ? '<img src="' + esc(c.imagen) + '" alt="Imagen del caso ' + (F.i + 1) + '">'
    : c.imagenTxt
      ? '<div class="cc-figph cc-figtxt">' +
        ICON.imagen +
        '<b>Imagen sugerida</b><span>' +
        esc(c.imagenTxt) +
        '</span></div>'
      : '<div class="cc-figph">' +
        ICON.imagen +
        '<b>Imagen del caso</b><span>La entrega el Equipo 2</span></div>';
  $('ccPh').textContent =
    etiqueta(F.fase, fases.length) + ' · ' + fase.tema + ' · Caso ' + (F.i + 1);
  $('ccCaso1').textContent = c.caso;
  $('ccAsk').textContent = c.pregunta;
  var fb = $('ccFb');
  fb.className = 'cc-fb';
  fb.innerHTML = '';
  $('ccOpts').innerHTML = c.opciones
    .map(function (o, i) {
      return (
        '<li><button class="cc-opt" type="button" data-op="' +
        i +
        '"><span class="cc-lt">' +
        LETRAS[i] +
        '</span><span>' +
        esc(o) +
        '</span></button></li>'
      );
    })
    .join('');
}
function responder(i) {
  var c = fasesDe(st.comp)[F.fase].casos[F.i],
    ok = i === c.correcta;
  $('ccOpts')
    .querySelectorAll('.cc-opt')
    .forEach(function (b) {
      b.disabled = true;
      var j = +b.getAttribute('data-op');
      if (j === c.correcta) b.classList.add('cc-ok');
      else if (j === i) b.classList.add('cc-bad');
      else b.classList.add('cc-dim');
    });
  F.res[F.i] = { ok: ok, dada: i };
  var fb = $('ccFb');
  fb.className = 'cc-fb ' + (ok ? 'cc-ok' : 'cc-bad');
  fb.innerHTML = ok
    ? ICON.ok + ' ¡Correcto!'
    : ICON.x + ' La correcta era la ' + LETRAS[c.correcta] + '.';
  $('ccSegs').children[F.i].className = ok ? 'cc-ok' : 'cc-bad';
  clearTimeout(avance);
  avance = setTimeout(
    function () {
      F.i++;
      if (F.i < fasesDe(st.comp)[F.fase].casos.length) pintarCaso();
      else terminar();
    },
    ok ? 1300 : 2200,
  );
}
function terminar() {
  var fases = fasesDe(st.comp),
    POR_FASE = fases[F.fase].casos.length,
    score = F.res.filter(function (r) {
      return r.ok;
    }).length,
    p = prog();
  if (!p[F.fase] || score >= p[F.fase].score) p[F.fase] = { score: score };
  guardar();
  var msgs = [
    'Repasemos juntos',
    'Repasemos juntos',
    'Vas por buen camino',
    '¡Bien hecho!',
    '¡Muy bien!',
    '¡Perfecto!',
  ];
  $('ccResT').textContent = msgs[Math.floor((score / POR_FASE) * 5)];
  $('ccNum').innerHTML = score + '<small>/' + POR_FASE + '</small>';
  $('ccStars').innerHTML = estrellas(score, POR_FASE);
  $('ccSub').textContent =
    score === POR_FASE
      ? 'Acertaste todos los casos de esta fase.'
      : 'Acertaste ' + score + ' de ' + POR_FASE + ' casos. Abajo tienes lo que falló y por qué.';
  var arc = $('ccArc');
  arc.style.strokeDashoffset = '326.7';
  mostrar('ccRes');
  setTimeout(
    function () {
      arc.style.strokeDashoffset = String(326.7 * (1 - score / POR_FASE));
    },
    reduce() ? 0 : 120,
  );
  var fase = fases[F.fase],
    fall = '',
    bien = '';
  fase.casos.forEach(function (c, k) {
    var r = F.res[k];
    var item =
      '<li class="cc-ri ' +
      (r.ok ? 'cc-ok' : 'cc-bad') +
      '"><div class="cc-rt"><span class="cc-ic">' +
      (r.ok ? ICON.ok : ICON.x) +
      '</span>Caso ' +
      (k + 1) +
      ' · ' +
      esc(c.pregunta) +
      '</div><dl><dt>Tu respuesta</dt><dd class="cc-y">' +
      esc(c.opciones[r.dada]) +
      '</dd><dt>Correcta</dt><dd class="cc-c">' +
      esc(c.opciones[c.correcta]) +
      '</dd></dl><p class="cc-ex">' +
      esc(c.explicacion) +
      '</p>' +
      (c.descartes.length
        ? '<p class="cc-exn">Por qué no son las otras</p><ul class="cc-desc">' +
          c.descartes
            .map(function (d) {
              return '<li>' + esc(d) + '</li>';
            })
            .join('') +
          '</ul>'
        : '') +
      '</li>';
    if (r.ok) bien += item;
    else fall += item;
  });
  $('ccRev').innerHTML =
    (fall ? '<h3>Lo que fallaste</h3><ul>' + fall + '</ul>' : '') +
    (bien ? '<h3>Lo que acertaste</h3><ul>' + bien + '</ul>' : '');
  $('ccSeguir').textContent =
    F.fase < fases.length - 1 ? 'Continuar el camino' : 'Volver al camino';
  $('ccResT').focus({ preventScroll: true });
}

/* ---------- selector de competencia ---------- */

function abrirSheet() {
  $('ccList').innerHTML = competencias()
    .map(function (c) {
      var real = !!(CASOS_DATA && CASOS_DATA[c.k] && CASOS_DATA[c.k].length),
        fs = fasesDe(c.k),
        nc = fs.reduce(function (s, f) {
          return s + f.casos.length;
        }, 0);
      return (
        '<li><button class="cc-cb" type="button" data-comp="' +
        c.k +
        '" aria-current="' +
        (c.k === st.comp) +
        '"><span class="cc-cn">' +
        c.n +
        '</span><span><b>' +
        esc(c.t) +
        '</b><small>' +
        fs.length +
        (fs.length === 1 ? ' fase · ' : ' fases · ') +
        nc +
        ' casos' +
        (real ? '' : ' · contenido de ejemplo') +
        '</small></span></button></li>'
      );
    })
    .join('');
  $('ccSheet').hidden = false;
  var cur = $('ccList').querySelector('[aria-current="true"]');
  if (cur) cur.focus();
}
function cerrarSheet() {
  $('ccSheet').hidden = true;
  $('ccChipBtn').focus();
}

/* ---------- entrada ---------- */

var listo = false;
function enlazar() {
  if (listo) return;
  listo = true;
  var sec = $('casos');
  sec.addEventListener('click', function (e) {
    var t = e.target.closest('button');
    if (!t || !sec.contains(t)) return;
    if (t.hasAttribute('data-fase')) {
      if (!t.hasAttribute('aria-disabled')) empezar(+t.getAttribute('data-fase'));
    } else if (t.hasAttribute('data-op')) {
      if (!t.disabled) responder(+t.getAttribute('data-op'));
    } else if (t.hasAttribute('data-cc-reset')) reiniciar(t);
    else if (t.hasAttribute('data-comp')) {
      st.comp = t.getAttribute('data-comp');
      guardar();
      guiaEn = null;
      $('ccSheet').hidden = true;
      renderCamino();
      $('ccChipBtn').focus();
    } else if (t.id === 'ccChipBtn') abrirSheet();
    else if (t.id === 'ccSeguir' || t.id === 'ccSalir') {
      clearTimeout(avance);
      mostrar('ccCamino');
      renderCamino();
    } else if (t.id === 'ccRepetir') empezar(F.fase);
  });
  $('ccSheet').addEventListener('click', function (e) {
    if (e.target === $('ccSheet')) cerrarSheet();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !$('ccSheet').hidden) cerrarSheet();
  });
}

/* La llama el router al entrar a #casos: siempre empieza en el camino. */
export function renderCasos() {
  if (!$('casos')) return;
  cargar();
  enlazar();
  clearTimeout(avance);
  $('ccSheet').hidden = true;
  mostrar('ccCamino');
  renderCamino();
}
