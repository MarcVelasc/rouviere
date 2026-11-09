import { estado } from '../../estado.js';
import { W, log, mn } from '../../core/almacenamiento.js';
import { $, el, pad, shuffle } from '../../core/dom.js';
import { haOpen } from '../atlas/apartados.js';
import { haLoad } from '../atlas/human-atlas.js';
import { hoy } from '../progreso/progreso.js';
import { RUTA, exTimer, qAll, showEx } from '../simulacros/simulacros.js';
import { allCards, cPend, stShow } from '../tarjetas/tarjetas.js';
/* nodo abierto en el panel */
export const RT_VIS = {};
export /* nodos de visita (atlas, biblioteca) ya abiertos en esta sesión */

function rtS() {
  if (!estado.S.ruta || typeof estado.S.ruta !== 'object' || Array.isArray(estado.S.ruta))
    estado.S.ruta = {
      done: {},
      xp: 0,
    };
  if (!estado.S.ruta.done) estado.S.ruta.done = {};
  if (typeof estado.S.ruta.xp !== 'number') estado.S.ruta.xp = 0;
  return estado.S.ruta;
}
export function rtHecho(id) {
  return !!rtS().done[id];
}
export function rtNodos() {
  var a = [];
  RUTA.forEach(function (u) {
    u.nodos.forEach(function (n) {
      a.push({
        u: u,
        n: n,
      });
    });
  });
  return a;
}
export function rtNodo(id) {
  var r = null;
  rtNodos().forEach(function (x) {
    if (x.n.id === id) r = x;
  });
  return r;
}
export function rtUniAbierta(ui) {
  if (ui === 0) return true;
  var p = RUTA[ui - 1],
    h = p.nodos.filter(function (n) {
      return rtHecho(n.id);
    }).length;
  return h / p.nodos.length >= 0.6;
}
export function rtEstado(ui, ni) {
  var u = RUTA[ui],
    n = u.nodos[ni];
  if (rtHecho(n.id)) return 'done';
  if (!rtUniAbierta(ui)) return 'lock';
  if (ni === 0) return 'open';
  return rtHecho(u.nodos[ni - 1].id) ? 'open' : 'lock';
}
export function rtActual() {
  for (var i = 0; i < RUTA.length; i++)
    for (var j = 0; j < RUTA[i].nodos.length; j++)
      if (rtEstado(i, j) === 'open')
        return {
          ui: i,
          ni: j,
          u: RUTA[i],
          n: RUTA[i].nodos[j],
        };
  return null;
}
export function rtNivel(xp) {
  var n = 1,
    req = 120,
    ac = 0;
  while (xp >= ac + req) {
    ac += req;
    n++;
    req = Math.round(req * 1.25);
  }
  return {
    n: n,
    base: ac,
    sig: ac + req,
    falta: ac + req - xp,
  };
}
export function rtRacha() {
  var d = {};
  (estado.S.est || []).forEach(function (x) {
    if ((x.c || 0) + (x.q || 0) > 0) d[x.d] = 1;
  });
  var hoyS = hoy(),
    n = 0,
    t = new Date();
  if (!d[hoyS]) t = new Date(t.getTime() - 864e5); /* la racha vale si estudiaste ayer */
  for (var i = 0; i < 400; i++) {
    var k = t.getFullYear() + '-' + pad(t.getMonth() + 1) + '-' + pad(t.getDate());
    if (!d[k]) break;
    n++;
    t = new Date(t.getTime() - 864e5);
  }
  return n;
}
export function rtHoy() {
  var h = hoy(),
    r = 0;
  (estado.S.est || []).forEach(function (x) {
    if (x.d === h) r = (x.c || 0) + (x.q || 0);
  });
  return r;
}
export const RTIC = {
  leccion: 'M5 4h10a2 2 0 0 1 2 2v14l-7-3-7 3V6a2 2 0 0 1 2-2z',
  tarjetas: 'M4 7h11v10H4zM8 4h11v10',
  cuestionario: 'M9 9a3 3 0 1 1 4 2.8c-.8.4-1 .9-1 1.7v.5M12 17.5v.5',
  evaluacion: 'M7 4h10v5a5 5 0 0 1-10 0zM9 19h6M12 14v5M4 5h3M17 5h3',
  desafio: 'M12 3l2.4 5.3 5.6.6-4.2 3.8 1.2 5.6L12 15.6 7 18.3l1.2-5.6L4 8.9l5.6-.6z',
  atlas: 'M12 3l8 4.5v9L12 21l-8-4.5v-9zM12 12l8-4.5M12 12v9M12 12L4 7.5',
};
export function rtIcono(t) {
  var ns = 'http://www.w3.org/2000/svg',
    s = document.createElementNS(ns, 'svg');
  s.setAttribute('viewBox', '0 0 24 24');
  s.setAttribute('class', 'nic');
  s.setAttribute('aria-hidden', 'true');
  var p = document.createElementNS(ns, 'path');
  p.setAttribute('d', RTIC[t] || RTIC.leccion);
  s.appendChild(p);
  return s;
}
export const RTNOM = {
  leccion: 'Lección',
  tarjetas: 'Tarjetas',
  cuestionario: 'Cuestionario',
  evaluacion: 'Evaluación de unidad',
  desafio: 'Desafío',
  atlas: 'Atlas 3D',
};
export function renderRuta() {
  rtS();
  var w = $('rutaw');
  if (!w) return;
  w.textContent = '';
  /* cabecera: nivel, XP, racha y objetivo del día */
  var xp = estado.S.ruta.xp,
    nv = rtNivel(xp),
    hechos = rtNodos().filter(function (x) {
      return rtHecho(x.n.id);
    }).length;
  var tot = rtNodos().length,
    act = rtActual();
  var cab = el('div', 'rcab');
  var k = el('div', 'kpis');
  [
    [String(nv.n), 'Nivel'],
    [String(xp), 'XP'],
    [rtRacha() + (rtRacha() === 1 ? ' día' : ' días'), 'Racha'],
    [hechos + ' / ' + tot, 'Nodos'],
  ].forEach(function (x) {
    var d = el('div', 'kpi');
    d.appendChild(el('b', 0, x[0]));
    d.appendChild(el('small', 0, x[1]));
    k.appendChild(d);
  });
  cab.appendChild(k);
  var pb = el('div', 'pb'),
    pi = document.createElement('i');
  pi.style.width = Math.round(((xp - nv.base) / (nv.sig - nv.base)) * 100) + '%';
  pi.style.transition = 'none';
  pb.appendChild(pi);
  cab.appendChild(pb);
  cab.appendChild(
    el(
      'p',
      's',
      'Te faltan ' +
        nv.falta +
        ' XP para el nivel ' +
        (nv.n + 1) +
        ' · hoy llevas ' +
        rtHoy() +
        ' actividades',
    ),
  );
  if (act) cab.appendChild(el('p', 's', 'Siguiente paso: ' + act.n.n + ' · ' + act.u.n));
  else
    cab.appendChild(
      el('p', 's', 'Has completado toda la ruta disponible. Puedes repetir cualquier nodo.'),
    );
  w.appendChild(cab);

  /* recomendación a partir de resultados reales */
  var rec = rtRecomienda();
  if (rec) {
    var rb = el('div', 'rrec');
    rb.appendChild(el('b', 0, 'Recomendación'));
    rb.appendChild(el('p', 's', rec.txt));
    if (rec.nid) {
      var rbt = el('button', 'pill sm', 'Ir a ese nodo');
      rbt.type = 'button';
      rbt.setAttribute('data-hc', '120');
      rbt.setAttribute('data-a', 'abrir');
      rbt.setAttribute('data-n', rec.nid);
      rb.appendChild(rbt);
    }
    w.appendChild(rb);
  }

  /* unidades */
  var anchoC = Math.max(280, Math.min(420, w.clientWidth || 320));
  RUTA.forEach(function (u, ui) {
    var abierta = rtUniAbierta(ui);
    var hu = u.nodos.filter(function (n) {
      return rtHecho(n.id);
    }).length;
    var pc = Math.round((hu / u.nodos.length) * 100);
    var bl = el('section', 'uni' + (abierta ? '' : ' bloq'));
    var h = el('div', 'uhead');
    h.appendChild(el('span', 'unum', 'Unidad ' + (ui + 1)));
    h.appendChild(el('h2', 0, u.n));
    h.appendChild(el('p', 's', u.intro));
    var ol = el('ul', 'vl');
    u.obj.forEach(function (o) {
      ol.appendChild(el('li', 0, o));
    });
    var det = document.createElement('details');
    det.className = 'uobj';
    var sm = document.createElement('summary');
    sm.textContent = 'Objetivos de la unidad';
    det.appendChild(sm);
    det.appendChild(ol);
    h.appendChild(det);
    var bar = el('div', 'pb'),
      bi = document.createElement('i');
    bi.style.width = pc + '%';
    bi.style.transition = 'none';
    bar.appendChild(bi);
    h.appendChild(bar);
    h.appendChild(
      el(
        'small',
        0,
        hu +
          ' de ' +
          u.nodos.length +
          ' nodos · ' +
          pc +
          '%' +
          (abierta ? '' : ' · se abre al completar el 60 % de la unidad anterior'),
      ),
    );
    bl.appendChild(h);

    /* camino */
    var GAP = 116,
      A = anchoC * 0.27,
      cx = anchoC / 2,
      top = 52,
      n = u.nodos.length;
    var alto = top + (n - 1) * GAP + 64;
    var cont = el('div', 'upath');
    cont.style.height = alto + 'px';
    var ns = 'http://www.w3.org/2000/svg',
      svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + anchoC + ' ' + alto);
    svg.setAttribute('class', 'upl');
    svg.setAttribute('aria-hidden', 'true');
    var pts = [];
    for (var i = 0; i < n; i++) pts.push([cx + A * Math.sin((i * Math.PI) / 2), top + i * GAP]);
    if (n > 1) {
      var dd = 'M' + pts[0][0].toFixed(1) + ' ' + pts[0][1];
      for (var i = 1; i < n; i++) {
        var a = pts[i - 1],
          b = pts[i],
          my = (a[1] + b[1]) / 2;
        dd +=
          'C' +
          a[0].toFixed(1) +
          ' ' +
          my +
          ',' +
          b[0].toFixed(1) +
          ' ' +
          my +
          ',' +
          b[0].toFixed(1) +
          ' ' +
          b[1];
      }
      var base = document.createElementNS(ns, 'path');
      base.setAttribute('d', dd);
      base.setAttribute('class', 'pl0');
      svg.appendChild(base);
      /* tramo ya recorrido */
      var hechoHasta = -1;
      for (var i = 0; i < n; i++) if (rtHecho(u.nodos[i].id)) hechoHasta = i;
      if (hechoHasta > 0) {
        var d2 = 'M' + pts[0][0].toFixed(1) + ' ' + pts[0][1];
        for (var i = 1; i <= hechoHasta; i++) {
          var a = pts[i - 1],
            b = pts[i],
            my = (a[1] + b[1]) / 2;
          d2 +=
            'C' +
            a[0].toFixed(1) +
            ' ' +
            my +
            ',' +
            b[0].toFixed(1) +
            ' ' +
            my +
            ',' +
            b[0].toFixed(1) +
            ' ' +
            b[1];
        }
        var pr = document.createElementNS(ns, 'path');
        pr.setAttribute('d', d2);
        pr.setAttribute('class', 'pl1');
        svg.appendChild(pr);
      }
    }
    cont.appendChild(svg);
    u.nodos.forEach(function (nd, ni) {
      var st = rtEstado(ui, ni),
        p = pts[ni];
      var b = el('button', 'nodo ' + st + (act && act.n.id === nd.id ? ' aqui' : ''));
      b.type = 'button';
      b.style.left = p[0] - 30 + 'px';
      b.style.top = p[1] - 30 + 'px';
      b.setAttribute('data-hc', '120');
      b.setAttribute('data-a', 'abrir');
      b.setAttribute('data-n', nd.id);
      b.setAttribute(
        'aria-label',
        RTNOM[nd.t] +
          ': ' +
          nd.n +
          ' · ' +
          (st === 'done' ? 'completado' : st === 'open' ? 'disponible' : 'bloqueado'),
      );
      if (st === 'lock') b.disabled = true;
      b.appendChild(rtIcono(nd.t));
      if (st === 'done') {
        var ck = el('span', 'ntick', '✓');
        b.appendChild(ck);
      }
      cont.appendChild(b);
      var lb = el('span', 'nlab', nd.n);
      lb.style.left = p[0] - 70 + 'px';
      lb.style.top = p[1] + 32 + 'px';
      cont.appendChild(lb);
      if (act && act.n.id === nd.id) {
        var aq = el('span', 'naqui', 'Estás aquí');
        aq.style.left = p[0] - 44 + 'px';
        aq.style.top = p[1] - 58 + 'px';
        cont.appendChild(aq);
      }
    });
    bl.appendChild(cont);
    w.appendChild(bl);
  });
  var pnl = $('rpanel');
  if (pnl && !estado.RT_SEL) pnl.style.display = 'none';
}
export function rtRecomienda() {
  /* todo sale de resultados reales: nada de estadísticas inventadas */
  var h = estado.S.hist || [],
    td = {};
  h.forEach(function (x) {
    (x.det || []).forEach(function (d) {
      var k = d.m;
      if (!td[k])
        td[k] = {
          ok: 0,
          n: 0,
        };
      td[k].n++;
      if (d.r === d.a) td[k].ok++;
    });
  });
  var flojo = null;
  Object.keys(td).forEach(function (k) {
    if (
      td[k].n >= 4 &&
      td[k].ok / td[k].n < 0.6 &&
      (!flojo || td[k].ok / td[k].n < td[flojo].ok / td[flojo].n)
    )
      flojo = k;
  });
  if (flojo) {
    var cand = null;
    RUTA.forEach(function (u) {
      u.nodos.forEach(function (nd) {
        if (cand) return;
        if (nd.cfg && nd.cfg.ms && nd.cfg.ms.indexOf(flojo) >= 0 && nd.t === 'tarjetas')
          cand = nd.id;
      });
    });
    return {
      txt:
        'En los simulacros llevas ' +
        td[flojo].ok +
        ' de ' +
        td[flojo].n +
        ' en ' +
        mn(flojo) +
        '. Repasa esa unidad antes de seguir.',
      nid: cand,
    };
  }
  var due = cPend();
  if (due >= 5)
    return {
      txt:
        'Tienes ' +
        due +
        ' tarjetas que tocaba repasar hoy. Empieza por ahí: ' +
        'la repetición espaciada funciona si se respeta el día.',
      nid: null,
    };
  var act = rtActual();
  if (act)
    return {
      txt: 'Vas por «' + act.n.n + '» en ' + act.u.n + '.',
      nid: act.n.id,
    };
  return null;
}
export function rtAbrir(id) {
  var x = rtNodo(id);
  if (!x) return;
  estado.RT_SEL = id;
  var ui = RUTA.indexOf(x.u),
    ni = x.u.nodos.indexOf(x.n),
    st = rtEstado(ui, ni);
  var p = $('rpanel');
  p.textContent = '';
  p.style.display = '';
  p.appendChild(el('span', 'unum', RTNOM[x.n.t] + ' · ' + x.u.n));
  p.appendChild(el('h2', 0, x.n.n));
  var dif = ['', 'Básica', 'Intermedia', 'Avanzada'][x.n.d || 1];
  p.appendChild(
    el(
      'p',
      's',
      'Dificultad ' +
        dif.toLowerCase() +
        ' · ' +
        x.n.xp +
        ' XP' +
        (rtHecho(id) ? ' (ya conseguidos)' : ''),
    ),
  );
  p.appendChild(el('p', 's', rtDesc(x.n)));
  var est = el(
    'span',
    'estado ' + st,
    st === 'done' ? 'Completado' : st === 'open' ? 'Disponible' : 'Bloqueado',
  );
  p.appendChild(est);
  if (st === 'lock') {
    p.appendChild(
      el(
        'p',
        's',
        ni === 0
          ? 'Se abre cuando completes el 60 % de la unidad anterior.'
          : 'Se abre al completar «' + x.u.nodos[ni - 1].n + '».',
      ),
    );
  }
  if (x.n.t === 'leccion') {
    var caja = el('div', 'lecc');
    caja.appendChild(el('p', 0, x.u.intro));
    caja.appendChild(el('b', 0, 'Al terminar esta unidad deberías poder:'));
    var ul = el('ul', 'vl');
    x.u.obj.forEach(function (o) {
      ul.appendChild(el('li', 0, o));
    });
    caja.appendChild(ul);
    caja.appendChild(el('p', 's mini', 'Contenido redactado para ROUVIÈRE, sin revisión docente.'));
    p.appendChild(caja);
  }
  if (st !== 'lock') {
    var etq = rtHecho(id)
      ? 'Repetir la actividad'
      : x.n.t === 'leccion'
        ? 'Marcar como leída'
        : x.n.t === 'atlas'
          ? RT_VIS[id]
            ? 'Ya lo exploré, marcar como hecho'
            : 'Abrir el atlas 3D'
          : 'Empezar';
    var b = el('button', 'pill', etq);
    b.type = 'button';
    b.setAttribute('data-hc', '120');
    b.setAttribute('data-a', 'empezar');
    b.setAttribute('data-n', id);
    p.appendChild(b);
  }
  var c = el('button', 'pill sm', 'Cerrar');
  c.type = 'button';
  c.setAttribute('data-hc', '120');
  c.setAttribute('data-a', 'cerrar');
  p.appendChild(c);
  p.scrollIntoView({
    block: 'nearest',
  });
}
export function rtDesc(n) {
  var c = n.cfg || {};
  if (n.t === 'leccion')
    return 'Lee la introducción y los objetivos. Es el punto de partida de la unidad.';
  if (n.t === 'tarjetas')
    return (
      'Sesión de estudio con ' +
      c.n +
      ' tarjetas de la unidad. Se completa cuando las calificas todas.'
    );
  if (n.t === 'atlas')
    return (
      'Abre el ' +
      c.nom.toLowerCase() +
      ' en el atlas 3D y explóralo. Se completa cuando vuelvas y lo confirmes.'
    );
  if (n.t === 'cuestionario')
    return c.n + ' preguntas de la unidad. Se completa con un ' + c.min + ' % de aciertos o más.';
  if (n.t === 'evaluacion')
    return (
      'Evaluación con ' +
      c.n +
      ' preguntas de toda la unidad. Hace falta un ' +
      c.min +
      ' % para superarla.'
    );
  if (n.t === 'desafio')
    return c.n + ' preguntas de dificultad avanzada. Hace falta un ' + c.min + ' %.';
  return '';
}
export function rtEmpezar(id) {
  var x = rtNodo(id);
  if (!x) return;
  var ui = RUTA.indexOf(x.u),
    ni = x.u.nodos.indexOf(x.n);
  if (rtEstado(ui, ni) === 'lock') return;
  var n = x.n,
    c = n.cfg || {};
  if (n.t === 'leccion') {
    rtCompletar(id, 'Lección leída');
    rtAbrir(id);
    renderRuta();
    return;
  }
  if (n.t === 'atlas') {
    if (RT_VIS[id]) {
      rtCompletar(id, 'Atlas explorado');
      rtAbrir(id);
      renderRuta();
      return;
    }
    RT_VIS[id] = 1;
    estado.RT_ACT = {
      nid: id,
      t: 'atlas',
    };
    location.hash = '#atlas';
    setTimeout(function () {
      try {
        haOpen();
        haLoad(c.k);
      } catch (e) {}
    }, 400);
    return;
  }
  if (n.t === 'tarjetas') {
    estado.CF = {
      m: 'all',
      t: 'all',
      d: 'all',
      st: 'all',
      q: '',
      fav: false,
    };
    estado.RT_ACT = {
      nid: id,
      t: 'tarjetas',
      ms: c.ms,
      ts: c.ts,
      n: c.n,
    };
    location.hash = '#tarjetas';
    setTimeout(function () {
      rtLanzaTarjetas(c);
    }, 120);
    return;
  }
  /* cuestionario, evaluación y desafío */
  estado.RT_ACT = {
    nid: id,
    t: 'quiz',
    min: c.min,
  };
  location.hash = '#simulacros';
  setTimeout(function () {
    rtLanzaQuiz(c);
  }, 120);
}
export function rtFiltra(banco, c) {
  return banco.filter(function (x) {
    if (c.ms && c.ms.indexOf(x.m) < 0) return false;
    if (c.ts && c.ts.length && c.ts.indexOf(x.t) < 0) return false;
    if (c.dif && x.d !== c.dif) return false;
    return true;
  });
}
export function rtLanzaTarjetas(c) {
  var a = rtFiltra(allCards(), c);
  /* primero las que no dominas y las que tocaba repasar */
  a.sort(function (p, q) {
    return rtPrio(p) - rtPrio(q);
  });
  var ids = a.slice(0, c.n).map(function (x) {
    return x.id;
  });
  estado.Q = ids;
  estado.qi = 0;
  estado.rev = false;
  estado.hi = 0;
  estado.ST = {
    ids: ids,
    i: 0,
    rev: false,
    mal: [],
    bien: 0,
  };
  $('cmain').style.display = 'none';
  $('cstudy').style.display = '';
  stShow();
}
export function rtPrio(c) {
  var st = estado.S.known[c.id],
    d = estado.S.sr[c.id] && estado.S.sr[c.id].due;
  if (st === 'h') return 0;
  if (d && d <= Date.now()) return 1;
  if (!st) return 2;
  return 3;
}
export function rtLanzaQuiz(c) {
  var pool = rtFiltra(qAll(), c).slice();
  shuffle(pool);
  var qs = pool.slice(0, Math.min(c.n, pool.length));
  estado.EX = {
    qs: qs,
    a: qs.map(function () {
      return -1;
    }),
    fl: qs.map(function () {
      return false;
    }),
    i: 0,
    t0: Date.now(),
    lim: 0,
    modo: 'examen',
    cfg: {
      sis: c.ms && c.ms.length === 1 ? c.ms[0] : 'all',
      tema: 'all',
      dif: 'all',
      src: 'banco',
    },
    conf: null,
  };
  exTimer();
  showEx();
}
export function rtCompletar(id, detalle) {
  var x = rtNodo(id);
  if (!x) return false;
  rtS();
  if (estado.S.ruta.done[id]) {
    W();
    return false;
  } /* el XP no se concede dos veces */
  estado.S.ruta.done[id] = {
    t: Date.now(),
    d: detalle || '',
  };
  estado.S.ruta.xp += x.n.xp;
  log('Ruta: ' + x.n.n + ' (+' + x.n.xp + ' XP)');
  W();
  return true;
}
export function rtAviso(txt, ok) {
  var e = $('rtoast');
  if (!e) return;
  e.textContent = txt;
  e.className = 'rtoast' + (ok ? ' ok' : '') + ' on';
  clearTimeout(window._rtt);
  window._rtt = setTimeout(function () {
    e.className = 'rtoast';
  }, 5000);
}

