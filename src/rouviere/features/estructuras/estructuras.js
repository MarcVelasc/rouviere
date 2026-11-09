import { estado } from '../../estado.js';
import { mn } from '../../core/almacenamiento.js';
import { $, el, msg } from '../../core/dom.js';
import { ANAT, anCasa } from '../anatomia/categorias.js';
import { COMP } from '../anatomia/competencias.js';
import { atParts } from '../atlas/atlas-sistemas.js';
import { haIndex, haLoad } from '../atlas/human-atlas.js';
import { AN_IMG } from '../embriologia/histologia-embriologia.js';
import { estCarga, estDeCarta, estPinta } from './fichas-est.js';
import { mvpVale } from '../mvp/mvp.js';
import { FICHA } from '../tarjetas/ficha-estudio.js';
import { cur } from '../tarjetas/tarjetas.js';
/* ===== seccion Estructuras: navegar las fichas EST ===== */
export const EQ = {
  q: '',
  m: 'all',
  tipo: 'all',
  comp: 'all',
  est: 'all',
  n: 40,
};
export function estChips(cont, campo, titulo, ops) {
  var w = $(cont);
  if (!w) return;
  w.textContent = '';
  w.appendChild(el('span', 'esft', titulo));
  ops.forEach(function (o) {
    var b = el('button', EQ[campo] === o[0] ? 'on' : '', o[1]);
    b.type = 'button';
    b.setAttribute('data-hc', '150');
    b.setAttribute('data-ef', campo);
    b.setAttribute('data-ev', o[0]);
    w.appendChild(b);
  });
}
export function estFiltra() {
  var q = String(EQ.q || '')
    .trim()
    .toLowerCase();
  return estado.EST.filter(function (e) {
    if (EQ.m !== 'all' && e.m !== EQ.m) return false;
    if (EQ.tipo !== 'all' && e.tipo !== EQ.tipo) return false;
    if (EQ.comp !== 'all' && (!e.comp || e.comp.indexOf(EQ.comp) < 0)) return false;
    if (EQ.est === 'con' && !e.d) return false;
    if (EQ.est === 'sin' && e.d) return false;
    if (!q) return true;
    var h = [
      e.n,
      e.lat || '',
      e.t || '',
      e.res || '',
      typeof mn === 'function' ? mn(e.m) : e.m,
    ].join(' ');
    if (e.d) for (var k in e.d) h += ' ' + e.d[k];
    return h.toLowerCase().indexOf(q) >= 0;
  });
}
export function renderEst() {
  var w = $('eslist');
  if (!w) return;
  if (estado.EST_LD !== 2) {
    w.textContent = '';
    w.appendChild(el('p', 's', 'Cargando las fichas…'));
    estCarga(function () {
      renderEst();
    });
    return;
  }
  var sis = {},
    tip = {},
    cmp = {};
  estado.EST.forEach(function (e) {
    sis[e.m] = 1;
    tip[e.tipo] = 1;
    (e.comp || []).forEach(function (c) {
      cmp[c] = 1;
    });
  });
  var osis = [['all', 'Todos']].concat(
    Object.keys(sis)
      .sort()
      .map(function (k) {
        return [k, typeof mn === 'function' ? mn(k) : k];
      }),
  );
  var otip = [['all', 'Todos']].concat(
    Object.keys(tip)
      .sort()
      .map(function (k) {
        return [k, k.charAt(0).toUpperCase() + k.slice(1)];
      }),
  );
  var ocmp = [['all', 'Todas']].concat(
    Object.keys(cmp)
      .sort()
      .map(function (k) {
        var o = typeof COMP !== 'undefined' && COMP ? COMP[k] : null;
        return [k, o && (o.n || o.t) ? o.n || o.t : k];
      }),
  );
  estChips('esf1', 'm', 'Sistema', osis);
  estChips('esf2', 'tipo', 'Tipo', otip);
  estChips('esf3', 'comp', 'Competencia', ocmp);
  estChips('esf4', 'est', 'Contenido', [
    ['all', 'Todas'],
    ['con', 'Con teoría'],
    ['sin', 'Pendientes'],
  ]);
  var r = estFiltra();
  msg('estot', String(estado.EST.length));
  msg(
    'esred',
    String(
      estado.EST.filter(function (e) {
        return !!e.d;
      }).length,
    ),
  );
  msg(
    'escnt',
    r.length === estado.EST.length
      ? r.length + ' estructuras'
      : r.length + ' de ' + estado.EST.length + ' estructuras',
  );
  w.textContent = '';
  if (!r.length) {
    w.appendChild(el('p', 's', 'Ninguna estructura coincide con esa búsqueda.'));
    return;
  }
  r.slice(0, EQ.n).forEach(function (e) {
    estPinta(e, w, 'corto');
  });
  if (r.length > EQ.n) {
    var b = el('button', 'pill esms', 'Ver ' + Math.min(40, r.length - EQ.n) + ' más');
    b.type = 'button';
    b.setAttribute('data-hc', '151');
    w.appendChild(b);
  }
}

