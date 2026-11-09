import { estado } from '../estado.js';
import { $, el } from './dom.js';
import BANK__json from '../data/bank.json';
import QB__json from '../data/qb.json';
import TEM__json from '../data/tem.json';
import NM_GEO__json from '../data/nm-geo.json';
import BIB__json from '../data/bib.json';
import SNC_G__json from '../data/snc-g.json';
import ATL_M__json from '../data/atl-m.json';
import NM_BRAIN__json from '../data/nm-brain.json';
/* ===== datos y almacenamiento ===== */
export const MODS = [
  ['oseo', 'Sistema óseo'],
  ['musc', 'Sistema muscular'],
  ['cardio', 'Sistema cardiovascular'],
  ['resp', 'Sistema respiratorio'],
  ['nerv', 'Sistema nervioso'],
  ['dig', 'Sistema digestivo'],
  ['uri', 'Sistema urinario'],
  ['rep', 'Sistema reproductor'],
  ['endo', 'Sistema endocrino'],
  ['sent', 'Órganos de los sentidos'],
  ['piel', 'Piel y tejido conectivo'],
  ['reg', 'Anatomía regional y terminología'],
];
export function mn(id) {
  for (var i = 0; i < MODS.length; i++) if (MODS[i][0] === id) return MODS[i][1];
  return id;
}
export function fillMods(id, all) {
  var s = $(id);
  if (!s) return;
  s.textContent = '';
  if (all) {
    var o = el('option', 0, 'Todos los módulos');
    o.value = 'all';
    s.appendChild(o);
  }
  MODS.forEach(function (m) {
    var o = el('option', 0, m[1]);
    o.value = m[0];
    s.appendChild(o);
  });
}
export function W() {
  try {
    localStorage.setItem('rv_s', JSON.stringify(estado.S));
  } catch (e) {}
}
export function log(m) {
  estado.S.act.unshift({
    t: Date.now(),
    m: m,
  });
  estado.S.act = estado.S.act.slice(0, 40);
  W();
}
/* Banco académico de ROUVIÈRE. Redactado para la plataforma a partir de anatomía
   descriptiva de manual. NO está revisado por un docente: la ficha de cada tarjeta
   y el pie de los simulacros lo advierten. */
export const BANK = BANK__json;
export const QB = QB__json;
export const TEM = TEM__json;
export const TNOTA =
  'Este documento es una propuesta académica inicial para organizar los contenidos de ROUVIÈRE. NO es el programa analítico oficial de la Universidad Católica Boliviana San Pablo (UCB), ni sustituye las indicaciones de los docentes. Los temas, competencias y grupos deben compararse con el programa oficial cuando esté disponible.';
export const TTRANS = [
  'Utilizar correctamente la terminología anatómica e histológica básica.',
  'Identificar estructuras en imágenes, esquemas, preparaciones y modelos 3D cuando estén disponibles.',
  'Relacionar estructura y función sin confundir descripciones anatómicas con diagnósticos clínicos.',
  'Estudiar mediante recuperación activa: responder antes de consultar la solución.',
  'Resolver preguntas de práctica y revisar errores con explicaciones basadas en fuentes.',
  'Citar la fuente de cada contenido y distinguir material verificado de material provisional.',
];
export const TCONF = [
  'Nombre oficial de cada asignatura y semestre en que se cursa.',
  'Programa analítico y unidades temáticas oficiales.',
  'Competencias y resultados de aprendizaje establecidos por el docente.',
  'Orden, profundidad y bibliografía obligatoria de cada unidad.',
  'Criterios de evaluación y nomenclatura usada por la carrera.',
];
export const TCAMPOS = [
  'Asignatura.',
  'Grupo o unidad.',
  'Nombre del tema.',
  'Competencia u objetivo de aprendizaje.',
  'Conceptos clave.',
  'Material de estudio y fuente bibliográfica.',
  'Imagen, microfotografía o modelo 3D, si existe y tiene permiso de uso.',
  'Tarjetas de estudio.',
  'Preguntas de práctica.',
  'Estado del contenido: borrador, revisado o validado por docente.',
];
export const NM_GEO = NM_GEO__json;
export const NM_GEO_AVISO =
  'Identificación deducida por la plataforma a partir de la posición, el tamaño y el contacto entre piezas. El archivo 3D NO trae estos nombres. Está revisada una por una contra la anatomía, pero debe confirmarla un docente: si encuentras un error, corrígelo con el botón ＋.';
