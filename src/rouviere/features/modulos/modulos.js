import { estado } from '../../estado.js';
import { QB, TCAMPOS, TCONF, TEM, TNOTA, TTRANS, mn } from '../../core/almacenamiento.js';
import { $, el, msg, nz } from '../../core/dom.js';
import { fueraAsig } from '../embriologia/histologia-embriologia.js';
import { renderGroupSrc } from '../fuentes/fuentes.js';
import { XC } from '../simulacros/simulacros.js';
import { allCards } from '../tarjetas/tarjetas.js';
export function li(ul, arr) {
  ul.textContent = '';
  arr.forEach(function (x) {
    ul.appendChild(el('li', 0, x));
  });
}
export function tab(n) {
  if (TEM[n] && fueraAsig(TEM[n].id)) return; /* asignatura fuera del foco */
  estado.curSub = n;
  estado.curG = null;
  $('mq').value = '';
  document.querySelectorAll('#modulos .tb').forEach(function (x, j) {
    x.classList.toggle('on', j === n);
  });
  $('mdd').style.display = 'none';
  $('mdw').style.display = '';
  $('tgen').textContent = 'Competencia general: ' + TEM[n].gen;
  renderMods();
}
export function grpCards(g) {
  return allCards().filter(function (c) {
    return g.m && c.m === g.m;
  }).length;
}
export function grpQs(g) {
  return QB.concat(estado.S.bank).filter(function (q) {
    return g.m && q.m === g.m;
  }).length;
}
export function renderMods() {
  var sj = TEM[estado.curSub],
    q = nz($('mq').value),
    l = $('mdl'),
    n = 0;
  l.textContent = '';
  $('tnota').textContent = TNOTA;
  li($('ttrans'), TTRANS);
  li($('tcampos'), TCAMPOS);
  li($('tconf'), TCONF);
  if (!$('tgen').textContent) $('tgen').textContent = 'Competencia general: ' + sj.gen;
  sj.g.forEach(function (g, i) {
    var hay = nz(g.t + ' ' + g.comp + ' ' + g.cont.join(' '));
    if (q && hay.indexOf(q) < 0) return;
    n++;
    var b = el('button', 'gcard');
    b.type = 'button';
    var a = el('span', 'gl', 'Grupo ' + g.g);
    b.appendChild(a);
    var t = el('span', 'gt', g.t);
    b.appendChild(t);
    var c = grpCards(g),
      qq = grpQs(g);
    b.appendChild(
      el(
        'span',
        'gs',
        g.cont.length +
          ' contenidos · ' +
          (c || qq ? c + ' tarjetas · ' + qq + ' preguntas' : 'sin material cargado'),
      ),
    );
    b.onclick = function () {
      openGroup(i);
    };
    l.appendChild(b);
  });
  if (!n) l.appendChild(el('p', 's', 'Ningún grupo coincide con tu búsqueda.'));
}
export function openGroup(i) {
  var sj = TEM[estado.curSub],
    g = sj.g[i];
  estado.curG = g;
  $('mdw').style.display = 'none';
  $('mdd').style.display = '';
  msg('mdest', 'Propuesta · sin validar');
  $('mdt').textContent = 'Grupo ' + g.g + '. ' + g.t;
  msg(
    'mdi',
    sj.n +
      ' · ' +
      g.cont.length +
      ' contenidos' +
      (g.m
        ? ' · ' + grpCards(g) + ' tarjetas y ' + grpQs(g) + ' preguntas en «' + mn(g.m) + '»'
        : ''),
  );
  msg('mdcomp', g.comp);
  li($('mdcont'), g.cont);
  msg('mdev', g.ev);
  renderGroupSrc(['ana', 'his', 'emb'][estado.curSub]);
  window.scrollTo(0, 0);
}
export function backG() {
  $('mdd').style.display = 'none';
  $('mdw').style.display = '';
  renderMods();
}
export function modGo(w) {
  var m = estado.curG && estado.curG.m ? estado.curG.m : 'all';
  if (w === 't') {
    estado.CF.m = m;
    estado.CF.t = 'all';
    estado.CF.d = 'all';
    estado.CF.st = 'all';
    estado.CF.q = '';
    estado.CF.fav = false;
    location.hash = '#tarjetas';
  } else if (w === 's') {
    XC.sis = m;
    XC.tema = 'all';
    location.hash = '#simulacros';
  } else {
    location.hash = '#atlas';
  }
}
/* ===== tarjetas ===== */
/* Estado de los filtros y de la sesión de estudio */
