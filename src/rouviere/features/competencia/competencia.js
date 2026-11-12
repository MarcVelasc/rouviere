import { estado } from '../../estado.js';
import { BANK, QB, log, mn } from '../../core/almacenamiento.js';
import { $ } from '../../core/dom.js';
import { COMP, compCasa, compGet } from '../anatomia/competencias.js';
import { ANAT } from '../anatomia/categorias.js';
import { HA_COL, haTint } from '../atlas/human-atlas.js';
import { con3D } from '../documentos/documentos.js';
import { estCarga, estDeFma } from '../estructuras/fichas-est.js';

/* ===== competencia =====
   Se abre al tocar una competencia (inicio o Aprender). Junta todo su contenido:
   modelo 3D, tarjetas, estudio con IA y simulacros. Las sub-pantallas viven dentro de
   #competencia y no cambian el hash; el visor 3D sí deja una entrada en el historial
   para que el botón «atrás» del celular lo cierre.

   Modelos: public/app/atlas/comp-<k>.json (los genera scripts/atlas-competencias.py).
   Descripciones: las fichas de estructura (est.js), buscadas por código FMA.
   Guardado en el dispositivo: rv_comp (la última abierta) y rv_sim_best (nota máxima). */

const POR_SESION = 10;
const NUMS = [20, 50, 100];
const DIF = { 1: 'Básica', 2: 'Intermedia', 3: 'Avanzada' };
const MODELO = {
  c1: 'Cabeza y cuello',
  c2: 'Esqueleto completo',
  c3: 'Tórax',
  c4: 'Abdomen y pelvis',
  c5: 'Sistema nervioso',
  base: 'Piel, tejido conectivo y linfáticos',
};
const TIPO = {
  skeletal: 'Hueso',
  muscular: 'Músculo',
  sensory: 'Órgano de los sentidos',
  respiratory: 'Aparato respiratorio',
  cardiac: 'Corazón',
  arterial: 'Arteria',
  venous: 'Vena',
  digestive: 'Aparato digestivo',
  urinary: 'Aparato urinario',
  reproductive: 'Aparato reproductor',
  nervous: 'Sistema nervioso',
  connective: 'Tejido conectivo',
  integumentary: 'Piel',
  lymphatic: 'Linfático',
  endocrine: 'Glándula endocrina',
};
const VISTAS = ['cpFicha', 'cpTar', 'cpCard', 'cpCardFin', 'cpSim', 'cpQ', 'cpRes'];

/* ---------- utilidades ---------- */

function leer(k, d) {
  try {
    var v = localStorage.getItem(k);
    return v ? JSON.parse(v) : d;
  } catch (e) {
    return d;
  }
}
function guardar(k, v) {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch (e) {}
}
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
  });
}
function barajar(a) {
  a = a.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1)),
      t = a[i];
    a[i] = a[j];
    a[j] = t;
  }
  return a;
}
function nombreCorto(a) {
  return a[1].replace(/^Competencia \d+ · /, '');
}
function etiquetaNum(a) {
  return a[1].split(' · ')[0];
}
function toast(t) {
  var e = $('cpToast');
  e.textContent = t;
  e.classList.add('on');
  clearTimeout(toast.t);
  toast.t = setTimeout(function () {
    e.classList.remove('on');
  }, 2600);
}
function llenarComp(sel) {
  sel.innerHTML = COMP.map(function (a) {
    return (
      '<option value="' +
      a[0] +
      '"' +
      (a[0] === cur ? ' selected' : '') +
      '>' +
      esc(a[1].replace(' · ', ': ')) +
      '</option>'
    );
  }).join('');
}
function opciones(sel, todos, lista, val) {
  sel.innerHTML =
    '<option value="">' +
    todos +
    '</option>' +
    lista
      .map(function (o) {
        return '<option value="' + esc(o[0]) + '">' + esc(o[1]) + '</option>';
      })
      .join('');
  sel.value = val;
}
function deComp(lista) {
  var a = compGet(cur);
  return lista.filter(function (x) {
    return compCasa(x, a);
  });
}