export function geoName(mid, raw) {
  var t = NM_GEO[mid];
  if (!t) return null;
  var e = t.n[raw];
  return e ? e[0] : null;
}
export function geoHow(mid, raw) {
  var t = NM_GEO[mid];
  if (!t) return null;
  var e = t.n[raw];
  return e ? t.c[e[1]] : null;
}
export const BIB = BIB__json;
export const BNOTA =
  'Este documento propone fuentes académicas y enlaces verificables para organizar la bibliografía de ROUVIÈRE. No constituye la bibliografía oficial de la UCB Tarija: debe compararse con el programa analítico y con las indicaciones de cada docente. Los enlaces a editoriales sirven para verificar los datos de los libros; no implican que el texto completo sea gratuito.';
export const BREGLAS = [
  'No presentar esta lista como bibliografía oficial de la UCB hasta compararla con el programa analítico.',
  'No inventar ediciones, años, autores, ISBN, DOI ni enlaces.',
  'Un enlace editorial no significa que el contenido completo sea gratuito.',
  'No subir libros escaneados ni copiar ilustraciones protegidas sin autorización.',
  'Priorizar recursos abiertos con licencia clara cuando se necesiten imágenes o materiales incorporados directamente en la web.',
  'Vincular cada explicación educativa con la fuente que realmente la respalda.',
  'Registrar la fecha de revisión de cada enlace y corregir los enlaces rotos.',
];
export const BCAMPOS = [
  'Asignatura y grupo temático al que se vincula.',
  'Autor o autores.',
  'Título completo.',
  'Edición.',
  'Año de publicación.',
  'Editorial o revista.',
  'ISBN, DOI o identificador bibliográfico, cuando exista.',
  'Enlace estable a la editorial, revista, biblioteca o recurso abierto.',
  'Tipo de acceso: abierto, vista previa, compra o suscripción.',
  'Fecha de consulta del enlace.',
  'Estado de revisión: por verificar, verificado bibliográficamente o revisado por docente.',
];
export const SNC_G = SNC_G__json;
export const SNC_OBJ = [
  'Definir qué estructuras forman el sistema nervioso central.',
  'Distinguir encéfalo y médula espinal del sistema nervioso periférico.',
  'Identificar cerebro, diencéfalo, tronco encefálico y cerebelo en esquemas o modelos.',
  'Reconocer los lóbulos cerebrales principales en una vista externa.',
  'Describir la función general de las meninges y del líquido cefalorraquídeo como elementos protectores.',
  'Reconocer la organización básica de sustancia gris y sustancia blanca en el cerebro y la médula espinal.',
  'Identificar las regiones principales de la médula espinal y la disposición general de sus astas en un corte transversal.',
];
export const SNC_COMP =
  'Al finalizar este módulo introductorio, el estudiante podrá identificar las principales divisiones anatómicas del sistema nervioso central, ubicar estructuras seleccionadas del encéfalo y la médula espinal, y describir de forma general su organización y función.';
export const SNC_ALC =
  'Este material es una base educativa introductoria para el módulo piloto de ROUVIÈRE. No es material oficial de la UCB ni sustituye la bibliografía indicada por el docente. Debe revisarse académicamente antes de publicarse como contenido definitivo.';
