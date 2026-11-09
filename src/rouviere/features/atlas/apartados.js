import { estado } from '../../estado.js';
import { ATL_M } from '../../core/almacenamiento.js';
import { $, el, msg } from '../../core/dom.js';
import { ATL_AP, ATL_PEND, atClear, atFicha, atInit, atLoad } from './atlas-sistemas.js';
import { HA_ATR, haBuild, haBytes, haIndex, haLoad, renderHA } from './human-atlas.js';
import { con3D, tresListo } from '../documentos/documentos.js';
/* Qué sistema del atlas abre cada juego de apartados. Es el puente entre la
   tarjeta de sistema y sus subapartados, para que no haya dos puertas. */
export const AP_DE_SIS = {
  sent: 'sent',
  repro: 'rep',
};
export function apPadDe(k) {
  return AP_DE_SIS[k] || null;
}
export function apSisDe(pad) {
  for (var k in AP_DE_SIS) if (AP_DE_SIS[k] === pad) return k;
  return null;
}
export function apGet(k) {
  for (var i = 0; i < ATL_AP.length; i++) if (ATL_AP[i].k === k) return ATL_AP[i];
  return null;
}
export function apDe(pad) {
  return ATL_AP.filter(function (a) {
    return a.pad === pad;
  });
}
export function apPiezas(a) {
  return a.tipo === 'glb'
    ? (
        ATL_M.filter(function (m) {
          return m.id === a.mod;
        })[0] || {
          parts: 0,
        }
      ).parts
    : a.parts.length;
}
export function renderAp() {
  var box = $('apbox');
  if (!box) return;
  box.textContent = '';
  if (!estado.AP_PAD) return; /* sin sistema elegido no hay nada que mostrar */
  var sis = apSisDe(estado.AP_PAD),
    gr = null;
  if (estado.HA_IX)
    estado.HA_IX.grupos.forEach(function (x) {
      if (x.k === sis) gr = x;
    });
  var hd = el('div', 'aphd');
  hd.appendChild(
    el('b', 0, estado.AP_PAD === 'sent' ? 'Órganos de los sentidos' : 'Aparatos reproductores'),
  );
  var ac = el('div', 'apacc');
  if (gr) {
    var bt = el('button', 'pill sm', 'Ver los ' + gr.parts.length + ' juntos, sin separar');
    bt.type = 'button';
    bt.setAttribute('data-hc', '129');
    bt.setAttribute('data-a', 'entero');
    bt.setAttribute('data-k', sis);
    ac.appendChild(bt);
  }
  var bc = el('button', 'pill sm', 'Cerrar');
  bc.type = 'button';
  bc.setAttribute('data-hc', '129');
  bc.setAttribute('data-a', 'cerrar');
  ac.appendChild(bc);
  hd.appendChild(ac);
  box.appendChild(hd);
  var g = el('div', 'apg');
  apDe(estado.AP_PAD).forEach(function (a) {
    var b = el(
      'button',
      'apc' + (estado.AP_CUR === a.k ? ' on' : '') + (estado.AP_LD === a.k ? ' ld' : ''),
    );
    b.type = 'button';
    b.setAttribute('data-hc', '129');
    b.setAttribute('data-a', 'abrir');
    b.setAttribute('data-k', a.k);
    b.appendChild(el('b', 0, a.n));
    var n = apPiezas(a);
    b.appendChild(
      el(
        'small',
        0,
        estado.AP_LD === a.k
          ? 'Cargando…'
          : n +
              (n === 1 ? ' estructura' : ' estructuras') +
              ' con nombre' +
              (a.tipo === 'ha' ? ' · ' + haBytes(a.bytes) : ' · modelo propio'),
      ),
    );
    if (a.falta && a.falta.length) b.appendChild(el('span', 'apf', a.falta.length + ' sin modelo'));
    g.appendChild(b);
  });
  box.appendChild(g);
  var a = estado.AP_CUR ? apGet(estado.AP_CUR) : null;
  if (a) {
    var d = el('div', 'apd');
    d.appendChild(el('b', 0, a.n));
    d.appendChild(el('p', 0, a.d));
    if (a.nota) d.appendChild(el('p', 'q', a.nota));
    if (a.tipo === 'ha') {
      var ul = el('div', 'apl');
      a.parts.forEach(function (p) {
        var x = el('span', 'appz', p.n);
        ul.appendChild(x);
      });
      var det = el('details');
      det.appendChild(el('summary', 0, 'Las ' + a.parts.length + ' estructuras de este apartado'));
      det.appendChild(ul);
      d.appendChild(det);
    }
    if (a.falta && a.falta.length) {
      var df = el('details');
      df.appendChild(
        el('summary', 0, 'Lo que no tiene geometría 3D aquí (' + a.falta.length + ')'),
      );
      var u2 = document.createElement('ul');
      u2.className = 'vl';
      a.falta.forEach(function (t) {
        u2.appendChild(el('li', 0, t));
      });
      df.appendChild(u2);
      var pend = ATL_PEND.filter(function (x) {
        return x.ap === a.k;
      });
      if (pend.length) {
        df.appendChild(
          el(
            'p',
            's',
            'Estos modelos existen y son descargables, pero no pude traerlos desde ' +
              'aquí: este entorno solo deja salir a los repositorios de paquetes. Descárgalos tú y ábrelos con ' +
              '«Abrir un modelo desde mi dispositivo», que ya funciona:',
          ),
        );
        pend.forEach(function (x) {
          var p = el('p', 'srcmini');
          var aa = el('a', 'src', x.n);
          aa.href = x.url;
          aa.target = '_blank';
          aa.rel = 'noopener noreferrer';
          p.appendChild(aa);
          df.appendChild(p);
        });
      }
      d.appendChild(df);
    }
    box.appendChild(d);
  }
}
export function apAbrir(k) {
  var a = apGet(k);
  if (!a) return;
  if (!tresListo()) {
    con3D(function () {
      apAbrir(k);
    }, 'amsg');
    return;
  }
  if (a.tipo === 'glb') {
    var m = null;
    ATL_M.forEach(function (x) {
      if (x.id === a.mod) m = x;
    });
    if (!m) {
      msg('amsg', 'No encuentro el modelo «' + a.mod + '».');
      return;
    }
    estado.AP_CUR = k;
    renderAp();
    atLoad(m);
    return;
  }
  if (!atInit()) return;
  haIndex(function (ix) {
    if (!ix) {
      msg(
        'amsg',
        'No pude leer atlas/atlas-index.json, así que no puedo colocar las piezas en su sitio.',
      );
      return;
    }
    atClear();
    estado.AP_CUR = k;
    estado.AP_LD = k;
    renderAp();
    estado.atCur = {
      id: 'ap-' + k,
      n: a.n,
      kind: 'named',
      tri: a.tri,
      parts: a.parts.length,
      sys: [],
      file: 'atlas/' + a.f + ' (' + haBytes(a.bytes) + ')',
      gen:
        a.gen || 'BodyParts3D 4.0, reempaquetado por apartado para no descargar sistemas enteros',
      nota: a.nota || HA_ATR,
      lic: a.lic || 'CC BY 4.0',
    };
    atFicha(estado.atCur);
    $('aov').style.display = '';
    $('aov').textContent = 'Cargando ' + a.n + ' (' + haBytes(a.bytes) + ')…';
    msg('amsg', 'Cargando ' + a.n + '…');
    var meta = {
      n: a.n,
      parts: a.parts,
      fuente:
        a.fuente || (a.gen && a.gen.indexOf('Human Reference') === 0 ? 'NIH 3D' : 'BodyParts3D'),
    };
    if (window.APB && window.APB[k]) {
      estado.AP_LD = null;
      renderAp();
      haBuild(meta, window.APB[k]);
      return;
    }
    function listo(buf) {
      window.APB = window.APB || {};
      window.APB[k] = buf;
      estado.AP_LD = null;
      renderAp();
      haBuild(meta, buf);
    }
    function falla() {
      estado.AP_LD = null;
      renderAp();
      $('aov').textContent = 'No se pudo cargar el apartado.';
      msg(
        'amsg',
        'No se pudo leer la geometría de «' +
          a.n +
          '». Si abriste ROUVIÈRE desde el paquete ' +
          'descargado, comprueba que la carpeta atlas está junto al HTML.',
      );
    }
    /* Dos caminos para el mismo archivo: el .js en base64 (es lo que se puede publicar
       en un artefacto, que no sirve archivos binarios) y el .bin crudo del paquete
       descargable, que pesa un tercio menos. Se intenta primero el que ya esté. */
    /* [Rouviere PWA] Los modelos se sirven como archivos binarios (antes base64 dentro de .js). */
    fetch('atlas/' + a.f)
      .then(function (r) {
        if (!r.ok) throw 0;
        return r.arrayBuffer();
      })
      .then(listo)
      .catch(falla);
  });
}
export function apAct(a, t) {
  if (a === 'pad') {
    estado.AP_PAD = t.getAttribute('data-k');
    renderHA();
    renderAp();
    return;
  }
  if (a === 'cerrar') {
    estado.AP_PAD = null;
    estado.AP_CUR = null;
    renderHA();
    renderAp();
    return;
  }
  if (a === 'entero') {
    var k = t.getAttribute('data-k');
    estado.AP_CUR = null;
    renderAp();
    estado.AP_PAD_PREV = estado.AP_PAD;
    haLoadReal(k);
    return;
  }
  if (a === 'abrir') {
    apAbrir(t.getAttribute('data-k'));
    return;
  }
}
export function haLoadReal(key) {
  var g = AP_DE_SIS[key];
  delete AP_DE_SIS[key];
  try {
    haLoad(key);
  } finally {
    AP_DE_SIS[key] = g;
  }
}
export function haOpen() {
  haIndex(function () {
    renderHA();
    renderAp();
    msg('amsg', 'Elige un sistema. «Sentidos» y «Reproductor» se abren por apartados.');
  });
}
/* ===== fuentes (bibliografía) ===== */