var cur = leer('rv_comp', 'c1');
if (!compGet(cur)) cur = 'c1';
var best = leer('rv_sim_best', {});
var desdeApp = false;

function cambiar(k) {
  if (!compGet(k)) return;
  cur = k;
  guardar('rv_comp', k);
}
function mostrar(id) {
  VISTAS.forEach(function (v) {
    $(v).hidden = v !== id;
  });
  var e = $(id);
  e.classList.remove('cp-enter');
  void e.offsetWidth;
  e.classList.add('cp-enter');
  window.scrollTo(0, 0);
}

/* ---------- entrada ---------- */

/* Abre la ficha de una competencia desde cualquier parte de la app. */
export function compIr(k) {
  cambiar(k);
  desdeApp = true;
  if (location.hash === '#competencia') renderCompetencia();
  else location.hash = '#competencia';
}

export function renderCompetencia() {
  enlazar();
  cerrar3d(true);
  renderFicha();
  mostrar('cpFicha');
}

/* ---------- 1 · ficha ---------- */

function renderFicha() {
  var a = compGet(cur);
  llenarComp($('cpSel'));
  $('cpImg').src = 'img/' + a[5];
  $('cpImg').alt = 'Ilustración de ' + nombreCorto(a);
  $('cpNombre').textContent = nombreCorto(a);
  var sis = {};
  a[3].forEach(function (p) {
    sis[p[0]] = 1;
  });
  $('cpMeta').textContent =
    etiquetaNum(a) + ' · ' + a[3].length + ' temas · ' + Object.keys(sis).length + ' sistemas';
  $('cpDesc').textContent = a[2];
  $('cpM3d').textContent = MODELO[cur] + ' en 3D. Toca cada parte para ver qué es.';
  $('cpMTar').textContent = deComp(BANK).length + ' tarjetas para repasar, de 10 en 10.';
  $('cpMSim').textContent = deComp(QB).length + ' preguntas de opción múltiple.';
  $('cpMBest').textContent = best[cur] != null ? 'Nota máxima: ' + best[cur] : 'Aún sin nota';
}

/* ---------- 2 · visor 3D ---------- */

var T = null,
  CACHE = {};

function init3d() {
  if (T) return T;
  var cv = $('cp3cv'),
    r = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true });
  r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  var sc = new THREE.Scene(),
    cam = new THREE.PerspectiveCamera(35, 1, 0.01, 50);
  sc.add(new THREE.HemisphereLight(0xffffff, 0x334455, 0.85));
  var dl = new THREE.DirectionalLight(0xffffff, 0.75);
  dl.position.set(1, 2, 3);
  cam.add(dl);
  sc.add(cam);
  var oc = new THREE.OrbitControls(cam, cv);
  oc.enableDamping = true;
  oc.dampingFactor = 0.08;
  oc.rotateSpeed = 0.8;
  oc.screenSpacePanning = true;
  T = {
    r: r,
    sc: sc,
    cam: cam,
    oc: oc,
    meshes: [],
    root: null,
    sel: null,
    modo: 'n',
    key: null,
    ray: new THREE.Raycaster(),
    run: false,
  };
  window.addEventListener('resize', function () {
    if (T.run) tamano();
  });
  oc.addEventListener('start', function () {
    $('cp3hint').style.opacity = 0;
  });
  var down = null;
  cv.addEventListener('pointerdown', function (e) {
    down = { x: e.clientX, y: e.clientY, t: Date.now() };
  });
  cv.addEventListener('pointerup', function (e) {
    if (!down) return;
    var d = Math.hypot(e.clientX - down.x, e.clientY - down.y);
    if (d < 6 && Date.now() - down.t < 450) tocar(e);
    down = null;
  });
  return T;
}
function tamano() {
  var w = window.innerWidth,
    h = window.innerHeight;
  T.r.setSize(w, h, false);
  T.cam.aspect = w / h;
  T.cam.updateProjectionMatrix();
}
function bucle() {
  /* Se para solo si sales del visor o de la sección (por ejemplo, con el menú). */
  if (!T.run || !$('competencia').classList.contains('on')) {
    T.run = false;
    return;
  }
  T.oc.update();
  T.r.render(T.sc, T.cam);
  requestAnimationFrame(bucle);
}

