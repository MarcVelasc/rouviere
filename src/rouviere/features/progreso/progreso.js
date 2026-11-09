import { estado } from '../../estado.js';
import { MODS, W, mn } from '../../core/almacenamiento.js';
import { $, el, fmt, msg, pad } from '../../core/dom.js';
import { ANAT } from '../anatomia/categorias.js';
import { anAvance } from '../embriologia/histologia-embriologia.js';
import { rtActual, rtHecho, rtNivel, rtNodos, rtRacha } from '../ruta/ruta.js';
import { allCards, cDue, cEstado } from '../tarjetas/tarjetas.js';
export /* ===== progreso ===== */
function hoy() {
  var d = new Date();
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}
export function estHoy(tipo, n) {
  var d = hoy(),
    r = null;
  estado.S.est.forEach(function (x) {
    if (x.d === d) r = x;
  });
  if (!r) {
    r = {
      d: d,
      c: 0,
      q: 0,
    };
    estado.S.est.unshift(r);
    estado.S.est = estado.S.est.slice(0, 180);
  }
  if (tipo === 'c') r.c++;
  else r.q += n || 1;
}
export function semana() {
  var a = [],
    d = new Date();
  for (var i = 6; i >= 0; i--) {
    var x = new Date(d.getTime() - i * 864e5);
    a.push(x.getFullYear() + '-' + pad(x.getMonth() + 1) + '-' + pad(x.getDate()));
  }
  return a;
}
export function svgLinea(vals, etq) {
  var W = 300,
    H = 90,
    ns = 'http://www.w3.org/2000/svg';
  var s = document.createElementNS(ns, 'svg');
  s.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
  s.setAttribute('class', 'spark');
  s.setAttribute('role', 'img');
  s.setAttribute(
    'aria-label',
    'Evolución: ' +
      vals
        .map(function (v) {
          return v + '%';
        })
        .join(', '),
  );
  if (vals.length < 2) return s;
  var mx = 100,
    p = '';
  vals.forEach(function (v, i) {
    var x = (i / (vals.length - 1)) * (W - 10) + 5,
      y = H - 8 - (v / mx) * (H - 20);
    p += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
  });
  var l = document.createElementNS(ns, 'path');
  l.setAttribute('d', p);
  l.setAttribute('class', 'spl');
  s.appendChild(l);
  vals.forEach(function (v, i) {
    var x = (i / (vals.length - 1)) * (W - 10) + 5,
      y = H - 8 - (v / mx) * (H - 20);
    var c = document.createElementNS(ns, 'circle');
    c.setAttribute('cx', x.toFixed(1));
    c.setAttribute('cy', y.toFixed(1));
    c.setAttribute('r', '3');
    c.setAttribute('class', 'spd');
    s.appendChild(c);
  });
  return s;
}
export function svgBarras(datos) {
  var ns = 'http://www.w3.org/2000/svg',
    n = datos.length,
    W = 300,
    H = Math.max(40, n * 22);
  var s = document.createElementNS(ns, 'svg');
  s.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
  s.setAttribute('class', 'bars2');
  s.setAttribute(
    'aria-label',
    datos
      .map(function (d) {
        return d[0] + ' ' + d[1] + '%';
      })
      .join(', '),
  );
  datos.forEach(function (d, i) {
    var y = i * 22 + 4;
    var f = document.createElementNS(ns, 'rect');
    f.setAttribute('x', '96');
    f.setAttribute('y', y);
    f.setAttribute('width', '198');
    f.setAttribute('height', '12');
    f.setAttribute('rx', '6');
    f.setAttribute('class', 'bg2');
    s.appendChild(f);
    var b = document.createElementNS(ns, 'rect');
    b.setAttribute('x', '96');
    b.setAttribute('y', y);
    b.setAttribute('width', String(Math.max(2, (198 * d[1]) / 100)));
    b.setAttribute('height', '12');
    b.setAttribute('rx', '6');
    b.setAttribute('class', 'fg2');
    s.appendChild(b);
    var t = document.createElementNS(ns, 'text');
    t.setAttribute('x', '0');
    t.setAttribute('y', y + 10);
    t.setAttribute('class', 'bt2');
    t.textContent = d[0];
    s.appendChild(t);
    var v = document.createElementNS(ns, 'text');
    v.setAttribute('x', '294');
    v.setAttribute('y', y + 10);
    v.setAttribute('text-anchor', 'end');
    v.setAttribute('class', 'bv2');
    v.textContent = d[1] + '%';
    s.appendChild(v);
  });
  return s;
}
export function renderPg() {
  var b = $('pgb');
  b.textContent = '';
  var a = allCards(),
    k = 0,
    p = 0,
    du = 0,
    now = Date.now();
  a.forEach(function (c) {
    var s = cEstado(c.id);
    if (s === 'k') k++;
    else if (s === 'h') p++;
    var d = cDue(c.id);
    if (d && d <= now) du++;
  });
  var est = estado.S.est || [],
    h = estado.S.hist || [];
  var respondidas = h.reduce(function (x, y) {
      return x + y.n;
    }, 0),
    acertadas = h.reduce(function (x, y) {
      return x + y.s;
    }, 0);
  var sinNada = !k && !p && !h.length && !estado.S.act.length && !est.length;

  /* objetivo semanal */
  var meta = (estado.S.goal && estado.S.goal.c) || 0,
    sem = semana(),
    hechas = 0;
  sem.forEach(function (d) {
    est.forEach(function (x) {
      if (x.d === d) hechas += x.c;
    });
  });
  if (sinNada) {
    var e = el('div', 'box');
    e.appendChild(el('h2', 0, 'Tu panel está listo, falta la actividad'));
    e.appendChild(
      el(
        'p',
        's',
        'Aquí aparecerán tus estadísticas reales en cuanto estudies. No mostramos datos de ejemplo.',
      ),
    );
    var ul = el('ul', 'vl');
    [
      ['Repasa 10 tarjetas', '#tarjetas'],
      ['Haz un simulacro de 10 preguntas', '#simulacros'],
      ['Marca tus temas difíciles para que vuelvan antes', '#tarjetas'],
    ].forEach(function (o) {
      var li = document.createElement('li');
      var aa = document.createElement('a');
      aa.href = o[1];
      aa.textContent = o[0];
      li.appendChild(aa);
      ul.appendChild(li);
    });
    e.appendChild(el('b', 0, 'Objetivos sugeridos para empezar'));
    e.appendChild(ul);
    var g = el('a', 'pill gold', 'Empezar por la ruta ');
    g.href = '#ruta';
    g.appendChild(el('span', 0, '→'));
    e.appendChild(g);
    var g2 = el('a', 'pill', 'Ir a las tarjetas ');
    g2.href = '#tarjetas';
    g2.appendChild(el('span', 0, '→'));
    e.appendChild(g2);
    b.appendChild(e);
    pgMeta(b, meta, hechas);
    return;
  }

  /* la ruta, arriba del todo: el progreso no es solo una lista de números */
  var rr = el('div', 'box');
  rr.appendChild(el('h2', 0, 'Tu ruta de aprendizaje'));
  var nv = rtNivel(estado.S.ruta.xp),
    nd = rtNodos().filter(function (x) {
      return rtHecho(x.n.id);
    }).length,
    tt = rtNodos().length,
    ac = rtActual();
  var kk = el('div', 'kpis');
  [
    [String(nv.n), 'Nivel'],
    [String(estado.S.ruta.xp), 'XP'],
    [rtRacha() + ' d', 'Racha'],
    [nd + ' / ' + tt, 'Nodos'],
  ].forEach(function (x) {
    var d = el('div', 'kpi');
    d.appendChild(el('b', 0, x[0]));
    d.appendChild(el('small', 0, x[1]));
    kk.appendChild(d);
  });
  rr.appendChild(kk);
  rr.appendChild(
    el('p', 's', ac ? 'Siguiente paso: ' + ac.n.n + ' · ' + ac.u.n : 'Ruta completada.'),
  );
  var ra = el('a', 'pill gold', 'Abrir la ruta ');
  ra.href = '#ruta';
  ra.appendChild(el('span', 0, '→'));
  rr.appendChild(ra);
  b.appendChild(rr);
  var r = el('div', 'box');
  r.appendChild(el('h2', 0, 'Resumen'));
  var cajas = el('div', 'kpis');
  [
    ['Tarjetas estudiadas', String(Object.keys(estado.S.sr).length)],
    ['Tarjetas dominadas', k + ' / ' + a.length],
    ['Marcadas difíciles', String(p)],
    ['Repasos para hoy', String(du)],
    ['Preguntas respondidas', String(respondidas)],
    ['Aciertos', respondidas ? Math.round((acertadas / respondidas) * 100) + '%' : '—'],
    ['Simulacros', String(h.length)],
    ['Tarjetas propias', String(estado.S.cards.length)],
  ].forEach(function (x) {
    var d = el('div', 'kpi');
    d.appendChild(el('b', 0, x[1]));
    d.appendChild(el('small', 0, x[0]));
    cajas.appendChild(d);
  });
  r.appendChild(cajas);
  b.appendChild(r);
  pgMeta(b, meta, hechas);

  /* evolución */
  if (h.length >= 2) {
    var ev = el('div', 'box');
    ev.appendChild(el('h2', 0, 'Evolución en los simulacros'));
    var vals = h
      .slice(0, 12)
      .reverse()
      .map(function (x) {
        return Math.round((x.s / x.n) * 100);
      });
    ev.appendChild(svgLinea(vals));
    ev.appendChild(
      el(
        'p',
        's',
        'Últimos ' +
          vals.length +
          ' intentos, del más antiguo al más reciente. ' +
          'Primero ' +
          vals[0] +
          '%, último ' +
          vals[vals.length - 1] +
          '%.',
      ),
    );
    b.appendChild(ev);
  }

  /* rendimiento por sistema */
  var sis = el('div', 'box');
  sis.appendChild(el('h2', 0, 'Rendimiento por sistema'));
  var datos = [],
    flojos = [];
  MODS.forEach(function (m) {
    var cs = a.filter(function (c) {
      return c.m === m[0];
    });
    var kk = cs.filter(function (c) {
      return cEstado(c.id) === 'k';
    }).length;
    var qs = 0,
      qok = 0;
    h.forEach(function (x) {
      (x.det || []).forEach(function (d) {
        if (d.m === m[0]) {
          qs++;
          if (d.r === d.a) qok++;
        }
      });
    });
    if (!cs.length && !qs) return;
    var pct = cs.length ? Math.round((kk / cs.length) * 100) : 0;
    /* El rótulo cabe en 96 px: los dos nombres largos se acortan para que no se monten
      sobre la barra. El nombre completo sigue en el aria-label del gráfico. */
    var et = m[1]
      .replace('Sistema ', '')
      .replace('Órganos de los ', '')
      .replace('Piel y tejido conectivo', 'piel y conectivo')
      .replace('Anatomía regional y terminología', 'regional');
    datos.push([et.length > 15 ? et.slice(0, 14) + '…' : et, pct]);
    if (qs >= 3 && qok / qs < 0.6) flojos.push(m[1] + ' (' + qok + '/' + qs + ' en simulacros)');
  });
  if (datos.length) sis.appendChild(svgBarras(datos));
  sis.appendChild(
    el('p', 's', 'Porcentaje de tarjetas que has marcado como dominadas en cada sistema.'),
  );
  b.appendChild(sis);

  /* temas débiles */
  var td = {};
  h.forEach(function (x) {
    (x.det || []).forEach(function (d) {
      var kk = mn(d.m) + ' · ' + (d.t || 'Sin tema');
      if (!td[kk])
        td[kk] = {
          ok: 0,
          n: 0,
        };
      td[kk].n++;
      if (d.r === d.a) td[kk].ok++;
    });
  });
  var deb = Object.keys(td)
    .filter(function (kk) {
      return td[kk].n >= 2 && td[kk].ok / td[kk].n < 0.6;
    })
    .sort(function (x, y) {
      return td[x].ok / td[x].n - td[y].ok / td[y].n;
    });
  /* ----- avance por área y temas completados ----- */
  if (typeof ANAT !== 'undefined') {
    var ar = el('div', 'box');
    ar.appendChild(el('h2', 0, 'Avance por área'));
    var tot = 0;
    ANAT.forEach(function (x) {
      var av = anAvance(x[0]);
      tot += av.k;
      var f = el('div', 'pgar');
      var t1 = el('div', 'anpt');
      t1.appendChild(el('b', 0, x[1]));
      t1.appendChild(el('span', 0, av.k + ' / ' + av.n));
      f.appendChild(t1);
      var bb = el('div', 'pbar'),
        ii = document.createElement('i');
      ii.style.width = Math.max(av.pc ? 2 : 0, av.pc) + '%';
      bb.appendChild(ii);
      f.appendChild(bb);
      ar.appendChild(f);
    });
    if (!tot)
      ar.appendChild(el('p', 's mini', 'Todavía no has marcado ninguna tarjeta como conocida.'));
    b.appendChild(ar);

    /* temas completados: aquellos en los que TODAS sus tarjetas están dominadas */
    var porT = {};
    allCards().forEach(function (c) {
      var kk = mn(c.m) + ' · ' + (c.t || 'Sin tema');
      if (!porT[kk])
        porT[kk] = {
          n: 0,
          k: 0,
        };
      porT[kk].n++;
      if (cEstado(c.id) === 'k') porT[kk].k++;
    });
    var hechos = Object.keys(porT).filter(function (kk) {
      return porT[kk].k === porT[kk].n;
    });
    var tc = el('div', 'box');
    tc.appendChild(el('h2', 0, 'Temas completados'));
    tc.appendChild(
      el(
        'p',
        's',
        hechos.length +
          ' de ' +
          Object.keys(porT).length +
          ' temas con todas sus tarjetas dominadas.',
      ),
    );
    if (hechos.length) {
      var ul = el('ul', 'vl');
      hechos.slice(0, 10).forEach(function (kk) {
        ul.appendChild(el('li', 0, kk));
      });
      tc.appendChild(ul);
    } else
      tc.appendChild(
        el(
          'p',
          's mini',
          'Un tema cuenta como completado cuando marcas todas sus tarjetas como conocidas.',
        ),
      );
    b.appendChild(tc);
  }

  /* ----- errores frecuentes, del detalle que guardan los simulacros ----- */
  var errT = {};
  h.forEach(function (x) {
    (x.det || []).forEach(function (d) {
      if (d.r === d.a) return; /* acertada: no es un error */
      var kk = mn(d.m) + ' · ' + (d.t || 'Sin tema');
      if (!errT[kk])
        errT[kk] = {
          f: 0,
          n: 0,
          m: d.m,
          t: d.t,
        };
      errT[kk].f++;
    });
  });
  h.forEach(function (x) {
    (x.det || []).forEach(function (d) {
      var kk = mn(d.m) + ' · ' + (d.t || 'Sin tema');
      if (errT[kk]) errT[kk].n++;
    });
  });
  var errL = Object.keys(errT)
    .sort(function (x, y) {
      return errT[y].f - errT[x].f;
    })
    .slice(0, 6);
  var ef = el('div', 'box');
  ef.appendChild(el('h2', 0, 'Errores frecuentes'));
  if (!errL.length)
    ef.appendChild(
      el(
        'p',
        's',
        h.length
          ? 'No has fallado ninguna pregunta todavía.'
          : 'Aparecerán aquí en cuanto hagas un simulacro.',
      ),
    );
  else {
    ef.appendChild(el('p', 's', 'Lo que más se te resiste, contado con tus propios intentos.'));
    errL.forEach(function (kk) {
      var e2 = errT[kk];
      var d = el('div', 'item');
      d.appendChild(el('b', 0, kk));
      d.appendChild(
        el(
          'small',
          0,
          e2.f +
            (e2.f === 1 ? ' fallo' : ' fallos') +
            ' de ' +
            e2.n +
            (e2.n === 1 ? ' pregunta' : ' preguntas'),
        ),
      );
      ef.appendChild(d);
    });
    var pb2 = el('button', 'pill', 'Practicar lo que más fallas ');
    pb2.type = 'button';
    pb2.setAttribute('data-hc', '144');
    pb2.setAttribute('data-m', errT[errL[0]].m);
    pb2.setAttribute('data-t', errT[errL[0]].t || 'all');
    pb2.appendChild(el('span', 0, '→'));
    ef.appendChild(pb2);
  }
  b.appendChild(ef);
  var w = el('div', 'box');
  w.appendChild(el('h2', 0, 'Temas que conviene repasar'));
  if (!deb.length)
    w.appendChild(
      el(
        'p',
        's',
        h.length
          ? 'Ningún tema baja del 60 % de aciertos con los datos que hay.'
          : 'Haz un simulacro para que aparezcan tus temas flojos.',
      ),
    );
  else
    deb.slice(0, 8).forEach(function (kk) {
      var d = el('div', 'item');
      d.appendChild(el('b', 0, kk));
      d.appendChild(el('small', 0, td[kk].ok + ' de ' + td[kk].n));
      w.appendChild(d);
    });
  if (flojos.length)
    w.appendChild(el('p', 's', 'Sistemas por debajo del 60 %: ' + flojos.join(' · ')));
  b.appendChild(w);

  /* repasos pendientes */
  var rp = el('div', 'box');
  rp.appendChild(el('h2', 0, 'Repasos programados'));
  if (!Object.keys(estado.S.sr).length)
    rp.appendChild(el('p', 's', 'Aún no has calificado ninguna tarjeta con el repaso espaciado.'));
  else {
    var hoyN = 0,
      man = 0,
      fut = 0;
    Object.keys(estado.S.sr).forEach(function (id) {
      var d = estado.S.sr[id].due || 0;
      if (d <= now) hoyN++;
      else if (d <= now + 864e5) man++;
      else fut++;
    });
    [
      ['Para hoy', hoyN],
      ['Para mañana', man],
      ['Más adelante', fut],
    ].forEach(function (x) {
      var d = el('div', 'item');
      d.appendChild(el('b', 0, x[0]));
      d.appendChild(el('small', 0, String(x[1])));
      rp.appendChild(d);
    });
    var ir = el('a', 'pill', 'Repasar ahora ');
    ir.href = '#tarjetas';
    ir.appendChild(el('span', 0, '→'));
    rp.appendChild(ir);
  }
  b.appendChild(rp);

  /* historial de estudio */
  var he = el('div', 'box');
  he.appendChild(el('h2', 0, 'Historial de estudio'));
  if (!est.length) he.appendChild(el('p', 's', 'Sin días registrados todavía.'));
  else
    est.slice(0, 14).forEach(function (x) {
      var d = el('div', 'item');
      d.appendChild(el('b', 0, x.d));
      d.appendChild(el('small', 0, x.c + ' tarjetas · ' + x.q + ' preguntas'));
      he.appendChild(d);
    });
  b.appendChild(he);

  /* simulacros y actividad */
  var hh = el('div', 'box');
  hh.appendChild(el('h2', 0, 'Simulacros'));
  if (!h.length) hh.appendChild(el('p', 's', 'Aún no hay intentos.'));
  h.slice(0, 8).forEach(function (x) {
    var d = el('div', 'item');
    d.appendChild(el('b', 0, x.s + ' / ' + x.n));
    d.appendChild(el('small', 0, fmt(x.t)));
    hh.appendChild(d);
  });
  b.appendChild(hh);
  var ac = el('div', 'box');
  ac.appendChild(el('h2', 0, 'Actividad reciente'));
  if (!estado.S.act.length) ac.appendChild(el('p', 's', 'Sin actividad registrada.'));
  estado.S.act.slice(0, 12).forEach(function (x) {
    var d = el('div', 'item');
    d.appendChild(el('span', 0, x.m));
    d.appendChild(el('small', 0, fmt(x.t)));
    ac.appendChild(d);
  });
  b.appendChild(ac);
}
export function pgMeta(b, meta, hechas) {
  var g = el('div', 'box');
  g.appendChild(el('h2', 0, 'Objetivo semanal'));
  if (meta) {
    var pc = Math.min(100, Math.round((hechas / meta) * 100));
    g.appendChild(
      el(
        'p',
        's',
        hechas + ' de ' + meta + ' tarjetas repasadas en los últimos 7 días (' + pc + '%).',
      ),
    );
    var pb = el('div', 'pb'),
      i = document.createElement('i');
    i.style.width = pc + '%';
    i.style.transition = 'none';
    pb.appendChild(i);
    g.appendChild(pb);
  } else
    g.appendChild(
      el(
        'p',
        's',
        'No has fijado ningún objetivo. Elige cuántas tarjetas quieres repasar cada semana.',
      ),
    );
  var row = el('div', 'two');
  var s = document.createElement('select');
  s.id = 'pgoal';
  s.className = 'in1';
  [0, 20, 50, 100, 150, 200, 300].forEach(function (n) {
    var o = el('option', 0, n ? n + ' tarjetas por semana' : 'Sin objetivo');
    o.value = n;
    if (n === meta) o.selected = true;
    s.appendChild(o);
  });
  var bt = el('button', 'pill', 'Guardar objetivo');
  bt.type = 'button';
  bt.setAttribute('data-hc', '117');
  bt.setAttribute('data-a', 'goal');
  row.appendChild(s);
  row.appendChild(bt);
  g.appendChild(row);
  g.appendChild(el('p', 's', '', '')).id = 'pgm2';
  b.appendChild(g);
}
export function pgAct(a, t) {
  if (a === 'goal') {
    estado.S.goal = {
      c: +$('pgoal').value,
    };
    W();
    renderPg();
    msg('pgm', 'Objetivo guardado.');
    return;
  }
  if (a === 'reset') {
    var w = $('pgm');
    w.textContent = '';
    estado.PGC = 1;
    w.appendChild(
      el(
        'b',
        0,
        'Esto borra tus marcas, repasos programados, simulacros y actividad. Las tarjetas que creaste tú no se borran.',
      ),
    );
    var b = el('button', 'pill', 'Sí, borrar el progreso');
    b.type = 'button';
    b.setAttribute('data-hc', '117');
    b.setAttribute('data-a', 'reset-si');
    w.appendChild(b);
    var n = el('button', 'pill sm', 'Cancelar');
    n.type = 'button';
    n.setAttribute('data-hc', '117');
    n.setAttribute('data-a', 'reset-no');
    w.appendChild(n);
    return;
  }
  if (a === 'reset-no') {
    estado.PGC = 0;
    msg('pgm', 'No se borró nada.');
    return;
  }
  if (a === 'reset-si') {
    estado.PGC = 0;
    estado.S.known = {};
    estado.S.hist = [];
    estado.S.act = [];
    estado.S.sr = {};
    estado.S.est = [];
    W();
    renderPg();
    msg('pgm', 'Progreso reiniciado. Tus tarjetas siguen ahí.');
  }
}
/* ===== estudio con IA ===== */
