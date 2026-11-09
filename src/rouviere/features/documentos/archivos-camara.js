import { estado } from '../../estado.js';
import { W } from '../../core/almacenamiento.js';
import { $, el, fmt, msg, nz } from '../../core/dom.js';
import {
  DOCMAX,
  DOCS,
  abrirZip,
  docExt,
  docKB,
  docxTexto,
  ocrTexto,
  pdfTexto,
  pptxTexto,
} from './documentos.js';
import { cnt, toText } from '../estudio-ia/estudio-ia.js';
import { hoy } from '../progreso/progreso.js';
/* ---------- gestión de la lista ---------- */
/* ==========================================================================
   Archivos y cámara, reescritos.
   Tres defectos reales que tenía el código anterior:
   1. Los <input type=file> estaban con display:none. Varios navegadores de
      Android ignoran el .click() sobre un elemento que no se renderiza, así
      que el botón no abría nada. Ahora quedan fuera de pantalla pero vivos.
   2. El botón de cámara se escondía con la comprobación ('capture' in input),
      que da falso en casi todos los navegadores de escritorio. Resultado: en
      computadora el botón desaparecía del todo. Esa comprobación ya no está.
   3. El archivo se procesaba en cuanto lo elegías, así que la pantalla decía
      «leído» sin que tú hubieras confirmado nada. Ahora hay dos pasos:
      primero se selecciona y se muestra, y solo se procesa al pulsarlo.
   ========================================================================== */
export const FORMATOS = [
  'txt',
  'md',
  'csv',
  'json',
  'docx',
  'pptx',
  'pdf',
  'jpg',
  'jpeg',
  'png',
  'webp',
];
export /* índice que se está sustituyendo, -1 si ninguno */

function docFmtOk(e) {
  return FORMATOS.indexOf(e) >= 0;
}
export function docMotivo(e) {
  if (e === 'doc' || e === 'ppt')
    return 'los formatos antiguos .doc y .ppt no se pueden abrir aquí; guárdalo como .docx o .pptx';
  if (e === 'xls' || e === 'xlsx') return 'todavía no leo hojas de cálculo; expórtalo a .csv';
  if (e === 'rar' || e === 'zip' || e === '7z')
    return 'es un comprimido; descomprímelo y sube los archivos de dentro';
  if (e === 'heic')
    return 'el formato HEIC de iPhone no se puede leer aquí; en Ajustes de la cámara elige «Más compatible» o conviértelo a JPG';
  if (!e) return 'el archivo no tiene extensión, así que no sé de qué tipo es';
  return 'no sé leer archivos .' + e;
}

/* ---------------------------------------------------------------- selección */
export function docAdd(files) {
  if (!files || !files.length) return;
  var nuevos = 0,
    rechazados = [];
  for (var i = 0; i < files.length; i++) {
    var f = files[i],
      e = docExt(f.name);
    var ficha;
    if (!docFmtOk(e))
      ficha = {
        nom: f.name,
        ext: e,
        size: f.size,
        st: 'err',
        msg: 'No lo puedo procesar: ' + docMotivo(e) + '.',
        txt: '',
      };
    else if (f.size > DOCMAX)
      ficha = {
        nom: f.name,
        ext: e,
        size: f.size,
        st: 'err',
        msg:
          'Pesa ' +
          docKB(f.size) +
          ' y el límite es ' +
          docKB(DOCMAX) +
          '. Divídelo o sube solo el capítulo que necesitas.',
        txt: '',
      };
    else if (f.size === 0)
      ficha = {
        nom: f.name,
        ext: e,
        size: 0,
        st: 'err',
        msg: 'El archivo está vacío (0 bytes).',
        txt: '',
      };
    else {
      ficha = {
        nom: f.name,
        ext: e,
        size: f.size,
        st: 'sel',
        msg: 'Seleccionado. Todavía no se ha leído: pulsa «Procesar» cuando quieras.',
        txt: '',
        f: f,
      };
      nuevos++;
    }
    if (!docFmtOk(e)) rechazados.push(f.name);
    if (estado.DREEMP >= 0) {
      DOCS.splice(estado.DREEMP, 1, ficha);
      estado.DREEMP = -1;
    } else DOCS.push(ficha);
  }
  docRender();
  msg(
    'dmsg',
    nuevos
      ? nuevos === 1
        ? '1 archivo seleccionado. Pulsa «Procesar» para leerlo.'
        : nuevos + ' archivos seleccionados. Pulsa «Procesar» para leerlos.'
      : rechazados.length
        ? 'Ninguno de esos archivos se puede procesar.'
        : '',
  );
}