export const SNC_FU = [
  [
    'Margetis K, Reddy V, Singh P. Anatomy, Central Nervous System. StatPearls [Internet]. Actualizado el 31 de enero de 2026. NCBI Bookshelf.',
    'https://www.ncbi.nlm.nih.gov/books/NBK542179/',
  ],
  [
    'National Institutes of Health. Information about the Brain. NIH Curriculum Supplement Series. NCBI Bookshelf.',
    'https://www.ncbi.nlm.nih.gov/books/NBK20367/',
  ],
];
export const SNC_TAB = [
  [
    'Cerebro y hemisferios',
    'Vista externa y orientación anatómica',
    'Seleccionar etiqueta y mostrar ficha',
  ],
  [
    'Lóbulos cerebrales',
    'Frontal, parietal, temporal y occipital',
    'Resaltar el lóbulo seleccionado',
  ],
  ['Cerebelo', 'Ubicación posterior e inferior respecto al cerebro', 'Mostrar/ocultar etiqueta'],
  [
    'Tronco encefálico',
    'Mesencéfalo, puente y bulbo raquídeo',
    'Seleccionar región y leer descripción',
  ],
  ['Meninges', 'Capas en un esquema o modelo apropiado', 'Alternar capas si el recurso lo permite'],
  [
    'Médula espinal',
    'Vista longitudinal y corte transversal',
    'Cambiar entre vista externa y corte',
  ],
  ['Sistema ventricular', 'Cavidades principales en un esquema', 'Etiquetado interactivo'],
];
export const SNC_QA = [
  [
    '¿Qué estructuras forman el sistema nervioso central?',
    'El encéfalo y la médula espinal.',
    [
      'El encéfalo y la médula espinal.',
      'El encéfalo y los nervios periféricos.',
      'La médula espinal y el cerebelo.',
      'Los hemisferios cerebrales y las meninges.',
    ],
  ],
  [
    '¿Cuáles son los cuatro lóbulos cerebrales que se describen habitualmente?',
    'Frontal, parietal, temporal y occipital.',
    [
      'Frontal, parietal, temporal y occipital.',
      'Frontal, temporal, occipital y cerebeloso.',
      'Parietal, temporal, occipital e insular.',
      'Frontal, parietal, occipital y bulbar.',
    ],
  ],
  [
    '¿Cuáles son las tres meninges?',
    'Duramadre, aracnoides y piamadre.',
    [
      'Duramadre, aracnoides y piamadre.',
      'Duramadre, piamadre y espacio subaracnoideo.',
      'Aracnoides, piamadre y sustancia gris.',
      'Duramadre, aracnoides y sustancia blanca.',
    ],
  ],
  [
    'En un corte transversal típico de la médula espinal, ¿dónde se encuentra la sustancia gris?',
    'En la región central, rodeada por sustancia blanca.',
    [
      'En la región central, rodeada por sustancia blanca.',
      'En la periferia, rodeando a la sustancia blanca.',
      'Solo en las astas anteriores.',
      'En las raíces posteriores.',
    ],
  ],
  [
    '¿Qué tres partes se describen habitualmente en el tronco encefálico?',
    'Mesencéfalo, puente y bulbo raquídeo.',
    [
      'Mesencéfalo, puente y bulbo raquídeo.',
      'Cerebro, cerebelo y médula espinal.',
      'Diencéfalo, puente y cerebelo.',
      'Mesencéfalo, tálamo y bulbo raquídeo.',
    ],
  ],
  [
    '¿Qué cavidad conecta el tercer y el cuarto ventrículo?',
    'El acueducto cerebral.',
    [
      'El acueducto cerebral.',
      'El ventrículo lateral.',
      'El espacio subaracnoideo.',
      'El conducto vertebral.',
    ],
  ],
];
export const SNC_LIM = [
  'El modelo contiene 283 mallas con nombres anatómicos del atlas Allen, en inglés.',
  'No incluye médula espinal, meninges ni espacio subaracnoideo: los grupos A, D y E no tienen correspondencia en el modelo.',
  'No hay una malla única por lóbulo cerebral. Los accesos del grupo C agrupan los giros cuyo nombre contiene «frontal», «parietal», «temporal» u «occipital»; es una coincidencia por nombre, no una segmentación validada por lóbulos.',
  'Mesencéfalo y puente aparecen solo de forma parcial (tegmento del mesencéfalo y parte basilar del puente).',
  'Las descripciones educativas provienen del documento del módulo, no del archivo 3D.',
];
export const EMB = [
  {
    id: 'embryo-stage16',
    n: 'Embrión humano · estadio Carnegie 16',
    st: 'Carnegie 16',
    edad: 'Edad post-fecundación estimada por la fuente: 39 días',
    tam: 'Longitud aproximada descrita por la fuente: 8 a 11 mm',
    tri: 91096,
    ver: 45548,
    src: 'NIH 3D, entrada 3DPX-016953',
    links: [['Página del modelo en NIH 3D', 'https://3d.nih.gov/entries/3DPX-016953?version=1']],
    orig: 'Stage_16.stl (STL binario, 4.554.884 bytes, 91.096 triángulos)',
  },
  {
    id: 'embryo-stage23',
    n: 'Embrión humano · estadio Carnegie 23',
    st: 'Carnegie 23',
    edad: 'Edad post-fecundación descrita por la fuente: aproximadamente 56 días',
    tam: '',
    tri: 30712,
    ver: 15351,
    src: 'NIH 3D, entrada 3DPX-016950. Reconstruido a partir de datos de segmentación del Virtual Human Embryo Project, según la descripción de la fuente.',
    links: [
      ['Página del modelo en NIH 3D', 'https://3d.nih.gov/entries/3DPX-016950'],
      ['Página de descarga', 'https://3d.nih.gov/entries/16950?version=1'],
    ],
    orig: 'Stage23.stl (STL binario, 1.535.684 bytes, 30.712 triángulos)',
  },
];
export const EMB_ART = [
  'External surface anatomy of the postfolding human embryo: Computer-aided, three-dimensional reconstruction of printable digital specimens. Journal of Anatomy (2021).',
  'https://pmc.ncbi.nlm.nih.gov/articles/PMC8602026/',
];
export const EMB_LIC =
  'El artículo de contexto indica licencia CC BY-NC-ND 4.0, que no autoriza obras derivadas ni uso comercial: sirve como lectura, no para reutilizar sus figuras. Los archivos STL no traen licencia ni autoría dentro del archivo. Antes de publicar, consulta la sección Licensing / Attribution Instructions de cada entrada en NIH 3D y copia aquí sus términos exactos.';
