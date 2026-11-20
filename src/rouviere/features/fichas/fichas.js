/* ===== Fichas anatómicas (Biblioteca) =====
   Las fichas de huesos, articulaciones y músculos, y los resúmenes por tema, que preparó el
   equipo de contenido. Vienen de data/fichas-equipo.json (Vanesa, scripts/fichas-equipo.py)
   y data/fichas-emi-leo.json (Emi y Leo, scripts/contenido-emi-leo.py); el texto se muestra
   tal cual.

   - Los datos se cargan solo al abrir la sección (unos 240 KB, en su propio archivo).
   - Filtros por bloque (Osteología, Miología…) y buscador sin tildes.
   - Cada ficha es un <details>: se abre en el sitio, sin cambiar de pantalla.
   - «Ubicación: … Origen: … Inserción: …» se muestra como lista de campos. */
import { $, el, nz } from '../../core/dom.js';

const POR_PAGINA = 40;
var D = null,
  cargando = null,
  bloque = '',
  q = '',
  mostrar = POR_PAGINA,
  listo = false;

function cargar() {
  if (D) return Promise.resolve(D);
  if (!cargando)
    cargando = Promise.all([
      import('../../data/fichas-equipo.json'),
      import('../../data/fichas-emi-leo.json'),
    ]).then(function (ms) {
      var a = ms[0].default || ms[0],
        b = ms[1].default || ms[1];
      D = {
        estado: a.estado,
        bibliografia: a.bibliografia,
        bloques: a.bloques.concat(
          b.bloques.filter(function (x) {
            return a.bloques.indexOf(x) < 0;
          }),
        ),
        fichas: a.fichas.concat(b.fichas),
      };
      // Por bloque (estable): las de Leo de sistema nervioso van junto a las de Vanesa.
      var pos = function (f) {
        return D.bloques.indexOf(f.b);
      };
      D.fichas = D.fichas
        .map(function (f, i) {
          return [f, i];
        })
        .sort(function (x, y) {
          return pos(x[0]) - pos(y[0]) || x[1] - y[1];
        })
        .map(function (x) {
          return x[0];
        });
      D.fichas.forEach(function (f) {
        f._q = nz(f.n + ' ' + f.z + ' ' + f.b + ' ' + f.p.join(' '));
        f._n = nz(f.n);
      });
      return D;
    });
  return cargando;
}

/* «Ubicación: X. Origen: Y.» → [['Ubicación','X.'],['Origen','Y.']]. Si el párrafo no empieza
   con una etiqueta y tiene menos de dos, se muestra como texto corrido. */
const ETIQUETA = /(^|[.;]\s+)([A-ZÁÉÍÓÚÑ][^.:;()]{1,38}):\s/g;
export function campos(p) {
  var marcas = [],
    m;
  ETIQUETA.lastIndex = 0;
  while ((m = ETIQUETA.exec(p)))
    marcas.push({ i: m.index + m[1].length, et: m[2], fin: ETIQUETA.lastIndex });
  if (!marcas.length || (marcas.length < 2 && marcas[0].i > 0)) return null;
  var out = [];
  if (marcas[0].i > 0) out.push(['', p.slice(0, marcas[0].i).trim()]);
  marcas.forEach(function (k, j) {
    var hasta = j + 1 < marcas.length ? marcas[j + 1].i : p.length;
    out.push([k.et, p.slice(k.fin, hasta).trim()]);
  });
  return out;
}

function cuerpo(f) {
  var box = el('div', 'fi-body');
  f.p.forEach(function (p) {
    var c = campos(p);
    if (!c) {
      box.appendChild(el('p', '', p));
      return;
    }
    var dl = el('dl', 'fi-dl');
    c.forEach(function (par) {
      if (par[0]) dl.appendChild(el('dt', '', par[0]));
      dl.appendChild(el('dd', par[0] ? '' : 'fi-libre', par[1]));
    });
    box.appendChild(dl);
  });
  return box;
}

function item(f, conBloque) {
  var d = el('details', 'fi' + (f.tipo !== 'ficha' ? ' fi-res' : ''));
  var s = el('summary');
  s.appendChild(el('span', 'fi-n', f.n));
  var meta = f.tipo === 'ficha' ? f.z : '';
  if (conBloque) meta = meta ? f.b + ' · ' + meta : f.b;
  if (meta) s.appendChild(el('small', 'fi-z', meta));
  d.appendChild(s);
  // El contenido se arma al abrir: así la lista de 400 fichas se pinta rápido.
  d.addEventListener('toggle', function () {
    if (d.open && !d.querySelector('.fi-body')) d.appendChild(cuerpo(f));
  });
  return d;
}

