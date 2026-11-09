import { estado } from '../../estado.js';
import { BANK, QB, mn } from '../../core/almacenamiento.js';
import { $, el, nz } from '../../core/dom.js';
import { apAbrir } from '../atlas/apartados.js';
import { ATL_AP } from '../atlas/atlas-sistemas.js';
import { gEstrLista, gEstructura } from '../atlas/buscar-estructuras.js';
import { haIndex, haShort } from '../atlas/human-atlas.js';
import { LIB, lbHay, renderLib } from '../biblioteca/biblioteca.js';
import { fueraRec } from '../embriologia/histologia-embriologia.js';
import { mvpVale } from '../mvp/mvp.js';
import { RUTA, XC, exSetup, qAll } from '../simulacros/simulacros.js';
import { allCards, renderCards } from '../tarjetas/tarjetas.js';
export function gBuscar(v) {
  clearTimeout(estado.GT);
  var q = String(v || '').trim();
  var x = $('gqx');
  if (x) x.hidden = !q;
  estado.GT = setTimeout(function () {
    gPinta(q);
  }, 160);
}
export function gRes(q) {
  var n = nz(q),
    out = [];
  if (n.length < 2) return out;
  /* Las secciones se ordenan por lo cerca que queda la coincidencia del nombre:
     buscar «progreso» tiene que dar Progreso antes que Ruta, aunque «progreso»
     también esté entre las palabras clave del caminito. */
  var secs = [];
  estado.GSEC.forEach(function (c) {
    var t = nz(c[1]),
      pos = t.indexOf(n),
      r = -1;
    if (t === n) r = 0;
    else if (pos === 0) r = 1;
    else if (pos > 0) r = 2;
    else if (nz(c[2]).indexOf(n) >= 0) r = 3;
    else if (nz(c[3]).indexOf(n) >= 0) r = 4;
    if (r >= 0 && mvpVale(c[0]))
      secs.push({
        r: r,
        o: {
          t: 'Sección',
          n: c[1],
          d: c[2],
          go: function () {
            location.hash = '#' + c[0];
          },
        },
      });
  });
  secs.sort(function (a, b) {
    return a.r - b.r;
  });
  secs.forEach(function (x) {
    out.push(x.o);
  });
  if (typeof LIB !== 'undefined' && mvpVale('biblioteca'))
    LIB.filter(function (r) {
      return !fueraRec(r) && lbHay(r).indexOf(n) >= 0;
    })
      .slice(0, 4)
      .forEach(function (r) {
        out.push({
          t: 'Biblioteca',
          n: r.tit,
          d: r.org,
          go: function () {
            estado.lbq = q;
            estado.lbcat = 'all';
            estado.lbkind = 'all';
            estado.lbidi = 'all';
            estado.lbview = 'all';
            estado.lbPage = 1;
            location.hash = '#biblioteca';
            setTimeout(function () {
              var e = $('lbq');
              if (e) e.value = q;
              renderLib();
            }, 60);
          },
        });
      });
  if (typeof BANK !== 'undefined') {
    var cc = allCards()
      .filter(function (c) {
        return nz(c.q + ' ' + c.a + ' ' + (c.t || '')).indexOf(n) >= 0;
      })
      .slice(0, 4);
    cc.forEach(function (c) {
      out.push({
        t: 'Tarjeta',
        n: c.q,
        d: mn(c.m) + (c.t ? ' · ' + c.t : ''),
        go: function () {
          estado.CF.m = 'all';
          estado.CF.t = 'all';
          estado.CF.d = 'all';
          estado.CF.st = 'all';
          estado.CF.fav = false;
          estado.CF.q = q;
          location.hash = '#tarjetas';
          setTimeout(function () {
            var e = $('cq');
            if (e) e.value = q;
            renderCards();
          }, 60);
        },
      });
    });
  }
  if (typeof ATL_AP !== 'undefined' && mvpVale('atlas'))
    ATL_AP.forEach(function (a) {
      if (out.length < 14 && nz(a.n + ' ' + (a.d || '')).indexOf(n) >= 0)
        out.push({
          t: 'Atlas 3D',
          n: a.n,
          d: a.parts ? a.parts.length + ' estructuras' : 'modelo propio',
          go: function () {
            location.hash = '#atlas';
            setTimeout(function () {
              apAbrir(a.k);
            }, 300);
          },
        });
    });
  if (typeof estado.HA_MAP !== 'undefined' && mvpVale('atlas')) {
    var est = gEstrLista(n);
    est.forEach(function (p) {
      out.push({
        t: 'Estructura',
        n: p.n,
        d:
          'Atlas 3D · ' +
          (typeof haShort === 'function' ? haShort(p.g || '', p.g || '') : '') +
          (p.e && nz(p.e).indexOf(n) >= 0 && nz(p.n).indexOf(n) < 0 ? ' · ' + p.e : ''),
        go: function () {
          gEstructura(p.i);
        },
      });
    });
    /* Si el índice aún no está cargado, la oferta de cargarlo va al pie de la lista,
       no entre los resultados: no es una coincidencia, es una acción. */
  }

  /* Las preguntas del banco también se buscan: eran 319 y no entraban. */
  if (typeof QB !== 'undefined' && mvpVale('simulacros')) {
    qAll()
      .filter(function (x) {
        return nz(x.q + ' ' + (x.t || '')).indexOf(n) >= 0;
      })
      .slice(0, 3)
      .forEach(function (x) {
        out.push({
          t: 'Pregunta',
          n: x.q,
          d: mn(x.m) + (x.t ? ' · ' + x.t : ''),
          go: function () {
            XC.cat = 'all';
            XC.sis = x.m;
            XC.tema = x.t || 'all';
            location.hash = '#simulacros';
            setTimeout(function () {
              if (typeof exSetup === 'function') exSetup();
            }, 60);
          },
        });
      });
  }
  if (typeof RUTA !== 'undefined' && mvpVale('ruta'))
    RUTA.forEach(function (u) {
      if (out.length < 18 && nz(u.n).indexOf(n) >= 0)
        out.push({
          t: 'Ruta',
          n: u.n,
          d: u.nodos ? u.nodos.length + ' nodos' : 'unidad del caminito',
          go: function () {
            location.hash = '#ruta';
          },
        });
    });
  return out.slice(0, 16);
}

