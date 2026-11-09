import { estado } from './estado.js';
import { EMB, fillMods } from './core/almacenamiento.js';
import { $, conf } from './core/dom.js';
import { closeMenu, route, toggleMenu } from './core/navegacion.js';
import { anModo, compAbrir, compGo } from './features/anatomia/anatomia.js';
import { anAbrir, anAtlas, anBack, anBuscar, anGo } from './features/anatomia/categorias.js';
import { apAct, haOpen } from './features/atlas/apartados.js';
import {
  atEmpty,
  atFit,
  atParts,
  atReset2,
  atRotToggle,
  atSelect,
  atShowAll,
  atUpload,
} from './features/atlas/atlas-sistemas.js';
import { haLoad } from './features/atlas/human-atlas.js';
import {
  LBS,
  lbAll,
  lbClearQ,
  lbClose,
  lbFav,
  lbMas,
  lbOpen,
  lbSearch,
  lbSetCat,
  lbSetIdi,
  lbSetKind,
  lbSetQ,
  lbSetView,
} from './features/biblioteca/biblioteca.js';
import {
  gAbrir,
  gBuscar,
  gCargaIx,
  gCerrar,
  gLimpia,
  gTecla,
} from './features/buscador/buscador.js';
import {
  camAct,
  camCerrar,
  docAct,
  docAdd,
  docBuscar,
  docPegar,
} from './features/documentos/archivos-camara.js';
import { cargarJS } from './features/documentos/documentos.js';
import {
  embBoth,
  embCenter,
  embLoad,
  embPinCycle,
  embReset,
  embSwap,
  embToggleRot,
  embToggleWire,
} from './features/embriologia/embriologia-3d.js';
import { ocultaFuera } from './features/embriologia/histologia-embriologia.js';
import { EQ, estAtlas, fichaAtlas, renderEst } from './features/estructuras/estructuras.js';
import { aCopy, aDl, ai, cnt, saveCards, saveQs } from './features/estudio-ia/estudio-ia.js';
import { addEx, cmv, nextEx } from './features/examenes/examenes.js';
import { bfilt } from './features/fuentes/fuentes.js';
import { flipMini, sld } from './features/inicio/carrusel.js';
import { areaIr } from './features/inicio/inicio.js';
import { atColorToggle, atLabToggle } from './features/inicio/resumen.js';
import { backG, modGo, renderMods, tab } from './features/modulos/modulos.js';
import { mvpAct, mvpOn, mvpPinta } from './features/mvp/mvp.js';
import { exportNames } from './features/nombres/nombres-usuario.js';
import { pgAct } from './features/progreso/progreso.js';
import { rouAct, rouInit, rouTecla, tabAct } from './features/rou/rou.js';
import { rtAct } from './features/ruta/ruta.js';
import { XC, exSetup, xAct, xSet } from './features/simulacros/simulacros.js';
import {
  brAll,
  brCenter,
  brFileSel,
  brList,
  brLoad,
  brPinCycle,
  brReset,
  brSelect,
  brToggleRot,
} from './features/snc/snc.js';
import { cAct, cImport, cSet, ficAplica } from './features/tarjetas/tarjetas.js';
import { addCm, cmCopy, cmDl, wipe } from './features/voces/voces.js';
/**
 * Arranque de la app: las mismas sentencias del original, en el mismo orden.
 * Inicializa el estado compartido y engancha los eventos de la página.
 */