function visibles() {
  var t = nz(q.trim());
  var palabras = t ? t.split(/\s+/) : [];
  var res = D.fichas.filter(function (f) {
    if (bloque && f.b !== bloque) return false;
    if (f.tipo === 'intro' && palabras.length) return false;
    return palabras.every(function (w) {
      return f._q.indexOf(w) >= 0;
    });
  });
  if (palabras.length) {
    // Primero la que se llama así, luego las que lo tienen en el nombre, luego el resto.
    var w = palabras[0],
      peso = function (f) {
        return f._n === w || f._n.indexOf(w + ' ') === 0 ? 3 : f._n.indexOf(w) >= 0 ? 2 : 0;
      };
    res.sort(function (a, b) {
      return peso(b) - peso(a);
    });
  }
  return res;
}

function pintarFiltros() {
  var box = $('fib'),
    izq = box.scrollLeft;
  box.textContent = '';
  [''].concat(D.bloques).forEach(function (b) {
    var n = D.fichas.filter(function (f) {
      return f.tipo !== 'intro' && (!b || f.b === b);
    }).length;
    var bt = el('button', b === bloque ? 'on' : '', (b || 'Todo') + ' (' + n + ')');
    bt.type = 'button';
    bt.setAttribute('aria-pressed', b === bloque ? 'true' : 'false');
    bt.addEventListener('click', function () {
      bloque = b;
      mostrar = POR_PAGINA;
      pintar();
    });
    box.appendChild(bt);
  });
  box.scrollLeft = izq;
}

function pintar() {
  pintarFiltros();
  var lista = $('filist'),
    mas = $('fimas'),
    res = visibles(),
    buscando = !!q.trim();
  lista.textContent = '';
  mas.textContent = '';
  var nF = res.filter(function (f) {
    return f.tipo === 'ficha';
  }).length;
  var nR = res.filter(function (f) {
    return f.tipo === 'res';
  }).length;
  var partes = [];
  if (nF) partes.push(nF + (nF === 1 ? ' ficha' : ' fichas'));
  if (nR) partes.push(nR + (nR === 1 ? ' resumen' : ' resúmenes'));
  $('ficnt').textContent = res.length
    ? partes.join(' y ') + (buscando ? ' con «' + q.trim() + '»' : '')
    : '';
  if (!res.length) {
    var v = el('div', 'box fi-vacio');
    v.appendChild(
      el(
        'p',
        '',
        'No hay fichas con «' +
          q.trim() +
          '». Prueba con otra palabra, sin tildes o en singular (por ejemplo «humero», «rodilla», «deltoides»).',
      ),
    );
    lista.appendChild(v);
    return;
  }
  var tope = res.slice(0, mostrar),
    zonaAct = null,
    bloqueAct = null;
  tope.forEach(function (f) {
    if (!buscando) {
      if (!bloque && f.b !== bloqueAct) {
        bloqueAct = f.b;
        zonaAct = null;
        lista.appendChild(el('h2', 'fi-b', f.b));
      }
      if (f.z !== zonaAct) {
        zonaAct = f.z;
        lista.appendChild(el('h3', 'fi-zt', f.z));
      }
      if (f.tipo === 'intro') {
        lista.appendChild(el('p', 'fi-intro', f.p.join(' ')));
        return;
      }
    }
    lista.appendChild(item(f, buscando && !bloque));
  });
  if (res.length > mostrar) {
    var b = el('button', 'pill sm', 'Mostrar más (' + (res.length - mostrar) + ' restantes)');
    b.type = 'button';
    b.addEventListener('click', function () {
      mostrar += POR_PAGINA * 2;
      pintar();
    });
    mas.appendChild(b);
  }
}

export function renderFichas() {
  if (!listo) {
    listo = true;
    var t = 0;
    $('fiq').addEventListener('input', function (e) {
      clearTimeout(t);
      var v = e.target.value;
      t = setTimeout(function () {
        q = v;
        mostrar = POR_PAGINA;
        if (D) pintar();
      }, 150);
    });
  }
  if (D) return pintar();
  $('ficnt').textContent = 'Cargando fichas…';
  cargar()
    .then(function () {
      $('fiest').textContent = D.estado;
      $('fibib').textContent = D.bibliografia.join(' · ');
      pintar();
    })
    .catch(function () {
      $('ficnt').textContent =
        'No se pudieron cargar las fichas. Revisa tu conexión y vuelve a abrir la sección.';
    });
}