/* ---------------------------------------------------------------- listado */
export function docPend() {
  return DOCS.filter(function (d) {
    return d.st === 'sel';
  }).length;
}
export function docRender() {
  var w = $('dlist');
  if (!w) return;
  w.textContent = '';
  if (!DOCS.length) {
    w.appendChild(el('p', 's mini', 'Todavía no has subido ningún archivo.'));
    docCnt();
    return;
  }
  DOCS.forEach(function (d, i) {
    var r = el('div', 'dfile ' + d.st);
    var h = el('div', 'dfh');
    h.appendChild(el('b', 0, d.nom));
    h.appendChild(
      el('small', 0, (d.ext ? d.ext.toUpperCase() : 'sin extensión') + ' · ' + docKB(d.size)),
    );
    r.appendChild(h);
    r.appendChild(el('p', 's ' + (d.st === 'err' ? 'derr' : ''), d.msg));
    if (d.prev) {
      var im = el('img', 'dprev');
      im.src = d.prev;
      im.alt = 'Vista previa de ' + d.nom;
      r.appendChild(im);
    }
    var acc = el('div', 'dacc');
    function bt(txt, accion, cls) {
      var b = el('button', 'pill sm' + (cls ? ' ' + cls : ''), txt);
      b.type = 'button';
      b.setAttribute('data-hc', '122');
      b.setAttribute('data-a', accion);
      b.setAttribute('data-i', String(i));
      acc.appendChild(b);
      return b;
    }
    if (d.st === 'sel') bt('Procesar', 'procesar', 'o');
    if (d.st === 'err' && d.f) bt('Reintentar', 'reintentar');
    if (d.st === 'ocr') bt('Intentar reconocer el texto', 'reintentar');
    if (d.st === 'ok') bt('Ver el texto extraído', 'ver');
    if (d.st !== 'load') bt('Sustituir', 'sustituir');
    bt('Quitar', 'quitar');
    r.appendChild(acc);
    w.appendChild(r);
  });
  var p = docPend();
  if (p > 1) {
    var t = el('div', 'dacc');
    var b = el('button', 'pill', 'Procesar los ' + p + ' archivos');
    b.type = 'button';
    b.setAttribute('data-hc', '122');
    b.setAttribute('data-a', 'procesar-todo');
    t.appendChild(b);
    w.appendChild(t);
  }
  docCnt();
}
export function docCnt() {
  var ok = DOCS.filter(function (d) {
      return d.st === 'ok';
    }),
    ch = ok.reduce(function (a, d) {
      return a + d.txt.length;
    }, 0),
    p = docPend();
  msg(
    'dmsg',
    ok.length
      ? ok.length +
          (ok.length === 1 ? ' documento leído · ' : ' documentos leídos · ') +
          ch.toLocaleString('es') +
          ' caracteres en el cuadro de texto' +
          (p ? ' · ' + p + ' sin procesar' : '')
      : p
        ? p +
          (p === 1
            ? ' archivo seleccionado, sin procesar'
            : ' archivos seleccionados, sin procesar')
        : '',
  );
}

