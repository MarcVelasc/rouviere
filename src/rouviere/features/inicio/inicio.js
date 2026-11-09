import { estado } from '../../estado.js';
import { $, el } from '../../core/dom.js';
import { compAbrir } from '../anatomia/anatomia.js';
import { anAbrir } from '../anatomia/categorias.js';
import { COMP, compAvance, compCuenta, compGet } from '../anatomia/competencias.js';
import { qAll } from '../simulacros/simulacros.js';
import { allCards, cDue } from '../tarjetas/tarjetas.js';
export /* ===== el inicio =====
   Saludo corto, las siete áreas y el acceso a la práctica. Los números salen del
   contenido que hay en ese momento, no están escritos a mano. */
function holaTexto() {
  var h = new Date().getHours();
  var s =
    h < 6 ? 'Buenas noches' : h < 13 ? 'Buenos días' : h < 20 ? 'Buenas tardes' : 'Buenas noches';
  var d = 0;
  try {
    allCards().forEach(function (c) {
      var t = cDue(c.id);
      if (t && t <= Date.now()) d++;
    });
  } catch (e) {}
  if (d) return s + '. Tienes ' + d + (d === 1 ? ' tarjeta' : ' tarjetas') + ' para repasar.';
  var v = 0;
  try {
    v = (estado.S.act && Object.keys(estado.S.act).length) || 0;
  } catch (e) {}
  return v
    ? s + '. ¿Seguimos donde lo dejaste?'
    : s + '. Elige una competencia y empieza a estudiar.';
}
export function renderHola() {
  var p = $('holat');
  if (p) p.textContent = holaTexto();
}
export function renderAreas() {
  var w = $('homeareas');
  if (!w || typeof COMP === 'undefined') return;
  w.textContent = '';
  /* Las competencias de la materia: es como el docente pide que se entre al contenido.
     Las siete áreas por sistema siguen a un toque, en la propia sección Anatomía. */
  COMP.forEach(function (a) {
    var c = compCuenta(a[0]),
      av = compAvance(a[0]);
    var t = el('a', 'arc');
    t.href = '#anatomia';
    t.setAttribute('data-hc', '142');
    t.setAttribute('data-k', a[0]);
    t.appendChild(el('b', 0, a[1].replace('Competencia ', 'C').replace(' · ', '. ')));
    t.appendChild(
      el(
        'span',
        'arcn',
        c.c + (c.c === 1 ? ' tarjeta' : ' tarjetas') + (av.k ? ' · ' + av.pc + '%' : ''),
      ),
    );
    w.appendChild(t);
  });
  var ps = $('hpracs');
  if (ps) {
    var n = 0,
      q = 0;
    try {
      n = allCards().length;
      q = qAll().length;
    } catch (e) {}
    ps.textContent = n + ' tarjetas y ' + q + ' preguntas, con revisión de errores.';
  }
}

/* Desde el inicio se entra directo al área: un toque menos que pasar por la lista. */
export function areaIr(k) {
  /* Vale tanto para una competencia como para un área: el inicio enseña las primeras,
     la pestaña «Por sistema» las segundas. */
  var esComp = typeof compGet === 'function' && !!compGet(k);
  estado.AN_MODO = esComp ? 'comp' : 'area';
  location.hash = '#anatomia';
  setTimeout(function () {
    if (esComp) compAbrir(k);
    else anAbrir(k);
  }, 60);
}

/* ===== Práctica =====
   Una sola puerta para las cuatro herramientas de estudio, como pide el documento de
   experiencia de usuario. No mueve ni duplica nada: cada tarjeta lleva a la sección
   que ya existía, y el número que enseña se calcula en el momento. */
