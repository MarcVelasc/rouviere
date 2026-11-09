import { estado } from '../../estado.js';
import { BANK, MODS, W, fillMods, log, mn } from '../../core/almacenamiento.js';
import { $, el, msg, nz, shuffle } from '../../core/dom.js';
import { ANAT, anCasa, anGet } from '../anatomia/categorias.js';
import { COMP, compCasa, compGet } from '../anatomia/competencias.js';
import { renderFicha } from '../estructuras/estructuras.js';
import { estHoy } from '../progreso/progreso.js';
import { rtFinTarjetas } from '../ruta/ruta.js';
export /* sesión del modo estudio */

function allCards() {
  return BANK.concat(estado.S.cards);
}
export function cTemas(m) {
  var r = {},
    a = allCards();
  a.forEach(function (c) {
    if (m === 'all' || c.m === m) r[c.t || 'Sin tema'] = 1;
  });
  return Object.keys(r).sort(function (a, b) {
    return a.localeCompare(b, 'es');
  });
}
export function cEstado(id) {
  return estado.S.known[id] || '';
}
export function cDue(id) {
  var r = estado.S.sr[id];
  return r && r.due ? r.due : 0;
}
export function cPend() {
  var n = 0,
    now = Date.now();
  allCards().forEach(function (c) {
    var d = cDue(c.id);
    if (d && d <= now) n++;
  });
  return n;
}
export function cMatch(c) {
  /* La categoría y el sistema son excluyentes: elegir uno limpia el otro. */
  if (estado.CF.comp && estado.CF.comp !== 'all' && !compCasa(c, compGet(estado.CF.comp)))
    return false;
  if (estado.CF.cat && estado.CF.cat !== 'all' && !anCasa(c, anGet(estado.CF.cat))) return false;
  if (estado.CF.m !== 'all' && c.m !== estado.CF.m) return false;
  if (estado.CF.t !== 'all' && (c.t || 'Sin tema') !== estado.CF.t) return false;
  if (estado.CF.d !== 'all' && String(c.d || 2) !== estado.CF.d) return false;
  if (estado.CF.fav && !estado.S.fav[c.id]) return false;
  var st = cEstado(c.id);
  if (estado.CF.st === 'k' && st !== 'k') return false;
  if (estado.CF.st === 'p' && st === 'k') return false;
  if (estado.CF.st === 'h' && st !== 'h') return false;
  if (estado.CF.st === 'rep') {
    var d = cDue(c.id);
    if (!d || d > Date.now()) return false;
  }
  if (estado.CF.st === 'mias' && !c.u) return false;
  if (estado.CF.q) {
    var k = nz(estado.CF.q);
    if (nz(c.q).indexOf(k) < 0 && nz(c.a).indexOf(k) < 0 && nz(c.t || '').indexOf(k) < 0)
      return false;
  }
  return true;
}
export function buildQ(keep) {
  var a = allCards().filter(cMatch);
  estado.Q = a.map(function (c) {
    return c.id;
  });
  if (!keep || estado.qi >= estado.Q.length) estado.qi = 0;
  estado.rev = false;
  estado.hi = 0;
  estado.CED = null;
}
export function cur() {
  var id = estado.Q[estado.qi],
    a = allCards();
  for (var i = 0; i < a.length; i++) if (a[i].id === id) return a[i];
  return null;
}
export function cFilters() {
  var w = $('cflt');
  if (!w) return;
  w.textContent = '';
  function sel(id, lab, opts, val, f) {
    var b = el('div', 'fcol'),
      l = el('label', 'sl2', lab);
    l.setAttribute('for', id);
    b.appendChild(l);
    var s = document.createElement('select');
    s.id = id;
    s.className = 'in1';
    s.setAttribute('data-hh', '113');
    s.setAttribute('data-f', f);
    opts.forEach(function (o) {
      var p = el('option', 0, o[1]);
      p.value = o[0];
      if (o[0] === val) p.selected = true;
      s.appendChild(p);
    });
    b.appendChild(s);
    w.appendChild(b);
  }
  sel(
    'cpsel',
    'Competencia',
    [['all', 'Todas las competencias']].concat(
      COMP.map(function (a) {
        return [a[0], a[1].replace('Competencia ', 'C').replace(' · ', '. ')];
      }),
    ),
    estado.CF.comp,
    'comp',
  );
  sel(
    'ccsel',
    'Área',
    [['all', 'Todas las áreas']].concat(
      ANAT.map(function (a) {
        return [a[0], a[1]];
      }),
    ),
    estado.CF.cat,
    'cat',
  );
  var ms = [['all', 'Todos los sistemas']].concat(
    MODS.map(function (m) {
      return [m[0], m[1]];
    }),
  );
  sel('cmsel', 'Sistema', ms, estado.CF.m, 'm');
  var ts = [['all', 'Todos los temas']].concat(
    cTemas(estado.CF.m).map(function (t) {
      return [t, t];
    }),
  );
  sel('ctsel', 'Tema', ts, estado.CF.t, 't');
  sel(
    'cdsel',
    'Dificultad',
    [
      ['all', 'Cualquiera'],
      ['1', 'Básica'],
      ['2', 'Intermedia'],
      ['3', 'Avanzada'],
    ],
    estado.CF.d,
    'd',
  );
  sel(
    'cfsel',
    'Estado',
    [
      ['all', 'Todas'],
      ['p', 'Pendientes'],
      ['k', 'Conocidas'],
      ['h', 'Difíciles'],
      ['rep', 'Toca repasar hoy'],
      ['mias', 'Solo las mías'],
    ],
    estado.CF.st,
    'st',
  );
}
export function cChips() {
  var w = $('cchips');
  if (!w) return;
  w.textContent = '';
  var f = el(
    'button',
    'chip2' + (estado.CF.fav ? ' on' : ''),
    (estado.CF.fav ? '★ ' : '☆ ') + 'Favoritas',
  );
  f.type = 'button';
  f.setAttribute('data-hc', '112');
  f.setAttribute('data-a', 'fav-filtro');
  w.appendChild(f);
  var n = cPend();
  var r = el('button', 'chip2' + (estado.CF.st === 'rep' ? ' on' : ''), 'Repasos de hoy: ' + n);
  r.type = 'button';
  r.setAttribute('data-hc', '112');
  r.setAttribute('data-a', 'repasos');
  w.appendChild(r);
  var sucio =
    estado.CF.m !== 'all' ||
    estado.CF.t !== 'all' ||
    estado.CF.d !== 'all' ||
    estado.CF.st !== 'all' ||
    estado.CF.q ||
    estado.CF.fav;
  if (sucio) {
    var c = el('button', 'chip2', 'Quitar filtros ×');
    c.type = 'button';
    c.setAttribute('data-hc', '112');
    c.setAttribute('data-a', 'limpiar');
    w.appendChild(c);
  }
}
export function show() {
  cFilters();
  cChips();
  var c = cur(),
    e = !c;
  ['fc', 'cin', 'cctl', 'csr'].forEach(function (i) {
    if ($(i)) $(i).style.display = e ? 'none' : '';
  });
  if ($('cem')) $('cem').style.display = e ? '' : 'none';
  if ($('cedit')) $('cedit').style.display = estado.CED ? '' : 'none';
  if ($('cdel')) $('cdel').style.display = c && c.u ? '' : 'none';
  if ($('cedb')) $('cedb').style.display = c && c.u ? '' : 'none';
  if (e) {
    msg('cpos', '0 de 0');
    msg('cst', '');
    return;
  }
  var dif = ['', 'Básica', 'Intermedia', 'Avanzada'][c.d || 2];
  $('fs').textContent =
    (estado.rev ? 'Respuesta' : 'Pregunta') + ' · ' + mn(c.m) + ' · ' + (c.t || 'Sin tema');
  $('ft').textContent = estado.rev ? c.a : c.q;
  var ex = $('fx');
  if (ex) {
    ex.textContent = estado.rev && c.e ? c.e : '';
    ex.style.display = estado.rev && c.e ? '' : 'none';
  }
  msg('cpos', estado.qi + 1 + ' de ' + estado.Q.length);
  var pb = $('cbar');
  if (pb)
    pb.style.width =
      (estado.Q.length ? Math.max(1, Math.round(((estado.qi + 1) / estado.Q.length) * 100)) : 0) +
      '%';
  var k = 0,
    h = 0;
  estado.Q.forEach(function (id) {
    var s = cEstado(id);
    if (s === 'k') k++;
    if (s === 'h') h++;
  });
  msg('cst', 'Conocidas ' + k + ' · Difíciles ' + h + ' · ' + dif);
  /* Resumen de los filtros en el propio título del plegable: así se sabe qué hay puesto
     sin tener que abrirlo. */
  var aj = $('caj');
  if (aj) {
    var sm = aj.querySelector('summary');
    var pt = [];
    if (estado.CF.comp !== 'all') {
      var cp = compGet(estado.CF.comp);
      if (cp) pt.push(cp[1]);
    }
    if (estado.CF.cat !== 'all') {
      var ar = anGet(estado.CF.cat);
      if (ar) pt.push(ar[1]);
    }
    if (estado.CF.m !== 'all') pt.push(mn(estado.CF.m));
    if (estado.CF.t !== 'all') pt.push(estado.CF.t);
    if (estado.CF.d !== 'all') pt.push(['', 'básica', 'intermedia', 'avanzada'][+estado.CF.d]);
    if (estado.CF.st !== 'all')
      pt.push(
        {
          k: 'conocidas',
          p: 'pendientes',
          h: 'difíciles',
          rep: 'de repaso',
          mias: 'mías',
        }[estado.CF.st] || '',
      );
    if (sm) sm.textContent = pt.length ? 'Filtros · ' + pt.join(' · ') : 'Filtros';
    /* Si se llega con un filtro puesto (por ejemplo desde un área), se abre solo:
       así se ve de dónde sale el mazo y se puede quitar. */
    if (pt.length) aj.open = true;
  }
  var fb = $('cfavb');
  if (fb) fb.textContent = estado.S.fav[c.id] ? '★ Quitar de favoritas' : '☆ Favorita';
  var o = $('corig');
  if (o)
    o.textContent = c.u ? 'Tarjeta tuya' : 'Banco de ROUVIÈRE · contenido sin revisión docente';
  renderFicha();
  var sr = $('csrt');
  if (sr) {
    var r = estado.S.sr[c.id];
    sr.textContent =
      r && r.due
        ? 'Próximo repaso: ' +
          new Date(r.due).toLocaleDateString('es') +
          ' · intervalo ' +
          r.iv +
          ' d'
        : 'Sin programar';
  }
}
export function cSet(f, v) {
  /* competencia, área y sistema son tres formas de cortar lo mismo: elegir una
     limpia las otras, para que nunca haya dos filtros diciendo cosas distintas. */
  if (f === 'comp') {
    estado.CF.comp = v;
    estado.CF.cat = 'all';
    estado.CF.m = 'all';
    estado.CF.t = 'all';
  } else if (f === 'cat') {
    estado.CF.cat = v;
    estado.CF.comp = 'all';
    estado.CF.m = 'all';
    estado.CF.t = 'all';
  } else if (f === 'm') {
    estado.CF.m = v;
    estado.CF.t = 'all';
    estado.CF.cat = 'all';
    estado.CF.comp = 'all';
  } else estado.CF[f] = v;
  buildQ();
  msg('hn', '');
  show();
}
export function cBusca(v) {
  estado.CF.q = v;
  buildQ();
  show();
}
export function cAct(a, t, e) {
  switch (a) {
    case 'flip':
      if (cur()) {
        estado.rev = !estado.rev;
        show();
      }
      break;
    case 'nav':
      nxC(+t.getAttribute('data-d'));
      break;
    case 'pista':
      cHint();
      break;
    case 'comprobar':
      cChk();
      break;
    case 'marcar':
      cMark(t.getAttribute('data-v'));
      break;
    case 'fav':
      cFav();
      break;
    case 'fav-filtro':
      estado.CF.fav = !estado.CF.fav;
      buildQ();
      show();
      break;
    case 'repasos':
      estado.CF.st = estado.CF.st === 'rep' ? 'all' : 'rep';
      buildQ();
      show();
      break;
    case 'limpiar':
      estado.CF = {
        comp: 'all',
        cat: 'all',
        m: 'all',
        t: 'all',
        d: 'all',
        st: 'all',
        q: '',
        fav: false,
      };
      if ($('cq2')) $('cq2').value = '';
      buildQ();
      show();
      break;
    case 'barajar':
      if (estado.Q.length) {
        shuffle(estado.Q);
        estado.qi = 0;
        estado.rev = false;
        estado.hi = 0;
        msg('hn', 'Tarjetas barajadas.');
        show();
      }
      break;
    case 'reiniciar':
      cRst();
      break;
    case 'sr':
      srGrade(t.getAttribute('data-g'));
      break;
    case 'estudio':
      stStart();
      break;
    case 'st-ver':
      estado.ST.rev = true;
      stShow();
      break;
    case 'st-grado':
      stGrade(+t.getAttribute('data-g'));
      break;
    case 'st-salir':
      estado.ST = null;
      $('cstudy').style.display = 'none';
      $('cmain').style.display = '';
      buildQ();
      show();
      break;
    case 'st-fallos':
      stRepeat();
      break;
    case 'crear':
      cAdd();
      break;
    case 'editar':
      cEditStart();
      break;
    case 'guardar-edicion':
      cEditSave();
      break;
    case 'cancelar-edicion':
      estado.CED = null;
      show();
      break;
    case 'borrar':
      cDel();
      break;
    case 'exp-json':
      cExport('json');
      break;
    case 'exp-csv':
      cExport('csv');
      break;
  }
}
export function nxC(d) {
  if (!estado.Q.length) return;
  estado.qi = (estado.qi + d + estado.Q.length) % estado.Q.length;
  estado.rev = false;
  estado.hi = 0;
  if ($('ans')) $('ans').value = '';
  msg('hn', '');
  show();
}
export function cHint() {
  var c = cur();
  if (!c) return;
  var H = c.h || [];
  if (!H.length) {
    msg('hn', 'Esta tarjeta no tiene pistas.');
    return;
  }
  if (estado.hi < H.length) {
    msg('hn', 'Pista ' + (estado.hi + 1) + ' de ' + H.length + ': ' + H[estado.hi]);
    estado.hi++;
  } else msg('hn', 'No quedan más pistas. Toca la tarjeta para ver la respuesta.');
}