export function boot() {
  // --- utilidades del DOM ---
  estado.RM = matchMedia('(prefers-reduced-motion:reduce)').matches;
  // --- datos y almacenamiento ---
  estado.S = {
    cards: [],
    known: {},
    hist: [],
    act: [],
    bank: [],
    cm: [],
    fav: {},
    sr: {},
    est: [],
    goal: {
      c: 0,
    },
    ruta: {
      done: {},
      xp: 0,
    },
    docs: [],
    sav: [],
    rou: {
      h: [],
      url: '',
    },
    mvp: false,
    ult: '',
    fic: {},
  };
  try {
    var r0 = localStorage.getItem('rv_s');
    if (r0) {
      var o0 = JSON.parse(r0);
      for (var k0 in o0) estado.S[k0] = o0[k0];
    }
  } catch (e) {}
  ['cards', 'hist', 'act', 'bank', 'cm', 'est', 'docs', 'sav'].forEach(function (k) {
    if (!Array.isArray(estado.S[k])) estado.S[k] = [];
  });
  ['known', 'fav', 'sr', 'goal', 'ruta', 'fic'].forEach(function (k) {
    if (!estado.S[k] || typeof estado.S[k] !== 'object' || Array.isArray(estado.S[k]))
      estado.S[k] =
        k === 'goal'
          ? {
              c: 0,
            }
          : k === 'ruta'
            ? {
                done: {},
                xp: 0,
              }
            : {};
  });
  if (!estado.S.ruta.done || typeof estado.S.ruta.done !== 'object') estado.S.ruta.done = {};
  if (!estado.S.fic || typeof estado.S.fic !== 'object' || Array.isArray(estado.S.fic))
    estado.S.fic = {};
  if (typeof estado.S.ruta.xp !== 'number') estado.S.ruta.xp = 0;
  // --- navegación ---
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });
  // --- inicio: resumen real ---
  estado.atColor = 'orig';
  estado.atLab = true;
  estado.atPin = 'top';
  estado.atTick = 0;
  // --- atlas 3D por sistemas ---
  estado.AT3 = null;
  estado.atSys = 0;
  estado.atCur = null;
  /* ===== atlas 3D de embriología ===== */
  estado.EV = null;
  estado.curEmb = 0;
  estado.embWire = false;
  estado.embPin = 'top';
  estado.embTick = 0;
  /* ===== módulo: sistema nervioso central ===== */
  estado.BR = null;
  estado.curSNC = 0;
  estado.brPin = 'top';
  estado.brTick = 0;
  estado.sncAns = [];
  /* ===== Human Atlas · BodyParts3D 4.0 (CC BY 4.0) ===== */
  estado.HA_IX = null;
  estado.HA_CUR = null;
  estado.HA_MAP = {};
  estado.HA_LD = null;
  /* ===== apartados: sentidos y aparatos reproductores ===== */
  estado.AP_CUR = null;
  estado.AP_LD = null;
  estado.AP_PAD = null;
  estado.AP_PAD_PREV = null;
  /* ===== fuentes (bibliografía) ===== */
  estado.bfil = 'all';
  // --- biblioteca académica ---
  estado.lbStore = true;
  try {
    localStorage.setItem('rv_lib_t', '1');
    localStorage.removeItem('rv_lib_t');
  } catch (e) {
    estado.lbStore = false;
  }
  try {
    var rl0 = localStorage.getItem('rv_lib');
    if (rl0) {
      var ol0 = JSON.parse(rl0);
      ['fav', 'rec', 'q'].forEach(function (k) {
        if (ol0[k] && ol0[k].length !== undefined) LBS[k] = ol0[k];
      });
      if (ol0.rt && typeof ol0.rt === 'object') LBS.rt = ol0.rt;
    }
  } catch (e) {}
  estado.lbq = '';
  estado.lbcat = 'all';
  estado.lbkind = 'all';
  estado.lbidi = 'all';
  estado.lbview = 'all';
  estado.lbopen = null;
  estado.lbPage = 1;
  estado.lbT = 0;
  /* ===== módulos: temario por competencias ===== */
  estado.curSub = 0;
  estado.curG = null;
  /* ===== tarjetas ===== */
  /* Estado de los filtros y de la sesión de estudio */
  estado.CF = {
    comp: 'all',
    cat: 'all',
    m: 'all',
    t: 'all',
    d: 'all',
    st: 'all',
    q: '',
    fav: false,
  };
  estado.Q = [];
  estado.qi = 0;
  estado.rev = false;
  estado.hi = 0;
  estado.CED = null;
  estado.ST = null;
  /* ===== simulacros ===== */
  estado.EX = null;
  estado.etm = null;
  /* ===== ruta de aprendizaje ===== */
  /* El estado vive en S.ruta: nodos hechos, XP y la fecha del último avance.
     El XP solo se concede la primera vez que se completa un nodo, así que recargar
     la página o repetir la actividad no lo duplica. */
  estado.RT_ACT = null;
  /* actividad en curso lanzada desde un nodo */
  estado.RT_SEL = null;
  // --- progreso ---
  estado.PGC = 0;
  // --- estudio con IA ---
  estado.GEN = null;
  // --- documentos del estudiante ---
  cargarJS._ = {};

  /* ---------- lectura de un zip (docx y pptx son zip) ---------- */
  // --- Archivos y cámara, reescritos. ---
  estado.DREEMP = -1;
  // --- ROU · asistente virtual de ROUVIÈRE ---
  estado.ROUAI = null;
  /* la función sample(), si existe */
  estado.ROUCTL = null;
  /* AbortController de la respuesta en curso */
  estado.ROULIM = null;
  /* ===== buscador general ===== */
  /* Busca en lo que la plataforma tiene de verdad. Cada resultado dice de dónde
     sale y, al abrirlo, deja la sección ya filtrada por lo que buscaste. */
  estado.GSEC = [
    ['home', 'Inicio', 'La portada con las ocho formas de practicar', 'portada principal'],
    [
      'practica',
      'Práctica',
      'Tarjetas, simulacros, la ruta de aprendizaje y el estudio con IA en un solo sitio',
      'practicar practica repasar test preguntas',
    ],
    [
      'anatomia',
      'Anatomía',
      'Las siete áreas: anatomía general, osteología, artrología, miología, angiología, esplacnología y neuroanatomía',
      'categorias areas ramas osteologia artrologia miologia angiologia neuroanatomia esplacnologia sentidos huesos musculos',
    ],
    [
      'atlas',
      'Atlas 3D',
      '2.234 estructuras con nombre, por sistemas y apartados',
      'modelo tridimensional cuerpo',
    ],
    [
      'snc',
      'Sistema nervioso',
      'Encéfalo con 283 estructuras rotuladas',
      'cerebro encefalo neuro snc',
    ],
    ['embrio', 'Embriología 3D', 'Estadios 16 y 23 de Carnegie', 'embrion desarrollo carnegie'],
    [
      'tarjetas',
      'Tarjetas',
      'Repaso con pistas y repetición espaciada',
      'flashcards repasar memorizar',
    ],
    [
      'simulacros',
      'Simulacros',
      'Preguntas de opción múltiple con explicación',
      'test examen practica preguntas',
    ],
    ['examenes', 'Exámenes', 'Tus fechas y la cuenta atrás', 'fechas calendario parcial'],
    [
      'ruta',
      'Ruta de aprendizaje',
      '15 unidades, 84 nodos y XP',
      'caminito camino progreso niveles',
    ],
    ['progreso', 'Progreso', 'Qué sabes y qué te toca repasar', 'estadisticas avance rachas'],
    [
      'estudio',
      'Estudio con IA',
      'Sube tus apuntes y saca resúmenes y preguntas',
      'apuntes pdf resumen documentos',
    ],
    ['rou', 'Rou', 'El asistente virtual de ROUVIÈRE', 'asistente chat lechuza ayuda'],
    [
      'biblioteca',
      'Biblioteca',
      '66 recursos académicos comprobados',
      'libros recursos atlas articulos',
    ],
    ['fuentes', 'Fuentes', 'Bibliografía por asignatura', 'bibliografia libros referencia'],
    [
      'modulos',
      'Temario',
      'Propuesta de temario por competencias y grupos',
      'temario modulos competencias programa',
    ],
    ['sobre', 'Sobre ROUVIÈRE', 'Qué es, qué hace y qué falta', 'acerca proyecto equipo'],
    ['voces', 'Voces', 'Lo que dijeron los estudiantes', 'opiniones encuesta comentarios'],
  ];
  estado.GT = 0;
  estado.GLAST = [];
  /* ===== EST: fichas de estructura =====================================
     Una estructura, un texto. Las tarjetas apuntan a sus fichas por `est`,
     y las fichas al atlas por código FMA. El contenido vive en est.js y se
     carga la primera vez que hace falta, para no engordar el HTML. */
  estado.EST = [];
  estado.EST_IX = {};
  estado.EST_FMA = {};
  estado.EST_LD = 0;
  estado.EST_CB = [];
  /* Indices que enlazan con BANK y con QB. Viven en est.js, no dentro de los
     registros: asi el enlace funciona y los 654 originales quedan intactos. */
  estado.EST_CARTAS = {};
  estado.EST_PREG = {};
  /* ===== la sección Anatomía, por competencia o por sistema ===== */
  estado.AN_MODO = 'comp';
  estado.COMP_CUR = null;
  // --- categorías anatómicas ---
  estado.anQ = '';
  estado.AN_CUR = null;
  // --- inicio: carrusel y tarjeta mini ---
  estado.si = 0;
  /* Enlace de eventos sin atributos en linea */
  var HT = [
    function (e, t) {
      exportNames();
    },
    function (e, t) {
      atColorToggle();
    },
    function (e, t) {
      atLabToggle();
    },
    function (e, t) {
      atReset2();
    },
    function (e, t) {
      atFit();
    },
    function (e, t) {
      atRotToggle();
    },
    function (e, t) {
      atShowAll();
    },
    function (e, t) {
      atSelect(null);
    },
    function (e, t) {
      atEmpty();
    },
    function (e, t) {
      atUpload(t.files[0]);
      t.value = '';
    },
    function (e, t) {
      atParts(t.value);
    },
    function (e, t) {
      embLoad(EMB[estado.curEmb].id);
    },
    function (e, t) {
      embReset();
    },
    function (e, t) {
      embCenter();
    },
    function (e, t) {
      embToggleRot();
    },
    function (e, t) {
      embToggleWire();
    },
    function (e, t) {
      embBoth();
    },
    function (e, t) {
      embSwap();
    },
    function (e, t) {
      brLoad('allen-brain.glb', 'Modelo del encéfalo');
    },
    function (e, t) {
      brReset();
    },
    function (e, t) {
      brCenter();
    },
    function (e, t) {
      brToggleRot();
    },
    function (e, t) {
      brAll();
    },
    function (e, t) {
      brSelect(null);
    },
    function (e, t) {
      brFileSel(t.files[0]);
      t.value = '';
    },
    function (e, t) {
      brList(t.value);
    },
    function (e, t) {
      bfilt(0);
    },
    function (e, t) {
      bfilt(1);
    },
    function (e, t) {
      bfilt(2);
    },
    function (e, t) {
      bfilt(3);
    },
    function (e, t) {
      tab(0);
    },
    function (e, t) {
      tab(1);
    },
    function (e, t) {
      tab(2);
    },
    function (e, t) {
      renderMods();
    },
    function (e, t) {
      backG();
    },
    function (e, t) {
      modGo('t');
    },
    function (e, t) {
      modGo('s');
    },
    function (e, t) {
      modGo('a');
    },
    function (e, t) {
      toggleMenu();
    },
    function (e, t) {
      closeMenu();
    },
    null,
    null,
    function (e, t) {
      flipMini(t);
    },
    function (e, t) {
      sld(-1);
    },
    function (e, t) {
      sld(1);
    },
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    function (e, t) {
      conf(t, wipe, 'Borrar mis datos');
    },
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    function (e, t) {
      ai('res');
    },
    function (e, t) {
      ai('pre');
    },
    function (e, t) {
      ai('tar');
    },
    function (e, t) {
      ai('tem');
    },
    function (e, t) {
      ai('afi');
    },
    function (e, t) {
      aCopy();
    },
    function (e, t) {
      aDl();
    },
    function (e, t) {
      saveCards();
    },
    function (e, t) {
      saveQs();
    },
    function (e, t) {
      addEx();
    },
    function (e, t) {
      cmv(-1);
    },
    function (e, t) {
      cmv(1);
    },
    function (e, t) {
      addCm();
    },
    function (e, t) {
      cmCopy();
    },
    function (e, t) {
      cmDl();
    },
    function (e, t) {
      lbSearch(t.value);
    },
    function (e, t) {
      lbSetView('fav');
    },
    function (e, t) {
      lbSetView('rec');
    },
    function (e, t) {
      lbAll();
    },
    function (e, t) {
      lbSetCat(t.getAttribute('data-k'));
    },
    function (e, t) {
      lbSetKind(t.getAttribute('data-k'));
    },
    function (e, t) {
      lbOpen(t.getAttribute('data-id'));
    },
    function (e, t) {
      lbFav(t.getAttribute('data-id'));
    },
    function (e, t) {
      lbClose();
    },
    function (e, t) {
      lbSetQ(t.getAttribute('data-q'));
    },
    function (e, t) {
      lbClearQ();
    },
    function (e, t) {
      lbSetView('dl');
    },
    function (e, t) {
      brPinCycle();
    },
    function (e, t) {
      embPinCycle();
    },
    function (e, t) {
      haOpen();
    },
    function (e, t) {
      haLoad(t.getAttribute('data-k'));
    },
    function (e, t) {
      cAct(t.getAttribute('data-a'), t, e);
    },
    function (e, t) {
      cSet(t.getAttribute('data-f'), t.value);
    },
    function (e, t) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        cAct('flip', t, e);
      }
    },
    function (e, t) {
      xAct(t.getAttribute('data-a'), t, e);
    },
    function (e, t) {
      xSet(t.getAttribute('data-f'), t.value, t);
    },
    function (e, t) {
      pgAct(t.getAttribute('data-a'), t);
    },
    function (e, t) {
      cImport(t.files[0]);
      t.value = '';
    },
    function (e, t) {
      ai(t.getAttribute('data-k'));
    },
    function (e, t) {
      rtAct(t.getAttribute('data-a'), t);
    },
    function (e, t) {
      docAdd(t.files);
      t.value = '';
    },
    function (e, t) {
      docAct(t.getAttribute('data-a'), t);
    },
    function (e, t) {
      docBuscar();
    },
    function (e, t) {
      lbSetIdi(t.getAttribute('data-k'));
    },
    function (e, t) {
      lbMas();
    },
    function (e, t) {
      camAct(t.getAttribute('data-a'));
    },
    function (e, t) {
      rouAct(t.getAttribute('data-a'), t);
    },
    function (e, t) {
      rouTecla(e, t);
    },
    function (e, t) {
      apAct(t.getAttribute('data-a'), t);
    },
    function (e, t) {
      tabAct(t.getAttribute('data-k'));
    },
    function (e, t) {
      gBuscar(t.value);
    },
    function (e, t) {
      gTecla(e);
    },
    function (e, t) {
      gLimpia();
    },
    function (e, t) {
      gAbrir(t.getAttribute('data-i'));
    },
    function (e, t) {
      mvpAct(t.getAttribute('data-a'));
    },
    function (e, t) {
      anAbrir(t.getAttribute('data-k'));
    },
    function (e, t) {
      anGo(t.getAttribute('data-w'));
    },
    function (e, t) {
      anBack();
    },
    function (e, t) {
      anAtlas(t.getAttribute('data-k'));
    },
    function (e, t) {
      anBuscar(t.value);
    },
    function (e, t) {
      gCargaIx();
    },
    function (e, t) {
      e.preventDefault();
      areaIr(t.getAttribute('data-k'));
    },
    function (e, t) {
      fichaAtlas(t.getAttribute('data-q'));
    },
    function (e, t) {
      XC.cat = 'all';
      XC.sis = t.getAttribute('data-m');
      XC.tema = t.getAttribute('data-t') || 'all';
      location.hash = '#simulacros';
      setTimeout(function () {
        if (typeof exSetup === 'function') exSetup();
      }, 60);
    },
    function (e, t) {
      compAbrir(t.getAttribute('data-k'));
    },
    function (e, t) {
      compGo(t.getAttribute('data-w'));
    },
    function (e, t) {
      anModo(t.getAttribute('data-m'));
    },
    /*148*/ function (e, t) {
      estAtlas(t.getAttribute('data-fma'), t.getAttribute('data-eid'));
    },
    /*149*/ function (e, t) {
      EQ.q = t.value || '';
      EQ.n = 40;
      renderEst();
    },
    /*150*/ function (e, t) {
      EQ[t.getAttribute('data-ef')] = t.getAttribute('data-ev');
      EQ.n = 40;
      renderEst();
    },
    /*151*/ function (e, t) {
      EQ.n += 40;
      renderEst();
    },
  ];
  (function () {
    function run(ev, attr) {
      var el = ev.target && ev.target.closest ? ev.target.closest('[' + attr + ']') : null;
      if (!el) return;
      var i = +el.getAttribute(attr),
        f = HT[i];
      if (!f) return;
      try {
        f.call(el, ev, el);
      } catch (err) {
        console.error(err);
      }
    }
    ['click', 'change', 'input', 'keydown'].forEach(function (ev) {
      document.addEventListener(ev, function (e) {
        run(
          e,
          'data-h' +
            {
              click: 'c',
              change: 'h',
              input: 'i',
              keydown: 'k',
            }[ev],
        );
      });
    });
  })();

  /* ===== arranque ===== */
  // --- arranque ---
  (function () {
    var io =
      !estado.RM && 'IntersectionObserver' in window
        ? new IntersectionObserver(
            function (es) {
              es.forEach(function (en) {
                if (en.isIntersecting) {
                  en.target.classList.add('in');
                  io.unobserve(en.target);
                }
              });
            },
            {
              threshold: 0.15,
            },
          )
        : null;
    document.querySelectorAll('#home .rv').forEach(function (e) {
      if (io) io.observe(e);
      else e.classList.add('in');
    });
    fillMods('cmod', false);
    fillMods('emod', false);
    fillMods('aimod', false);
    $('src').addEventListener('input', cnt);
    cnt();
    rouInit();
    ocultaFuera();
    document.body.classList.toggle('mvp', mvpOn());
    mvpPinta();
    document.addEventListener('click', function (e) {
      var b = document.querySelector('.bq');
      if (b && !b.contains(e.target)) gCerrar();
    });
    (function () {
      var z = $('dz');
      if (!z) return;
      ['dragenter', 'dragover'].forEach(function (ev) {
        z.addEventListener(ev, function (e) {
          e.preventDefault();
          z.classList.add('sobre');
        });
      });
      ['dragleave', 'drop'].forEach(function (ev) {
        z.addEventListener(ev, function (e) {
          e.preventDefault();
          z.classList.remove('sobre');
        });
      });
      z.addEventListener('drop', function (e) {
        if (e.dataTransfer && e.dataTransfer.files) docAdd(e.dataTransfer.files);
      });
      z.addEventListener('click', function (e) {
        if (
          e.target === z ||
          e.target.tagName === 'B' ||
          e.target.tagName === 'P' ||
          e.target.tagName === 'SMALL'
        ) {
          estado.DREEMP = -1;
          $('upl').click();
        }
      });
      z.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          estado.DREEMP = -1;
          $('upl').click();
        }
      });
      /* el botón de cámara se queda siempre: si el navegador no la permite, camAbrir() lo dice y
         abre el selector de fotos. Antes se escondía con ('capture' in input), que es falso en
         casi todo escritorio, así que desaparecía sin motivo. */
      document.addEventListener('paste', docPegar);
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && $('camw') && $('camw').style.display !== 'none') camCerrar();
      });
    })();
    ficAplica();
    /* La teoría se pide la primera vez que el usuario entra donde se usa. */
    ['tarjetas', 'anatomia', 'atlas', 'simulacros', 'snc'].forEach(function (k) {});
    sld(0);
    nextEx();
    setInterval(function () {
      if (!location.hash || location.hash === '#home') nextEx();
    }, 1000);
    addEventListener('hashchange', route);
    route();
  })();
}
