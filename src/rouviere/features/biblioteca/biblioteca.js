import { estado } from '../../estado.js';
import { $, el, fmt, msg, nz } from '../../core/dom.js';
import { fueraMat, fueraRec } from '../embriologia/histologia-embriologia.js';
import { li } from '../modulos/modulos.js';
import LIB__json from '../../data/lib.json';
/* ===== biblioteca académica ===== */
export const LIB = LIB__json;
export const LIBCAT = [
  ['gen', 'Anatomía humana'],
  ['reg', 'Anatomía descriptiva y topográfica'],
  ['fun', 'Anatomía funcional y aplicada'],
  ['neu', 'Neuroanatomía'],
  ['his', 'Histología'],
  ['emb', 'Embriología'],
  ['fis', 'Fisiología'],
  ['bioq', 'Bioquímica y biología celular'],
  ['micro', 'Microbiología e inmunología'],
  ['pat', 'Patología'],
  ['sem', 'Semiología médica'],
  ['term', 'Terminología médica'],
  ['est', 'Métodos de estudio'],
  ['com', 'Bibliografía comercial'],
];
export const LIBKIND = [
  ['libro', 'Libro abierto'],
  ['catalogo', 'Catálogo o buscador'],
  ['atlas', 'Atlas interactivo'],
  ['articulo', 'Artículo de acceso abierto'],
  ['comercial', 'Libro comercial'],
];
export const LIBNOTA =
  'El catálogo partió de los 24 recursos del documento «Biblioteca ROUVIÈRE: enlaces gratuitos» y hoy reúne 81, repartidos en catorce materias: anatomía humana, anatomía descriptiva y topográfica, anatomía funcional, neuroanatomía, histología, embriología, fisiología, bioquímica y biología celular, microbiología e inmunología, patología, semiología, terminología médica, métodos de estudio y bibliografía comercial. Una obra puede aparecer en dos materias, pero se cuenta una sola vez. De esos 81, aquí se listan 66: los 15 de histología y de embriología quedan fuera del foco de la plataforma, que es solo de anatomía, aunque sus fichas comprobadas siguen guardadas en el catálogo. Todos los recursos añadidos se comprobaron abriendo su página el 11/10/2026: el título, la autoría y la licencia que figuran en cada ficha son los que mostró esa página, no los que yo supusiera. Es un índice de enlaces: ROUVIÈRE no aloja ni redistribuye los libros, solo lleva a sus páginas oficiales. No es la bibliografía oficial de la UCB.';
