import { estado } from '../../estado.js';
import { log } from '../../core/almacenamiento.js';
import { $, el, msg } from '../../core/dom.js';
import { apDe, apPadDe, renderAp } from './apartados.js';
import { atClear, atFicha, atFit, atInit, atParts } from './atlas-sistemas.js';
import { pinCache } from './rotulos.js';
import { con3D, tresListo } from '../documentos/documentos.js';
export const HA_BUF = {};
export const HA_ATR =
  'Modelos: BodyParts3D 4.0 (anatomía de referencia de varón adulto), © The Database Center for Life Science, licencia CC BY 4.0. ' +
  'Preparación de las mallas y empaquetado: proyecto Human Atlas de ashemag, licencia MIT. ' +
  'ROUVIÈRE los reempaqueta por sistema y traduce los nombres al español; no modifica la geometría.';
/* Código de color del atlas anatómico: arteria roja, vena azul, nervio amarillo,
   linfático verde, hueso marfil, músculo rojo oscuro. Los órganos van al color del
   tejido fresco (pulmón rosado, hígado e intestino pardos, riñón pardo rojizo). */
export const HA_COL = {
  skeletal: 0xede4d0,
  muscular: 0xa8382f,
  arterial: 0xd1332b,
  venous: 0x2b5fa8,
  cardiac: 0xb03a32,
  nervous: 0xefc84a,
  respiratory: 0xd79ab4,
  digestive: 0xc08a4a,
  urinary: 0x9a5f49,
  reproductive: 0xc093a8,
  endocrine: 0xc97f4f,
  sensory: 0x6fa8dc,
  connective: 0xd9cbb0,
  integumentary: 0xe0b48a,
  lymphatic: 0x7fbf8f,
};
export function haTint(hex, k) {
  var r = (hex >> 16) & 255,
    g = (hex >> 8) & 255,
    b = hex & 255,
    f = 0.82 + 0.36 * k;
  function c(v) {
    return Math.max(0, Math.min(255, Math.round(v * f)));
  }
  return (c(r) << 16) | (c(g) << 8) | c(b);
}
export function haIndex(cb) {
  if (estado.HA_IX) {
    cb(estado.HA_IX);
    return;
  }
  msg('amsg', 'Cargando el índice del atlas…');
  function done(o) {
    estado.HA_IX = o;
    estado.HA_MAP = {};
    o.grupos.forEach(function (g) {
      g.parts.forEach(function (p) {
        estado.HA_MAP[p.i] = p;
      });
    });
    cb(o);
  }
  /* [Rouviere PWA] El índice se lee directo del JSON. */
  haIndexFetch(done);
}
export function haIndexFetch(done) {
  fetch('atlas/atlas-index.json')
    .then(function (r) {
      if (!r.ok) throw 0;
      return r.json();
    })
    .then(done)
    .catch(function () {
      msg(
        'amsg',
        'No se pudo leer «atlas/atlas-index.json». Deja la carpeta atlas junto al HTML y ábrelo con un servidor local.',
      );
    });
}
export function haBytes(n) {
  return n >= 1048576
    ? (n / 1048576).toFixed(1).replace('.', ',') + ' MB'
    : Math.round(n / 1024) + ' KB';
}
export function haNum(n) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
export const HA_TH = {
  oseo: 'sis-oseo',
  muscular: 'sis-muscular',
  cardio: 'sis-cardio',
  resp: 'sis-resp',
  nerv: 'sis-nerv',
  dig: 'sis-dig',
  uri: 'sis-uri',
  repro: 'sis-repro',
  endo: 'sis-endo',
  sent: 'sis-sent',
  otros: 'sis-otros',
};
export const HA_SHORT = {
  oseo: 'Óseo',
  muscular: 'Muscular',
  cardio: 'Cardiovascular',
  resp: 'Respiratorio',
  nerv: 'Nervioso',
  dig: 'Digestivo',
  uri: 'Urinario',
  repro: 'Reproductor',
  endo: 'Endocrino',
  sent: 'Sentidos',
  otros: 'Conectivo y piel',
};
export function haShort(k, n) {
  return HA_SHORT[k] || n;
}
export function renderHA() {
  var box = $('hagrid');
  if (!box) return;
  box.textContent = '';
  if (!estado.HA_IX) {
    var b0 = el('button', 'pill', 'Cargar el atlas anatómico ');
    b0.type = 'button';
    b0.setAttribute('data-hc', '110');
    b0.appendChild(el('span', 0, '→'));
    box.appendChild(b0);
    msg('hatot', '2.234 estructuras de BodyParts3D, con su nombre anatómico en español.');
    return;
  }
  var hd = el('div', 'habar');
  hd.appendChild(el('b', 0, haNum(estado.HA_IX.total)));
  hd.appendChild(el('span', 0, 'estructuras · ' + estado.HA_IX.grupos.length + ' sistemas'));
  box.appendChild(hd);
  var g = el('div', 'hag');
  estado.HA_IX.grupos.forEach(function (x) {
    var b = el(
      'button',
      'hab' + (estado.HA_CUR === x.k ? ' on' : '') + (estado.HA_LD === x.k ? ' ld' : ''),
    );
    b.type = 'button';
    b.setAttribute('data-hc', '111');
    b.setAttribute('data-k', x.k);
    var c = HA_COL[x.sys[0]];
    if (c != null) b.style.setProperty('--hc', '#' + ('000000' + c.toString(16)).slice(-6));
    if (HA_TH[x.k]) {
      var th = el('span', 'habth');
      th.style.setProperty('--th', 'url(img/' + HA_TH[x.k] + '.webp)');
      b.appendChild(th);
    }
    b.appendChild(el('b', 0, haShort(x.k, x.n)));
    var pad = apPadDe(x.k),
      sub = pad ? apDe(pad).length : 0;
    if (pad) {
      b.classList.add('conap');
      if (estado.AP_PAD === pad) b.classList.add('on');
      b.appendChild(el('small', 0, sub + ' apartados · ' + haNum(x.parts.length) + ' estructuras'));
    } else
      b.appendChild(
        el(
          'small',
          0,
          estado.HA_LD === x.k ? 'Cargando…' : haNum(x.parts.length) + ' · ' + haBytes(x.bytes),
        ),
      );
    g.appendChild(b);
  });
  box.appendChild(g);
  msg(
    'hatot',
    'Anatomía de referencia de varón adulto (BodyParts3D 4.0). Cada sistema se descarga solo cuando lo abres.',
  );
}
/* La leyenda del código de color. Primero vena, arteria y nervio, que es lo que hay que
   saber reconocer en un paquete vasculonervioso. Solo enseña los sistemas que el modelo
   abierto tiene de verdad, para no prometer colores que no están en pantalla. */