function abrir3d() {
  var k = cur,
    a = compGet(k);
  $('cp3d').hidden = false;
  document.body.style.overflow = 'hidden';
  $('cp3T').textContent = MODELO[k];
  $('cp3S').textContent = etiquetaNum(a);
  $('cp3ficha').hidden = true;
  menu(false);
  $('cp3hint').style.opacity = 1;
  history.pushState({ cp3d: 1 }, '', location.hash);
  $('cp3x').focus();
  var tres = con3D(function () {
    if (!$('cp3d').hidden) cargar3d(k);
  }, null);
  if (!tres) {
    $('cp3load').hidden = false;
    $('cp3loadT').textContent = 'Preparando el visor 3D…';
  }
}
function cargar3d(k) {
  init3d();
  tamano();
  if (!T.run) {
    T.run = true;
    bucle();
  }
  if (T.key === k && T.root) {
    $('cp3load').hidden = true;
    return;
  }
  limpiar();
  T.key = k;
  $('cp3load').hidden = false;
  $('cp3loadT').textContent = 'Cargando ' + MODELO[k].toLowerCase() + '…';
  var p = CACHE[k]
    ? Promise.resolve(CACHE[k])
    : fetch('atlas/comp-' + k + '.json')
        .then(function (r) {
          if (!r.ok) throw 0;
          return r.json();
        })
        .then(function (ix) {
          return fetch('atlas/' + ix.bin)
            .then(function (r) {
              if (!r.ok) throw 0;
              return r.arrayBuffer();
            })
            .then(function (buf) {
              CACHE[k] = [ix, buf];
              return CACHE[k];
            });
        });
  p.then(function (v) {
    if (T.key !== k) return;
    construir(v[0], v[1]);
    $('cp3load').hidden = true;
    $('cp3S').textContent = etiquetaNum(compGet(k)) + ' · ' + v[0].parts.length + ' estructuras';
  }).catch(function () {
    T.key = null;
    $('cp3loadT').textContent =
      'No se pudo cargar el modelo. Revisa tu conexión e inténtalo otra vez.';
  });
  estCarga(); /* las descripciones se adelantan mientras baja el modelo */
}
function limpiar() {
  if (!T) return;
  if (T.root) {
    T.sc.remove(T.root);
    T.meshes.forEach(function (m) {
      m.geometry.dispose();
      m.material.dispose();
    });
  }
  T.root = null;
  T.meshes = [];
  T.sel = null;
}
function construir(ix, buf) {
  var g = new THREE.Group();
  g.scale.setScalar(ix.scale);
  g.position.set(ix.origin[0], ix.origin[1], ix.origin[2]);
  ix.parts.forEach(function (p, i) {
    var ge = new THREE.BufferGeometry();
    ge.setAttribute('position', new THREE.BufferAttribute(new Uint16Array(buf, p.p, p.v * 3), 3));
    ge.setAttribute(
      'normal',
      new THREE.BufferAttribute(new Int16Array(buf, p.m, p.v * 3), 3, true),
    );
    ge.setIndex(
      new THREE.BufferAttribute(
        p.w ? new Uint32Array(buf, p.x, p.k) : new Uint16Array(buf, p.x, p.k),
        1,
      ),
    );
    var me = new THREE.Mesh(
      ge,
      new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 1 }),
    );
    me._p = p;
    me._i = i;
    g.add(me);
    T.meshes.push(me);
  });
  T.sc.add(g);
  T.root = g;
  g.updateMatrixWorld(true);
  pintar();
  encuadre();
}
function colorDe(m) {
  if (T.modo === 'c') {
    var c = new THREE.Color();
    c.setHSL(((m._i * 137.508) % 360) / 360, 0.85, 0.55);
    return c;
  }
  return new THREE.Color(haTint(HA_COL[m._p.s] || 0xc9b9a0, (m._i % 7) / 6));
}
function pintar() {
  var s = T.sel;
  T.meshes.forEach(function (m) {
    var ma = m.material;
    ma.color.copy(colorDe(m));
    ma.emissive.setHex(0);
    ma.opacity = s && m !== s ? 0.18 : 1;
    ma.depthWrite = !(s && m !== s);
    if (s && m === s) {
      if (T.modo === 'n') ma.color.setHex(0xffc94a);
      ma.emissive.setHex(0x3a2600);
    }
  });
}
function encuadre() {
  var b = new THREE.Box3().expandByObject(T.root),
    c = b.getCenter(new THREE.Vector3()),
    s = b.getSize(new THREE.Vector3()),
    r = Math.max(s.x, s.y, s.z) * 0.5;
  var dist =
    (r / Math.sin(THREE.MathUtils.degToRad(T.cam.fov / 2))) *
    (T.cam.aspect < 1 ? 1.25 / Math.max(T.cam.aspect, 0.5) : 1.05);
  T.oc.target.copy(c);
  T.cam.position.set(c.x + dist * 0.25, c.y + dist * 0.08, c.z + dist * 0.96);
  T.cam.near = dist / 100;
  T.cam.far = dist * 10;
  T.cam.updateProjectionMatrix();
  T.oc.update();
}
function tocar(e) {
  if (!T.meshes.length) return;
  menu(false);
  var rc = T.r.domElement.getBoundingClientRect();
  T.ray.setFromCamera(
    new THREE.Vector2(
      ((e.clientX - rc.left) / rc.width) * 2 - 1,
      -((e.clientY - rc.top) / rc.height) * 2 + 1,
    ),
    T.cam,
  );
  var h = T.ray.intersectObjects(T.meshes, false);
  seleccionar(h.length ? h[0].object : null);
}
function seleccionar(m) {
  T.sel = m;
  pintar();
  var f = $('cp3ficha');
  if (!m) {
    f.hidden = true;
    return;
  }
  $('cp3hint').style.opacity = 0;
  if (estado.EST_LD !== 2) {
    pintaFicha(m, null, true);
    estCarga(function () {
      if (T.sel === m) pintaFicha(m, estDeFma(m._p.c), false);
    });
  } else pintaFicha(m, estDeFma(m._p.c), false);
}
function pintaFicha(m, e, cargando) {
  var p = m._p,
    f = $('cp3ficha'),
    d = (e && e.d) || {},
    h =
      '<div class="cp-grab"></div><div class="cp-fh"><div><span class="cp-kind"><i class="cp-k-' +
      esc(p.s) +
      '"></i>' +
      (TIPO[p.s] || 'Estructura') +
      '</span><h3>' +
      esc(p.n) +
      '</h3></div><button class="cp-ib" type="button" id="cp3fx" aria-label="Cerrar descripción"><svg class="cp-i"><use href="#cp-i-x"/></svg></button></div>';
  if (cargando) h += '<p class="cp-none">Cargando la descripción…</p>';
  else if (e && (e.res || d.def)) {
    if (e.n && e.n !== p.n) h += '<p class="cp-of">Ficha: ' + esc(e.n) + '</p>';
    if (e.res) h += '<p class="cp-res">' + esc(e.res) + '</p>';
    h +=
      '<dl>' +
      (d.def ? '<div><dt>Qué es</dt><dd>' + esc(d.def) + '</dd></div>' : '') +
      (d.ub ? '<div><dt>Dónde está</dt><dd>' + esc(d.ub) + '</dd></div>' : '') +
      (d.rel ? '<div><dt>Relaciones</dt><dd>' + esc(d.rel) + '</dd></div>' : '') +
      '</dl><p class="cp-draft">Ficha en borrador, pendiente de revisión docente.</p>';
  } else
    h +=
      '<p class="cp-none">Esta estructura todavía no tiene descripción. La añade el equipo de contenido y aparecerá aquí.</p>';
  f.innerHTML = h;
  f.hidden = false;
  f.scrollTop = 0;
  $('cp3fx').addEventListener('click', function () {
    seleccionar(null);
  });
}
function menu(on) {
  $('cp3menu').hidden = !on;
  $('cp3plus').setAttribute('aria-expanded', on ? 'true' : 'false');
}
/* sinHistoria: se cierra porque ya se salió por otro lado (atrás o cambio de sección). */
function cerrar3d(sinHistoria) {
  if ($('cp3d').hidden) return;
  $('cp3d').hidden = true;
  document.body.style.overflow = '';
  menu(false);
  if (T) {
    T.run = false;
    seleccionar(null);
  }
  if (!sinHistoria && history.state && history.state.cp3d) history.back();
  $('cpIr3d').focus();
}