/* se llama al terminar una sesión de estudio o un examen lanzados desde un nodo */
export function rtFinTarjetas() {
  if (!estado.RT_ACT || estado.RT_ACT.t !== 'tarjetas') return;
  var id = estado.RT_ACT.nid,
    n = estado.RT_ACT.n;
  var hechas = estado.ST ? estado.ST.ids.length : 0;
  estado.RT_ACT = null;
  if (hechas >= n && rtCompletar(id, 'Sesión de ' + hechas + ' tarjetas'))
    rtAviso('Nodo completado: +' + rtNodo(id).n.xp + ' XP', true);
  rtVolverBtn('cstudy');
}
export function rtFinQuiz(pct) {
  if (!estado.RT_ACT || estado.RT_ACT.t !== 'quiz') return;
  var id = estado.RT_ACT.nid,
    min = estado.RT_ACT.min || 0;
  estado.RT_ACT = null;
  if (pct >= min) {
    if (rtCompletar(id, 'Examen superado con ' + pct + ' %'))
      rtAviso('Nodo completado con ' + pct + ' %: +' + rtNodo(id).n.xp + ' XP', true);
    else rtAviso('Nodo ya completado antes. No se repite el XP.', true);
  } else
    rtAviso('Te faltó llegar al ' + min + ' %: sacaste ' + pct + ' %. Puedes repetirlo.', false);
  rtVolverBtn('exr');
}
export function rtVolverBtn(donde) {
  var c = $(donde);
  if (!c) return;
  if (c.querySelector('.rvolver')) return;
  var a = el('a', 'pill gold rvolver', 'Volver a la ruta ');
  a.href = '#ruta';
  a.appendChild(el('span', 0, '→'));
  c.appendChild(a);
}
export function rtAct(a, t) {
  if (a === 'abrir') rtAbrir(t.getAttribute('data-n'));
  else if (a === 'empezar') rtEmpezar(t.getAttribute('data-n'));
  else if (a === 'cerrar') {
    estado.RT_SEL = null;
    $('rpanel').style.display = 'none';
  }
}

/* ===== progreso ===== */
