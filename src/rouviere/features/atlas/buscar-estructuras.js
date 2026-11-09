import { estado } from '../../estado.js';
import { $, msg, nz } from '../../core/dom.js';
import { apAbrir, apPadDe } from './apartados.js';
import { ATL_AP, atFocus, atParts, atSelect } from './atlas-sistemas.js';
import { haIndex, haLoad } from './human-atlas.js';
export /* ===== buscar estructuras anatómicas =====
   HA_MAP tiene las 2.234 estructuras con su nombre en español y en inglés, pero solo
   después de cargar el índice del atlas (medio mega). Mientras no esté cargado, el
   buscador ofrece cargarlo en vez de decir que no hay nada. */
function gEstrLista(n) {
  var r = [],
    id,
    p;
  for (id in estado.HA_MAP) {
    p = estado.HA_MAP[id];
    if (p && p.n && nz(p.n + ' ' + (p.e || '')).indexOf(n) >= 0) {
      r.push(p);
      if (r.length >= 6) break;
    }
  }
  return r;
}

/* Abre una estructura concreta: carga su sistema (o su apartado, en sentidos y
   reproductor), la busca en la lista de partes y la deja seleccionada y enfocada.
   Si el visor 3D no llega a cargar, queda el aviso que el propio visor ya da. */
export function gEstructura(id) {
  location.hash = '#atlas';
  haIndex(function (ix) {
    var gk = null,
      nom = '';
    ix.grupos.forEach(function (g) {
      g.parts.forEach(function (p) {
        if (p.i === id) {
          gk = g.k;
          nom = p.n;
        }
      });
    });
    if (!gk) {
      msg('amsg', 'Esa estructura no aparece en el índice del atlas.');
      return;
    }
    var pad = typeof apPadDe === 'function' ? apPadDe(gk) : null;
    if (pad) {
      /* en sentidos y reproductor la geometría vive repartida en apartados */
      var ap = null;
      ATL_AP.forEach(function (a) {
        if (!ap && a.parts)
          a.parts.forEach(function (p) {
            if (p.i === id) ap = a.k;
          });
      });
      if (ap) apAbrir(ap);
      else haLoad(gk);
    } else haLoad(gk);
    /* El nombre se escribe ya en el buscador de partes, sin esperar a la geometría:
       así el estudiante ve qué se está buscando mientras el visor termina de cargar. */
    var q0 = $('aq');
    if (q0) {
      q0.value = nom;
      if (typeof atParts === 'function') atParts(nom);
    }
    var t0 = Date.now();
    (function espera() {
      if (!estado.AT3 || !estado.AT3.meshes || !estado.AT3.meshes.length) {
        if (Date.now() - t0 < 25000) setTimeout(espera, 400);
        return;
      }
      var q = $('aq');
      if (q) {
        q.value = nom;
        atParts(nom);
      }
      var m = null;
      estado.AT3.meshes.forEach(function (x) {
        if (x.name === id) m = x;
      });
      if (m) {
        atSelect(m);
        if (typeof atFocus === 'function') atFocus([m]);
      } else
        msg('amsg', '«' + nom + '» está en este sistema, pero su geometría no vino en el archivo.');
    })();
  });
}

/* ===== fuera del foco: Histología y Embriología =====
   El documento de experiencia de usuario pide que ROUVIÈRE sea solo de anatomía, así
   que las dos salen del menú, del índice, del buscador, de las pestañas del temario,
   de las materias de la biblioteca y de las asignaturas de Fuentes.

   No se borra nada. Los dos embriones de Carnegie, sus fichas, los doce recursos de
   la biblioteca y las dos asignaturas del temario siguen enteros en el archivo: para
   devolverlos, basta con vaciar estas tres listas. */
