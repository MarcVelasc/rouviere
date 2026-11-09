import { estado } from '../../estado.js';
import { TEM } from '../../core/almacenamiento.js';
import { anCasa, anGet } from '../anatomia/categorias.js';
import { allCards, cEstado } from '../tarjetas/tarjetas.js';
/* ===== fuera del foco: Histología y Embriología =====
   El documento de experiencia de usuario pide que ROUVIÈRE sea solo de anatomía, así
   que las dos salen del menú, del índice, del buscador, de las pestañas del temario,
   de las materias de la biblioteca y de las asignaturas de Fuentes.

   No se borra nada. Los dos embriones de Carnegie, sus fichas, los doce recursos de
   la biblioteca y las dos asignaturas del temario siguen enteros en el archivo: para
   devolverlos, basta con vaciar estas tres listas. */
export const FUERA = {
  sec: ['embrio'],
  /* secciones que se esconden de la navegación */
  mat: ['his', 'emb'],
  /* materias de la biblioteca */
  asig: ['his', 'emb'],
};
export /* asignaturas del temario y de Fuentes */
function fueraSec(h) {
  return FUERA.sec.indexOf(h) >= 0;
}
export function fueraMat(c) {
  return FUERA.mat.indexOf(c) >= 0;
}
export function fueraAsig(a) {
  return FUERA.asig.indexOf(a) >= 0;
}
/* Un recurso queda fuera si su materia principal es una de las dos, o si está en la
   bibliografía comercial como libro de histología o de embriología. Los de patología
   o de morfología que además tocan histología se quedan: su materia es otra. */
export function fueraRec(r) {
  return fueraMat(r.cat) || (r.cat === 'com' && fueraMat(r.c2));
}
export function ocultaFuera() {
  /* enlaces del menú y del índice del pie */
  FUERA.sec.forEach(function (k) {
    document.querySelectorAll('a[href="#' + k + '"]').forEach(function (a) {
      var li = a.closest('li');
      (li || a).hidden = true;
    });
  });
  /* un bloque o una columna sin enlaces visibles se va entera */
  document.querySelectorAll('#tn .tng').forEach(function (g) {
    if (
      ![].slice.call(g.querySelectorAll('a')).filter(function (x) {
        return !x.hidden;
      }).length
    )
      g.hidden = true;
  });
  document.querySelectorAll('#indice .idxc').forEach(function (c) {
    if (
      ![].slice.call(c.querySelectorAll('li')).filter(function (x) {
        return !x.hidden;
      }).length
    )
      c.hidden = true;
  });
  /* pestañas de asignatura del temario */
  if (typeof TEM !== 'undefined')
    document.querySelectorAll('#modulos .tabs .tb').forEach(function (b, i) {
      if (TEM[i] && fueraAsig(TEM[i].id)) b.hidden = true;
    });
  /* pestañas de asignatura de Fuentes: all · ana · his · emb */
  document.querySelectorAll('#btabs .tb').forEach(function (b, i) {
    if (fueraAsig(['all', 'ana', 'his', 'emb'][i])) b.hidden = true;
  });
  /* el buscador deja de ofrecerlas */
  if (typeof estado.GSEC !== 'undefined')
    estado.GSEC = estado.GSEC.filter(function (c) {
      return !fueraSec(c[0]);
    });
}

/* Ilustración de cada área. Son las mismas imágenes de sistemas que ya venían con la
   plataforma, con su atribución en ATRIBUCIONES.md; no se añade ninguna nueva. */
export const AN_IMG = {
  general: ['sis-otros.webp', 'Ilustración de piel y tejido conectivo'],
  osteo: ['sis-oseo.webp', 'Ilustración del esqueleto humano'],
  artro: ['sis-oseo.webp', 'Ilustración del esqueleto humano, con sus articulaciones'],
  mio: ['sis-muscular.webp', 'Ilustración de la musculatura humana'],
  angio: ['sis-cardio.webp', 'Ilustración del corazón y los grandes vasos'],
  esplac: ['sis-dig.webp', 'Ilustración de las vísceras abdominales'],
  neuro: ['sis-nerv.webp', 'Ilustración del encéfalo y el sistema nervioso'],
};
export /* Cuántas tarjetas del área tienes marcadas como conocidas. */
function anAvance(k) {
  var a = anGet(k);
  if (!a)
    return {
      k: 0,
      n: 0,
      pc: 0,
    };
  var n = 0,
    c = 0;
  allCards().forEach(function (x) {
    if (anCasa(x, a)) {
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

/* ===== ficha de estudio =====
   Los campos anatómicos se pintan solo cuando la tarjeta los trae. Lo que no está,
   no se enseña y no se rellena con texto de relleno. */
