import { estado } from '../../estado.js';
import { ATL_M, ATL_SYS, W, mn } from '../../core/almacenamiento.js';
import { $, el, nz } from '../../core/dom.js';
import { V } from '../../core/navegacion.js';
import { LIB, lbCatName, lbHay } from '../biblioteca/biblioteca.js';
import { STOP } from '../estudio-ia/estudio-ia.js';
import { li } from '../modulos/modulos.js';
import { rtS } from '../ruta/ruta.js';
import { allCards, cEstado } from '../tarjetas/tarjetas.js';
export /* ==========================================================================
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

function ROUSVG(n, cara) {
  /* El dibujo vive una sola vez en <template id="rou-art">, con su <svg> incluido:
     sin ese envoltorio el parser de HTML trata <path/> como etiqueta abierta y mete
     unos trazos dentro de otros, con lo que solo se pinta el contorno.
     cara=true recorta a la cabeza; a 22 o 24 px la lechuza entera no se lee.
     Es la misma ilustración con otro viewBox, no otro dibujo. */
  var t = document.getElementById('rou-art');
  if (!t || !t.content) return '';
  var o = t.content.firstElementChild;
  if (!o) return '';
  var sv = o.cloneNode(true);
  sv.setAttribute('viewBox', cara ? '292 196 396 396' : '0 0 1024 1024');
  sv.setAttribute('width', n);
  sv.setAttribute('height', n);
  return sv.outerHTML;
}
export const ROUCHIPS = [
  [
    'Explícame un tema de Medicina',
    'Explícame un tema de Medicina: empieza preguntándome cuál quiero.',
  ],
  [
    'Ayúdame a estudiar anatomía',
    'Ayúdame a estudiar anatomía. Mira mi progreso real y dime por dónde seguir.',
  ],
  [
    'Busca un recurso en la Biblioteca',
    'Busca en la Biblioteca de ROUVIÈRE un recurso para estudiar anatomía del miembro superior.',
  ],
  [
    'Ayúdame con un examen',
    'Ayúdame a preparar un examen de anatomía: hazme cinco preguntas de opción múltiple y corrígeme.',
  ],
  ['¿Cómo uso ROUVIÈRE?', '¿Cómo uso ROUVIÈRE? Explícame para qué sirve cada sección.'],
];
export const ROUCOMO = [
  'Dentro del artefacto de Claude, ROU responde con una IA real, usando la cuenta de quien abre la página. No hay ninguna clave dentro de ROUVIÈRE: no puede haberla, porque el código del navegador lo lee cualquiera.',
  'La primera vez, Claude te pedirá permiso para que esta página use tu cuenta. Si dices que no, ROU deja de ofrecer respuestas y te lo dice.',
  'ROU recuerda la conversación de esta pantalla y la guarda en este dispositivo, así que puedes minimizarlo y seguir donde lo dejaste. No se sincroniza con otros dispositivos.',
  'Tiene funciones reales de la plataforma: busca en los 81 recursos de la Biblioteca, entre las tarjetas, en el Atlas 3D, lee tu progreso de verdad y abre secciones. Cuando dice que buscó algo, lo buscó.',
  'En tu copia descargada no hay IA del artefacto. Ahí ROU no inventa nada: busca en la biblioteca y en las tarjetas, te lleva a la sección y te avisa de que no tiene IA conectada.',
];
export const ROUNOPE = [
  'No diagnostica. Explica medicina como se explica en clase; lo que te pasa a ti lo valora un médico en persona.',
  'No navega por internet ni abre enlaces, así que no puede consultar nada nuevo ni leer una página por ti.',
  'No conoce lo ocurrido después de la fecha de corte del modelo que responda. Si preguntas por algo muy reciente, te lo advertirá.',
  'No inventa citas, autores ni páginas. Si no sabe algo, lo dice.',
  'No guarda tus conversaciones en ningún servidor de ROUVIÈRE: no hay servidor.',
];
export function rouChips() {
  [
    ['rouq', 1],
    ['rouq2', 0],
    ['rouq3', 0],
  ].forEach(function (par) {
    var w = $(par[0]);
    if (!w) return;
    w.textContent = '';
    ROUCHIPS.forEach(function (c) {
      var b = el('button', 'rchip', c[0]);
      b.type = 'button';
      b.setAttribute('data-hc', '127');
      b.setAttribute('data-a', 'chip');
      b.setAttribute('data-q', c[1]);
      w.appendChild(b);
    });
  });
}
/* límites que informa la plataforma */
export const ROUMAX = 14;
/* turnos que se mandan como contexto */
export const ROUREGLAS =
  'Eres Rou, el asistente virtual de ROUVIÈRE, una plataforma gratuita de estudio de anatomía ' +
  'hecha por un estudiante de Medicina de la Universidad Católica Boliviana «San Pablo» de Tarija. ' +
  'Hablas español de forma natural y cercana, tuteando, sin solemnidad.\n\n' +
  'QUÉ HACES: respondes lo que te pregunten. No te limitas a anatomía ni a preguntas preparadas. ' +
  'Explicas temas de Medicina y de cualquier otra materia, ciencia, tecnología y cultura general; ' +
  'comparas conceptos, resumes, inventas preguntas de examen y tarjetas de estudio, organizas un ' +
  'plan de repaso y ayudas a moverse por la plataforma.\n\n' +
  'CÓMO RESPONDES: directo y sin relleno. Para una duda simple, dos o tres frases. Para un tema ' +
  'de estudio, estructura corta con lo esencial primero. Nada de listas larguísimas si no las piden.\n\n' +
  'HONESTIDAD: distingue lo que es un hecho asentado de lo que está discutido o no sabes. Si no lo ' +
  'sabes, dilo. No inventes citas, páginas, autores ni estadísticas. No tienes acceso a internet ni ' +
  'puedes abrir enlaces, así que no digas que has consultado nada. Si te preguntan por algo muy ' +
  'reciente, avisa de que puedes estar desactualizado.\n\n' +
  'SALUD: puedes explicar medicina como se explica en una clase. Lo que no haces es diagnosticar a ' +
  'nadie ni indicar tratamientos para un caso personal. Si alguien te cuenta un síntoma propio o de ' +
  'un familiar, explica lo general y dile que eso lo valora un médico en persona. Si lo que cuenta ' +
  'suena urgente o grave, dilo con claridad y sin alarmismo.\n\n' +
  'HERRAMIENTAS: tienes funciones reales de la plataforma. Úsalas cuando pidan un recurso, una ' +
  'tarjeta, una estructura del atlas, su progreso o ir a una sección, en vez de suponer. Nunca digas ' +
  'que abriste, guardaste o buscaste algo si no llamaste a la función correspondiente.';
