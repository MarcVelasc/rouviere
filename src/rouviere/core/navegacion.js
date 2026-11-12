import { estado } from '../estado.js';
import { TEM } from './almacenamiento.js';
import { $, msg } from './dom.js';
import { anBack, renderAn } from '../features/anatomia/categorias.js';
import { renderAp } from '../features/atlas/apartados.js';
import { renderAtlas } from '../features/atlas/atlas-sistemas.js';
import { HA_ATR, renderHA } from '../features/atlas/human-atlas.js';
import { renderLib } from '../features/biblioteca/biblioteca.js';
import {
  CAM,
  camCerrar,
  docRecientes,
  docRender,
  savRender,
} from '../features/documentos/archivos-camara.js';
import { con3D } from '../features/documentos/documentos.js';
import { renderEmb } from '../features/embriologia/embriologia-3d.js';
import { renderEst } from '../features/estructuras/estructuras.js';
import { renderEx } from '../features/examenes/examenes.js';
import { renderBib } from '../features/fuentes/fuentes.js';
import { renderInicio } from '../features/inicio/inicio.js';
import { renderCuenta } from '../features/cuenta/cuenta.js';
import { renderCasos } from '../features/casos/casos.js';
import { ultSet } from '../features/inicio/panel.js';
import { renderMods } from '../features/modulos/modulos.js';
import { mvpAviso } from '../features/mvp/mvp.js';
import { renderPrac } from '../features/practica/practica.js';
import { renderPg } from '../features/progreso/progreso.js';
import { renderTabs } from '../features/rou/rou.js';
import { renderRuta } from '../features/ruta/ruta.js';
import { exSetup } from '../features/simulacros/simulacros.js';
import { renderSNC } from '../features/snc/snc.js';
import { renderCards } from '../features/tarjetas/tarjetas.js';
import { renderCm } from '../features/voces/voces.js';
export /* ===== navegación ===== */
function openMenu() {
  var m = $('menup'),
    b = $('burger');
  m.classList.add('open');
  m.setAttribute('aria-hidden', 'false');
  $('scrim').hidden = false;
  b.classList.add('x');
  b.setAttribute('aria-expanded', 'true');
  b.setAttribute('aria-label', 'Cerrar menú');
  document.body.style.overflow = 'hidden';
  var f = m.querySelector('.tn a.on') || m.querySelector('.tn a');
  if (f) f.focus();
}
export function closeMenu() {
  var m = $('menup'),
    b = $('burger');
  if (!m) return;
  m.classList.remove('open');
  m.setAttribute('aria-hidden', 'true');
  $('scrim').hidden = true;
  b.classList.remove('x');
  b.setAttribute('aria-expanded', 'false');
  b.setAttribute('aria-label', 'Abrir menú');
  document.body.style.overflow = '';
}
export function toggleMenu() {
  ($('menup').classList.contains('open') ? closeMenu : openMenu)();
}
export const V = [
  'home',
  'anatomia',
  'practica',
  'modulos',
  'tarjetas',
  'simulacros',
  'progreso',
  'sobre',
  'atlas',
  'estudio',
  'examenes',
  'voces',
  'fuentes',
  'snc',
  'embrio',
  'biblioteca',
  'ruta',
  'rou',
  'estructuras',
  'casos',
];
export function route() {
  var h = (location.hash || '#home').slice(1);
  if (V.indexOf(h) < 0) h = 'home';
  V.forEach(function (v) {
    $(v).classList.toggle('on', v === h);
  });
  window.scrollTo(0, 0);
  [0, 60, 160].forEach(function (ms) {
    setTimeout(function () {
      if (window.scrollY && window.scrollY < 200) window.scrollTo(0, 0);
    }, ms);
  });
  document.body.classList.toggle('dk', h === 'home' || h === 'casos');
  document.querySelectorAll('#tn a').forEach(function (a) {
    a.classList.toggle('on', a.getAttribute('href') === '#' + h);
  });
  closeMenu();
  renderCuenta();
  if (h === 'home') renderInicio();
  if (h === 'casos') renderCasos();
  ultSet(h);
  if (h === 'modulos') {
    $('tgen').textContent = 'Competencia general: ' + TEM[estado.curSub].gen;
    $('mdd').style.display = 'none';
    $('mdw').style.display = '';
    renderMods();
  }
  if (h === 'tarjetas') renderCards();
  if (h === 'simulacros') exSetup();
  if (h === 'progreso') renderPg();
  if (h === 'ruta') renderRuta();
  if (h === 'atlas') renderAp();
  if (h === 'estudio') {
    docRender();
    docRecientes();
    savRender();
  } else if (CAM && CAM.stream) camCerrar();
  renderTabs(h);
  mvpAviso(h);
  if (h === 'anatomia') {
    anBack();
    renderAn();
  }
  if (h === 'practica')
    renderPrac(); /* al entrar siempre se ve la lista, como en el Temario: volver a la sección no debe dejarte dentro de una categoría */
  if (h === 'atlas' || h === 'snc' || h === 'embrio')
    con3D(null, null); /* se adelanta a la primera pulsación */
  if (h === 'atlas') {
    renderAtlas();
    renderHA();
    msg('haatr', HA_ATR);
  }
  if (h === 'examenes') renderEx();
  if (h === 'voces') renderCm();
  if (h === 'fuentes') renderBib();
  if (h === 'biblioteca') renderLib();
  if (h === 'estructuras') renderEst();
  if (h === 'snc') renderSNC();
  if (h === 'embrio') renderEmb();
}
/* ===== inicio: resumen real ===== */