export const EMB_CONV =
  'Los archivos aportados son STL binarios, un formato que no guarda nombres de partes ni materiales. No cambié la extensión: convertí la malla a GLB conservando todos sus triángulos, soldando vértices repetidos y calculando normales suavizadas. Stage 16: 91.096 triángulos, 273.288 vértices soldados a 45.548. Stage 23: 30.712 triángulos, 92.136 vértices soldados a 15.351.';
export const EMB_LIM = [
  'Cada archivo es una sola malla conectada: lo comprobé uniendo los triángulos por vértices compartidos y en ambos casos resulta un único cuerpo.',
  'Por eso no hay controles para mostrar u ocultar capas ni órganos: esas piezas no existen dentro del archivo.',
  'El STL tampoco guarda nombres de estructuras, así que no hay lista de partes que etiquetar.',
  'El visor sí permite girar, acercar, alejar, centrar y restablecer la vista, en computadora y en celular.',
  'Para tener capas haría falta un modelo segmentado por órganos, con una malla y un nombre por estructura.',
];
export const ATL_SYS = [
  ['oseo', 'Sistema óseo', 'Huesos y articulaciones.'],
  ['musc', 'Sistema muscular', 'Músculos y partes blandas del aparato locomotor.'],
  ['cardio', 'Sistema cardiovascular', 'Corazón y vasos sanguíneos.'],
  ['resp', 'Sistema respiratorio', 'Vías aéreas y pulmones.'],
  ['nerv', 'Sistema nervioso', 'Encéfalo y médula espinal.'],
  ['dig', 'Sistema digestivo', 'Boca, tubo digestivo y glándulas anexas.'],
  ['uri', 'Sistema urinario', 'Riñones, uréteres, vejiga y uretra.'],
  ['rep', 'Sistema reproductor', 'Órganos reproductores.'],
  ['endo', 'Sistema endocrino', 'Glándulas endocrinas.'],
  ['sent', 'Órganos de los sentidos', 'Ojo, oído, olfato y gusto.'],
];
export const ATL_M = ATL_M__json;
export const ATL_FALTA = [
  {
    n: 'Boca y glándulas salivales',
    file: '3d-vh-f-mouth_glb_6.xml (103.690.760 bytes)',
    sys: 'Sistema digestivo',
    det: 'Es un GLB válido con 21 estructuras con nombre y 1.604.802 triángulos. No lo incluí en la página porque pesa 103 MB: descargarlo en un celular sería lento y costoso. Puedes abrirlo tú con el botón «Abrir un modelo desde mi dispositivo».',
  },
];
export const ATL_VAC = {
  musc: 'Solo hay un archivo de brazo del que no se puede confirmar el tejido.',
  dig: 'El único modelo digestivo es la boca, que no está incluida por su tamaño.',
  endo: 'No adjuntaste ningún modelo endocrino.',
  cardio: 'Solo el archivo de pulmones y corazón, cuyos cuerpos no están identificados.',
  uri: 'Solo la vejiga: falta riñones, uréteres y uretra.',
  rep: 'Solo el útero.',
  sent: 'Solo el ojo derecho: falta oído, olfato y gusto.',
};
export const ATL_LIC =
  'Los modelos provienen de archivos que tú aportaste. Los GLB de ojo, útero, vejiga y encéfalo llevan nombres del Visible Human y del atlas Allen e indican haber sido exportados con Babylon.js desde Maya; los STL solo declaran el programa que los exportó. Ninguno de los archivos contiene autor ni licencia en su interior. Antes de publicar la plataforma hay que confirmar la fuente, la licencia y la atribución exigida por cada entrada original.';