export function rouS() {
  if (!estado.S.rou || !Array.isArray(estado.S.rou.h))
    estado.S.rou = {
      h: [],
      url: '',
    };
  return estado.S.rou;
}
export function rouGuarda() {
  var r = rouS();
  r.h = r.h.slice(-40);
  W();
}

/* ------------------------------------------------------------ herramientas */
export function rouTools() {
  return [
    {
      name: 'buscar_biblioteca',
      description:
        'Busca en la biblioteca de ROUVIÈRE (81 recursos académicos reales). Devuelve hasta 5 fichas con título, autor, materia, idioma y enlace. Úsala siempre que pidan material de estudio, un libro o un atlas.',
      inputSchema: {
        type: 'object',
        properties: {
          consulta: {
            type: 'string',
            description: 'Tema o título a buscar',
          },
        },
        required: ['consulta'],
      },
      execute: function (inp) {
        var q = nz(String(inp.consulta || ''));
        var r = LIB.filter(function (x) {
          return lbHay(x).indexOf(q) >= 0;
        }).slice(0, 5);
        if (!r.length) return 'Sin resultados en la biblioteca para «' + inp.consulta + '».';
        return r.map(function (x) {
          return {
            titulo: x.tit,
            autor: x.org,
            materia: lbCatName(x.cat),
            idioma: x.idi,
            tema: x.tema,
            enlace: x.url,
          };
        });
      },
    },
    {
      name: 'buscar_tarjetas',
      description:
        'Busca entre las tarjetas de estudio de ROUVIÈRE. Devuelve hasta 5 con su pregunta, respuesta y sistema. Úsala cuando pidan repasar un tema concreto.',
      inputSchema: {
        type: 'object',
        properties: {
          texto: {
            type: 'string',
            description: 'Palabra o tema',
          },
        },
        required: ['texto'],
      },
      execute: function (inp) {
        var q = nz(String(inp.texto || ''));
        var r = allCards()
          .filter(function (c) {
            return nz(c.q + ' ' + c.a + ' ' + (c.t || '')).indexOf(q) >= 0;
          })
          .slice(0, 5);
        if (!r.length)
          return (
            'No hay tarjetas sobre «' +
            inp.texto +
            '». El banco tiene ' +
            allCards().length +
            ' en total.'
          );
        return r.map(function (c) {
          return {
            pregunta: c.q,
            respuesta: c.a,
            sistema: mn(c.m),
            tema: c.t,
          };
        });
      },
    },
    {
      name: 'buscar_atlas',
      description:
        'Busca una estructura anatómica en el Atlas 3D y dice en qué sistema está y si hay modelo cargable. Úsala cuando pregunten dónde ver algo en 3D.',
      inputSchema: {
        type: 'object',
        properties: {
          estructura: {
            type: 'string',
          },
        },
        required: ['estructura'],
      },
      execute: function (inp) {
        var q = nz(String(inp.estructura || '')),
          r = [];
        ATL_M.forEach(function (m) {
          if (nz(m.n).indexOf(q) >= 0)
            r.push({
              modelo: m.n,
              piezas: m.parts,
              sistema: m.sys.join(', '),
            });
        });
        ATL_SYS.forEach(function (sy) {
          if (nz(sy[1] + ' ' + sy[2]).indexOf(q) >= 0)
            r.push({
              sistema: sy[1],
              descripcion: sy[2],
            });
        });
        if (typeof estado.AT3 === 'object' && estado.AT3 && estado.AT3.ix && estado.AT3.ix.grupos)
          estado.AT3.ix.grupos.forEach(function (g) {
            g.parts.forEach(function (p) {
              if (r.length < 10 && nz(p.n).indexOf(q) >= 0)
                r.push({
                  estructura: p.n,
                  grupo: g.n,
                });
            });
          });
        return r.length
          ? r.slice(0, 10)
          : 'No encontré «' + inp.estructura + '» en el atlas cargado.';
      },
    },
    {
      name: 'mi_progreso',
      description:
        'Lee el progreso real del estudiante en este dispositivo: tarjetas sabidas y pendientes, simulacros hechos, nota media, racha y XP del caminito. Úsala antes de recomendar qué estudiar.',
      execute: function () {
        var a = allCards().length,
          sab = 0,
          dif = 0;
        allCards().forEach(function (c) {
          var e = cEstado(c.id);
          if (e === 'ok') sab++;
          else if (e === 'dif') dif++;
        });
        var h = estado.S.hist || [],
          med = h.length
            ? Math.round(
                h.reduce(function (x, y) {
                  return x + (y.pc || 0);
                }, 0) / h.length,
              )
            : null;
        rtS();
        return {
          tarjetas_totales: a,
          sabidas: sab,
          dificiles: dif,
          pendientes: a - sab - dif,
          simulacros_hechos: h.length,
          nota_media_porcentaje: med,
          dias_estudiados: (estado.S.act || []).length,
          xp_caminito: estado.S.ruta.xp,
          nodos_completados: Object.keys(estado.S.ruta.done).length,
        };
      },
    },
    {
      name: 'ir_a_seccion',
      description:
        'Abre de verdad una sección de ROUVIÈRE en la pantalla del estudiante. Secciones válidas: home, atlas, ruta, tarjetas, simulacros, examenes, progreso, estudio, biblioteca, modulos, snc, embrio, fuentes, sobre.',
      inputSchema: {
        type: 'object',
        properties: {
          seccion: {
            type: 'string',
          },
        },
        required: ['seccion'],
      },
      execute: function (inp) {
        var v = String(inp.seccion || '')
          .replace('#', '')
          .trim();
        if (V.indexOf(v) < 0)
          return 'No existe la sección «' + v + '». Las válidas son: ' + V.join(', ') + '.';
        location.hash = '#' + v;
        rouMin();
        return 'Abierta la sección ' + v + ' en la pantalla.';
      },
    },
  ];
}

