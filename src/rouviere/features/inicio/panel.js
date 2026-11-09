import { estado } from '../../estado.js';
import { W } from '../../core/almacenamiento.js';
import { $, el, fmt } from '../../core/dom.js';
import { fueraSec } from '../embriologia/histologia-embriologia.js';
import { exMs, nxt } from '../examenes/examenes.js';
import { avgSc } from './resumen.js';
import { mvpVale } from '../mvp/mvp.js';
import { rtNivel, rtRacha } from '../ruta/ruta.js';
import { allCards, cEstado, cPend } from '../tarjetas/tarjetas.js';
export /* ===== panel de inicio =====
   Sustituye al catálogo de herramientas, que repetía el menú lateral. Todo lo que
   enseña sale del estado guardado en este dispositivo; cuando no hay nada, lo dice.
   Ninguna cifra es de ejemplo. */

/* La última sección visitada, para poder retomarla. Se guarda solo cuando cambia. */
function ultSet(h) {
  if (!h || h === 'home' || !estado.S) return;
  if (estado.S.ult === h) return;
  estado.S.ult = h;
  W();
}
export function ultNom(h) {
  var r = null;
  if (typeof estado.GSEC !== 'undefined')
    estado.GSEC.forEach(function (c) {
      if (c[0] === h) r = c;
    });
  return r;
}
export function pnlCont() {
  var w = $('pnlcont');
  if (!w) return;
  w.textContent = '';
  var h = estado.S.ult,
    g = ultNom(h);
  /* Si la última sección quedó fuera del foco o del modo MVP, no se ofrece. */
  if (g && typeof fueraSec === 'function' && fueraSec(h)) g = null;
  if (g && typeof mvpVale === 'function' && !mvpVale(h)) g = null;
  var c = el('div', 'pcard');
  if (g) {
    c.appendChild(el('span', 'pck', 'Continuar aprendiendo'));
    c.appendChild(el('b', 'pcn', g[1]));
    c.appendChild(el('p', 'pcd', g[2]));
    var a = el('a', 'pcb', 'Retomar ' + g[1].toLowerCase() + ' ');
    a.href = '#' + h;
    a.appendChild(el('span', 0, '→'));
    c.appendChild(a);
  } else {
    c.appendChild(el('span', 'pck', 'Empieza por aquí'));
    c.appendChild(el('b', 'pcn', 'Ruta de aprendizaje'));
    c.appendChild(
      el(
        'p',
        'pcd',
        'Quince unidades en orden, de los fundamentos a los sistemas. Si no sabes por dónde empezar, empieza aquí.',
      ),
    );
    var a2 = el('a', 'pcb', 'Abrir la ruta ');
    a2.href = '#ruta';
    a2.appendChild(el('span', 0, '→'));
    c.appendChild(a2);
  }
  w.appendChild(c);
}

/* Un recuadro por dato, y solo si ese dato existe de verdad. */
export function pnlProg() {
  var w = $('pnlprog');
  if (!w) return;
  w.textContent = '';
  var cs = allCards(),
    tot = cs.length,
    k = 0,
    dif = 0;
  cs.forEach(function (c) {
    var e = cEstado(c.id);
    if (e === 'k') k++;
    else if (e === 'h') dif++;
  });
  var pend = typeof cPend === 'function' ? cPend() : 0;
  var hist = estado.S.hist || [],
    prom = typeof avgSc === 'function' ? avgSc() : null;
  var rac = typeof rtRacha === 'function' ? rtRacha() : 0;
  var xp = (estado.S.ruta && estado.S.ruta.xp) || 0;
  var ex = typeof nxt === 'function' ? nxt() : null;
  function tile(lab, val, sub, href, pc) {
    var a = href ? el('a', 'ptile') : el('div', 'ptile');
    if (href) a.href = href;
    a.appendChild(el('span', 'ptl', lab));
    a.appendChild(el('b', 'ptv', String(val)));
    if (sub) a.appendChild(el('span', 'pts', sub));
    if (pc != null) {
      var b = el('div', 'pbar'),
        i = document.createElement('i');
      i.style.width = Math.max(2, Math.min(100, pc)) + '%';
      b.appendChild(i);
      a.appendChild(b);
    }
    w.appendChild(a);
  }
  var hayAlgo = k || dif || pend || hist.length || xp || rac;
  if (!hayAlgo) {
    var v = el('div', 'pvacio');
    v.appendChild(el('b', 0, 'Todavía no hay nada que medir'));
    v.appendChild(
      el('p', 's', 'Tu progreso aparece aquí en cuanto estudies. No mostramos datos de ejemplo.'),
    );
    var l1 = el('a', 'pcb', 'Repasar unas tarjetas ');
    l1.href = '#tarjetas';
    l1.appendChild(el('span', 0, '→'));
    v.appendChild(l1);
    w.appendChild(v);
    return;
  }
  tile(
    'Tarjetas dominadas',
    k + ' de ' + tot,
    dif ? dif + ' marcadas como difíciles' : 'de todo el banco',
    '#tarjetas',
    Math.round((k / tot) * 100),
  );
  if (pend)
    tile(
      'Para repasar hoy',
      pend,
      pend === 1 ? 'tarjeta vencida' : 'tarjetas vencidas',
      '#tarjetas',
    );
  if (hist.length)
    tile(
      'Simulacros hechos',
      hist.length,
      prom != null ? 'promedio ' + prom + '%' : '',
      '#simulacros',
      prom,
    );
  if (rac) tile('Racha de estudio', rac, rac === 1 ? 'día seguido' : 'días seguidos', '#progreso');
  if (xp) {
    var nv = rtNivel(xp);
    tile(
      'Ruta de aprendizaje',
      'Nivel ' + nv.n,
      xp + ' XP · faltan ' + nv.falta,
      '#ruta',
      Math.round(((xp - nv.base) / (nv.sig - nv.base)) * 100),
    );
  }
  if (ex) {
    var dias = Math.max(0, Math.ceil((exMs(ex) - Date.now()) / 864e5));
    tile(
      'Próximo examen',
      dias === 0 ? 'Hoy' : dias + (dias === 1 ? ' día' : ' días'),
      ex.n || '',
      '#examenes',
    );
  }
}
export function pnlAct() {
  var w = $('pnlact'),
    s2 = $('pnlacts');
  if (!w) return;
  w.textContent = '';
  var a = (estado.S.act || []).slice(0, 5);
  var box = $('pnlactbox');
  if (box) box.hidden = a.length === 0; /* sin actividad, la sección entera no aparece */
  if (!a.length) return;
  a.forEach(function (x) {
    var d = el('div', 'pact');
    d.appendChild(el('b', 0, x.m));
    d.appendChild(el('span', 0, fmt(x.t)));
    w.appendChild(d);
  });
  if (s2) s2.textContent = 'Lo último que hiciste en este dispositivo.';
}
export function renderPanel() {
  pnlCont();
  pnlProg();
  pnlAct();
}

/* ===== el inicio =====
   Saludo corto, las siete áreas y el acceso a la práctica. Los números salen del
   contenido que hay en ese momento, no están escritos a mano. */