export const ATL_MAN = {
  'sys-bladder': 1,
  'sys-eye-r': 3,
  'sys-ie20': 1,
  'sys-left-arm': 1,
  'sys-lungs-heart': 1,
  'sys-oe20': 1,
  'sys-respiratory': 1,
  'sys-skeleton': 2,
  'sys-uterus': 1,
  'allen-brain': 2,
  'embryo-stage16': 1,
  'embryo-stage23': 1,
};
export const NM_EYE = {
  retina: 'Retina',
  fovea: 'Fóvea',
  macula_lutea: 'Mácula lútea',
  optic_disc: 'Disco óptico',
  palpebral_conjunctiva_of_upper_eyelid: 'Conjuntiva palpebral del párpado superior',
  palpebral_conjunctiva_of_lower_eyelid: 'Conjuntiva palpebral del párpado inferior',
  sclera: 'Esclerótica',
  optic_choroid: 'Coroides',
  pupil: 'Pupila',
  ciliary_processes: 'Procesos ciliares',
  suspensory_ligament_of_lens: 'Ligamento suspensorio del cristalino (zónula)',
  ora_serrata_of_retina: 'Ora serrata de la retina',
  corneo_scleral_junction: 'Unión corneoescleral (limbo)',
  lens: 'Cristalino',
  schlemms_canal: 'Conducto de Schlemm',
  aqueous_humor: 'Humor acuoso',
  ciliary_body: 'Cuerpo ciliar',
  ciliary_muscle: 'Músculo ciliar',
  trabecular_meshwork: 'Malla trabecular',
  iris: 'Iris',
  bulbar_conjunctiva: 'Conjuntiva bulbar',
  cornea: 'Córnea',
  vitreous_humor: 'Humor vítreo',
};
export const NM_UTE = {
  abdominal_ostium_of_uterine_tube: 'Ostium abdominal de la trompa uterina',
  body_of_uterus: 'Cuerpo del útero',
  fundus_of_uterus: 'Fondo del útero',
  cornua: 'Cuernos uterinos',
  lower_uterine_segment: 'Segmento uterino inferior',
  posterior_wall_of_uterus: 'Pared posterior del útero',
  anterior_wall_of_uterus: 'Pared anterior del útero',
  uterine_tube: 'Trompa uterina',
  cervix: 'Cuello uterino',
  isthmus: 'Istmo',
  endometrium: 'Endometrio',
  myometrium: 'Miometrio',
  perimetrium: 'Perimetrio',
  internal_os: 'Orificio cervical interno',
  external_os: 'Orificio cervical externo',
  uterine_cavity: 'Cavidad uterina',
  round_ligament: 'Ligamento redondo',
  broad_ligament: 'Ligamento ancho',
  fimbriae: 'Fimbrias',
  infundibulum: 'Infundíbulo',
  ampulla: 'Ampolla',
  internal_cervical_os: 'Orificio cervical interno',
  external_cervical_os: 'Orificio cervical externo',
};
export const NM_BLA = {
  urinary_bladder_neck_smooth_muscle: 'Músculo liso del cuello vesical',
  fundus_of_urinary_bladder_dome: 'Fondo (cúpula) de la vejiga',
  ureteral_orifice: 'Orificio ureteral',
  fundus_of_urinary_bladder_base1: 'Base del fondo vesical',
  trigone_of_urinary_bladder: 'Trígono vesical',
  internal_urethral_orifice: 'Orificio uretral interno',
  detrusor: 'Músculo detrusor',
  ureter: 'Uréter',
  urethra: 'Uretra',
  apex_of_urinary_bladder: 'Vértice de la vejiga',
};
export const NM_BRAIN = NM_BRAIN__json;
export const NM_FICHA = {
  VH_M_cornea_R: [
    'Transmite y enfoca la luz hacia la retina. Su curvatura irregular puede producir astigmatismo.',
    'sp',
  ],
  VH_M_lens_R: [
    'Es la parte ajustable del sistema de enfoque del ojo: el músculo ciliar cambia su forma para enfocar de cerca o de lejos.',
    'sp',
  ],
  VH_M_retina_R: [
    'Contiene bastones, para la visión con poca luz, y conos, para el color y la agudeza. La señal pasa por células bipolares y ganglionares y viaja por el nervio óptico.',
    'sp',
  ],
  VH_M_ciliary_body_R: [
    'Participa en la transmisión y el enfoque de la luz; su músculo ciliar modifica la forma del cristalino.',
    'sp',
  ],
  VH_M_ciliary_muscle_R: [
    'Al contraerse cambia la forma del cristalino para enfocar objetos cercanos o lejanos.',
    'sp',
  ],
  VH_M_optic_choroid_R: [
    'Interviene en el equilibrio fisiológico, el mantenimiento de la presión y la nutrición de los tejidos oculares.',
    'sp',
  ],
  VH_M_aqueous_humor_R: [
    'Contribuye al equilibrio, la presión y la nutrición oculares, y refracta la luz antes de que llegue a la retina. Su exceso de producción o su drenaje alterado se asocian al glaucoma.',
    'sp',
  ],
  VH_M_vitreous_humor_R: [
    'Forma parte del mismo grupo de equilibrio, presión y nutrición; la luz lo atraviesa antes de llegar a la retina.',
    'sp',
  ],
  VH_M_iris_R: [
    'Se describe entre las estructuras que ayudan a transmitir y enfocar la luz hacia la retina.',
    'sp',
  ],
};
export const NM_FSP = [
  'Ludwig PE, Jessu R, Czyz CN. Physiology, Eye. StatPearls [Internet]. Actualizado el 17 de julio de 2023.',
  'https://www.ncbi.nlm.nih.gov/books/NBK470322/',
];
export const NM_PROC = {
  'sys-respiratory': {
    t: 'Respiratory System (Lungs) — Visible Human Male',
    id: 'NIH 3D, 3DPX-013408',
    aut: 'Kristen Browne, proyecto NLM3D (hoy Programa de Biovisualización del NIAID)',
    lic: 'CC BY 4.0',
    src: 'Segmentaciones del conjunto de criosecciones del Visible Human Male de la National Library of Medicine, hechas en 3D Slicer y remalladas en ZBrush',
    cont: 'Todo el aparato respiratorio, incluidos los pulmones y el cartílago traqueal',
    url: 'https://3d.nih.gov/entries/3DPX-013408',
    seg: 'Sí: la entrada ofrece VHM_Respiratory_Pieces.fbx, con las piezas separadas y mapeadas. Tú descargaste la versión «Viewer», que viene fusionada. Con el archivo Pieces se podrían nombrar las estructuras.',
  },
  'sys-left-arm': {
    t: 'Visible Human Male Left Arm Muscles',
    id: 'NIH 3D, 3DPX-012628',
    aut: 'Kristen Browne (kbrowne)',
    lic: 'CC BY 4.0',
    src: 'Conjuntos de imágenes Cryo y TC del Visible Human Male; músculos y huesos segmentados en 3D Slicer y optimizados en ZBrush',
    cont: 'Músculos y huesos del brazo izquierdo',
    url: 'https://3d.nih.gov/entries/3DPX-012628',
    seg: 'La entrada publica un único archivo de salida fusionado. El brazo derecho está en otra entrada.',
  },
  'sys-skeleton': {
    t: 'Sin identificar',
    id: 'No identificado',
    aut: 'No consta',
    lic: 'Por confirmar',
    src: 'El STL solo declara que se exportó desde Blender 2.83.3',
    cont: 'Esqueleto, sin confirmar su origen',
    url: '',
    seg: 'No pude encontrar su página de origen. Dime de dónde lo descargaste y lo documento.',
  },
  'sys-lungs-heart': {
    t: 'Sin identificar',
    id: 'No identificado',
    aut: 'No consta',
    lic: 'Por confirmar',
    src: 'El STL no declara generador',
    cont: 'Por el nombre del archivo, pulmones y corazón',
    url: '',
    seg: 'No pude encontrar su página de origen. Dime de dónde lo descargaste y lo documento.',
  },
};