/* ------------------------------------------------------------ interfaz */
export function rouBurbuja(rol, txt, pend) {
  var d = el('div', 'rb ' + (rol === 'u' ? 'ru' : 'ra'));
  if (rol !== 'u') {
    var ic = el('span', 'rbi');
    ic.innerHTML = ROUSVG(22, 1);
    d.appendChild(ic);
  }
  var p = el('div', 'rbt', txt);
  if (pend) p.classList.add('pend');
  d.appendChild(p);
  return d;
}
export function rouPinta() {
  var w = $('roul');
  if (!w) return;
  w.textContent = '';
  var h = rouS().h;
  if (!h.length) {
    w.appendChild(
      rouBurbuja(
        'a',
        'Hola, soy Rou, tu asistente virtual de ROUVIÈRE. ' +
          'Estoy aquí para ayudarte a estudiar, resolver dudas y encontrar lo que necesitas.',
      ),
    );
  }
  h.forEach(function (m) {
    w.appendChild(rouBurbuja(m.r, m.t));
  });
  w.scrollTop = w.scrollHeight;
}
export function rouEstado(t, cls) {
  var e = $('roust');
  if (!e) return;
  e.textContent = t || '';
  e.className = 's rst ' + (cls || '');
}
export function rouAbrir() {
  var p = $('roup');
  if (!p) return;
  p.style.display = '';
  p.setAttribute('aria-hidden', 'false');
  document.body.classList.add('roud');
  rouPinta();
  var i = $('roui');
  if (i)
    setTimeout(function () {
      i.focus();
    }, 80);
}
export function rouMin() {
  var p = $('roup');
  if (!p) return;
  p.style.display = 'none';
  p.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('roud');
}
export function rouCerrar() {
  if (estado.ROUCTL) estado.ROUCTL.abort();
  rouMin();
}
export function rouLimpiar() {
  if (estado.ROUCTL) estado.ROUCTL.abort();
  rouS().h = [];
  W();
  rouPinta();
  rouEstado('Conversación borrada. Empezamos de cero.');
}

