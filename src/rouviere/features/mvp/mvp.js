import { estado } from '../../estado.js';
import { W, log } from '../../core/almacenamiento.js';
import { $, el } from '../../core/dom.js';
import { route } from '../../core/navegacion.js';
import { fueraSec } from '../embriologia/histologia-embriologia.js';
import { TAB_A } from '../rou/rou.js';
/* ===== modo MVP =====
   El documento «Funciones del MVP y de la segunda versión» (Diseño Digital 1,
   DGR-151) fija seis funciones para la primera prueba con estudiantes y manda el
   resto a una segunda versión. Este modo las deja a la vista y esconde lo demás.
   No borra nada: todo sigue en su sitio y vuelve al apagarlo. */
/* 1 = función del MVP · 2 = existe, pero en segundo plano · ausente = segunda versión */
export const MVP_SEC = {
  home: 1,
  anatomia: 1,
  practica: 1,
  modulos: 1,
  tarjetas: 1,
  simulacros: 1,
  progreso: 1,
  examenes: 2,
  sobre: 2,
};
export const MVP_FUN = [
  [
    'M1',
    'Acceso web gratuito y móvil',
    'Entras desde un enlace, sin instalar nada ni crear cuenta.',
    'home',
  ],
  [
    'M2',
    'Temario organizado por áreas',
    'Eliges un área anatómica y encuentras sus tarjetas, sus preguntas y sus modelos.',
    'anatomia',
  ],
  [
    'M3',
    'Tarjetas de estudio',
    'Responde antes de ver la respuesta, con pistas si te trabas.',
    'tarjetas',
  ],
  [
    'M4',
    'Simulacro de preguntas',
    'Resuelves un conjunto de preguntas y ves tu puntuación.',
    'simulacros',
  ],
  [
    'M5',
    'Revisión de errores',
    'Al terminar el simulacro ves qué fallaste y repites solo esas.',
    'simulacros',
  ],
  [
    'M6',
    'Indicador básico de progreso',
    'Un resumen de tu actividad, guardado en este dispositivo.',
    'progreso',
  ],
];
export function mvpOn() {
  return !!(estado.S && estado.S.mvp);
}
export function mvpVale(h) {
  return !mvpOn() || !!MVP_SEC[h];
}
export function mvpSet(v) {
  estado.S.mvp = !!v;
  W();
  document.body.classList.toggle('mvp', estado.S.mvp);
  mvpPinta();
  var h = (location.hash || '#home').slice(1);
  if (estado.S.mvp && !mvpVale(h)) location.hash = '#home';
  else route();
  log(estado.S.mvp ? 'Modo MVP activado' : 'Modo MVP desactivado');
}
export function mvpPinta() {
  var on = mvpOn();
  /* menú lateral */
  document.querySelectorAll('#tn a').forEach(function (a) {
    var k = a.getAttribute('href').slice(1);
    /* fuera del foco pesa más que el modo MVP: Histología y Embriología no vuelven
       a aparecer al apagar el modo */
    a.hidden = fueraSec(k) || (on && !MVP_SEC[k]);
  });
  /* Si de un bloque del menú no queda ningún enlace, se va también su título:
     antes el encabezado se quedaba solo, encabezando nada. */
  document.querySelectorAll('#tn .tng').forEach(function (g) {
    var v = [].slice.call(g.querySelectorAll('a')).filter(function (x) {
      return !x.hidden;
    });
    g.hidden = v.length === 0;
  });
  /* herramientas del inicio y pestañas: fuera lo que no sea del MVP */
  document.querySelectorAll('#iniTools a[href^="#"]').forEach(function (t) {
    t.parentElement.hidden = on && !MVP_SEC[t.getAttribute('href').slice(1)];
  });
  document.querySelectorAll('#tabbar .tbb[data-hc="130"]').forEach(function (b) {
    b.hidden = on && !MVP_SEC[TAB_A[b.getAttribute('data-k')]];
  });
  /* Rou, en el centro de la barra, se retira: el asistente es de la segunda versión. */
  var fb = document.querySelector('#tabbar .tbrou');
  if (fb) fb.hidden = on;
  /* el aviso de la esquina */
  var b = $('mvpbadge');
  if (b) b.hidden = !on;
  /* la lista de funciones en Sobre */
  var ul = $('mvplista');
  if (ul && !ul.childNodes.length)
    MVP_FUN.forEach(function (f) {
      var li = document.createElement('li');
      li.appendChild(el('b', 0, f[0] + '. ' + f[1]));
      li.appendChild(el('span', 0, ' ' + f[2]));
      ul.appendChild(li);
    });
  /* Hay dos interruptores, el del menú y el de Sobre. Los dos tienen que mostrar el
     mismo estado, se encienda por donde se encienda; antes solo se actualizaba el
     del menú y el de Sobre se quedaba diciendo «apagado» con el modo encendido. */
  document.querySelectorAll('.mvpsw input').forEach(function (sw) {
    sw.checked = on;
    sw.setAttribute('aria-checked', on ? 'true' : 'false');
  });
}

/* Aviso dentro de una sección que no pertenece al MVP */
export function mvpAviso(h) {
  var v = $(h);
  if (!v) return;
  var old = v.querySelector('.mvpnot');
  if (old) old.remove();
  if (!mvpOn() || MVP_SEC[h]) return;
  var d = el('div', 'box warn mvpnot');
  d.appendChild(el('b', 0, 'Función de la segunda versión'));
  d.appendChild(
    el(
      'p',
      's',
      'Está terminada y funciona, pero queda fuera del MVP que se está ' +
        'probando, según el documento de funciones. No aparece en la navegación mientras el modo ' +
        'MVP esté encendido.',
    ),
  );
  var w = el('div', 'two');
  var b1 = el('button', 'pill sm', 'Apagar el modo MVP');
  b1.type = 'button';
  b1.setAttribute('data-hc', '135');
  b1.setAttribute('data-a', 'off');
  w.appendChild(b1);
  var a1 = el('a', 'pill sm', 'Volver al inicio');
  a1.href = '#home';
  w.appendChild(a1);
  d.appendChild(w);
  var h1 = v.querySelector('h1');
  if (h1 && h1.nextSibling) v.insertBefore(d, h1.nextSibling);
  else v.insertBefore(d, v.firstChild);
}
export function mvpAct(a) {
  if (a === 'off') {
    mvpSet(false);
    return;
  }
  if (a === 'on') {
    mvpSet(true);
    return;
  }
  if (a === 'sw') {
    mvpSet(!mvpOn());
    return;
  }
}

/* ===== buscar estructuras anatómicas =====
   HA_MAP tiene las 2.234 estructuras con su nombre en español y en inglés, pero solo
   después de cargar el índice del atlas (medio mega). Mientras no esté cargado, el
   buscador ofrece cargarlo en vez de decir que no hay nada. */
