import { estado } from '../../estado.js';
import { mn } from '../../core/almacenamiento.js';
import { el } from '../../core/dom.js';
/* Qué apartados lleva cada tipo y en qué orden. Lo que no está, no se pinta:
   una arteria no tiene inserción y no aparece ese hueco. */
export const EST_T = {
  musculo: ['def', 'ub', 'car', 'ori', 'ins', 'inerv', 'vasc', 'rel', 'fun', 'cli'],
  arteria: ['def', 'ori', 'tra', 'rel', 'ram', 'ter', 'cli'],
  vena: ['def', 'ori', 'tra', 'rel', 'ram', 'ter', 'cli'],
  nervio: ['def', 'car', 'ori', 'tra', 'rel', 'ram', 'ter', 'par', 'cli'],
  organo: ['def', 'ub', 'car', 'par', 'rel', 'vasc', 'dren', 'inerv', 'fun', 'cli'],
  hueso: ['def', 'ub', 'car', 'par', 'rel', 'vasc', 'dren', 'inerv', 'fun', 'cli'],
  articulacion: ['def', 'ub', 'car', 'par', 'rel', 'inerv', 'vasc', 'fun', 'cli'],
  /* «concepto» agrupa cosas muy distintas — células, vías, regiones, procesos,
     hormonas — y cuatro campos se quedan cortos para una vía nerviosa, que tiene
     origen, trayecto y territorio de verdad. Se le permite todo el catálogo, en
     el orden del catálogo; lo que no corresponda simplemente no se escribe. */
  concepto: [
    'def',
    'ub',
    'car',
    'par',
    'ori',
    'ins',
    'tra',
    'rel',
    'ram',
    'ter',
    'inerv',
    'vasc',
    'dren',
    'fun',
    'cli',
  ],
};
export const EST_L = {
  def: 'Definición',
  ub: 'Ubicación',
  car: 'Características anatómicas',
  par: 'Partes',
  ori: 'Origen',
  ins: 'Inserción',
  tra: 'Trayecto',
  rel: 'Relaciones anatómicas',
  ram: 'Ramas',
  ter: 'Territorio',
  inerv: 'Inervación',
  vasc: 'Irrigación',
  dren: 'Drenaje',
  fun: 'Función',
  cli: 'Importancia clínica',
};
/* El mismo campo se llama distinto según el tipo: una vena no tiene ramas,
   tiene afluentes, y su territorio es de drenaje y no de irrigación. */
export const EST_L2 = {
  vena: {
    ram: 'Afluentes',
    ter: 'Territorio de drenaje',
    ori: 'Origen (raíces)',
  },
  arteria: {
    ter: 'Territorio de irrigación',
  },
  nervio: {
    ter: 'Territorio de inervación',
    ram: 'Ramas',
    ori: 'Origen',
  },
  concepto: {
    car: 'Qué hay que saber',
    fun: 'Para qué sirve o qué significa',
  },
};
export function estLab(tipo, k) {
  var o = EST_L2[tipo];
  return (o && o[k]) || EST_L[k] || k;
}
export const EST_OBRA = {
  rouviere: 'Rouvière',
  gray: 'Gray',
  moore: 'Moore',
  netter: 'Netter',
};
export function estIndexa() {
  estado.EST_IX = {};
  estado.EST_FMA = {};
  estado.EST.forEach(function (e) {
    estado.EST_IX[e.id] = e;
    (e.fma || []).forEach(function (c) {
      if (!estado.EST_FMA[c]) estado.EST_FMA[c] = e;
    });
  });
}

/* Carga perezosa. Dos caminos, como el atlas: la variable ya puesta (artefacto
   publicado que inyecta est.js antes) o el archivo suelto del paquete. */
export function estCarga(cb) {
  if (estado.EST_LD === 2) {
    if (cb) cb();
    return;
  }
  if (cb) estado.EST_CB.push(cb);
  if (estado.EST_LD === 1) return;
  estado.EST_LD = 1;
  function listo() {
    estado.EST_LD = 2;
    if (window.EST_CARTAS) estado.EST_CARTAS = window.EST_CARTAS;
    if (window.EST_PREG) estado.EST_PREG = window.EST_PREG;
    estIndexa();
    var c = estado.EST_CB;
    estado.EST_CB = [];
    c.forEach(function (f) {
      try {
        f();
      } catch (e) {}
    });
  }
  if (window.EST_DATA) {
    estado.EST = window.EST_DATA;
    listo();
    return;
  }
  var sc = document.createElement('script');
  sc.src = 'est.js';
  sc.onload = function () {
    estado.EST = window.EST_DATA || [];
    listo();
  };
  sc.onerror = function () {
    estado.EST = [];
    listo();
  };
  document.head.appendChild(sc);
}
export function estGet(id) {
  return estado.EST_IX[id] || null;
}
export function estDeFma(c) {
  return estado.EST_FMA[c] || null;
}
export function estDeCarta(c) {
  var r = [];
  if (!c) return r;
  var ids = c.est || estado.EST_CARTAS[c.id] || [];
  ids.forEach(function (i) {
    var e = estGet(i);
    if (e && r.indexOf(e) < 0) r.push(e);
  });
  return r;
}
/* Lo mismo para una pregunta del banco de simulacros. */
export function estDePregunta(q) {
  var r = [];
  if (!q) return r;
  (estado.EST_PREG[q.id] || []).forEach(function (i) {
    var e = estGet(i);
    if (e && r.indexOf(e) < 0) r.push(e);
  });
  return r;
}
export function estTieneTeoria(e) {
  if (!e || !e.d) return false;
  for (var k in e.d) {
    if (e.d[k]) return true;
  }
  return false;
}