/* ------------------------------------------------------------ envío */
export function rouMsgErr(c) {
  return c === 'not_granted'
    ? 'No diste permiso para que ROUVIÈRE use tu cuenta de Claude. Puedes activarlo en el menú de permisos del artefacto.'
    : c === 'rate_limited'
      ? 'Has hecho muchas consultas seguidas o llegaste a tu límite de uso. Espera un poco y vuelve a intentarlo.'
      : c === 'session_expired'
        ? 'Tu sesión caducó. Vuelve a entrar y repite la pregunta.'
        : c === 'sampling_disabled'
          ? 'Tu cuenta no tiene disponible la IA en artefactos.'
          : c === 'refused'
            ? 'Esa petición no la puedo responder. Pruébala de otra forma.'
            : c === 'prompt_too_large'
              ? 'La conversación se hizo demasiado larga. Pulsa «Borrar conversación» y vuelve a preguntar.'
              : c === 'empty_completion'
                ? 'No salió ninguna respuesta. Prueba a preguntarlo más concreto.'
                : 'Hubo un fallo de conexión al responder. Inténtalo otra vez.';
}
export async function rouEnviar(texto) {
  var t = String(texto || '').trim();
  if (!t) return;
  var r = rouS();
  r.h.push({
    r: 'u',
    t: t,
  });
  rouGuarda();
  rouPinta();
  var i = $('roui');
  if (i) {
    i.value = '';
    rouAlto();
  }
  if (!estado.ROUAI && !r.url) {
    rouSinIA();
    return;
  }
  var w = $('roul');
  var burb = rouBurbuja('a', 'Pensando…', true);
  w.appendChild(burb);
  w.scrollTop = w.scrollHeight;
  var cuerpo = burb.querySelector('.rbt');
  rouEstado('ROU está escribiendo…', 'esc');
  $('rouenv').style.display = 'none';
  $('roustop').style.display = '';
  estado.ROUCTL = new AbortController();
  var conTools = !!(
    estado.ROULIM && estado.ROULIM.tools
  ); /* para no reintentar dos veces lo mismo */
  var turnos = [
    {
      role: 'user',
      content: ROUREGLAS,
    },
  ];
  r.h.slice(-ROUMAX).forEach(function (m) {
    turnos.push({
      role: m.r === 'u' ? 'user' : 'assistant',
      content: m.t,
    });
  });
  try {
    var res;
    if (estado.ROUAI) {
      res = await estado.ROUAI(turnos, {
        cache: false,
        signal: estado.ROUCTL.signal,
        tools: estado.ROULIM && estado.ROULIM.tools ? rouTools() : undefined,
        onText: function (u) {
          cuerpo.classList.remove('pend');
          cuerpo.textContent = u.text;
          w.scrollTop = w.scrollHeight;
        },
      });
      res = res.text;
    } else res = await rouPropio(turnos, cuerpo, w);
    cuerpo.classList.remove('pend');
    cuerpo.textContent = res;
    r.h.push({
      r: 'a',
      t: res,
    });
    rouGuarda();
    rouEstado('');
  } catch (e) {
    var cod = (e && e.code) || 'upstream_error';
    if (cod === 'cancelled') {
      var parc = (e && e.text) || '';
      if (parc) {
        cuerpo.classList.remove('pend');
        cuerpo.textContent = parc + ' […detenido]';
        r.h.push({
          r: 'a',
          t: parc + ' […detenido]',
        });
        rouGuarda();
      } else burb.remove();
      rouEstado('Detenido.');
    } else if (cod === 'tools_unavailable' && conTools) {
      /* Se reintenta UNA vez, sin las funciones. Antes se reintentaba siempre, así que
         una plataforma que rechazara la llamada por otro motivo dejaba a ROU girando
         en bucle y colgaba la pestaña. */
      estado.ROULIM = estado.ROULIM || {};
      delete estado.ROULIM.tools;
      burb.remove();
      rouEstado('Reintentando sin las funciones de la plataforma…');
      r.h.pop();
      return rouEnviar(t);
    } else {
      cuerpo.classList.remove('pend');
      cuerpo.classList.add('err');
      cuerpo.textContent = rouMsgErr(cod);
      rouEstado('');
    }
  } finally {
    estado.ROUCTL = null;
    var a = $('rouenv'),
      b = $('roustop');
    if (a) a.style.display = '';
    if (b) b.style.display = 'none';
    w.scrollTop = w.scrollHeight;
  }
}
export function rouParar() {
  if (estado.ROUCTL) estado.ROUCTL.abort();
}