/* Comprobación tolerante: acepta la respuesta si contiene alguna de las claves,
   o si coincide en buena parte con la respuesta escrita. No exige literalidad. */
export function cChk() {
  var c = cur();
  if (!c) return;
  var a = nz($('ans').value);
  if (!a) {
    msg('hn', 'Escribe primero lo que recuerdas.');
    return;
  }
  var ok = false;
  if (c.k && c.k.length)
    ok = c.k.some(function (k) {
      return nz(k) && a.indexOf(nz(k)) >= 0;
    });
  if (!ok) {
    var r = nz(c.a);
    if (a.length >= 4 && (r.indexOf(a) >= 0 || a.indexOf(r) >= 0)) ok = true;
    else {
      var pa = a.split(/\s+/).filter(function (w) {
          return w.length > 3;
        }),
        pr = r.split(/\s+/).filter(function (w) {
          return w.length > 3;
        });
      if (pr.length) {
        var c2 = pr.filter(function (w) {
          return pa.indexOf(w) >= 0;
        }).length;
        if (c2 / pr.length >= 0.6) ok = true;
      }
    }
  }
  if (ok) {
    estado.rev = true;
    show();
    msg('hn', 'Correcto. Mira la respuesta completa por si te dejaste algo.');
  } else msg('hn', 'Todavía no. Pide una pista o toca la tarjeta para ver la respuesta.');
}
export function cMark(v) {
  var c = cur();
  if (!c) return;
  if (estado.S.known[c.id] === v) delete estado.S.known[c.id];
  else estado.S.known[c.id] = v;
  log(
    'Tarjeta ' +
      ({
        k: 'conocida',
        p: 'pendiente',
        h: 'difícil',
      }[v] || v) +
      ': ' +
      c.q.slice(0, 45),
  );
  estHoy('c');
  W();
  var p = estado.qi;
  buildQ(true);
  estado.qi = Math.min(p, Math.max(estado.Q.length - 1, 0));
  estado.rev = false;
  estado.hi = 0;
  if ($('ans')) $('ans').value = '';
  msg('hn', '');
  show();
}
export function cFav() {
  var c = cur();
  if (!c) return;
  if (estado.S.fav[c.id]) delete estado.S.fav[c.id];
  else estado.S.fav[c.id] = 1;
  W();
  buildQ(true);
  show();
}
export function cRst() {
  allCards().forEach(function (c) {
    if (cMatch(c)) {
      delete estado.S.known[c.id];
      delete estado.S.sr[c.id];
    }
  });
  log('Sesión de tarjetas reiniciada');
  W();
  buildQ();
  msg('hn', 'Sesión reiniciada en las tarjetas filtradas.');
  show();
}

