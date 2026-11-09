import { BANK, QB, mn } from '../../core/almacenamiento.js';
import { nz } from '../../core/dom.js';
import { allCards, cEstado } from '../tarjetas/tarjetas.js';
import COMP__json from '../../data/comp.json';
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
export const COMP = COMP__json;
export function compGet(k) {
  for (var i = 0; i < COMP.length; i++) if (COMP[i][0] === k) return COMP[i];
  return null;
}
export function compCasa(c, a) {
  if (!a) return true;
  for (var i = 0; i < a[3].length; i++)
    if (a[3][i][0] === c.m && a[3][i][1] === (c.t || '')) return true;
  return false;
}
export function compCuenta(k) {
  var a = compGet(k);
  if (!a)
    return {
      c: 0,
      q: 0,
    };
  var c = 0,
    q = 0,
    i;
  for (i = 0; i < BANK.length; i++) if (compCasa(BANK[i], a)) c++;
  for (i = 0; i < QB.length; i++) if (compCasa(QB[i], a)) q++;
  return {
    c: c,
    q: q,
  };
}
export function compAvance(k) {
  var a = compGet(k);
  if (!a)
    return {
      k: 0,
      n: 0,
      pc: 0,
    };
  var n = 0,
    c = 0;
  allCards().forEach(function (x) {
    if (compCasa(x, a)) {
      n++;
      if (cEstado(x.id) === 'k') c++;
    }
  });
  return {
    k: c,
    n: n,
    pc: n ? Math.round((c / n) * 100) : 0,
  };
}
/* Las áreas que toca cada competencia, para enseñar de dónde sale su contenido. */
export function compAreas(k) {
  var a = compGet(k);
  if (!a) return [];
  var r = {};
  a[3].forEach(function (p) {
    r[p[0]] = 1;
  });
  return Object.keys(r).map(mn);
}
export function compHay(a) {
  return nz(
    a[1] +
      ' ' +
      a[2] +
      ' ' +
      a[3]
        .map(function (p) {
          return p[1] + ' ' + mn(p[0]);
        })
        .join(' '),
  );
}

/* ===== categorías anatómicas =====
   Las cinco primeras son las ramas clásicas de la anatomía descriptiva que pide el
   documento de organización. Las tres últimas no son invento: son las otras ramas
   clásicas, y están porque entre las cinco primeras solo caben cuatro de los doce
   sistemas del temario; sin ellas, 156 de las 335 tarjetas se quedarían sin entrada.
   Ningún contenido aparece en dos categorías a la vez: Artrología se lleva el tema
   «Articulaciones» y Osteología lo excluye.

   k  clave · n nombre · d qué abarca · sis sistemas del temario que entran
   t  único tema incluido · xt tema excluido · at qué abre en el Atlas 3D
   lib materia de la biblioteca que lo cubre */