/* ------------------------------------------------------------ backend propio */
export async function rouPropio(turnos, cuerpo, w) {
  var u = rouS().url;
  var rs = await fetch(u, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    signal: estado.ROUCTL.signal,
    body: JSON.stringify({
      messages: turnos,
    }),
  });
  if (!rs.ok)
    throw {
      code: 'upstream_error',
      message: 'HTTP ' + rs.status,
    };
  var ct = rs.headers.get('content-type') || '';
  if (ct.indexOf('application/json') >= 0) {
    var j = await rs.json();
    var t =
      j.text ||
      j.content ||
      j.respuesta ||
      (j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content);
    if (!t)
      throw {
        code: 'empty_completion',
        message: 'sin texto',
      };
    return String(t);
  }
  /* texto plano o streaming línea a línea */
  var rd = rs.body.getReader(),
    dec = new TextDecoder(),
    acc = '';
  while (true) {
    var c = await rd.read();
    if (c.done) break;
    acc += dec.decode(c.value, {
      stream: true,
    });
    cuerpo.classList.remove('pend');
    cuerpo.textContent = acc;
    w.scrollTop = w.scrollHeight;
  }
  if (!acc.trim())
    throw {
      code: 'empty_completion',
      message: 'sin texto',
    };
  return acc;
}