/* El pie del desplegable: aparece mientras el índice de las 2.234 estructuras no esté
   en memoria, para que nadie se quede pensando que su estructura no existe. */
export function gPie(w, q) {
  if (
    typeof estado.HA_IX === 'undefined' ||
    estado.HA_IX ||
    !mvpVale('atlas') ||
    String(q).length < 3
  )
    return;
  var b = el('button', 'bqo bqmas');
  b.type = 'button';
  b.setAttribute('data-hc', '141');
  b.appendChild(el('span', 'bqt', 'Atlas 3D'));
  var d = el('span', 'bqn');
  d.appendChild(el('b', 0, 'Buscar «' + q + '» entre las 2.234 estructuras'));
  d.appendChild(el('small', 0, 'Carga el índice del atlas, una sola vez por visita'));
  b.appendChild(d);
  w.appendChild(b);
}
export function gCargaIx() {
  var i = $('gq'),
    q = i ? i.value : '';
  var w = $('gres');
  if (w) {
    w.textContent = '';
    w.appendChild(el('p', 'bqe', 'Cargando el índice del atlas…'));
    w.hidden = false;
  }
  haIndex(function () {
    gPinta(q);
  });
}
export function gPinta(q) {
  var w = $('gres'),
    inp = $('gq');
  if (!w) return;
  var r = gRes(q);
  w.textContent = '';
  if (!q || q.length < 2) {
    w.hidden = true;
    if (inp) inp.setAttribute('aria-expanded', 'false');
    return;
  }
  if (!r.length) {
    w.appendChild(
      el('p', 'bqe', 'Nada coincide con «' + q + '». Prueba con una palabra más corta.'),
    );
    gPie(w, q);
    w.hidden = false;
    if (inp) inp.setAttribute('aria-expanded', 'true');
    return;
  }
  r.forEach(function (x, i) {
    var b = el('button', 'bqo');
    b.type = 'button';
    b.setAttribute('role', 'option');
    b.setAttribute('data-hc', '134');
    b.setAttribute('data-i', String(i));
    b.appendChild(el('span', 'bqt', x.t));
    var d = el('span', 'bqn');
    d.appendChild(el('b', 0, x.n));
    if (x.d) d.appendChild(el('small', 0, x.d));
    b.appendChild(d);
    w.appendChild(b);
  });
  gPie(w, q);
  estado.GLAST = r;
  w.hidden = false;
  if (inp) inp.setAttribute('aria-expanded', 'true');
}
export function gAbrir(i) {
  var x = estado.GLAST[+i];
  if (!x) return;
  gCerrar();
  x.go();
}
export function gCerrar() {
  var w = $('gres');
  if (w) {
    w.hidden = true;
    w.textContent = '';
  }
  var i = $('gq');
  if (i) i.setAttribute('aria-expanded', 'false');
}
export function gLimpia() {
  var i = $('gq');
  if (i) {
    i.value = '';
    i.focus();
  }
  var x = $('gqx');
  if (x) x.hidden = true;
  gCerrar();
}
export function gTecla(e) {
  if (e.key === 'Escape') {
    gCerrar();
    return;
  }
  if (e.key === 'Enter') {
    e.preventDefault();
    if (estado.GLAST.length) gAbrir(0);
  }
}

/* ===== modo MVP =====
   El documento «Funciones del MVP y de la segunda versión» (Diseño Digital 1,
   DGR-151) fija seis funciones para la primera prueba con estudiantes y manda el
   resto a una segunda versión. Este modo las deja a la vista y esconde lo demás.
   No borra nada: todo sigue en su sitio y vuelve al apagarlo. */

/* 1 = función del MVP · 2 = existe, pero en segundo plano · ausente = segunda versión */
