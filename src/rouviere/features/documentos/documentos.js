import { $, msg } from '../../core/dom.js';
/* ===== documentos del estudiante ===== */
/* Lee de verdad el contenido de los archivos. DOCX y PPTX se abren aquí mismo
   (son archivos zip con XML dentro) usando DecompressionStream, que trae el propio
   navegador. El PDF necesita pdf.js y las imágenes necesitan OCR: ambos se descargan
   de un CDN solo cuando hace falta, y si no están disponibles se dice claramente. */
export const DOCS = [];
export const DOCMAX = 25 * 1024 * 1024;
export const PDFJS_URL = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js';
export const PDFJS_W = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
export const TESS_URL = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';
export function docExt(n) {
  var m = String(n)
    .toLowerCase()
    .match(/\.([a-z0-9]+)$/);
  return m ? m[1] : '';
}
export function docKB(n) {
  return n < 1024
    ? n + ' B'
    : n < 1048576
      ? Math.round(n / 1024) + ' KB'
      : (n / 1048576).toFixed(1) + ' MB';
}

/* ---------- Three.js, solo cuando hace falta ----------
   Antes iba en tres <script> que bloqueaban el arranque de TODA la web, aunque
   el visitante solo viniera a hacer tarjetas. Son unos 700 KB para tres de las
   dieciséis secciones. Ahora se piden al entrar en una de esas tres, y quien
   toque un modelo antes de que terminen queda en cola: su acción se repite sola
   al acabar la descarga, sin que tenga que volver a pulsar. */