/* ------------------------------------------------------------ sin IA: lo que sí puede hacer */
export function rouSinIA() {
  var q = rouS().h[rouS().h.length - 1].t,
    nq = nz(q),
    w = $('roul');
  var partes = [],
    hecho = false;
  var secc = [
    ['atlas', 'atlas'],
    ['modelo 3d', 'atlas'],
    ['tarjeta', 'tarjetas'],
    ['flashcard', 'tarjetas'],
    ['simulacro', 'simulacros'],
    ['examen', 'examenes'],
    ['progreso', 'progreso'],
    ['caminito', 'ruta'],
    ['ruta', 'ruta'],
    ['biblioteca', 'biblioteca'],
    ['libro', 'biblioteca'],
    ['estudio con ia', 'estudio'],
    ['apunte', 'estudio'],
    ['nervioso', 'snc'],
    ['embrio', 'embrio'],
  ];
  var dest = null;
  secc.forEach(function (p) {
    if (!dest && nq.indexOf(nz(p[0])) >= 0) dest = p[1];
  });
  var libs = LIB.filter(function (x) {
    return rouPal(nq).some(function (p) {
      return lbHay(x).indexOf(p) >= 0;
    });
  }).slice(0, 3);
  var tars = allCards()
    .filter(function (c) {
      return rouPal(nq).some(function (p) {
        return nz(c.q + ' ' + c.a).indexOf(p) >= 0;
      });
    })
    .slice(0, 3);
  partes.push(
    'Aquí no tengo una IA conectada, así que no voy a redactarte una explicación: ' +
      'sería inventármela. Lo que sí puedo hacer es buscar de verdad en lo que ya tiene ROUVIÈRE.',
  );
  if (libs.length) {
    hecho = true;
    partes.push(
      '\nEn la biblioteca encontré:\n' +
        libs
          .map(function (x) {
            return '• ' + x.tit + ' — ' + x.org;
          })
          .join('\n'),
    );
  }
  if (tars.length) {
    hecho = true;
    partes.push(
      '\nTarjetas que tocan eso:\n' +
        tars
          .map(function (c) {
            return '• ' + c.q;
          })
          .join('\n'),
    );
  }
  if (dest) {
    hecho = true;
    partes.push('\nTe llevo a la sección correspondiente.');
  }
  if (!hecho)
    partes.push('\nDe esto concreto no encontré nada en la biblioteca ni en las tarjetas.');
  partes.push(
    '\nPara que pueda responderte de verdad: abre ROUVIÈRE desde el enlace del artefacto ' +
      'de Claude (ahí uso tu propia cuenta, sin claves), o conecta tu servidor en «Ajustes de ROU».',
  );
  var txt = partes.join('\n');
  rouS().h.push({
    r: 'a',
    t: txt,
  });
  rouGuarda();
  rouPinta();
  if (dest)
    setTimeout(function () {
      location.hash = '#' + dest;
      rouMin();
    }, 900);
}
export function rouPal(n) {
  return String(n)
    .split(/\s+/)
    .filter(function (p) {
      return p.length > 3 && STOP.indexOf(p) < 0;
    });
}

/* ------------------------------------------------------------ ajustes */
export function rouURL() {
  var v = String($('rouurl').value || '').trim();
  if (v && !/^https:\/\//.test(v) && !/^http:\/\/localhost/.test(v)) {
    rouEstado('La dirección debe empezar por https:// (o http://localhost para pruebas).', 'err');
    return;
  }
  rouS().url = v;
  W();
  rouEstado(
    v ? 'Servidor guardado. ROU lo usará cuando no haya IA del artefacto.' : 'Servidor borrado.',
  );
  rouCab();
}
export function rouCab() {
  var e = $('rouvia');
  if (!e) return;
  e.textContent = estado.ROUAI
    ? 'IA conectada · responde Claude con tu propia cuenta'
    : rouS().url
      ? 'IA conectada · tu servidor'
      : 'Sin IA conectada · solo búsqueda dentro de ROUVIÈRE';
  e.className = 'rvia ' + (estado.ROUAI || rouS().url ? 'ok' : 'no');
  var h = $('rouhome');
  if (h) h.textContent = e.textContent;
  var h2 = $('rouhome2');
  if (h2) {
    h2.textContent = e.textContent;
    h2.className = e.className;
  }
}