export const HA_AVISO =
  'Color por sistema, con el código del atlas anatómico: arteria roja, vena azul, ' +
  'nervio amarillo, linfático verde. Es una convención de estudio, no el color exacto del tejido ' +
  'en la disección.';
export const HA_LEY = [
  ['arterial', 'Arteria'],
  ['venous', 'Vena'],
  ['nervous', 'Nervio'],
  ['lymphatic', 'Linfático'],
  ['skeletal', 'Hueso'],
  ['muscular', 'Músculo'],
  ['cardiac', 'Corazón'],
  ['respiratory', 'Vía aérea y pulmón'],
  ['digestive', 'Digestivo'],
  ['urinary', 'Urinario'],
  ['reproductive', 'Reproductor'],
  ['endocrine', 'Glándula endocrina'],
  ['sensory', 'Órgano del sentido'],
  ['connective', 'Tejido conectivo'],
  ['integumentary', 'Piel'],
];
export function haLeyenda() {
  var w = $('haley');
  if (!w) return;
  w.textContent = '';
  var hay = {};
  ((estado.AT3 && estado.AT3.meshes) || []).forEach(function (m) {
    if (m._ha && m._ha.s) hay[m._ha.s] = 1;
  });
  var n = 0;
  HA_LEY.forEach(function (p) {
    if (!hay[p[0]]) return;
    var c = HA_COL[p[0]];
    if (c == null) return;
    var t = el('span', 'haleyi');
    var d = el('i');
    d.style.background = '#' + ('000000' + c.toString(16)).slice(-6);
    t.appendChild(d);
    t.appendChild(el('span', 0, p[1]));
    w.appendChild(t);
    n++;
  });
  w.hidden = !n;
}
export function haChunks(key, n, cb) {
  /* [Rouviere PWA] Los modelos se sirven como archivos binarios (antes base64 dentro de .js). */
  fetch('atlas/atlas-' + key + '.bin')
    .then(function (r) {
      if (!r.ok) throw 0;
      return r.arrayBuffer();
    })
    .catch(function () {
      return null;
    })
    .then(cb);
}
export function haLoad(key) {
  if (!tresListo()) {
    con3D(function () {
      haLoad(key);
    }, 'amsg');
    return;
  }
  /* Sentidos y Reproductor no cargan los 45 ó 12 de golpe: abren sus apartados. */
  var pad = apPadDe(key);
  if (pad) {
    estado.AP_PAD = estado.AP_PAD === pad ? null : pad;
    estado.AP_CUR = null;
    renderHA();
    renderAp();
    if (estado.AP_PAD) {
      var bx = $('apbox');
      if (bx && bx.scrollIntoView)
        bx.scrollIntoView({
          block: 'nearest',
        });
      msg(
        'amsg',
        'Elige un apartado de ' +
          (pad === 'sent' ? 'los órganos de los sentidos' : 'los aparatos reproductores') +
          '.',
      );
    }
    return;
  }
  if (!atInit()) return;
  haIndex(function (ix) {
    var g = null;
    ix.grupos.forEach(function (x) {
      if (x.k === key) g = x;
    });
    if (!g) {
      msg('amsg', 'Ese apartado no existe en el atlas.');
      return;
    }
    atClear();
    estado.HA_CUR = key;
    estado.HA_LD = key;
    renderHA();
    estado.atCur = {
      id: 'ha-' + key,
      n: g.n,
      kind: 'named',
      tri: 0,
      parts: g.parts.length,
      sys: [],
      file: 'BodyParts3D 4.0 · ' + g.f + ' (' + haBytes(g.bytes) + ')',
      gen: 'Human Atlas (ashemag), MIT',
      nota: HA_ATR,
      lic: 'CC BY 4.0',
    };
    atFicha(estado.atCur);
    $('aov').style.display = '';
    $('aov').textContent = 'Cargando ' + g.n + ' (' + haBytes(g.bytes) + ')…';
    msg('amsg', 'Cargando ' + g.n + '…');
    if (HA_BUF[key]) {
      estado.HA_LD = null;
      renderHA();
      haBuild(g, HA_BUF[key]);
      return;
    }
    haChunks(key, g.chunks || 1, function (buf) {
      estado.HA_LD = null;
      renderHA();
      if (!buf) {
        $('aov').textContent = 'No se pudo cargar el apartado.';
        msg(
          'amsg',
          'No se pudo leer «atlas/atlas-' +
            key +
            '.bin». Comprueba que la carpeta atlas está junto al HTML.',
        );
        return;
      }
      HA_BUF[key] = buf;
      haBuild(g, buf);
    });
  });
}
export function haBuild(g, buf) {
  var o = estado.HA_IX.origin,
    s = estado.HA_IX.scale;
  var grp = new THREE.Group();
  grp.scale.setScalar(s);
  grp.position.set(o[0], o[1], o[2]);
  var n = g.parts.length;
  g.parts.forEach(function (p, i) {
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
    var col = haTint(HA_COL[p.s] || 0xc9b9a0, (i % 7) / 6);
    var ma = new THREE.MeshLambertMaterial({
      color: col,
    });
    var me = new THREE.Mesh(ge, ma);
    me.name = p.i;
    me._ha = p;
    if (!estado.HA_MAP[p.i])
      estado.HA_MAP[p.i] = p; /* para que atPretty() dé el nombre en español */
    grp.add(me);
    estado.AT3.meshes.push(me);
  });
  estado.AT3.sc.add(grp);
  estado.AT3.root = grp;
  grp.updateMatrixWorld(true);
  estado.AT3.meshes.forEach(function (x) {
    x._oc = x.material.color.getHex();
  });
  estado.atColor = 'orig';
  $('acol').textContent = 'Colorear estructuras';
  msg('acolw', HA_AVISO);
  haLeyenda();
  atFit();
  pinCache(estado.AT3.meshes);
  $('aov').style.display = 'none';
  msg(
    'amsg',
    g.n +
      ' cargado: ' +
      n +
      ' estructuras con nombre real' +
      (g.fuente ? ' de ' + g.fuente : ' de BodyParts3D') +
      '. Toca una para verla, o búscala en la lista.',
  );
  log('Atlas BodyParts3D: ' + g.n);
  atParts('');
}

/* ===== apartados: sentidos y aparatos reproductores ===== */