/* [Rouviere PWA] three.js r128 incluido en public/app/vendor/three: funciona sin internet. */
export const TRES_BASE = 'vendor/three/';
export const TRES = {
  estado: 'no',
  cola: [],
};
export /* no · cargando · listo · falla */
function tresListo() {
  return !!(window.THREE && THREE.OrbitControls && THREE.GLTFLoader);
}
export function tresAviso(id) {
  if (!id) return;
  msg(
    id,
    TRES.estado === 'falla'
      ? 'No se pudo descargar el visor 3D (sin conexión o bloqueada). El resto de ROUVIÈRE funciona igual.'
      : 'Descargando el visor 3D. Es una sola vez; en cuanto termine sigue solo.',
  );
}
export function con3D(cb, avisoId) {
  if (tresListo()) {
    TRES.estado = 'listo';
    if (cb) cb();
    return true;
  }
  if (cb) TRES.cola.push(cb);
  tresAviso(avisoId);
  if (TRES.estado === 'cargando' || TRES.estado === 'falla') return false;
  TRES.estado = 'cargando';
  cargarJS(TRES_BASE + 'build/three.min.js')
    .then(function () {
      return cargarJS(TRES_BASE + 'examples/js/controls/OrbitControls.js');
    })
    .then(function () {
      return cargarJS(TRES_BASE + 'examples/js/loaders/GLTFLoader.js');
    })
    .then(function () {
      TRES.estado = 'listo';
      var c = TRES.cola;
      TRES.cola = [];
      c.forEach(function (f) {
        try {
          f();
        } catch (e) {}
      });
    })
    .catch(function () {
      TRES.estado = 'falla';
      TRES.cola = [];
      ['amsg', 'bmsg', 'emsg'].forEach(function (x) {
        if ($(x) && $(x).textContent.indexOf('Descargando el visor') >= 0) tresAviso(x);
      });
    });
  return false;
}
export function cargarJS(url) {
  return new Promise(function (ok, mal) {
    if (cargarJS._[url]) return ok();
    var s = document.createElement('script');
    s.src = url;
    s.async = true;
    var t = setTimeout(function () {
      mal(new Error('tardó demasiado'));
    }, 20000);
    s.onload = function () {
      clearTimeout(t);
      cargarJS._[url] = 1;
      ok();
    };
    s.onerror = function () {
      clearTimeout(t);
      mal(new Error('no se pudo descargar'));
    };
    document.head.appendChild(s);
  });
}
export /* ---------- lectura de un zip (docx y pptx son zip) ---------- */
function u16(d, o) {
  return d[o] | (d[o + 1] << 8);
}
export function u32(d, o) {
  return (d[o] | (d[o + 1] << 8) | (d[o + 2] << 16) | (d[o + 3] << 24)) >>> 0;
}
export async function abrirZip(buf) {
  var d = new Uint8Array(buf),
    fin = -1;
  for (var i = d.length - 22; i >= 0 && i > d.length - 66000; i--)
    if (u32(d, i) === 0x06054b50) {
      fin = i;
      break;
    }
  if (fin < 0) throw new Error('el archivo no parece un zip válido');
  var n = u16(d, fin + 10),
    off = u32(d, fin + 16),
    p = off,
    out = {};
  for (var k = 0; k < n; k++) {
    if (u32(d, p) !== 0x02014b50) break;
    var met = u16(d, p + 10),
      csz = u32(d, p + 20),
      nl = u16(d, p + 28),
      el = u16(d, p + 30),
      cl = u16(d, p + 32),
      lho = u32(d, p + 42);
    var nom = '';
    for (var j = 0; j < nl; j++) nom += String.fromCharCode(d[p + 46 + j]);
    var ln = u16(d, lho + 26),
      le = u16(d, lho + 28),
      dat = lho + 30 + ln + le;
    var raw = d.subarray(dat, dat + csz);
    if (met === 0) out[nom] = raw;
    else if (met === 8) {
      if (typeof DecompressionStream === 'undefined')
        throw new Error('este navegador no puede descomprimir el archivo');
      var ds = new DecompressionStream('deflate-raw');
      var ab = await new Response(new Blob([raw]).stream().pipeThrough(ds)).arrayBuffer();
      out[nom] = new Uint8Array(ab);
    }
    p += 46 + nl + el + cl;
  }
  return out;
}
export function txtDe(u8) {
  return new TextDecoder('utf-8').decode(u8);
}
export function desXml(s) {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}
export function docxTexto(zip) {
  var f = zip['word/document.xml'];
  if (!f) throw new Error('no encontré el texto dentro del .docx');
  var xml = txtDe(f),
    out = [];
  (xml.match(/<w:p[ >][\s\S]*?<\/w:p>|<w:p\/>/g) || []).forEach(function (p) {
    var t = (p.match(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g) || [])
      .map(function (x) {
        return desXml(x.replace(/<[^>]+>/g, ''));
      })
      .join('');
    if (!t.trim()) {
      out.push('');
      return;
    }
    var h = p.match(/w:pStyle w:val="([^"]*)"/),
      pre = '';
    if (h && /^Heading(\d)/i.test(h[1])) pre = new Array(+RegExp.$1 + 1).join('#') + ' ';
    else if (h && /^Title/i.test(h[1])) pre = '# ';
    else if (/<w:numPr>/.test(p) || (h && /List|Lista|Vi.?eta/i.test(h[1]))) pre = '- ';
    out.push(pre + t);
  });
  var r = out
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  if (!r) throw new Error('el documento no tiene texto legible');
  return r;
}
export function pptxTexto(zip) {
  var ns = Object.keys(zip)
    .filter(function (k) {
      return /^ppt\/slides\/slide\d+\.xml$/.test(k);
    })
    .sort(function (a, b) {
      return +a.match(/(\d+)/)[1] - +b.match(/(\d+)/)[1];
    });
  if (!ns.length) throw new Error('no encontré diapositivas dentro del .pptx');
  var out = [];
  ns.forEach(function (k, i) {
    var xml = txtDe(zip[k]);
    var ls = (xml.match(/<a:t>([\s\S]*?)<\/a:t>/g) || [])
      .map(function (x) {
        return desXml(x.replace(/<[^>]+>/g, '')).trim();
      })
      .filter(Boolean);
    out.push('## Diapositiva ' + (i + 1));
    ls.forEach(function (l) {
      out.push(l);
    });
    out.push('');
  });
  var r = out.join('\n').trim();
  if (!r.replace(/## Diapositiva \d+/g, '').trim())
    throw new Error('las diapositivas no tienen texto');
  return r;
}
export async function pdfTexto(file, prog) {
  await cargarJS(PDFJS_URL);
  var lib = window.pdfjsLib;
  if (!lib) throw new Error('pdf.js no quedó disponible');
  if (lib.GlobalWorkerOptions) lib.GlobalWorkerOptions.workerSrc = PDFJS_W;
  var buf = await file.arrayBuffer();
  var pdf = await lib.getDocument({
    data: buf,
  }).promise;
  var out = [],
    n = pdf.numPages;
  for (var i = 1; i <= n; i++) {
    if (prog) prog('leyendo página ' + i + ' de ' + n);
    var pg = await pdf.getPage(i),
      tc = await pg.getTextContent();
    var ln = tc.items
      .map(function (x) {
        return x.str;
      })
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (ln) out.push('## Página ' + i + '\n' + ln);
  }
  var r = out.join('\n\n').trim();
  if (!r)
    throw new Error(
      'el PDF no tiene texto seleccionable: parece escaneado. Prueba con el reconocimiento de imagen.',
    );
  return r;
}
export async function ocrTexto(file, prog) {
  await cargarJS(TESS_URL);
  if (!window.Tesseract) throw new Error('la librería de reconocimiento no quedó disponible');
  var r = await Tesseract.recognize(file, 'spa', {
    logger: function (m) {
      if (prog && m.status)
        prog(m.status + (m.progress ? ' ' + Math.round(m.progress * 100) + ' %' : ''));
    },
  });
  var t = ((r && r.data && r.data.text) || '').trim();
  if (!t) throw new Error('no se reconoció ningún texto en la imagen');
  return t;
}

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