/* ---------------------------------------------------------------- cámara */
export const CAM = {
  stream: null,
  foto: null,
};
export function camCerrar() {
  if (CAM.stream) {
    CAM.stream.getTracks().forEach(function (t) {
      t.stop();
    });
    CAM.stream = null;
  }
  CAM.foto = null;
  var w = $('camw');
  if (w) {
    w.style.display = 'none';
    w.setAttribute('aria-hidden', 'true');
  }
  var v = $('camv');
  if (v) v.srcObject = null;
  document.body.classList.remove('nosc');
}
export function camMsg(t) {
  msg('cammsg', t);
}
export function camVista(modo) {
  /* modo: 'vivo' mientras se graba, 'foto' cuando ya hay una tomada */
  var v = $('camv'),
    c = $('camc');
  if (v) v.style.display = modo === 'vivo' ? '' : 'none';
  if (c) c.style.display = modo === 'foto' ? '' : 'none';
  ['camtirar'].forEach(function (id) {
    var b = $(id);
    if (b) b.style.display = modo === 'vivo' ? '' : 'none';
  });
  ['camrep', 'camusar'].forEach(function (id) {
    var b = $(id);
    if (b) b.style.display = modo === 'foto' ? '' : 'none';
  });
}
export async function camAbrir() {
  var w = $('camw');
  if (!w) return;
  w.style.display = '';
  w.setAttribute('aria-hidden', 'false');
  document.body.classList.add('nosc');
  camVista('vivo');
  camMsg('Pidiendo permiso para usar la cámara…');
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    camMsg(
      'Este navegador no permite abrir la cámara desde una página. Te abro el selector de fotos: ahí tu teléfono te deja tomar una con la cámara.',
    );
    setTimeout(function () {
      camCerrar();
      $('ucam').click();
    }, 1800);
    return;
  }
  try {
    CAM.stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: {
          ideal: 'environment',
        },
        width: {
          ideal: 1600,
        },
      },
      audio: false,
    });
    var v = $('camv');
    v.srcObject = CAM.stream;
    await v.play();
    camMsg('Encuadra el apunte y pulsa «Tomar la foto».');
  } catch (err) {
    var n = err && err.name ? err.name : '';
    var txt =
      n === 'NotAllowedError'
        ? 'No diste permiso para la cámara (o el navegador lo bloqueó).'
        : n === 'NotFoundError'
          ? 'No encontré ninguna cámara en este dispositivo.'
          : n === 'NotReadableError'
            ? 'La cámara está ocupada por otra aplicación.'
            : n === 'SecurityError'
              ? 'El navegador bloqueó la cámara por seguridad.'
              : 'No pude abrir la cámara' + (n ? ' (' + n + ')' : '') + '.';
    camMsg(txt + ' Te abro el selector de fotos como alternativa.');
    setTimeout(function () {
      camCerrar();
      $('ucam').click();
    }, 2200);
  }
}
export function camTirar() {
  var v = $('camv'),
    c = $('camc');
  if (!v || !v.videoWidth) {
    camMsg('La imagen todavía no está lista, espera un segundo.');
    return;
  }
  var an = Math.min(v.videoWidth, 1600),
    al = Math.round((v.videoHeight * an) / v.videoWidth);
  c.width = an;
  c.height = al;
  c.getContext('2d').drawImage(v, 0, 0, an, al);
  CAM.foto = c.toDataURL('image/jpeg', 0.9);
  camVista('foto');
  camMsg('¿Se lee bien? Si está movida, repítela.');
}
export function camRepetir() {
  CAM.foto = null;
  camVista('vivo');
  camMsg('Encuadra otra vez y pulsa «Tomar la foto».');
}
export function camUsar() {
  if (!CAM.foto) {
    camMsg('Todavía no has tomado ninguna foto.');
    return;
  }
  var b = atob(CAM.foto.split(',')[1]),
    u = new Uint8Array(b.length);
  for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i);
  var nom = 'foto-' + hoy() + '-' + String(DOCS.length + 1) + '.jpg';
  var f = new File([u], nom, {
    type: 'image/jpeg',
  });
  var prev = CAM.foto;
  camCerrar();
  docAdd([f]);
  var d = DOCS[DOCS.length - 1];
  if (d) {
    d.prev = prev;
    docRender();
  }
  msg('dmsg', 'Foto añadida como «' + nom + '». Pulsa «Procesar» para sacarle el texto.');
}
export function camAct(a) {
  if (a === 'abrir') return camAbrir();
  if (a === 'tirar') return camTirar();
  if (a === 'repetir') return camRepetir();
  if (a === 'usar') return camUsar();
  if (a === 'cerrar') return camCerrar();
}

