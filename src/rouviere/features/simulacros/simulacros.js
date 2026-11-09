import { estado } from '../../estado.js';
import { MODS, QB, W, log, mn } from '../../core/almacenamiento.js';
import { $, el, fmt, msg, pad, shuffle } from '../../core/dom.js';
import { ANAT, anCasa, anGet } from '../anatomia/categorias.js';
import { COMP, compCasa, compGet } from '../anatomia/competencias.js';
import { estCarga, estDePregunta, estPinta, estTieneTeoria } from '../estructuras/fichas-est.js';
import { estHoy } from '../progreso/progreso.js';
import { rtFinQuiz } from '../ruta/ruta.js';
import RUTA__json from '../../data/ruta.json';
export const XC = {
  comp: 'all',
  cat: 'all',
  sis: 'all',
  tema: 'all',
  dif: 'all',
  src: 'banco',
  n: 20,
  tiempo: 0,
  modo: 'practica',
  orden: 'rnd',
};
export function qAll() {
  return QB.concat(
    estado.S.bank.map(function (q, i) {
      return {
        id: q.id || 'm' + i,
        m: q.m,
        t: q.t || 'Mis preguntas',
        d: q.d || 2,
        q: q.q,
        o: q.o,
        a: q.a,
        e: q.e || '',
        x: q.x || null,
        u: true,
      };
    }),
  );
}
export function qTemas(sis) {
  var r = {};
  qAll().forEach(function (q) {
    if (sis === 'all' || q.m === sis) r[q.t || 'Sin tema'] = 1;
  });
  return Object.keys(r).sort(function (a, b) {
    return a.localeCompare(b, 'es');
  });
}
export function qPool() {
  return qAll().filter(function (q) {
    if (XC.src === 'banco' && q.u) return false;
    if (XC.src === 'mias' && !q.u) return false;
    if (XC.comp && XC.comp !== 'all' && !compCasa(q, compGet(XC.comp))) return false;
    if (XC.cat && XC.cat !== 'all' && !anCasa(q, anGet(XC.cat))) return false;
    if (XC.sis !== 'all' && q.m !== XC.sis) return false;
    if (XC.tema !== 'all' && (q.t || 'Sin tema') !== XC.tema) return false;
    if (XC.dif !== 'all' && String(q.d || 2) !== XC.dif) return false;
    return true;
  });
}
export function xSet(f, v, t) {
  if (f === 'comp') {
    XC.comp = v;
    XC.cat = 'all';
    XC.sis = 'all';
    XC.tema = 'all';
  } else if (f === 'cat') {
    XC.cat = v;
    XC.comp = 'all';
    XC.sis = 'all';
    XC.tema = 'all';
  } else if (f === 'sis') {
    XC.sis = v;
    XC.tema = 'all';
    XC.cat = 'all';
    XC.comp = 'all';
  } else if (f === 'n') XC.n = Math.max(1, +v || 1);
  else if (f === 'tiempo') XC.tiempo = +v;
  else if (f === 'orden') XC.orden = t.checked ? 'rnd' : 'sec';
  else XC[f] = v;
  exSetup();
}
export function exSetup() {
  $('exs').style.display = '';
  $('exq').style.display = 'none';
  $('exr').style.display = 'none';
  clearInterval(estado.etm);
  var w = $('xcfg');
  w.textContent = '';
  function sel(id, lab, opts, val, f) {
    var b = el('div', 'fcol'),
      l = el('label', 'sl2', lab);
    l.setAttribute('for', id);
    b.appendChild(l);
    var s = document.createElement('select');
    s.id = id;
    s.className = 'in1';
    s.setAttribute('data-hh', '116');
    s.setAttribute('data-f', f);
    opts.forEach(function (o) {
      var p = el('option', 0, o[1]);
      p.value = o[0];
      if (String(o[0]) === String(val)) p.selected = true;
      s.appendChild(p);
    });
    b.appendChild(s);
    w.appendChild(b);
  }
  sel(
    'xsrc',
    'Fuente',
    [
      ['banco', 'Banco ROUVIÈRE'],
      ['mias', 'Mis preguntas'],
      ['ambos', 'Ambas'],
    ],
    XC.src,
    'src',
  );
  sel(
    'xcomp',
    'Competencia',
    [['all', 'Todas las competencias']].concat(
      COMP.map(function (a) {
        return [a[0], a[1].replace('Competencia ', 'C').replace(' · ', '. ')];
      }),
    ),
    XC.comp,
    'comp',
  );
  sel(
    'xcat',
    'Área',
    [['all', 'Todas las áreas']].concat(
      ANAT.map(function (a) {
        return [a[0], a[1]];
      }),
    ),
    XC.cat,
    'cat',
  );
  sel(
    'xsis',
    'Sistema',
    [['all', 'Todos los sistemas']].concat(
      MODS.map(function (m) {
        return [m[0], m[1]];
      }),
    ),
    XC.sis,
    'sis',
  );
  sel(
    'xtema',
    'Tema',
    [['all', 'Todos los temas']].concat(
      qTemas(XC.sis).map(function (t) {
        return [t, t];
      }),
    ),
    XC.tema,
    'tema',
  );
  sel(
    'xdif',
    'Dificultad',
    [
      ['all', 'Cualquiera'],
      ['1', 'Básica'],
      ['2', 'Intermedia'],
      ['3', 'Avanzada'],
    ],
    XC.dif,
    'dif',
  );
  var pool = qPool(),
    max = pool.length;
  if (XC.n > max) XC.n = max;
  var nop = [];
  [5, 10, 15, 20, 25, 30, 40, 50, 75, 100].forEach(function (n) {
    if (n <= max) nop.push([n, n + ' preguntas']);
  });
  if (max && (!nop.length || nop[nop.length - 1][0] !== max))
    nop.push([max, 'Todas (' + max + ')']);
  sel('xn', 'Número de preguntas', nop.length ? nop : [[0, 'Ninguna disponible']], XC.n, 'n');
  sel(
    'xt',
    'Tiempo',
    [
      [0, 'Sin límite'],
      [300, '5 minutos'],
      [600, '10 minutos'],
      [900, '15 minutos'],
      [1800, '30 minutos'],
      [3600, '60 minutos'],
    ],
    XC.tiempo,
    'tiempo',
  );
  sel(
    'xmodo',
    'Modo',
    [
      ['practica', 'Práctica'],
      ['examen', 'Examen'],
    ],
    XC.modo,
    'modo',
  );
  var b = el('div', 'fcol'),
    lb = el('label', 'chkl');
  var ck = document.createElement('input');
  ck.type = 'checkbox';
  ck.id = 'xord';
  ck.checked = XC.orden === 'rnd';
  ck.setAttribute('data-hh', '116');
  ck.setAttribute('data-f', 'orden');
  lb.appendChild(ck);
  lb.appendChild(document.createTextNode(' Orden aleatorio'));
  b.appendChild(lb);
  w.appendChild(b);
  var info = $('exinfo');
  info.textContent = '';
  if (!max) {
    info.appendChild(el('b', 0, 'Con ese filtro no queda ninguna pregunta.'));
    info.appendChild(el('p', 's', 'Cambia el sistema, el tema o la dificultad.'));
  } else {
    info.appendChild(el('b', 0, max + ' preguntas disponibles con este filtro'));
    info.appendChild(
      el(
        'p',
        's',
        'Se usarán ' +
          XC.n +
          '. ' +
          (XC.tiempo
            ? 'Tiempo: ' + Math.round(XC.tiempo / 60) + ' minutos.'
            : 'Sin límite de tiempo.') +
          (XC.modo === 'practica'
            ? ' En práctica ves si acertaste nada más responder.'
            : ' En examen la corrección sale al final.'),
      ),
    );
  }
  var bt = $('xstart');
  bt.disabled = !max;
  msg('exmsg', '');
  xHist();
}
export function xHist() {
  var h = $('exh');
  h.textContent = '';
  if (!estado.S.hist.length) {
    h.appendChild(el('p', 's', 'Aún no hay intentos. Empieza tu primer simulacro.'));
    return;
  }
  estado.S.hist.slice(0, 10).forEach(function (x, i) {
    var d = el('button', 'mrow item');
    d.type = 'button';
    d.setAttribute('data-hc', '115');
    d.setAttribute('data-a', 'ver-intento');
    d.setAttribute('data-i', String(i));
    d.appendChild(el('b', 0, x.s + ' / ' + x.n + '  ·  ' + Math.round((x.s / x.n) * 100) + '%'));
    var det =
      (x.sis && x.sis !== 'all' ? mn(x.sis) : 'todos los sistemas') +
      ' · ' +
      fmt(x.t) +
      (x.secs ? ' · ' + pad(Math.floor(x.secs / 60)) + ':' + pad(x.secs % 60) : '');
    d.appendChild(el('small', 0, det));
    h.appendChild(d);
  });
  var b = el('button', 'pill sm', 'Borrar historial');
  b.type = 'button';
  b.setAttribute('data-hc', '115');
  b.setAttribute('data-a', 'borrar-hist');
  h.appendChild(b);
}
export function exStart() {
  var pool = qPool().slice();
  if (!pool.length) {
    msg('exmsg', 'No hay preguntas con esa selección.');
    return;
  }
  if (XC.orden === 'rnd') shuffle(pool);
  var qs = pool.slice(0, Math.min(XC.n, pool.length));
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
    lim: XC.tiempo,
    modo: XC.modo,
    cfg: {
      sis: XC.sis,
      tema: XC.tema,
      dif: XC.dif,
      src: XC.src,
    },
    conf: null,
  };
  exTimer();
  showEx();
}
export function exTimer() {
  clearInterval(estado.etm);
  function tick() {
    if (!estado.EX) return;
    var s = Math.floor((Date.now() - estado.EX.t0) / 1000);
    var e = $('tm');
    if (!e) return;
    if (estado.EX.lim) {
      var r = estado.EX.lim - s;
      if (r <= 0) {
        clearInterval(estado.etm);
        exFinish(true);
        return;
      }
      e.textContent = pad(Math.floor(r / 60)) + ':' + pad(r % 60);
      e.className = 'timer' + (r <= 60 ? ' rojo' : '');
    } else e.textContent = pad(Math.floor(s / 60)) + ':' + pad(s % 60);
  }
  tick();
  estado.etm = setInterval(tick, 1000);
}
export function showEx() {
  var q = estado.EX.qs[estado.EX.i],
    n = estado.EX.qs.length;
  $('exs').style.display = 'none';
  $('exr').style.display = 'none';
  $('exq').style.display = '';
  msg('exp', 'Pregunta ' + (estado.EX.i + 1) + ' de ' + n);
  $('exbar').style.width = ((estado.EX.i + 1) / n) * 100 + '%';
  msg('exqt', q.q);
  msg(
    'exmeta',
    mn(q.m) +
      ' · ' +
      (q.t || 'Sin tema') +
      ' · ' +
      ['', 'básica', 'intermedia', 'avanzada'][q.d || 2],
  );
  var o = $('exo');
  o.textContent = '';
  var resp = estado.EX.a[estado.EX.i],
    ver = estado.EX.modo === 'practica' && resp >= 0;
  q.o.forEach(function (txt, k) {
    var cls = 'opt';
    if (resp === k) cls += ' sel';
    if (ver) {
      if (k === q.a) cls += ' ok';
      else if (k === resp) cls += ' no';
    }
    var b = el('button', cls, txt);
    b.type = 'button';
    b.setAttribute('data-hc', '115');
    b.setAttribute('data-a', 'opcion');
    b.setAttribute('data-k', String(k));
    /* El signo se anade solo cuando ya se respondio: antes delataria la correcta. */
    if (ver && (k === q.a || k === resp)) {
      var ic = el('span', 'opi', k === q.a ? '✓' : '✗');
      b.appendChild(ic);
    }
    if (ver) b.disabled = true;
    o.appendChild(b);
  });
  var m2 = $('exm2');
  m2.textContent = '';
  if (ver) {
    m2.className = 'exm2 ' + (resp === q.a ? 'bien' : 'mal');
    m2.appendChild(
      el('b', 0, resp === q.a ? '¡Correcto!' : 'Incorrecto. La respuesta es: ' + q.o[q.a]),
    );
    if (q.e) m2.appendChild(el('p', 's', q.e));
    if (resp !== q.a && q.x && q.x[resp]) m2.appendChild(el('p', 's', 'Por qué no: ' + q.x[resp]));
  }
  var f = $('exflag');
  f.textContent = estado.EX.fl[estado.EX.i] ? '⚑ Marcada para revisar' : '⚐ Marcar para revisar';
  f.className = 'pill sm' + (estado.EX.fl[estado.EX.i] ? ' gold' : '');
  $('exprev').disabled = estado.EX.i === 0;
  $('exnext').textContent = estado.EX.i === n - 1 ? 'Ir al final' : 'Siguiente →';
  xGrid();
  xConf();
}
export function xGrid() {
  var g = $('exgrid');
  if (!g) return;
  g.textContent = '';
  estado.EX.qs.forEach(function (q, i) {
    var c =
      'gq' +
      (i === estado.EX.i ? ' act' : '') +
      (estado.EX.a[i] >= 0 ? ' resp' : '') +
      (estado.EX.fl[i] ? ' fl' : '');
    var b = el('button', c, String(i + 1));
    b.type = 'button';
    b.setAttribute('data-hc', '115');
    b.setAttribute('data-a', 'ir');
    b.setAttribute('data-i', String(i));
    g.appendChild(b);
  });
  var r = estado.EX.a.filter(function (x) {
    return x >= 0;
  }).length;
  msg(
    'exstat',
    'Respondidas ' +
      r +
      ' · Pendientes ' +
      (estado.EX.qs.length - r) +
      (estado.EX.fl.filter(Boolean).length
        ? ' · Marcadas ' + estado.EX.fl.filter(Boolean).length
        : ''),
  );
}
export function xConf() {
  var c = $('exconf');
  if (!c) return;
  c.textContent = '';
  if (!estado.EX.conf) {
    c.style.display = 'none';
    return;
  }
  c.style.display = '';
  var sinResp = estado.EX.a.filter(function (x) {
    return x < 0;
  }).length;
  c.appendChild(
    el('b', 0, estado.EX.conf === 'fin' ? '¿Terminar el simulacro?' : '¿Salir del simulacro?'),
  );
  c.appendChild(
    el(
      'p',
      's',
      estado.EX.conf === 'fin'
        ? sinResp
          ? 'Quedan ' + sinResp + ' preguntas sin responder y contarán como falladas.'
          : 'Has respondido todas las preguntas.'
        : 'Se perderán las respuestas de este intento.',
    ),
  );
  var d = el('div', 'two');
  var si = el('button', 'pill', estado.EX.conf === 'fin' ? 'Sí, terminar' : 'Sí, salir');
  si.type = 'button';
  si.setAttribute('data-hc', '115');
  si.setAttribute('data-a', 'conf-si');
  var no = el('button', 'pill', 'Seguir aquí');
  no.type = 'button';
  no.setAttribute('data-hc', '115');
  no.setAttribute('data-a', 'conf-no');
  d.appendChild(si);
  d.appendChild(no);
  c.appendChild(d);
}
export function xAct(a, t, e) {
  switch (a) {
    case 'empezar':
      exStart();
      break;
    case 'opcion':
      estado.EX.a[estado.EX.i] = +t.getAttribute('data-k');
      showEx();
      break;
    case 'prev':
      if (estado.EX.i > 0) {
        estado.EX.i--;
        showEx();
      }
      break;
    case 'next':
      if (estado.EX.i < estado.EX.qs.length - 1) {
        estado.EX.i++;
        showEx();
      } else {
        estado.EX.conf = 'fin';
        xConf();
      }
      break;
    case 'ir':
      estado.EX.i = +t.getAttribute('data-i');
      showEx();
      break;
    case 'flag':
      estado.EX.fl[estado.EX.i] = !estado.EX.fl[estado.EX.i];
      showEx();
      break;
    case 'fin':
      estado.EX.conf = 'fin';
      xConf();
      break;
    case 'salir':
      estado.EX.conf = 'salir';
      xConf();
      break;
    case 'conf-no':
      estado.EX.conf = null;
      xConf();
      break;
    case 'conf-si':
      if (estado.EX.conf === 'fin') exFinish(false);
      else {
        clearInterval(estado.etm);
        estado.EX = null;
        exSetup();
      }
      break;
    case 'repetir-errores':
      xErrores();
      break;
    case 'nuevo':
      estado.EX = null;
      exSetup();
      break;
    case 'repetir':
      xRepetir();
      break;
    case 'ver-intento':
      xVer(+t.getAttribute('data-i'));
      break;
    case 'borrar-hist':
      estado.S.hist = [];
      W();
      exSetup();
      break;
    case 'volver':
      exSetup();
      break;
  }
}
export function exFinish(porTiempo) {
  clearInterval(estado.etm);
  var s = 0,
    n = estado.EX.qs.length,
    sin = 0;
  var det = estado.EX.qs.map(function (q, i) {
    var r = estado.EX.a[i],
      ok = r === q.a;
    if (ok) s++;
    if (r < 0) sin++;
    return {
      id: q.id || '',
      q: q.q,
      o: q.o,
      a: q.a,
      r: r,
      e: q.e || '',
      x: q.x || null,
      m: q.m,
      t: q.t || '',
      d: q.d || 2,
    };
  });
  var secs = Math.round((Date.now() - estado.EX.t0) / 1000);
  estado.S.hist.unshift({
    t: Date.now(),
    s: s,
    n: n,
    mod: estado.EX.cfg.sis,
    sis: estado.EX.cfg.sis,
    tema: estado.EX.cfg.tema,
    dif: estado.EX.cfg.dif,
    src: estado.EX.cfg.src,
    modo: estado.EX.modo,
    secs: secs,
    sin: sin,
    det: det,
  });
  estado.S.hist = estado.S.hist.slice(0, 40);
  log('Simulacro: ' + s + ' de ' + n);
  estHoy('q', n);
  W();
  xResult(
    {
      s: s,
      n: n,
      secs: secs,
      sin: sin,
      det: det,
      t: Date.now(),
    },
    porTiempo,
  );
  rtFinQuiz(Math.round((s / n) * 100));
}
export function xResult(h, porTiempo) {
  $('exq').style.display = 'none';
  $('exs').style.display = 'none';
  $('exr').style.display = '';
  msg('exsc', h.s + ' / ' + h.n);
  msg(
    'expc',
    Math.round((h.s / h.n) * 100) +
      '% de aciertos · ' +
      (h.n - h.s - h.sin) +
      ' falladas · ' +
      h.sin +
      ' sin responder · tiempo ' +
      pad(Math.floor(h.secs / 60)) +
      ':' +
      pad(h.secs % 60) +
      (porTiempo ? ' · se acabó el tiempo' : ''),
  );
  /* temas dominados y temas flojos */
  var porTema = {};
  h.det.forEach(function (d) {
    var k = mn(d.m) + ' · ' + d.t;
    if (!porTema[k])
      porTema[k] = {
        ok: 0,
        n: 0,
      };
    porTema[k].n++;
    if (d.r === d.a) porTema[k].ok++;
  });
  var bien = [],
    flojo = [];
  Object.keys(porTema).forEach(function (k) {
    var p = porTema[k].ok / porTema[k].n;
    (p >= 0.8 ? bien : p < 0.5 ? flojo : []).push(
      k + ' (' + porTema[k].ok + '/' + porTema[k].n + ')',
    );
  });
  var tw = $('extem');
  tw.textContent = '';
  if (bien.length) {
    tw.appendChild(el('b', 0, 'Temas dominados'));
    tw.appendChild(el('p', 's', bien.join(' · ')));
  }
  if (flojo.length) {
    tw.appendChild(el('b', 0, 'Temas para repasar'));
    tw.appendChild(el('p', 's', flojo.join(' · ')));
  }
  if (!bien.length && !flojo.length)
    tw.appendChild(
      el('p', 's', 'Resultados repartidos: no destaca ningún tema por encima ni por debajo.'),
    );
  var fall = h.det.filter(function (d) {
    return d.r !== d.a;
  }).length;
  $('exrep').style.display = fall ? '' : 'none';
  var r = $('exrv');
  r.textContent = '';
  h.det.forEach(function (d, i) {
    var ok = d.r === d.a,
      caja = el('div', 'rev' + (ok ? ' ok' : ' no'));
    caja.appendChild(el('b', 0, i + 1 + '. ' + d.q));
    var ul = el('div', 'revo');
    d.o.forEach(function (t, k) {
      var cls = 'ro' + (k === d.a ? ' c' : '') + (k === d.r && !ok ? ' w' : '');
      var li = el('div', cls, (k === d.a ? '✓ ' : k === d.r ? '✗ ' : '  ') + t);
      ul.appendChild(li);
    });
    caja.appendChild(ul);
    if (d.r < 0) caja.appendChild(el('p', 's', 'No respondiste esta pregunta.'));
    if (d.e) caja.appendChild(el('p', 's', d.e));
    if (!ok && d.r >= 0 && d.x && d.x[d.r])
      caja.appendChild(el('p', 's', 'Por qué no «' + d.o[d.r] + '»: ' + d.x[d.r]));
    /* La ficha de la estructura, solo donde hace falta: en lo que fallaste. */
    if (!ok && d.id) {
      if (estado.EST_LD !== 2) {
        estCarga(function () {
          if ($('exr') && $('exr').style.display !== 'none') xResult(h, porTiempo);
        });
      } else {
        var fes = estDePregunta(d).filter(estTieneTeoria);
        if (fes.length) {
          caja.appendChild(
            el(
              'p',
              'fhcl',
              fes.length === 1
                ? 'Repasa la estructura'
                : 'Repasa estas ' + fes.length + ' estructuras',
            ),
          );
          fes.forEach(function (e) {
            estPinta(e, caja, 'corto');
          });
        }
      }
    }
    caja.appendChild(el('small', 0, mn(d.m) + ' · ' + d.t));
    r.appendChild(caja);
  });
}
export function xErrores() {
  var h = estado.S.hist[0];
  if (!h || !h.det) return;
  var ids = h.det.filter(function (d) {
    return d.r !== d.a;
  });
  if (!ids.length) return;
  var qs = ids.map(function (d) {
    return {
      id: d.id || '',
      m: d.m,
      t: d.t,
      d: d.d,
      q: d.q,
      o: d.o,
      a: d.a,
      e: d.e,
      x: d.x,
    };
  });
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
    modo: 'practica',
    cfg: {
      sis: 'all',
      tema: 'all',
      dif: 'all',
      src: 'repaso',
    },
    conf: null,
  };
  exTimer();
  showEx();
}
export function xRepetir() {
  var h = estado.S.hist[0];
  if (!h || !h.det) return;
  var qs = h.det.map(function (d) {
    return {
      id: d.id || '',
      m: d.m,
      t: d.t,
      d: d.d,
      q: d.q,
      o: d.o,
      a: d.a,
      e: d.e,
      x: d.x,
    };
  });
  if (XC.orden === 'rnd') shuffle(qs);
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
    lim: XC.tiempo,
    modo: XC.modo,
    cfg: {
      sis: h.sis || 'all',
      tema: h.tema || 'all',
      dif: h.dif || 'all',
      src: h.src || 'banco',
    },
    conf: null,
  };
  exTimer();
  showEx();
}
export function xVer(i) {
  var h = estado.S.hist[i];
  if (!h) return;
  if (!h.det) {
    msg('exmsg', 'Ese intento es anterior a la revisión detallada: solo se guardó la puntuación.');
    return;
  }
  xResult(h, false);
}
export const RUTA = RUTA__json;