/* Repetición espaciada (SM-2 simplificado) */
export function srGrade(g) {
  var c = cur();
  if (!c) return;
  g = +g;
  var r = estado.S.sr[c.id] || {
    n: 0,
    ef: 2.5,
    iv: 0,
  };
  if (g === 0) {
    r.n = 0;
    r.iv = 0;
    estado.S.known[c.id] = 'h';
  } else {
    r.ef = Math.max(1.3, r.ef + (0.1 - (3 - g) * (0.08 + (3 - g) * 0.02)));
    r.n++;
    r.iv = r.n === 1 ? 1 : r.n === 2 ? 3 : Math.round((r.iv || 3) * r.ef);
    if (g === 1) r.iv = Math.max(1, Math.round(r.iv * 0.6));
    if (g === 3) estado.S.known[c.id] = 'k';
  }
  r.last = Date.now();
  r.due = Date.now() + (r.iv || 0) * 864e5;
  estado.S.sr[c.id] = r;
  estHoy('c');
  W();
  msg(
    'hn',
    g === 0
      ? 'Vuelve a salir hoy.'
      : 'Siguiente repaso en ' + r.iv + (r.iv === 1 ? ' día.' : ' días.'),
  );
  nxC(1);
}

/* Modo estudio: responder sin ver la solución y revisar los fallos al final */
export function stStart() {
  var ids = estado.Q.slice();
  if (!ids.length) {
    msg('hn', 'No hay tarjetas con este filtro.');
    return;
  }
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
export function stCur() {
  var id = estado.ST.ids[estado.ST.i],
    a = allCards();
  for (var i = 0; i < a.length; i++) if (a[i].id === id) return a[i];
  return null;
}
export function stShow() {
  var c = stCur();
  if (!c || estado.ST.i >= estado.ST.ids.length) {
    stEnd();
    return;
  }
  msg('stpos', 'Tarjeta ' + (estado.ST.i + 1) + ' de ' + estado.ST.ids.length);
  $('stbar').style.width = (estado.ST.i / estado.ST.ids.length) * 100 + '%';
  msg('stq', c.q);
  var r = $('stresp');
  r.textContent = '';
  r.style.display = estado.ST.rev ? '' : 'none';
  if (estado.ST.rev) {
    r.appendChild(el('b', 0, c.a));
    if (c.e) r.appendChild(el('p', 's', c.e));
  }
  $('stver').style.display = estado.ST.rev ? 'none' : '';
  $('stgr').style.display = estado.ST.rev ? '' : 'none';
  $('stfin').textContent = '';
}
export function stGrade(g) {
  var c = stCur();
  if (!c) return;
  if (g === 0) estado.ST.mal.push(c.id);
  else estado.ST.bien++;
  srGradeId(c.id, g);
  estado.ST.i++;
  estado.ST.rev = false;
  stShow();
}
export function srGradeId(id, g) {
  var r = estado.S.sr[id] || {
    n: 0,
    ef: 2.5,
    iv: 0,
  };
  if (g === 0) {
    r.n = 0;
    r.iv = 0;
    estado.S.known[id] = 'h';
  } else {
    r.ef = Math.max(1.3, r.ef + (0.1 - (3 - g) * (0.08 + (3 - g) * 0.02)));
    r.n++;
    r.iv = r.n === 1 ? 1 : r.n === 2 ? 3 : Math.round((r.iv || 3) * r.ef);
    if (g === 3) estado.S.known[id] = 'k';
  }
  r.last = Date.now();
  r.due = Date.now() + (r.iv || 0) * 864e5;
  estado.S.sr[id] = r;
  estHoy('c');
  W();
}
export function stEnd() {
  var t = estado.ST.ids.length;
  msg('stpos', 'Sesión terminada');
  $('stbar').style.width = '100%';
  msg('stq', 'Has repasado ' + t + ' ' + (t === 1 ? 'tarjeta' : 'tarjetas') + '.');
  var r = $('stresp');
  r.textContent = '';
  r.style.display = '';
  r.appendChild(
    el('b', 0, 'Acertadas: ' + estado.ST.bien + ' · Para repetir: ' + estado.ST.mal.length),
  );
  if (estado.ST.mal.length) {
    var ul = el('ul', 'vl');
    estado.ST.mal.slice(0, 10).forEach(function (id) {
      var c = allCards().filter(function (x) {
        return x.id === id;
      })[0];
      if (c) ul.appendChild(el('li', 0, c.q));
    });
    r.appendChild(ul);
  }
  $('stver').style.display = 'none';
  $('stgr').style.display = 'none';
  var f = $('stfin');
  f.textContent = '';
  if (estado.ST.mal.length) {
    var b = el('button', 'pill', 'Repetir las que fallaste');
    b.type = 'button';
    b.setAttribute('data-hc', '112');
    b.setAttribute('data-a', 'st-fallos');
    f.appendChild(b);
  }
  log('Modo estudio: ' + estado.ST.bien + ' de ' + t);
  rtFinTarjetas();
}
export function stRepeat() {
  estado.ST = {
    ids: estado.ST.mal.slice(),
    i: 0,
    rev: false,
    mal: [],
    bien: 0,
  };
  stShow();
}

/* Crear, editar, borrar y exportar */
export function cAdd() {
  var q = $('cq').value.trim(),
    a = $('ca').value.trim(),
    h = $('ch').value.trim(),
    m = $('cmod').value,
    t = $('ctema').value.trim(),
    d = $('cdif').value;
  if (q.length < 3 || !a) {
    msg('cmsg', 'Escribe la pregunta (mínimo 3 letras) y la respuesta.');
    return;
  }
  estado.S.cards.push({
    id: 'u' + Date.now() + Math.floor(Math.random() * 1000),
    m: m,
    t: t || 'Mis tarjetas',
    d: +d,
    q: q.slice(0, 300),
    a: a.slice(0, 500),
    e: '',
    h: h ? [h.slice(0, 200)] : [],
    k: [],
    u: true,
  });
  W();
  log('Tarjeta creada: ' + q.slice(0, 40));
  $('cq').value = '';
  $('ca').value = '';
  $('ch').value = '';
  $('ctema').value = '';
  msg('cmsg', 'Tarjeta guardada en este dispositivo.');
  buildQ(true);
  show();
}
export function cEditStart() {
  var c = cur();
  if (!c || !c.u) return;
  estado.CED = c.id;
  $('eq').value = c.q;
  $('ea').value = c.a;
  $('eh').value = (c.h && c.h[0]) || '';
  $('etema').value = c.t || '';
  $('emod').value = c.m;
  $('edif').value = String(c.d || 2);
  show();
}
export function cEditSave() {
  if (!estado.CED) return;
  var q = $('eq').value.trim(),
    a = $('ea').value.trim();
  if (q.length < 3 || !a) {
    msg('cmsg2', 'Escribe la pregunta y la respuesta.');
    return;
  }
  estado.S.cards.forEach(function (c) {
    if (c.id === estado.CED) {
      c.q = q.slice(0, 300);
      c.a = a.slice(0, 500);
      c.h = $('eh').value.trim() ? [$('eh').value.trim().slice(0, 200)] : [];
      c.t = $('etema').value.trim() || 'Mis tarjetas';
      c.m = $('emod').value;
      c.d = +$('edif').value;
    }
  });
  W();
  log('Tarjeta editada');
  estado.CED = null;
  msg('cmsg2', '');
  buildQ(true);
  show();
}
export function cDel() {
  var c = cur();
  if (!c || !c.u) return;
  estado.S.cards = estado.S.cards.filter(function (x) {
    return x.id !== c.id;
  });
  delete estado.S.known[c.id];
  delete estado.S.fav[c.id];
  delete estado.S.sr[c.id];
  W();
  log('Tarjeta eliminada');
  estado.CED = null;
  buildQ(true);
  show();
}
export function bajar(nombre, txt, tipo) {
  try {
    var b = new Blob([txt], {
        type: tipo,
      }),
      u = URL.createObjectURL(b),
      a = document.createElement('a');
    a.href = u;
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      URL.revokeObjectURL(u);
      a.remove();
    }, 500);
    return true;
  } catch (e) {
    return false;
  }
}
export function cExport(f) {
  var a = allCards().filter(cMatch);
  if (!a.length) {
    msg('cmsg3', 'No hay tarjetas con el filtro actual.');
    return;
  }
  var ok;
  if (f === 'json')
    ok = bajar(
      'tarjetas-rouviere.json',
      JSON.stringify(
        a.map(function (c) {
          return {
            sistema: c.m,
            tema: c.t || '',
            dificultad: c.d || 2,
            pregunta: c.q,
            respuesta: c.a,
            explicacion: c.e || '',
            pistas: c.h || [],
            propia: !!c.u,
          };
        }),
        null,
        1,
      ),
      'application/json',
    );
  else {
    var esc = function (s) {
        return '"' + String(s == null ? '' : s).replace(/"/g, '""') + '"';
      },
      l = ['sistema,tema,dificultad,pregunta,respuesta,explicacion,pista'];
    a.forEach(function (c) {
      l.push(
        [c.m, c.t || '', c.d || 2, c.q, c.a, c.e || '', (c.h && c.h[0]) || ''].map(esc).join(','),
      );
    });
    ok = bajar('tarjetas-rouviere.csv', '﻿' + l.join('\n'), 'text/csv');
  }
  msg(
    'cmsg3',
    ok
      ? 'Descargadas ' + a.length + ' tarjetas en ' + f.toUpperCase() + '.'
      : 'Tu navegador bloqueó la descarga.',
  );
}
export function cImport(f) {
  if (!f) return;
  var r = new FileReader();
  r.onload = function () {
    try {
      var txt = String(r.result),
        nuevas = [];
      if (/^\s*\[/.test(txt)) {
        JSON.parse(txt).forEach(function (o) {
          if (o && o.pregunta && o.respuesta) {
            var n2 = {
              m: o.sistema || 'oseo',
              t: o.tema || 'Importadas',
              d: +o.dificultad || 2,
              q: String(o.pregunta),
              a: String(o.respuesta),
              e: String(o.explicacion || ''),
              h: Array.isArray(o.pistas) ? o.pistas : [],
            };
            ['ub', 'car', 'rel', 'oi', 'inerv', 'vasc', 'dren', 'imp'].forEach(function (kk) {
              if (o[kk]) n2[kk] = String(o[kk]);
            });
            nuevas.push(n2);
          }
        });
      } else {
        var ls = txt
          .replace(/\r/g, '')
          .split('\n')
          .filter(function (x) {
            return x.trim();
          });
        var cab = ls.shift().toLowerCase().indexOf('pregunta') >= 0;
        if (!cab) ls.unshift('');
        ls.forEach(function (l) {
          if (!l.trim()) return;
          var p = l.match(/("([^"]|"")*"|[^,]*)(,|$)/g) || [];
          var v = p.map(function (x) {
            return x.replace(/,$/, '').replace(/^"|"$/g, '').replace(/""/g, '"');
          });
          if (v.length >= 5 && v[3] && v[4]) {
            var o = {
              m: v[0] || 'oseo',
              t: v[1] || 'Importadas',
              d: +v[2] || 2,
              q: v[3],
              a: v[4],
              e: v[5] || '',
              h: v[6] ? [v[6]] : [],
            };
            /* columnas opcionales de la ficha, en el orden de FICHA */
            ['ub', 'car', 'rel', 'oi', 'inerv', 'vasc', 'dren', 'imp'].forEach(function (kk, ii) {
              if (v[7 + ii]) o[kk] = v[7 + ii];
            });
            nuevas.push(o);
          }
        });
      }
      if (!nuevas.length) {
        msg('cmsg3', 'No encontré tarjetas válidas en ese archivo.');
        return;
      }
      var hay = {};
      allCards().forEach(function (c) {
        hay[nz(c.q)] = c;
      });
      var n = 0,
        rep = 0,
        amp = 0;
      nuevas.forEach(function (c) {
        var vieja = hay[nz(c.q)];
        if (vieja) {
          /* La pregunta ya está. Si la fila trae teoría que la tarjeta no tenía, se completa
             en lugar de tirarla: así sirve la plantilla de las 335 fichas. */
          var toco = false;
          FIC_K.forEach(function (k) {
            if (c[k] && !vieja[k]) {
              vieja[k] = String(c[k]).slice(0, 600);
              toco = true;
            }
          });
          if (toco) {
            amp++;
            if (!vieja.u) {
              var g = estado.S.fic[vieja.id] || {};
              FIC_K.forEach(function (k) {
                if (vieja[k]) g[k] = vieja[k];
              });
              estado.S.fic[vieja.id] = g;
            }
          } else rep++;
          return;
        }
        hay[nz(c.q)] = c;
        n++;
        if (
          MODS.map(function (m) {
            return m[0];
          }).indexOf(c.m) < 0
        )
          c.m = 'oseo';
        var nu = {
          id: 'u' + Date.now() + Math.floor(Math.random() * 100000),
          m: c.m,
          t: c.t,
          d: c.d,
          q: c.q.slice(0, 300),
          a: c.a.slice(0, 500),
          e: c.e.slice(0, 400),
          h: c.h,
          k: [],
          u: true,
        };
        ['ub', 'car', 'rel', 'oi', 'inerv', 'vasc', 'dren', 'imp'].forEach(function (kk) {
          if (c[kk]) nu[kk] = String(c[kk]).slice(0, 600);
        });
        estado.S.cards.push(nu);
      });
      W();
      log('Importadas ' + n + ' tarjetas' + (amp ? ' y completadas ' + amp : ''));
      var av = [];
      if (n)
        av.push(n === 1 ? 'Importada 1 tarjeta nueva' : 'Importadas ' + n + ' tarjetas nuevas');
      if (amp)
        av.push(
          (amp === 1
            ? '1 tarjeta que ya tenías se completó'
            : amp + ' tarjetas que ya tenías se completaron') + ' con la teoría del archivo',
        );
      if (rep)
        av.push(
          rep === 1
            ? '1 fila repetida sin nada nuevo, no se duplicó'
            : rep + ' filas repetidas sin nada nuevo, no se duplicaron',
        );
      msg('cmsg3', av.join(' · ') + '.');
      buildQ(true);
      show();
    } catch (err) {
      msg('cmsg3', 'No pude leer el archivo: ' + err.message);
    }
  };
  r.onerror = function () {
    msg('cmsg3', 'No pude leer el archivo.');
  };
  r.readAsText(f);
}

/* Campos de ficha que el usuario importó sobre tarjetas del banco. Se vuelcan al
   arrancar, porque BANK vive en el código y lo importado vive en localStorage. */
export const FIC_K = ['ub', 'car', 'rel', 'oi', 'inerv', 'vasc', 'dren', 'imp'];
export function ficAplica() {
  if (!estado.S.fic) return;
  var ix = {};
  BANK.forEach(function (c) {
    ix[c.id] = c;
  });
  Object.keys(estado.S.fic).forEach(function (id) {
    var c = ix[id],
      o = estado.S.fic[id];
    if (!c || !o) return;
    FIC_K.forEach(function (k) {
      if (o[k]) c[k] = String(o[k]);
    });
  });
}
export function cStats() {
  var w = $('cstats');
  if (!w) return;
  w.textContent = '';
  var a = allCards(),
    k = 0,
    p = 0,
    h = 0,
    f = 0,
    sr = 0,
    now = Date.now();
  a.forEach(function (c) {
    var s = cEstado(c.id);
    if (s === 'k') k++;
    else if (s === 'h') h++;
    else p++;
    if (estado.S.fav[c.id]) f++;
    var d = cDue(c.id);
    if (d && d <= now) sr++;
  });
  [
    ['Tarjetas en el banco', String(BANK.length)],
    ['Tarjetas tuyas', String(estado.S.cards.length)],
    ['Dominadas', k + ' de ' + a.length],
    ['Marcadas como difíciles', String(h)],
    ['Sin marcar', String(p)],
    ['Favoritas', String(f)],
    ['Tocan hoy', String(sr)],
  ].forEach(function (r) {
    var d = el('div', 'item');
    d.appendChild(el('b', 0, r[0]));
    d.appendChild(el('small', 0, r[1]));
    w.appendChild(d);
  });
}
export function renderCards() {
  if ($('cmod') && !$('cmod').options.length) fillMods('cmod');
  if ($('emod') && !$('emod').options.length) fillMods('emod');
  buildQ(true);
  show();
  cStats();
}

/* ===== simulacros ===== */