/* ---------- 3 · tarjetas ---------- */

var F = { a: '', s: '', t: '', d: '' };
function area(k) {
  for (var i = 0; i < ANAT.length; i++) if (ANAT[i][0] === k) return ANAT[i];
  return null;
}
/* ANAT: [k, nombre, desc, sistemas, único tema, tema excluido, …] */
function enArea(x, ar) {
  if (!ar) return true;
  if (ar[3].indexOf(x.m) < 0) return false;
  if (ar[4] && x.t !== ar[4]) return false;
  if (ar[5] && x.t === ar[5]) return false;
  return true;
}
function filtrar(hasta) {
  var ar = area(F.a);
  return deComp(BANK).filter(function (x) {
    if (hasta > 0 && !enArea(x, ar)) return false;
    if (hasta > 1 && F.s && x.m !== F.s) return false;
    if (hasta > 2 && F.t && x.t !== F.t) return false;
    if (hasta > 3 && F.d && String(x.d) !== F.d) return false;
    return true;
  });
}
function renderTar() {
  llenarComp($('cpTC'));
  var b0 = filtrar(0);
  var ars = ANAT.filter(function (ar) {
    return b0.some(function (x) {
      return enArea(x, ar);
    });
  }).map(function (ar) {
    return [ar[0], ar[1]];
  });
  if (
    !ars.some(function (o) {
      return o[0] === F.a;
    })
  )
    F.a = '';
  opciones($('cpTA'), 'Todas las áreas', ars, F.a);
  var ss = {};
  filtrar(1).forEach(function (x) {
    ss[x.m] = 1;
  });
  if (!ss[F.s]) F.s = '';
  opciones(
    $('cpTS'),
    'Todos los sistemas',
    Object.keys(ss).map(function (m) {
      return [m, mn(m)];
    }),
    F.s,
  );
  var tt = {};
  filtrar(2).forEach(function (x) {
    tt[x.t] = 1;
  });
  if (!tt[F.t]) F.t = '';
  opciones(
    $('cpTT'),
    'Todos los temas',
    Object.keys(tt).map(function (t) {
      return [t, t];
    }),
    F.t,
  );
  var dd = {};
  filtrar(3).forEach(function (x) {
    dd[x.d] = 1;
  });
  if (!dd[F.d]) F.d = '';
  opciones(
    $('cpTD'),
    'Todas las dificultades',
    [1, 2, 3]
      .filter(function (d) {
        return dd[d];
      })
      .map(function (d) {
        return [String(d), DIF[d]];
      }),
    F.d,
  );
  var n = filtrar(4).length,
    av = $('cpTAvail');
  av.className = 'cp-avail' + (n < POR_SESION ? ' cp-warn' : '');
  av.innerHTML =
    n >= POR_SESION
      ? '<b>' + n + ' tarjetas</b> con estos filtros. La sesión toma 10 al azar.'
      : n
        ? 'Solo hay <b>' +
          n +
          ' tarjeta' +
          (n > 1 ? 's' : '') +
          '</b> con estos filtros: la sesión será de ' +
          n +
          '.'
        : 'No hay tarjetas con estos filtros. Prueba con otros.';
  $('cpTGo').disabled = !n;
}