/* Abre el atlas en la pieza de esa ficha. No adivina: usa el código FMA. */
export function estAtlas(fma, eid) {
  if (typeof haIndex !== 'function') {
    location.hash = '#atlas';
    return;
  }
  location.hash = '#atlas';
  haIndex(function (ix) {
    var pz = null;
    ix.grupos.forEach(function (g) {
      g.parts.forEach(function (p) {
        if (!pz && p.c === fma) pz = [g.k, p];
      });
    });
    if (!pz) {
      msg('amsg', 'Esa estructura no está en el índice del atlas.');
      return;
    }
    var q = $('aq');
    if (q) q.value = pz[1].n;
    if (typeof haLoad === 'function') haLoad(pz[0]);
    msg('amsg', 'Cargando «' + mn(pz[0]) + '» para enseñar ' + pz[1].n + '…');
  });
}
export function anDeCarta(c) {
  var r = null;
  if (typeof ANAT !== 'undefined')
    ANAT.forEach(function (a) {
      if (!r && anCasa(c, a)) r = a;
    });
  return r;
}
export function renderFicha() {
  var w = $('cficha');
  if (!w) return;
  var c = cur();
  /* Mientras no se haya volteado, la ficha no se abre: sería enseñar la respuesta. */
  if (!c || !estado.rev) {
    w.hidden = true;
    w.textContent = '';
    return;
  }
  w.hidden = false;
  w.textContent = '';
  var a = anDeCarta(c);
  var cab = el('div', 'fhcab');
  if (a && typeof AN_IMG !== 'undefined' && AN_IMG[a[0]]) {
    var im = AN_IMG[a[0]],
      g = document.createElement('img');
    g.src = 'img/' + im[0];
    g.alt = im[1];
    g.loading = 'lazy';
    g.className = 'fhimg';
    cab.appendChild(g);
  }
  var tx = el('div', 'fhtx');
  tx.appendChild(el('span', 'fhk', (a ? a[1] : mn(c.m)) + ' · ' + (c.t || 'Sin tema')));
  tx.appendChild(el('b', 'fhn', c.a));
  cab.appendChild(tx);
  w.appendChild(cab);
  function campo(lab, val) {
    if (!val) return;
    var d = el('div', 'fhc');
    d.appendChild(el('span', 'fhcl', lab));
    d.appendChild(el('p', 'fhcv', val));
    w.appendChild(d);
  }
  campo('La pregunta que responde', c.q);
  if (c.e) campo('Explicación', c.e);
  FICHA.forEach(function (f) {
    campo(f[1], c[f[0]]);
  });

  /* Las fichas de estructura: una por cada estructura que la tarjeta nombra.
     El texto vive una sola vez en EST, así que no puede contradecirse. */
  if (estado.EST_LD !== 2 || estDeCarta(c).length) {
    if (estado.EST_LD !== 2) {
      estCarga(function () {
        if (cur() === c && estado.rev) renderFicha();
      });
    } else {
      var fis = estDeCarta(c);
      if (fis.length) {
        w.appendChild(
          el(
            'p',
            'fhcl',
            fis.length === 1
              ? 'Ficha de la estructura'
              : 'Fichas de las ' + fis.length + ' estructuras que nombra',
          ),
        );
        fis.forEach(function (e) {
          estPinta(e, w, fis.length === 1 ? 'full' : 'corto');
        });
      }
    }
  }

  /* enlace real al Atlas: busca el nombre del tema entre las 2.234 estructuras */
  if (typeof mvpVale === 'function' && mvpVale('atlas') && c.t) {
    var b = el('button', 'pill sm', 'Buscar «' + c.t + '» en el Atlas 3D ');
    b.type = 'button';
    b.setAttribute('data-hc', '143');
    b.setAttribute('data-q', c.t);
    b.appendChild(el('span', 0, '→'));
    var cj = el('div', 'fhacc');
    cj.appendChild(b);
    w.appendChild(cj);
  }

  /* qué campos le faltan a esta ficha, dicho sin rodeos */
  var faltan = FICHA.filter(function (f) {
    return !c[f[0]];
  }).map(function (f) {
    return f[1];
  });
  if (faltan.length) {
    var dt = document.createElement('details');
    dt.className = 'box fhfalta';
    var sm = document.createElement('summary');
    sm.textContent = 'Campos que esta ficha todavía no tiene (' + faltan.length + ')';
    dt.appendChild(sm);
    dt.appendChild(
      el(
        'p',
        's',
        'El banco de ROUVIÈRE guarda pregunta, respuesta y explicación. ' +
          'Estos campos no están escritos y no se rellenan solos: los tiene que redactar y revisar un docente. ' +
          'Se pueden cargar desde «Importar y exportar», con estas columnas en el CSV: ' +
          FICHA.map(function (f) {
            return f[0];
          }).join(', ') +
          '.',
      ),
    );
    var ul = el('ul', 'vl');
    faltan.forEach(function (x) {
      ul.appendChild(el('li', 0, x));
    });
    dt.appendChild(ul);
    w.appendChild(dt);
  }
}
export function fichaAtlas(q) {
  if (typeof haIndex !== 'function') {
    location.hash = '#atlas';
    return;
  }
  location.hash = '#atlas';
  haIndex(function () {
    var e = $('aq');
    if (e) {
      e.value = q;
      if (typeof atParts === 'function') atParts(q);
    }
  });
}

/* ===== la sección Anatomía, por competencia o por sistema ===== */
