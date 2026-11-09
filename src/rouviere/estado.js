/**
 * Estado compartido de la app (antes eran variables globales).
 * Cada propiedad indica en qué sección se declaró. Se inicializa en boot().
 */
export const estado = {
  // utilidades del DOM (core/dom)
  RM: undefined,
  // datos y almacenamiento (core/almacenamiento)
  S: undefined,
  // inicio: resumen real (features/inicio/resumen)
  atColor: undefined,
  atLab: undefined,
  atPin: undefined,
  atTick: undefined,
  // atlas 3D por sistemas (features/atlas/atlas-sistemas)
  AT3: undefined,
  atSys: undefined,
  atCur: undefined,
  // atlas 3D de embriología (features/embriologia/embriologia-3d)
  EV: undefined,
  curEmb: undefined,
  embWire: undefined,
  embPin: undefined,
  embTick: undefined,
  // módulo: sistema nervioso central (features/snc/snc)
  BR: undefined,
  curSNC: undefined,
  brPin: undefined,
  brTick: undefined,
  sncAns: undefined,
  // Human Atlas · BodyParts3D 4.0 (CC BY 4.0) (features/atlas/human-atlas)
  HA_IX: undefined,
  HA_CUR: undefined,
  HA_MAP: undefined,
  HA_LD: undefined,
  // apartados: sentidos y aparatos reproductores (features/atlas/apartados)
  AP_CUR: undefined,
  AP_LD: undefined,
  AP_PAD: undefined,
  AP_PAD_PREV: undefined,
  // fuentes (bibliografía) (features/fuentes/fuentes)
  bfil: undefined,
  // biblioteca académica (features/biblioteca/biblioteca)
  lbStore: undefined,
  lbq: undefined,
  lbcat: undefined,
  lbkind: undefined,
  lbidi: undefined,
  lbview: undefined,
  lbopen: undefined,
  lbPage: undefined,
  lbT: undefined,
  // módulos: temario por competencias (features/modulos/modulos)
  curSub: undefined,
  curG: undefined,
  // tarjetas (features/tarjetas/tarjetas)
  CF: undefined,
  Q: undefined,
  qi: undefined,
  rev: undefined,
  hi: undefined,
  CED: undefined,
  ST: undefined,
  // simulacros (features/simulacros/simulacros)
  EX: undefined,
  etm: undefined,
  // ruta de aprendizaje (features/ruta/ruta)
  RT_ACT: undefined,
  RT_SEL: undefined,
  // progreso (features/progreso/progreso)
  PGC: undefined,
  // estudio con IA (features/estudio-ia/estudio-ia)
  GEN: undefined,
  // Archivos y cámara, reescritos. (features/documentos/archivos-camara)
  DREEMP: undefined,
  // ROU · asistente virtual de ROUVIÈRE (features/rou/rou)
  ROUAI: undefined,
  ROUCTL: undefined,
  ROULIM: undefined,
  // buscador general (features/buscador/buscador)
  GSEC: undefined,
  GT: undefined,
  GLAST: undefined,
  // EST: fichas de estructura (features/estructuras/fichas-est)
  EST: undefined,
  EST_IX: undefined,
  EST_FMA: undefined,
  EST_LD: undefined,
  EST_CB: undefined,
  EST_CARTAS: undefined,
  EST_PREG: undefined,
  // la sección Anatomía, por competencia o por sistema (features/anatomia/anatomia)
  AN_MODO: undefined,
  COMP_CUR: undefined,
  // categorías anatómicas (features/anatomia/categorias)
  anQ: undefined,
  AN_CUR: undefined,
  // inicio: carrusel y tarjeta mini (features/inicio/carrusel)
  si: undefined,
};
