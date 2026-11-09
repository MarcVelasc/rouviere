import { estado } from '../../estado.js';
import { $, el, msg } from '../../core/dom.js';
import { compAbrir } from '../anatomia/anatomia.js';
import { anAbrir } from '../anatomia/categorias.js';
import { COMP, compAvance, compGet } from '../anatomia/competencias.js';
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
/* ===== pantalla de inicio =====
   Saludo con el nombre de la sesión, la frase del día y las competencias con su avance
   real. Las herramientas son enlaces fijos en app/index.html. */
export function renderInicio() {
  msg('iniHola', 'Hola' + (nombreSesion() ? ', ' + nombreSesion() : ''));
  msg('iniLead', holaTexto());
  renderInicioComps();
  iniFlecha();
}

/* El nombre lo guarda el acceso (src/) en la sesión. Solo el primer nombre. */
function nombreSesion() {
  try {
    var k = 'rouviere.session';
    var s = JSON.parse(localStorage.getItem(k) || sessionStorage.getItem(k) || 'null');
    var n = s && s.user && s.user.name ? String(s.user.name).trim().split(/\s+/)[0] : '';
    return n || '';
  } catch (e) {
    return '';
  }
}

function renderInicioComps() {
  var w = $('iniComps');
  if (!w || typeof COMP === 'undefined') return;
  w.textContent = '';
  COMP.forEach(function (a) {
    var av = compAvance(a[0]);
    var nombre = a[1].replace(/^Competencia \d+ · /, '');
    var num = a[0] === 'base' ? 'B' : a[0].replace('c', '');
    var li = el('li');
    var t = el('a', 'ini-comp');
    t.href = '#anatomia';
    t.setAttribute('data-hc', '142');
    t.setAttribute('data-k', a[0]);
    t.appendChild(el('span', 'ini-num', num));
    t.appendChild(el('span', 'ini-ct', nombre));
    var bar = el('span', 'ini-bar');
    bar.setAttribute('role', 'progressbar');
    bar.setAttribute('aria-label', 'Avance en ' + nombre);
    bar.setAttribute('aria-valuemin', '0');
    bar.setAttribute('aria-valuemax', '100');
    bar.setAttribute('aria-valuenow', String(av.pc));
    var i = document.createElement('i');
    i.style.width = av.pc + '%';
    bar.appendChild(i);
    t.appendChild(bar);
    t.appendChild(el('span', 'ini-pc', av.pc + '%'));
    li.appendChild(t);
    w.appendChild(li);
  });
}

/* La flecha de la fila de herramientas (celular): desliza y se oculta al llegar al final. */
function iniFlecha() {
  var row = $('iniTools'),
    more = $('iniMore');
  if (!row || !more || more.dataset.ok) return;
  more.dataset.ok = '1';
  function upd() {
    more.hidden = row.scrollLeft + row.clientWidth >= row.scrollWidth - 8;
  }
  row.addEventListener('scroll', upd, { passive: true });
  window.addEventListener('resize', upd);
  more.addEventListener('click', function () {
    row.scrollBy({ left: row.clientWidth * 0.8, behavior: estado.RM ? 'auto' : 'smooth' });
  });
  upd();
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