/* ---------------------------------------------------------------- pegar */
export function docPegar(e) {
  var vista = document.querySelector('#estudio.on');
  if (!vista) return;
  var dt = e.clipboardData;
  if (!dt) return;
  var fs = [];
  if (dt.files && dt.files.length) for (var i = 0; i < dt.files.length; i++) fs.push(dt.files[i]);
  else if (dt.items)
    for (var j = 0; j < dt.items.length; j++) {
      if (dt.items[j].kind === 'file') {
        var f = dt.items[j].getAsFile();
        if (f) fs.push(f);
      }
    }
  if (!fs.length) return; /* texto normal: que lo pegue el navegador */
  e.preventDefault();
  var lim = fs.map(function (f) {
    if (f.name && docExt(f.name)) return f;
    var ext = (f.type || '').indexOf('png') >= 0 ? 'png' : 'jpg';
    return new File([f], 'pegado-' + hoy() + '.' + ext, {
      type: f.type || 'image/jpeg',
    });
  });
  docAdd(lim);
  msg(
    'dmsg',
    'Pegaste ' + lim.length + (lim.length === 1 ? ' archivo' : ' archivos') + '. Pulsa «Procesar».',
  );
}

/* ---------------------------------------------------------------- volcado al cuadro de texto */
export function docJoin() {
  var ok = DOCS.filter(function (d) {
    return d.st === 'ok';
  });
  if (!ok.length) return;
  var t = ok
    .map(function (d) {
      return '=== ' + d.nom + ' ===\n' + d.txt;
    })
    .join('\n\n');
  if (t.length > 120000) t = t.slice(0, 120000) + '\n\n[texto recortado a 120.000 caracteres]';
  $('src').value = t;
  cnt();
}
export async function docProc(i) {
  var d = DOCS[i];
  if (!d || !d.f) return;
  d.st = 'load';
  d.msg = 'Leyendo…';
  docRender();
  function prog(t) {
    d.msg = t;
    docRender();
  }
  try {
    var e = d.ext;
    if (e === 'txt' || e === 'md' || e === 'csv' || e === 'json') {
      d.txt = (await d.f.text()).trim();
      if (!d.txt) throw new Error('el archivo está vacío');
    } else if (e === 'docx') {
      d.txt = docxTexto(await abrirZip(await d.f.arrayBuffer()));
    } else if (e === 'pptx') {
      d.txt = pptxTexto(await abrirZip(await d.f.arrayBuffer()));
    } else if (e === 'pdf') {
      prog('descargando el lector de PDF…');
      d.txt = await pdfTexto(d.f, prog);
    } else if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'heic'].indexOf(e) >= 0) {
      if (!d.ocr) {
        d.st = 'ocr';
        d.msg =
          'Es una imagen. Para sacar el texto hay que descargar el reconocedor ' +
          '(varios MB la primera vez). Pulsa el botón si quieres intentarlo.';
        docRender();
        return;
      }
      prog('descargando el reconocedor…');
      d.txt = await ocrTexto(d.f, prog);
    } else if (e === 'doc' || e === 'ppt')
      throw new Error(
        'los formatos antiguos .doc y .ppt no se pueden leer aquí. Guárdalo como .docx o .pptx.',
      );
    else throw new Error('no sé leer archivos .' + e);
    if (d.txt.length > 200000)
      d.txt = d.txt.slice(0, 200000) + '\n\n[documento recortado a 200.000 caracteres]';
    d.st = 'ok';
    d.msg = 'Listo: ' + d.txt.length.toLocaleString('es') + ' caracteres extraídos.';
    docGuarda(d);
  } catch (err) {
    d.st = 'err';
    d.msg = 'No pude leerlo: ' + (err && err.message ? err.message : 'error desconocido');
  }
  docRender();
  docJoin();
}
export function docGuarda(d) {
  if (!Array.isArray(estado.S.docs)) estado.S.docs = [];
  estado.S.docs = estado.S.docs.filter(function (x) {
    return x.n !== d.nom;
  });
  estado.S.docs.unshift({
    n: d.nom,
    t: Date.now(),
    ch: d.txt.length,
    txt: d.txt.slice(0, 20000),
  });
  estado.S.docs = estado.S.docs.slice(0, 3);
  W();
  docRecientes();
}
export function docRecientes() {
  var w = $('drec');
  if (!w) return;
  w.textContent = '';
  if (!estado.S.docs || !estado.S.docs.length) {
    w.appendChild(el('p', 's mini', 'Aquí aparecerán los últimos documentos que abras.'));
    return;
  }
  estado.S.docs.forEach(function (x, i) {
    var b = el('button', 'mrow item');
    b.type = 'button';
    b.setAttribute('data-hc', '122');
    b.setAttribute('data-a', 'reabrir');
    b.setAttribute('data-i', String(i));
    b.appendChild(el('b', 0, x.n));
    b.appendChild(
      el(
        'small',
        0,
        fmt(x.t) +
          ' · ' +
          x.ch.toLocaleString('es') +
          ' caracteres' +
          (x.ch > 20000 ? ' (se guardaron los primeros 20.000)' : ''),
      ),
    );
    w.appendChild(b);
  });
}
export function docAct(a, t) {
  if (a === 'elegir') {
    estado.DREEMP = -1;
    $('upl').click();
    return;
  }
  if (a === 'camara') {
    camAbrir();
    return;
  }
  if (a === 'procesar-todo') {
    DOCS.forEach(function (d, k) {
      if (d.st === 'sel') docProc(k);
    });
    return;
  }
  var i = +t.getAttribute('data-i');
  if (a === 'procesar') {
    docProc(i);
    return;
  }
  if (a === 'sustituir') {
    estado.DREEMP = i;
    $('upl').click();
    return;
  }
  if (a === 'quitar') {
    DOCS.splice(i, 1);
    docRender();
    docJoin();
    if (
      !DOCS.filter(function (d) {
        return d.st === 'ok';
      }).length
    )
      $('src').value = '';
    cnt();
    return;
  }
  if (a === 'reintentar') {
    if (DOCS[i]) {
      if (DOCS[i].st === 'ocr') DOCS[i].ocr = 1;
      docProc(i);
    }
    return;
  }
  if (a === 'ver') {
    var d = DOCS[i];
    if (!d) return;
    $('src').value = '=== ' + d.nom + ' ===\n' + d.txt;
    cnt();
    msg('dmsg', 'En el cuadro de texto está solo «' + d.nom + '».');
    return;
  }
  if (a === 'reabrir') {
    var x = estado.S.docs[i];
    if (!x) return;
    $('src').value = '=== ' + x.n + ' ===\n' + x.txt;
    cnt();
    msg('dmsg', 'Reabierto «' + x.n + '» desde los documentos recientes.');
    return;
  }
  if (a === 'guardar') {
    aGuardar();
    return;
  }
  if (a === 'borrar-sav') {
    estado.S.sav.splice(i, 1);
    W();
    savRender();
    return;
  }
  if (a === 'abrir-sav') {
    var y = estado.S.sav[i];
    if (!y) return;
    $('aoutbox').style.display = '';
    $('out').textContent = '';
    $('out').appendChild(el('p', 'gtx', y.txt));
    msg('abadge', 'Guardado ' + fmt(y.t));
    msg('aam', 'Resultado recuperado de los guardados.');
    $('aoutbox').scrollIntoView({
      block: 'nearest',
    });
    return;
  }
}