/* ------------------------------------------------------------ eventos */
export function rouAlto() {
  var i = $('roui');
  if (!i) return;
  i.style.height = 'auto';
  i.style.height = Math.min(i.scrollHeight, 120) + 'px';
}

/* Qué pestaña se enciende en cada sección, y a dónde lleva cada una.
   Barra de cinco: Inicio, Aprender, Rou (en el centro, abre el chat), Biblioteca y Perfil. */
export const TAB_DE = {
  home: 'inicio',
  sobre: 'inicio',
  voces: 'inicio',
  fuentes: 'inicio',
  modulos: 'aprender',
  anatomia: 'aprender',
  atlas: 'aprender',
  snc: 'aprender',
  embrio: 'aprender',
  estructuras: 'aprender',
  practica: 'aprender',
  tarjetas: 'aprender',
  simulacros: 'aprender',
  ruta: 'aprender',
  casos: 'aprender',
  competencia: 'aprender',
  estudio: 'aprender',
  biblioteca: 'biblioteca',
  progreso: 'perfil',
  examenes: 'perfil',
  rou: 'rou',
};
export const TAB_A = {
  inicio: 'home',
  aprender: 'anatomia',
  biblioteca: 'biblioteca',
  perfil: 'progreso',
};
export function tabAct(k) {
  var d = TAB_A[k];
  if (d) location.hash = '#' + d;
}
export function renderTabs(h) {
  var act = TAB_DE[h] || '';
  document.querySelectorAll('#tabbar .tbb').forEach(function (b) {
    b.classList.toggle('on', b.getAttribute('data-k') === act);
    if (b.getAttribute('data-k') === act) b.setAttribute('aria-current', 'page');
    else b.removeAttribute('aria-current');
  });
}
export function rouAct(a, t) {
  if (a === 'abrir') {
    rouAbrir();
    return;
  }
  if (a === 'min') {
    rouMin();
    return;
  }
  if (a === 'cerrar') {
    rouCerrar();
    return;
  }
  if (a === 'enviar') {
    rouEnviar($('roui').value);
    return;
  }
  if (a === 'parar') {
    rouParar();
    return;
  }
  if (a === 'limpiar') {
    rouLimpiar();
    return;
  }
  if (a === 'url') {
    rouURL();
    return;
  }
  if (a === 'chip') {
    rouAbrir();
    rouEnviar(t.getAttribute('data-q'));
    return;
  }
}
export function rouTecla(e, t) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    rouEnviar(t.value);
  }
}

/* ------------------------------------------------------------ arranque */
export async function rouInit() {
  rouS();
  rouCab();
  rouChips();
  li($('roucomo'), ROUCOMO);
  li($('rounope'), ROUNOPE);
  var hh = document.querySelector('#roup .rhi');
  if (hh) hh.innerHTML = ROUSVG(34, 1);
  var he = document.querySelector('.rouhero .rhero');
  if (he) he.innerHTML = ROUSVG(104);
  var hb = $('rouhomesvg');
  if (hb) hb.innerHTML = ROUSVG(120);
  var i = $('roui');
  if (i) i.addEventListener('input', rouAlto);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && $('roup') && $('roup').style.display !== 'none') rouMin();
  });
  if ($('rouurl')) $('rouurl').value = rouS().url || '';
  if (typeof claude === 'undefined' || !claude || !claude.use) return;
  try {
    estado.ROUAI = await claude.use('sample');
    if (estado.ROUAI) {
      try {
        estado.ROULIM = await estado.ROUAI.limits();
      } catch (e) {
        estado.ROULIM = {};
      }
    }
    rouCab();
  } catch (e) {
    estado.ROUAI = null;
    rouCab();
  }
}

/* ===== buscador general ===== */
/* Busca en lo que la plataforma tiene de verdad. Cada resultado dice de dónde
   sale y, al abrirlo, deja la sección ya filtrada por lo que buscaste. */