/* Pinta una ficha dentro de `w`. `modo` 'full' la abre, 'corto' la deja plegada. */
export function estPinta(e, w, modo) {
  if (!e) return;
  var c = el('div', 'efc');
  var cab = el('div', 'efcab');
  var h = el('div');
  h.style.flex = '1 1 200px';
  var kk = el('span', 'efk', (typeof mn === 'function' ? mn(e.m) : e.m) + (e.t ? ' · ' + e.t : ''));
  h.appendChild(kk);
  var nn = el('p', 'efn');
  nn.appendChild(document.createTextNode(e.n));
  if (e.lat) nn.appendChild(el('span', 'eflat', e.lat));
  h.appendChild(nn);
  cab.appendChild(h);
  var est = e.rev || 'borrador';
  cab.appendChild(
    el(
      'span',
      'efb ' + (est === 'aprobado' ? 'rev' : 'bor'),
      est === 'aprobado' ? 'Revisada' : est === 'revisado' ? 'En revisión' : 'Borrador',
    ),
  );
  c.appendChild(cab);
  if (e.res) c.appendChild(el('p', 'efres', e.res));
  var campos = (EST_T[e.tipo] || EST_T.concepto).filter(function (k) {
    return e.d && e.d[k];
  });
  if (campos.length) {
    var dt = document.createElement('details');
    dt.className = 'eft';
    if (modo === 'full') dt.open = true;
    var sm = document.createElement('summary');
    sm.textContent = 'Desarrollo teórico (' + campos.length + ' apartados)';
    dt.appendChild(sm);
    campos.forEach(function (k) {
      var d = el('div', 'efa');
      d.appendChild(el('span', 'efal', estLab(e.tipo, k)));
      d.appendChild(el('p', 'efav', e.d[k]));
      dt.appendChild(d);
    });
    if (e.ver && e.ver.length) {
      var vv = el('p', 'efpie');
      vv.appendChild(el('b', 0, 'Ver también: '));
      e.ver.forEach(function (id, i) {
        var o = estGet(id);
        if (!o) return;
        vv.appendChild(document.createTextNode((i ? ' · ' : '') + o.n));
      });
      dt.appendChild(vv);
    }
    if (e.fte && e.fte.length) {
      var ft = el('p', 'efpie');
      ft.appendChild(el('b', 0, 'Fuentes: '));
      ft.appendChild(
        document.createTextNode(
          e.fte
            .map(function (f) {
              return (
                (EST_OBRA[f.ob] || f.ob) +
                (f.ed ? ' ' + f.ed : '') +
                (f.cap ? ', ' + f.cap : '') +
                (f.vst === 'ok' ? '' : ' (sin comprobar)')
              );
            })
            .join(' · '),
        ),
      );
      dt.appendChild(ft);
    }
    c.appendChild(dt);
  } else {
    c.appendChild(
      el(
        'p',
        'efsin',
        'La teoría de esta estructura todavía no está redactada. ' +
          'Está en el inventario y le toca turno: el contenido lo escribe y lo revisa un docente.',
      ),
    );
  }
  var acc = el('div', 'efacc');
  if (e.fma && e.fma.length) {
    var b = el('button', 'pill sm', 'Ver en el Atlas 3D →');
    b.type = 'button';
    b.setAttribute('data-hc', '148');
    b.setAttribute('data-fma', e.fma[0]);
    b.setAttribute('data-eid', e.id);
    acc.appendChild(b);
    acc.appendChild(
      el(
        'span',
        'efsin',
        'Modelo 3D: ' +
          e.fma.length +
          (e.fma.length === 1
            ? ' pieza candidata, sin verificar'
            : ' piezas candidatas, sin verificar'),
      ),
    );
  } else if (e.tipo !== 'concepto') {
    acc.appendChild(el('span', 'efsin', 'Esta estructura no tiene modelo en el Atlas 3D.'));
  }
  if (acc.childNodes.length) c.appendChild(acc);
  w.appendChild(c);
}

/* ===== seccion Estructuras: navegar las fichas EST ===== */