var S = { cards: [], i: 0 };
function empezarTar() {
  S.cards = barajar(filtrar(4)).slice(0, POR_SESION);
  S.i = 0;
  pintaCard();
  mostrar('cpCard');
}
function pintaCard() {
  var c = S.cards[S.i],
    n = S.cards.length;
  $('cpCardB').classList.remove('cp-flip');
  $('cpCCount').innerHTML = S.i + 1 + '<small>/' + n + '</small>';
  $('cpCBar').style.width = ((S.i + 1) / n) * 100 + '%';
  $('cpFImg').innerHTML = c.img
    ? '<img alt="" src="' + esc(c.img) + '">'
    : '<span class="cp-fph"><svg class="cp-i"><use href="#cp-i-img"/></svg>Imagen de la tarjeta</span>';
  $('cpFTag').innerHTML =
    esc(c.t) +
    '<span class="cp-dif" title="Dificultad ' +
    DIF[c.d].toLowerCase() +
    '">' +
    [1, 2, 3]
      .map(function (d) {
        return '<i' + (d <= c.d ? ' class="on"' : '') + '></i>';
      })
      .join('') +
    '</span>';
  $('cpFQ').textContent = c.q;
  $('cpFA').textContent = c.a;
  $('cpFE').textContent = c.e || '';
  $('cpCPrev').disabled = S.i === 0;
  $('cpCNextT').textContent = S.i === n - 1 ? 'Terminar' : 'Siguiente';
}
function sigCard() {
  if (S.i < S.cards.length - 1) {
    S.i++;
    pintaCard();
    return;
  }
  $('cpCfN').textContent = S.cards.length;
  $('cpCfT').textContent =
    'Repasaste ' + S.cards.length + ' tarjetas de ' + nombreCorto(compGet(cur)) + '.';
  log('Tarjetas: ' + S.cards.length + ' de ' + nombreCorto(compGet(cur)));
  mostrar('cpCardFin');
}