/* ---------- resultados guardados ---------- */
export function aGuardar() {
  if (!estado.GEN) {
    msg('aam', 'Primero genera algo.');
    return;
  }
  if (!Array.isArray(estado.S.sav)) estado.S.sav = [];
  var t = toText(estado.GEN),
    nom =
      (
        DOCS.filter(function (d) {
          return d.st === 'ok';
        })[0] || {}
      ).nom || 'Apunte';
  estado.S.sav.unshift({
    n: nom,
    k: estado.GEN.kind,
    t: Date.now(),
    txt: String(t).slice(0, 20000),
  });
  estado.S.sav = estado.S.sav.slice(0, 12);
  W();
  savRender();
  msg('aam', 'Guardado. Lo tienes en «Resultados guardados».');
}
export const SAVN = {
  res: 'Resumen',
  esq: 'Esquema',
  glo: 'Glosario',
  con: 'Conceptos clave',
  gui: 'Guía de repaso',
  pre: 'Preguntas',
  tar: 'Tarjetas',
  tem: 'Temas',
  afi: 'Afiche',
};
export function savRender() {
  var w = $('savl');
  if (!w) return;
  w.textContent = '';
  if (!estado.S.sav || !estado.S.sav.length) {
    w.appendChild(el('p', 's mini', 'Todavía no has guardado ningún resultado.'));
    return;
  }
  estado.S.sav.forEach(function (x, i) {
    var r = el('div', 'item');
    var b = el('button', 'lnk', (SAVN[x.k] || x.k) + ' · ' + x.n);
    b.type = 'button';
    b.setAttribute('data-hc', '122');
    b.setAttribute('data-a', 'abrir-sav');
    b.setAttribute('data-i', String(i));
    r.appendChild(b);
    var d = el('button', 'lnk', 'Borrar');
    d.type = 'button';
    d.setAttribute('data-hc', '122');
    d.setAttribute('data-a', 'borrar-sav');
    d.setAttribute('data-i', String(i));
    d.style.marginLeft = 'auto';
    d.style.color = 'var(--mut)';
    r.appendChild(el('small', 0, fmt(x.t)));
    r.appendChild(d);
    w.appendChild(r);
  });
}

