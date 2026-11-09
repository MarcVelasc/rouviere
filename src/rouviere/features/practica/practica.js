import { estado } from '../../estado.js';
import { $, el } from '../../core/dom.js';
import { mvpVale } from '../mvp/mvp.js';
import { RUTA, qAll } from '../simulacros/simulacros.js';
import { allCards, cDue } from '../tarjetas/tarjetas.js';
/* ===== Práctica =====
   Una sola puerta para las cuatro herramientas de estudio, como pide el documento de
   experiencia de usuario. No mueve ni duplica nada: cada tarjeta lleva a la sección
   que ya existía, y el número que enseña se calcula en el momento. */
export const PRAC = [
  [
    'tarjetas',
    'Tarjetas de estudio',
    'Responde de memoria y comprueba. Con pistas si te trabas.',
    function () {
      var n = allCards().length,
        d = 0;
      allCards().forEach(function (c) {
        var t = cDue(c.id);
        if (t && t <= Date.now()) d++;
      });
      return n + (n === 1 ? ' tarjeta' : ' tarjetas') + (d ? ' · ' + d + ' para repasar hoy' : '');
    },
  ],
  [
    'simulacros',
    'Simulacros',
    'Preguntas de opción múltiple con su explicación y revisión de errores.',
    function () {
      var n = qAll().length;
      return n + (n === 1 ? ' pregunta' : ' preguntas');
    },
  ],
  [
    'ruta',
    'Ruta de aprendizaje',
    'El recorrido ordenado, de los fundamentos a los sistemas.',
    function () {
      if (typeof RUTA === 'undefined') return '';
      var t = 0;
      RUTA.forEach(function (u) {
        t += u.nodos ? u.nodos.length : 0;
      });
      return RUTA.length + ' unidades · ' + t + ' pasos';
    },
  ],
  [
    'estudio',
    'Estudio con IA',
    'Sube tus apuntes y saca resúmenes, esquemas y preguntas.',
    function () {
      return estado.S.docs && estado.S.docs.length
        ? estado.S.docs.length + (estado.S.docs.length === 1 ? ' apunte tuyo' : ' apuntes tuyos')
        : 'Tus propios apuntes';
    },
  ],
];
export function renderPrac() {
  var w = $('praclist');
  if (!w) return;
  w.textContent = '';
  PRAC.forEach(function (p) {
    if (!mvpVale(p[0])) return; /* en modo MVP no se ofrece lo que está fuera */
    var a = el('a', 'prc');
    a.href = '#' + p[0];
    a.appendChild(el('b', 0, p[1]));
    a.appendChild(el('p', 'prcd', p[2]));
    var d = '';
    try {
      d = p[3]();
    } catch (e) {
      d = '';
    }
    if (d) a.appendChild(el('span', 'prcn', d));
    w.appendChild(a);
  });
  /* lo siguiente que le toca, sin tener que entrar a ver */
  var h = $('pracsig');
  if (h) {
    var d = 0;
    allCards().forEach(function (c) {
      var t = cDue(c.id);
      if (t && t <= Date.now()) d++;
    });
    h.textContent = d
      ? 'Tienes ' + d + (d === 1 ? ' tarjeta' : ' tarjetas') + ' esperando repaso.'
      : 'No tienes repasos pendientes: empieza por donde quieras.';
  }
}

/* ===== competencias de Anatomía =====
   Las cinco que fijó el docente en la entrevista, más un sexto grupo de bases: entre
   las cinco no caben la terminología, las regiones y cavidades, la anatomía de
   superficie, la piel y el tejido conectivo ni las generalidades endocrinas, y sin ese
   grupo 35 tarjetas se quedarían sin puerta de entrada.

   El reparto se hace por tema, no por sistema, y se enseña entero en la ficha de cada
   competencia: es una propuesta a partir del nombre de cada tema y queda pendiente de
   que el docente la confirme. Para corregirla solo hay que mover un tema de lista.

   k · n nombre · d qué abarca · t pares [sistema, tema] · at modelos del Atlas
   img ilustración · lib materia de la biblioteca */