/* ---------- 4 · simulacros ---------- */

var NQ = NUMS[0];
function renderSim() {
  llenarComp($('cpSC'));
  var q = deComp(QB).length,
    b = best[cur];
  if (q < NQ) NQ = NUMS[0];
  $('cpSBest').innerHTML = b != null ? b + '<small>/100</small>' : '—';
  $('cpSBestT').textContent =
    b != null
      ? 'Tu mejor nota en esta competencia. Intenta superarla.'
      : 'Aún no has hecho un simulacro de esta competencia.';
  $('cpSN').innerHTML = NUMS.map(function (n) {
    var ok = q >= n;
    return (
      '<button class="cp-nc" type="button" role="radio" data-n="' +
      n +
      '" aria-checked="' +
      (ok && n === NQ) +
      '"' +
      (ok ? '' : ' disabled') +
      '><b>' +
      n +
      '</b><small>preguntas</small></button>'
    );
  }).join('');
  var av = $('cpSAvail');
  av.className = 'cp-avail' + (q < NUMS[2] ? ' cp-warn' : '');
  av.innerHTML =
    'Esta competencia tiene <b>' +
    q +
    ' preguntas</b> en el banco.' +
    (q < NUMS[2]
      ? ' Los simulacros más largos se activan cuando el equipo de contenido añada las que faltan.'
      : '');
  $('cpSGo').disabled = q < NUMS[0];
}

var X = { qs: [], i: 0, r: [] },
  salirArm = 0;