/* ---------- buscar dentro del documento ---------- */
export function docBuscar() {
  var q = nz($('dq').value || '').trim(),
    w = $('dres');
  if (!w) return;
  w.textContent = '';
  if (q.length < 3) {
    w.appendChild(el('p', 's', 'Escribe al menos tres letras.'));
    return;
  }
  var ok = DOCS.filter(function (d) {
    return d.st === 'ok';
  });
  if (!ok.length && $('src').value.trim())
    ok = [
      {
        nom: 'texto pegado',
        txt: $('src').value,
      },
    ];
  if (!ok.length) {
    w.appendChild(el('p', 's', 'Primero sube un documento o pega un texto.'));
    return;
  }
  var pal = q.split(/\s+/).filter(function (x) {
      return x.length > 2;
    }),
    hits = [];
  ok.forEach(function (d) {
    var secc = '',
      lineas = d.txt.split('\n');
    lineas.forEach(function (l, idx) {
      if (/^#{1,3}\s/.test(l)) secc = l.replace(/^#+\s*/, '');
      var n = nz(l);
      var p = pal.filter(function (x) {
        return n.indexOf(x) >= 0;
      }).length;
      if (p)
        hits.push({
          d: d.nom,
          s: secc,
          l: l.trim(),
          i: idx + 1,
          p: p,
        });
    });
  });
  hits.sort(function (a, b) {
    return b.p - a.p;
  });
  if (!hits.length) {
    w.appendChild(
      el(
        'p',
        's',
        'No encontré eso en tus documentos. ' +
          'Solo busco lo que está escrito en ellos: no añado información de fuera.',
      ),
    );
    return;
  }
  w.appendChild(el('p', 's', hits.length + ' coincidencias. Se muestran las 8 más ajustadas:'));
  hits.slice(0, 8).forEach(function (h) {
    var c = el('div', 'dhit');
    c.appendChild(el('b', 0, h.l.slice(0, 300)));
    c.appendChild(el('small', 0, h.d + (h.s ? ' · ' + h.s : '') + ' · línea ' + h.i));
    w.appendChild(c);
  });
}

/* ==========================================================================
   ROU · asistente virtual de ROUVIÈRE
   Sección propia + botón flotante en todas las secciones. No vive dentro de
   Estudio con IA: comparte la plataforma, no la interfaz.

   De dónde salen las respuestas, por orden:
   1. claude.use('sample') — cuando ROUVIÈRE se abre como artefacto publicado
      de Claude. Es IA de verdad, con la cuenta de quien mira la página; no
      hay ninguna clave en este código ni puede haberla.
   2. Un backend propio, si el usuario pega su dirección en los ajustes de
      ROU. Se guarda solo en su dispositivo. La clave vive en el servidor.
   3. Sin ninguna de las dos: ROU no inventa texto. Dice que no tiene IA
      conectada y se limita a lo que sí puede hacer de verdad: buscar en la
      biblioteca, en las tarjetas y en el atlas, leer el progreso real y
      llevar a cada sección.
   ========================================================================== */