export const LIBREGLAS = [
  'El catálogo es un índice de enlaces, no una carpeta de libros: cada recurso se consulta en su sitio original.',
  'Cada ficha indica qué abre realmente el enlace: una página, un lector, un artículo o un buscador.',
  'No es la bibliografía oficial de la UCB: compárala con el programa analítico y con lo que indique cada docente.',
  '«Comprobado» significa que el enlace se abrió el 11/10/2026 y que los datos de la ficha se leyeron en esa página. Nada más: no significa que el contenido esté validado por un docente.',
  'Tres obras (Alberts, Berg y Janeway) solo permiten buscar dentro del texto en NCBI, no leerlo de corrido. Están marcadas como tales y no cuentan como lectura gratuita.',
  'Solo aparece un botón de descarga cuando el recurso tiene de verdad un archivo o una página de descarga oficial. El resto son enlaces de lectura en línea.',
  'Los recursos marcados como comerciales se incluyen como referencias legítimas: no se copian, no se suben ni se redistribuyen.',
  'Antes de reutilizar texto o imágenes de un recurso abierto, revisa su licencia concreta (no todas permiten uso comercial o modificación).',
  'Si un enlace deja de funcionar, anota la fecha y corrígelo; el estado de verificación de cada ficha indica cuándo se revisó.',
  'Los marcadores, el historial y las búsquedas recientes se guardan solo en este dispositivo y no se envían a ningún servidor.',
];
export const LBS = {
  fav: [],
  rec: [],
  q: [],
  rt: {},
};
export function LW() {
  try {
    localStorage.setItem('rv_lib', JSON.stringify(LBS));
  } catch (e) {
    estado.lbStore = false;
  }
}
export const LBPAG = 12;
/* cuántas fichas se pintan de golpe */
export const LBIDI = [
  ['Español', 'En español'],
  ['Español e inglés', 'Bilingüe'],
  ['Inglés', 'En inglés'],
];
export function lbCatIdx(k) {
  for (var i = 0; i < LIBCAT.length; i++) if (LIBCAT[i][0] === k) return i;
  return 99;
}
export function lbCatName(k) {
  for (var i = 0; i < LIBCAT.length; i++) if (LIBCAT[i][0] === k) return LIBCAT[i][1];
  return k;
}
export function lbKindName(k) {
  for (var i = 0; i < LIBKIND.length; i++) if (LIBKIND[i][0] === k) return LIBKIND[i][1];
  return k;
}
export function lbAcc(a) {
  return a === 'abierto'
    ? 'Acceso abierto · gratuito'
    : a === 'cuenta'
      ? 'Gratuito · pide cuenta para seguir leyendo'
      : a === 'variable'
        ? 'Catálogo gratuito · el acceso depende de cada obra'
        : 'Requiere compra, suscripción o acceso institucional';
}
export const LBFMT = {
  pdfok: 'PDF gratuito disponible',
  pdfsrc: 'PDF oficial · descarga no probada',
  epubok: 'EPUB gratuito disponible',
  read: 'Lectura gratuita en línea',
  atlas: 'Atlas interactivo',
  cat: 'Catálogo · acceso según la obra',
  paid: 'Requiere compra o acceso institucional',
  nover: 'Descarga no verificada',
};
export function lbFmtRow(r) {
  var d = el('div', 'lbfmt');
  (r.fmt || []).forEach(function (f) {
    d.appendChild(el('span', 'f-' + f, LBFMT[f] || f));
  });
  return d;
}
export function lbHasDl(r) {
  return !!(r.pdf || r.epub);
}
export function lbVst(v) {
  return v === 'ok'
    ? 'Enlace comprobado'
    : v === 'parcial'
      ? 'Comprobado con reservas'
      : v === 'roto'
        ? 'Dirección incorrecta en el catálogo'
        : 'No se pudo comprobar';
}
export const LBCOL = {
  ana: ['#0A3A52', '#167A6D'],
  his: ['#167A6D', '#2CA8A0'],
  neu: ['#0A3A52', '#2CA8A0'],
  emb: ['#167A6D', '#65C3B5'],
  bio: ['#2CA8A0', '#65C3B5'],
  com: ['#0A3A52', '#D9A441'],
};
export const LBGLY = {
  ana: 'M32 8v48 M23 16h18 M21 27h22 M23 38h18 M26 49h12',
  his: 'M10 32c6-10 14-14 22-14s16 4 22 14c-6 10-14 14-22 14s-16-4-22-14z M32 24a8 8 0 100 16 8 8 0 100-16z',
  neu: 'M32 8c-9 0-15 6-15 14 0 5 2 8 2 12 0 7 5 14 13 14s13-7 13-14c0-4 2-7 2-12 0-8-6-14-15-14z M32 14v34 M22 26h20',
  emb: 'M38 12c10 4 14 14 12 24-2 11-12 18-22 15-8-3-12-11-10-19 2-7 8-9 13-13 4-3 6-5 7-7z',
  bio: 'M32 10a22 22 0 100 44 22 22 0 100-44z M32 22a10 10 0 100 20 10 10 0 100-20z M32 10v12 M32 42v12',
  com: 'M12 14h18c3 0 5 2 5 5v33c0-3-2-5-5-5H12z M52 14H34c-3 0-5 2-5 5v33c0-3 2-5 5-5h18z',
};
export function lbThumb(cat) {
  var c = LBCOL[cat] || LBCOL.ana,
    d = document.createElement('div');
  d.className = 'lbth';
  d.style.background = 'linear-gradient(135deg,' + c[0] + ',' + c[1] + ')';
  var b = el('b', 0, lbCatName(cat));
  d.appendChild(b);
  var ns = 'http://www.w3.org/2000/svg',
    s = document.createElementNS(ns, 'svg');
  s.setAttribute('viewBox', '0 0 64 64');
  s.setAttribute('aria-hidden', 'true');
  var p = document.createElementNS(ns, 'path');
  p.setAttribute('d', LBGLY[cat] || LBGLY.ana);
  p.setAttribute('fill', 'none');
  p.setAttribute('stroke', '#fff');
  p.setAttribute('stroke-width', '2');
  p.setAttribute('stroke-linecap', 'round');
  p.setAttribute('stroke-linejoin', 'round');
  s.appendChild(p);
  d.appendChild(s);
  return d;
}
export function lbGet(id) {
  for (var i = 0; i < LIB.length; i++) if (LIB[i].id === +id) return LIB[i];
  return null;
}
export function lbIsFav(id) {
  return LBS.fav.indexOf(+id) >= 0;
}
export function lbHay(r) {
  var t = [
    r.tit,
    r.pdftit,
    r.desc,
    r.nota,
    r.opens,
    r.org,
    r.dlnote,
    r.tema,
    r.idi,
    r.ver,
    lbCatName(r.cat),
    lbCatName(r.c2 || ''),
    lbKindName(r.kind),
    lbAcc(r.acc),
    r.url,
  ];
  (r.fmt || []).forEach(function (f) {
    t.push(LBFMT[f]);
  });
  r.meta.forEach(function (m) {
    t.push(m[0]);
    t.push(m[1]);
  });
  return nz(t.join(' '));
}
export function lbList() {
  return LIB.filter(function (r) {
    if (estado.lbview === 'fav' && !lbIsFav(r.id)) return false;
    if (estado.lbview === 'rec' && LBS.rec.indexOf(r.id) < 0) return false;
    if (estado.lbview === 'dl' && !lbHasDl(r)) return false;
    if (fueraRec(r)) return false; /* materia fuera del foco de la plataforma */
    if (estado.lbcat !== 'all' && r.cat !== estado.lbcat && r.c2 !== estado.lbcat) return false;
    if (estado.lbkind !== 'all' && r.kind !== estado.lbkind) return false;
    if (estado.lbidi !== 'all' && r.idi !== estado.lbidi) return false;
    if (estado.lbq && lbHay(r).indexOf(nz(estado.lbq)) < 0) return false;
    return true;
  }).sort(function (x, y) {
    /* por materia, para que «Ver más» recorra el catálogo en orden */
    var a = lbCatIdx(x.cat),
      b = lbCatIdx(y.cat);
    return a !== b ? a - b : x.id - y.id;
  });
}
export function lbBtn(txt, cls, handler, id) {
  var b = el('button', cls, txt);
  b.type = 'button';
  b.setAttribute('data-hc', handler);
  if (id != null) b.setAttribute('data-id', id);
  return b;
}
export function lbA(txt, url, cls) {
  var a = el('a', cls || 0, txt);
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  return a;
}
export function lbSrcBtn(r) {
  if (r.vst === 'roto') return lbA('Enlace del catálogo (falla)', r.url, 'o');
  return lbA('Ver fuente oficial', r.url, 'o');
}
export function lbDlBtns(ac, r, full) {
  if (r.pdf) {
    var b = lbA(r.pdfl || 'Descargar PDF', r.pdf, 'dl');
    if (r.pdfq === 'ok') b.setAttribute('download', '');
    ac.appendChild(b);
  }
  if (full && r.pdf2) ac.appendChild(lbA(r.pdf2[0], r.pdf2[1], 'dl2'));
  if (r.epub) ac.appendChild(lbA('Descargar EPUB', r.epub, 'dl2'));
  if (r.read) ac.appendChild(lbA('Leer en línea', r.read, r.pdf ? 'o' : ''));
  if (r.dlpage && (full || !r.pdf))
    ac.appendChild(lbA(full ? r.dlpage[0] : 'Abrir descarga oficial', r.dlpage[1], 'o'));
  ac.appendChild(lbSrcBtn(r));
  if (full)
    (r.alt || []).forEach(function (l) {
      ac.appendChild(lbA(l[0], l[1], 'o'));
    });
}
export function lbCard(r) {
  var c = el('div', 'lbc');
  c.appendChild(lbThumb(r.cat));
  var b = el('div', 'lbb');
  b.appendChild(el('h3', 0, r.tit));
  if (r.org) b.appendChild(el('p', 'lborg', r.org));
  var tg = el('div', 'lbtags');
  tg.appendChild(el('span', 'tagacc acc-' + r.acc, lbAcc(r.acc)));
  tg.appendChild(el('span', 'lbk', lbKindName(r.kind)));
  b.appendChild(tg);
  b.appendChild(lbFmtRow(r));
  var tm = el('p', 'lbtem');
  tm.appendChild(el('b', 0, r.tema || 'Tema no registrado'));
  tm.appendChild(document.createTextNode(' · ' + (r.idi || 'Idioma no registrado')));
  b.appendChild(tm);
  b.appendChild(el('p', 0, r.desc));
  var v = el('span', 'lbv ' + r.vst);
  v.appendChild(el('i', 0, ''));
  v.appendChild(el('span', 0, lbVst(r.vst)));
  b.appendChild(v);
  var ac = el('div', 'lbacts');
  lbDlBtns(ac, r, false);
  ac.appendChild(lbBtn('Ver ficha', 'o', 102, r.id));
  ac.appendChild(
    lbBtn(
      lbIsFav(r.id) ? '★ Guardado' : '☆ Guardar',
      'o' + (lbIsFav(r.id) ? ' fav' : ''),
      103,
      r.id,
    ),
  );
  b.appendChild(ac);
  c.appendChild(b);
  return c;
}
export function lbDetail(r) {
  var d = el('div', 'lbd');
  var tg = el('div', 'lbtags');
  tg.appendChild(el('span', 'tagacc acc-' + r.acc, lbAcc(r.acc)));
  tg.appendChild(el('span', 'lbk', lbKindName(r.kind)));
  tg.appendChild(el('span', 'lbk', lbCatName(r.cat)));
  d.appendChild(tg);
  d.appendChild(el('h2', 0, r.tit));
  if (r.pdftit !== r.tit) d.appendChild(el('p', 's', 'Figura en el catálogo como: ' + r.pdftit));
  d.appendChild(el('p', 0, r.desc));
  var dl = document.createElement('dl');
  function row(k, v) {
    dl.appendChild(el('dt', 0, k));
    dl.appendChild(el('dd', 0, v));
  }
  row(
    'Nº en el catálogo',
    'Recurso ' +
      r.id +
      ' de ' +
      LIB.filter(function (x) {
        return !fueraRec(x);
      }).length +
      (r.id <= 24 ? ' (del catálogo original)' : ' (añadido en la ampliación)'),
  );
  row('Materia', lbCatName(r.cat) + (r.c2 ? ' · ' + lbCatName(r.c2) : ''));
  row('Tema principal', r.tema || 'No registrado');
  row('Idioma', r.idi || 'No registrado');
  row('Tipo de recurso', lbKindName(r.kind));
  row('Condiciones de acceso', lbAcc(r.acc));
  if (r.accpdf) row('Acceso según el catálogo', r.accpdf);
  row('Qué abre el enlace', r.opens);
  row(
    'Formatos disponibles',
    (r.fmt || [])
      .map(function (f) {
        return LBFMT[f];
      })
      .join(' · ') || 'No registrados',
  );
  if (r.org) row('Autor o institución', r.org);
  r.meta.forEach(function (m) {
    row(m[0], m[1]);
  });
  if (!r.meta.length)
    row('Datos bibliográficos', 'No se registran: no se pudieron comprobar en una fuente oficial.');
  d.appendChild(dl);
  var q = el('p', 'q', 'Estado de comprobación: ' + r.ver);
  d.appendChild(q);
  if (LBS.rt && LBS.rt[r.id])
    d.appendChild(
      el(
        'p',
        'q',
        'Tu historial: abierta ' +
          LBS.rt[r.id].n +
          (LBS.rt[r.id].n === 1 ? ' vez' : ' veces') +
          ', la última el ' +
          fmt(LBS.rt[r.id].t) +
          '. Solo en este dispositivo.',
      ),
    );
  if (r.nota) d.appendChild(el('p', 'q', 'Nota: ' + r.nota));
  d.appendChild(
    el(
      'p',
      'q',
      'Descarga: ' + (r.dlnote || 'no se registra ningún archivo de descarga para este recurso.'),
    ),
  );
  var u = el('p', 'u', 'Dirección registrada: ' + r.url);
  d.appendChild(u);
  var ac = el('div', 'lbacts');
  lbDlBtns(ac, r, true);
  ac.appendChild(
    lbBtn(
      lbIsFav(r.id) ? '★ Guardado en marcadores' : '☆ Guardar en marcadores',
      'o' + (lbIsFav(r.id) ? ' fav' : ''),
      103,
      r.id,
    ),
  );
  ac.appendChild(lbBtn('Cerrar ficha', 'o', 104, r.id));
  d.appendChild(ac);
  var rel = r.rel.map(lbGet).filter(function (x) {
    return x;
  });
  if (rel.length) {
    d.appendChild(el('p', 'lbh', 'Recursos relacionados'));
    var rr = el('div', 'lbrel');
    rel.forEach(function (x) {
      rr.appendChild(lbBtn(x.tit + ' · ' + lbCatName(x.cat), '', 102, x.id));
    });
    d.appendChild(rr);
  }
  return d;
}
export function lbFilters() {
  var fc = $('lbfc');
  fc.textContent = '';
  var ab = lbBtn('Todas las categorías', estado.lbcat === 'all' ? 'on' : '', 100, '');
  ab.setAttribute('data-k', 'all');
  fc.appendChild(ab);
  LIBCAT.forEach(function (c) {
    if (fueraMat(c[0])) return;
    var n = LIB.filter(function (r) {
      return !fueraRec(r) && (r.cat === c[0] || r.c2 === c[0]);
    }).length;
    var b = lbBtn(c[1] + ' (' + n + ')', estado.lbcat === c[0] ? 'on' : '', 100, '');
    b.setAttribute('data-k', c[0]);
    fc.appendChild(b);
  });
  var ft = $('lbft');
  ft.textContent = '';
  var tb = lbBtn('Todos los tipos', estado.lbkind === 'all' ? 'on' : '', 101, '');
  tb.setAttribute('data-k', 'all');
  ft.appendChild(tb);
  LIBKIND.forEach(function (c) {
    var n = LIB.filter(function (r) {
      return !fueraRec(r) && r.kind === c[0];
    }).length;
    var b = lbBtn(c[1] + ' (' + n + ')', estado.lbkind === c[0] ? 'on' : '', 101, '');
    b.setAttribute('data-k', c[0]);
    ft.appendChild(b);
  });
  var fi = $('lbfi');
  if (fi) {
    fi.textContent = '';
    var ib = lbBtn('Cualquier idioma', estado.lbidi === 'all' ? 'on' : '', 124, '');
    ib.setAttribute('data-k', 'all');
    fi.appendChild(ib);
    LBIDI.forEach(function (c) {
      var n = LIB.filter(function (r) {
        return !fueraRec(r) && r.idi === c[0];
      }).length;
      if (!n) return;
      var b = lbBtn(c[1] + ' (' + n + ')', estado.lbidi === c[0] ? 'on' : '', 124, '');
      b.setAttribute('data-k', c[0]);
      fi.appendChild(b);
    });
  }
  ['lbvf', 'lbvr', 'lbvd', 'lbva'].forEach(function (id, i) {
    var e = $(id);
    if (e) e.classList.toggle('on', estado.lbview === ['fav', 'rec', 'dl', 'all'][i]);
  });
  msg('lbfn', String(LBS.fav.length));
}
export function lbChips() {
  var c = $('lbqs');
  c.textContent = '';
  if (!LBS.q.length) return;
  c.appendChild(el('span', 's', 'Últimas búsquedas:'));
  LBS.q.slice(0, 6).forEach(function (q) {
    var b = lbBtn(q, '', 105, '');
    b.setAttribute('data-q', q);
    c.appendChild(b);
  });
  c.appendChild(lbBtn('Borrar', '', 106, ''));
}
export function lbEmpty() {
  var d = el('div', 'lbe');
  if (estado.lbview === 'fav' && !LBS.fav.length) {
    d.appendChild(el('b', 0, 'Todavía no tienes marcadores'));
    d.appendChild(
      el(
        'p',
        0,
        'Pulsa «Guardar» en cualquier ficha y aparecerá aquí. Se guarda solo en este dispositivo.',
      ),
    );
  } else if (estado.lbview === 'dl') {
    d.appendChild(el('b', 0, 'Sin archivos que coincidan'));
    d.appendChild(
      el(
        'p',
        0,
        'Son ' +
          lbStats().arch +
          ' las fichas del catálogo que ofrecen un archivo para descargar, y ninguna coincide con los filtros activos.',
      ),
    );
    var b2 = lbBtn('Quitar filtros', 'o', 99, '');
    var w2 = el('div', 'lbacts');
    w2.style.justifyContent = 'center';
    w2.appendChild(b2);
    d.appendChild(w2);
  } else if (estado.lbview === 'rec' && !LBS.rec.length) {
    d.appendChild(el('b', 0, 'Aún no has abierto ninguna ficha'));
    d.appendChild(
      el(
        'p',
        0,
        'Cuando abras la ficha de un recurso, quedará registrada aquí con la fecha, para volver rápido. Se guardan las 24 últimas, solo en este dispositivo.',
      ),
    );
  } else {
    d.appendChild(el('b', 0, 'Ningún recurso coincide con esta búsqueda'));
    d.appendChild(
      el(
        'p',
        0,
        estado.lbq
          ? 'No hay resultados para «' +
              estado.lbq +
              '» con los filtros activos. Prueba con menos palabras, revisa la ortografía o quita los filtros.'
          : 'No hay resultados con los filtros activos. Prueba a quitar alguno.',
      ),
    );
    var b = lbBtn('Quitar filtros y ver los ' + LIB.length + ' recursos', 'o', 99, '');
    var w = el('div', 'lbacts');
    w.style.justifyContent = 'center';
    w.appendChild(b);
    d.appendChild(w);
  }
  return d;
}
export function lbStats() {
  var a = {
    con: 0,
    add: 0,
    tot: LIB.length,
    arch: 0,
    archok: 0,
    lee: 0,
    solob: 0,
    com: 0,
    pend: 0,
    esp: 0,
  };
  LIB.forEach(function (r) {
    if (r.id <= 24) a.con++;
    else a.add++;
    if (r.pdf || r.epub || r.dlpage) {
      a.arch++;
      if (r.pdfq === 'ok') a.archok++;
    }
    if ((r.fmt || []).indexOf('read') >= 0 || (r.fmt || []).indexOf('atlas') >= 0) a.lee++;
    if ((r.fmt || []).indexOf('cat') >= 0) a.solob++;
    if (r.acc === 'compra') a.com++;
    if (r.vst !== 'ok') a.pend++;
    if (String(r.idi || '').indexOf('Español') >= 0) a.esp++;
  });
  return a;
}
export function lbTally() {
  var w = $('lbtally');
  if (!w) return;
  w.textContent = '';
  var a = lbStats();
  [
    ['Conservados del catálogo original', a.con, 'Los que ya estaban; ninguno se ha borrado.'],
    ['Añadidos en esta ampliación', a.add, 'Comprobados uno a uno abriendo su página.'],
    [
      'Recursos únicos en total',
      a.tot,
      'Una obra cuenta una sola vez, aunque esté en dos materias.',
    ],
    ['Con lectura en línea', a.lee, 'Se leen enteros en la web del proyecto, sin cuenta ni pago.'],
    ['En español o bilingües', a.esp, 'El resto está en inglés.'],
    [
      'Con archivo para descargar',
      a.arch,
      a.archok
        ? 'De ellos, ' +
          a.archok +
          ' con la descarga probada archivo en mano; el resto son direcciones oficiales de la editorial.'
        : 'Direcciones oficiales de la editorial; la descarga no se probó archivo en mano.',
    ],
    [
      'Solo permiten buscar dentro',
      a.solob,
      'Catálogos y libros que no se pueden leer de corrido.',
    ],
    ['Comerciales (referencia)', a.com, 'Se citan como bibliografía; no se copian ni se suben.'],
    [
      'Pendientes o con reservas',
      a.pend,
      'Algo no se pudo confirmar desde aquí: ábrelos tú antes de fiarte.',
    ],
  ].forEach(function (x) {
    var c = el('div', 'lbtc');
    c.appendChild(el('b', 0, String(x[1])));
    c.appendChild(el('span', 'lbtl', x[0]));
    c.appendChild(el('small', 0, x[2]));
    w.appendChild(c);
  });
}
export function lbMasBtn(total, vistos) {
  var w = $('lbmas');
  if (!w) return;
  w.textContent = '';
  if (vistos >= total) return;
  var b = lbBtn('Ver ' + Math.min(LBPAG, total - vistos) + ' recursos más', 'o', 125, '');
  w.appendChild(b);
  w.appendChild(el('p', 's', 'Mostrando ' + vistos + ' de ' + total + '.'));
}
export function renderLib() {
  lbTally();
  msg(
    'lbnota',
    LIBNOTA +
      (estado.lbStore
        ? ''
        : ' Aviso: este navegador no permite guardar datos locales, así que los marcadores y el historial no se conservarán al cerrar.'),
  );
  li($('lbreglas'), LIBREGLAS);
  var vv = $('lbver');
  if (vv && !vv.childNodes.length) {
    LIB.filter(function (r) {
      return !fueraRec(r);
    }).forEach(function (r) {
      var p = el('p', 'lbvl');
      p.appendChild(el('b', 0, r.id + '. ' + r.tit + ' — ' + lbVst(r.vst) + '. '));
      p.appendChild(document.createTextNode(r.ver));
      vv.appendChild(p);
    });
  }
  lbFilters();
  lbChips();
  var det = $('lbdet');
  det.textContent = '';
  if (estado.lbopen) {
    var r0 = lbGet(estado.lbopen);
    if (r0) det.appendChild(lbDetail(r0));
  }
  var l = $('lblist');
  l.textContent = '';
  var list = lbList();
  var TOTV = LIB.filter(function (r) {
    return !fueraRec(r);
  }).length; /* sin histología ni embriología */
  msg('lbtot', String(TOTV));
  msg(
    'lbcnt',
    list.length === 0
      ? 'Sin resultados.'
      : list.length === 1
        ? '1 recurso.'
        : list.length + ' recursos de ' + TOTV + '.',
  );
  $('lbmas').textContent = '';
  if (!list.length) {
    l.appendChild(lbEmpty());
    return;
  }
  if (estado.lbview === 'rec') {
    var g = el('div', 'lbg');
    LBS.rec.forEach(function (id) {
      var r = lbGet(id);
      if (r && list.indexOf(r) >= 0) g.appendChild(lbCard(r));
    });
    l.appendChild(g);
    return;
  }
  /* carga progresiva: se pintan de a LBPAG para no colgar el móvil con 81 fichas */
  var cuantos = Math.min(list.length, LBPAG * estado.lbPage),
    vis = list.slice(0, cuantos);
  var cats = [];
  LIBCAT.forEach(function (c) {
    if (
      vis.some(function (r) {
        return r.cat === c[0];
      })
    )
      cats.push(c);
  });
  cats.forEach(function (c) {
    l.appendChild(el('h2', 'h2s', c[1]));
    var g = el('div', 'lbg');
    vis
      .filter(function (r) {
        return r.cat === c[0];
      })
      .forEach(function (r) {
        g.appendChild(lbCard(r));
      });
    l.appendChild(g);
  });
  lbMasBtn(list.length, cuantos);
}
export function lbSearch(v) {
  estado.lbq = v;
  estado.lbopen = null;
  estado.lbPage = 1;
  clearTimeout(estado.lbT);
  estado.lbT = setTimeout(function () {
    var q = String(estado.lbq).trim();
    if (q.length > 2) {
      var i = LBS.q.indexOf(q);
      if (i >= 0) LBS.q.splice(i, 1);
      LBS.q.unshift(q);
      LBS.q = LBS.q.slice(0, 8);
      LW();
    }
    renderLib();
  }, 400);
  renderLib();
}
export function lbSetQ(q) {
  estado.lbq = q;
  $('lbq').value = q;
  estado.lbopen = null;
  estado.lbPage = 1;
  renderLib();
}
export function lbClearQ() {
  LBS.q = [];
  LW();
  renderLib();
}
export function lbSetCat(k) {
  estado.lbcat = k;
  estado.lbopen = null;
  estado.lbPage = 1;
  renderLib();
}
export function lbSetKind(k) {
  estado.lbkind = k;
  estado.lbopen = null;
  estado.lbPage = 1;
  renderLib();
}
export function lbSetIdi(k) {
  estado.lbidi = k;
  estado.lbopen = null;
  estado.lbPage = 1;
  renderLib();
}
export function lbMas() {
  estado.lbPage++;
  renderLib();
}
export function lbSetView(v) {
  estado.lbview = v;
  estado.lbopen = null;
  estado.lbPage = 1;
  renderLib();
}
export function lbAll() {
  estado.lbview = 'all';
  estado.lbcat = 'all';
  estado.lbkind = 'all';
  estado.lbidi = 'all';
  estado.lbq = '';
  estado.lbopen = null;
  estado.lbPage = 1;
  var e = $('lbq');
  if (e) e.value = '';
  renderLib();
}
export function lbOpen(id) {
  id = +id;
  estado.lbopen = id;
  var i = LBS.rec.indexOf(id);
  if (i >= 0) LBS.rec.splice(i, 1);
  LBS.rec.unshift(id);
  LBS.rec = LBS.rec.slice(0, 24);
  if (!LBS.rt) LBS.rt = {};
  var pv = LBS.rt[id] || {};
  LBS.rt[id] = {
    t: Date.now(),
    n: (pv.n || 0) + 1,
  };
  LW();
  renderLib();
  var d = $('lbdet');
  if (d && d.firstChild && d.firstChild.scrollIntoView)
    d.firstChild.scrollIntoView({
      block: 'start',
    });
}
export function lbClose() {
  estado.lbopen = null;
  renderLib();
}
export function lbFav(id) {
  id = +id;
  var i = LBS.fav.indexOf(id);
  if (i >= 0) LBS.fav.splice(i, 1);
  else LBS.fav.push(id);
  LW();
  renderLib();
}
/* ===== módulos: temario por competencias ===== */