function empezarSim() {
  X.qs = barajar(deComp(QB))
    .slice(0, NQ)
    .map(function (q) {
      return { q: q, ord: barajar([0, 1, 2, 3]) };
    });
  X.i = 0;
  X.r = [];
  pintaQ();
  mostrar('cpQ');
}
function pintaQ() {
  var it = X.qs[X.i],
    q = it.q,
    n = X.qs.length;
  $('cpQCount').innerHTML = X.i + 1 + '<small>/' + n + '</small>';
  $('cpQBar').style.width = ((X.i + 1) / n) * 100 + '%';
  $('cpQTema').textContent = q.t;
  $('cpQDif').textContent = DIF[q.d] || '';
  var fig = $('cpQFig');
  fig.hidden = !q.img;
  fig.innerHTML = q.img ? '<img alt="" src="' + esc(q.img) + '">' : '';
  $('cpQText').textContent = q.q;
  $('cpQOpts').innerHTML = it.ord
    .map(function (o, j) {
      return (
        '<li><button class="cp-opt" type="button" role="radio" aria-checked="' +
        (X.r[X.i] === o) +
        '" data-o="' +
        o +
        '"><span class="cp-lt">' +
        'ABCD'[j] +
        '</span><span>' +
        esc(q.o[o]) +
        '</span></button></li>'
      );
    })
    .join('');
  $('cpQNext').disabled = X.r[X.i] == null;
  $('cpQNext').textContent = X.i === n - 1 ? 'Terminar' : 'Siguiente';
}
function terminarSim() {
  var ok = 0,
    mal = [];
  X.qs.forEach(function (it, i) {
    if (X.r[i] === it.q.a) ok++;
    else mal.push(i);
  });
  var nota = Math.round((ok / X.qs.length) * 100),
    prev = best[cur],
    rec = prev == null || nota > prev;
  if (rec) {
    best[cur] = nota;
    guardar('rv_sim_best', best);
  }
  log('Simulacro de ' + nombreCorto(compGet(cur)) + ': ' + nota + '/100');
  $('cpRN').textContent = nota;
  var arc = $('cpRArc');
  arc.setAttribute('stroke-dasharray', '0 100');
  setTimeout(function () {
    arc.setAttribute('stroke-dasharray', nota + ' 100');
  }, 60);
  $('cpRT').textContent =
    nota >= 85
      ? '¡Excelente!'
      : nota >= 70
        ? '¡Muy bien!'
        : nota >= 51
          ? 'Aprobado'
          : 'Sigue practicando';
  $('cpRS').textContent = ok + ' de ' + X.qs.length + ' correctas · ' + nombreCorto(compGet(cur));
  $('cpRRec').hidden = !rec;
  $('cpRRev').innerHTML = mal.length
    ? '<h3>Lo que fallaste (' +
      mal.length +
      ')</h3><ul>' +
      mal
        .map(function (i) {
          var q = X.qs[i].q;
          return (
            '<li class="cp-ri"><p>' +
            esc(q.q) +
            '</p><dl><dt>Tu respuesta</dt><dd class="cp-y">' +
            esc(q.o[X.r[i]]) +
            '</dd><dt>Correcta</dt><dd class="cp-c">' +
            esc(q.o[q.a]) +
            '</dd></dl>' +
            (q.e ? '<p class="cp-ex">' + esc(q.e) + '</p>' : '') +
            '</li>'
          );
        })
        .join('') +
      '</ul>'
    : '<div class="cp-allok">Acertaste todas. No hay nada que repasar.</div>';
  mostrar('cpRes');
  $('cpRT').focus({ preventScroll: true });
}

/* ---------- eventos (una sola vez) ---------- */

function enlazar() {
  if (enlazar.ok) return;
  enlazar.ok = true;
  $('cpVolver').addEventListener('click', function () {
    if (desdeApp) history.back();
    else location.hash = '#home';
  });
  $('cpSel').addEventListener('change', function () {
    cambiar(this.value);
    renderFicha();
  });
  $('cpIr3d').addEventListener('click', abrir3d);
  $('cpIrTar').addEventListener('click', function () {
    F = { a: '', s: '', t: '', d: '' };
    renderTar();
    mostrar('cpTar');
  });
  $('cpIrSim').addEventListener('click', function () {
    renderSim();
    mostrar('cpSim');
  });
  $('cpIrEst').addEventListener('click', function () {
    location.hash = '#estudio';
  });
  document.querySelectorAll('#competencia [data-cp-ficha]').forEach(function (b) {
    b.addEventListener('click', function () {
      renderFicha();
      mostrar('cpFicha');
    });
  });

  /* visor 3D */
  $('cp3x').addEventListener('click', function () {
    cerrar3d(false);
  });
  $('cp3plus').addEventListener('click', function () {
    menu($('cp3menu').hidden);
  });
  document.querySelectorAll('#cp3menu [data-cp-modo]').forEach(function (b) {
    b.addEventListener('click', function () {
      if (!T) return;
      T.modo = b.getAttribute('data-cp-modo');
      document.querySelectorAll('#cp3menu [data-cp-modo]').forEach(function (x) {
        x.setAttribute('aria-checked', x === b ? 'true' : 'false');
      });
      pintar();
      menu(false);
    });
  });
  $('cp3reset').addEventListener('click', function () {
    if (T && T.root) {
      seleccionar(null);
      encuadre();
    }
    menu(false);
  });
  window.addEventListener('popstate', function () {
    if (!$('cp3d').hidden) cerrar3d(true);
  });
  document.addEventListener('keydown', function (e) {
    if (!$('competencia').classList.contains('on')) return;
    if (!$('cp3d').hidden) {
      if (e.key !== 'Escape') return;
      if (!$('cp3menu').hidden) menu(false);
      else if (T && T.sel) seleccionar(null);
      else cerrar3d(false);
      return;
    }
    if (!$('cpCard').hidden) {
      if (e.key === 'ArrowRight') sigCard();
      else if (e.key === 'ArrowLeft') $('cpCPrev').click();
    }
  });

  /* tarjetas */
  $('cpTC').addEventListener('change', function () {
    cambiar(this.value);
    F = { a: '', s: '', t: '', d: '' };
    renderTar();
  });
  $('cpTA').addEventListener('change', function () {
    F.a = this.value;
    F.s = F.t = F.d = '';
    renderTar();
  });
  $('cpTS').addEventListener('change', function () {
    F.s = this.value;
    F.t = F.d = '';
    renderTar();
  });
  $('cpTT').addEventListener('change', function () {
    F.t = this.value;
    renderTar();
  });
  $('cpTD').addEventListener('change', function () {
    F.d = this.value;
    renderTar();
  });
  $('cpTGo').addEventListener('click', empezarTar);
  $('cpCardB').addEventListener('click', function () {
    this.classList.toggle('cp-flip');
  });
  $('cpCPrev').addEventListener('click', function () {
    if (S.i > 0) {
      S.i--;
      pintaCard();
    }
  });
  $('cpCNext').addEventListener('click', sigCard);
  document.querySelector('#cpCard [data-cp-tar]').addEventListener('click', function () {
    renderTar();
    mostrar('cpTar');
  });
  $('cpCfOtra').addEventListener('click', empezarTar);

  /* simulacros */
  $('cpSC').addEventListener('change', function () {
    cambiar(this.value);
    renderSim();
  });
  $('cpSN').addEventListener('click', function (e) {
    var b = e.target.closest('.cp-nc');
    if (!b || b.disabled) return;
    NQ = +b.getAttribute('data-n');
    renderSim();
  });
  $('cpSGo').addEventListener('click', empezarSim);
  $('cpQOpts').addEventListener('click', function (e) {
    var b = e.target.closest('.cp-opt');
    if (!b) return;
    X.r[X.i] = +b.getAttribute('data-o');
    this.querySelectorAll('.cp-opt').forEach(function (x) {
      x.setAttribute('aria-checked', x === b ? 'true' : 'false');
    });
    $('cpQNext').disabled = false;
  });
  $('cpQNext').addEventListener('click', function () {
    if (X.i < X.qs.length - 1) {
      X.i++;
      pintaQ();
      window.scrollTo(0, 0);
    } else terminarSim();
  });
  $('cpQX').addEventListener('click', function () {
    if (Date.now() - salirArm < 2500) {
      renderSim();
      mostrar('cpSim');
      return;
    }
    salirArm = Date.now();
    toast('Toca otra vez la X para salir. Perderás este intento.');
  });
  $('cpROtra').addEventListener('click', function () {
    renderSim();
    mostrar('cpSim');
  });
}
