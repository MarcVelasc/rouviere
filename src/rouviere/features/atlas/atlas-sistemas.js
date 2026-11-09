import { estado } from '../../estado.js';
import {
  ATL_FALTA,
  ATL_LIC,
  ATL_M,
  ATL_SYS,
  ATL_VAC,
  NM_FICHA,
  NM_FSP,
  NM_GEO,
  NM_GEO_AVISO,
  geoHow,
  log,
} from '../../core/almacenamiento.js';
import { $, el, msg, nz } from '../../core/dom.js';
import { renderHA } from './human-atlas.js';
import { pinCache, pinDraw, pinList } from './rotulos.js';
import { con3D, tresListo } from '../documentos/documentos.js';
import { estCarga, estDeFma, estPinta } from '../estructuras/fichas-est.js';
import { atProc } from '../inicio/resumen.js';
import { applyColors, esName } from '../nombres/nombres-anatomicos.js';
import { askName, unGet } from '../nombres/nombres-usuario.js';
import ATL_AP__json from '../../data/atl-ap.json';
/* ===== atlas 3D por sistemas ===== */
export const ATL_AP = ATL_AP__json;
export const ATL_PEND = [
  {
    n: 'Ovario izquierdo — Human Reference Atlas, CC BY 4.0, archivo .glb',
    url: 'https://3d.nih.gov/entries/3DPX-020979',
    ap: 'repro-f',
  },
  {
    n: 'Ovario derecho — Human Reference Atlas, CC BY 4.0, archivo .glb',
    url: 'https://3d.nih.gov/entries/3DPX-020980',
    ap: 'repro-f',
  },
  {
    n: 'Órgano de Corti (NIH 3D lo titula «oído interno», pero es el órgano de Corti con sus células ciliadas, no la cóclea ni la cadena de huesecillos) — Biovisualization LLC, CC BY 4.0',
    url: 'https://3d.nih.gov/entries/20227',
    ap: 'oido',
  },
  {
    n: 'Oído interno',
    url: 'https://3d.nih.gov/entries/20227',
    ap: 'oido',
  },
  {
    n: 'Z-Anatomy, atlas completo en Blender (CC BY-SA 4.0)',
    url: 'https://zenodo.org/records/4953712',
    ap: '',
  },
];
export const atRotOn = true;
export function atModels(sid) {
  return ATL_M.filter(function (m) {
    return m.sys.indexOf(sid) >= 0;
  });
}
export function kindLabel(k) {
  return k === 'named'
    ? 'Partes con nombre'
    : k === 'shells'
      ? 'Cuerpos sin nombre'
      : 'Una sola malla';
}
export function renderAtlas() {
  var tb = $('asys');
  tb.textContent = '';
  ATL_SYS.forEach(function (sy, i) {
    var n = atModels(sy[0]).length;
    var b = el('button', 'tb' + (i === estado.atSys ? ' on' : ''), sy[1] + ' (' + n + ')');
    b.type = 'button';
    b.onclick = function () {
      estado.atSys = i;
      renderAtlas();
    };
    tb.appendChild(b);
  });
  var sy = ATL_SYS[estado.atSys],
    ms = atModels(sy[0]);
  msg('asysd', sy[2] + (ATL_VAC[sy[0]] && ms.length ? ' Cobertura: ' + ATL_VAC[sy[0]] : ''));
  var l = $('alist');
  l.textContent = '';
  if (!ms.length) {
    var e = el('div', 'box');
    e.appendChild(el('p', 0, 'No hay ningún modelo para este sistema.'));
    if (ATL_VAC[sy[0]]) e.appendChild(el('p', 's', ATL_VAC[sy[0]]));
    l.appendChild(e);
  }
  ms.forEach(function (m) {
    var b = el('button', 'mcard');
    b.type = 'button';
    b.appendChild(el('b', 0, m.n));
    b.appendChild(
      el(
        'small',
        0,
        m.tri.toLocaleString('es') +
          ' triángulos · ' +
          m.parts +
          ' ' +
          (m.kind === 'named'
            ? 'estructuras con nombre'
            : m.kind === 'shells'
              ? 'cuerpos separados'
              : 'malla'),
      ),
    );
    var bd = el(
      'span',
      'badge b-' + (m.kind === 'named' ? 'named' : m.kind === 'shells' ? 'shell' : 'single'),
      kindLabel(m.kind),
    );
    b.appendChild(bd);
    b.onclick = function () {
      atLoad(m);
    };
    l.appendChild(b);
  });
  var fa = $('afalta');
  fa.textContent = '';
  ATL_FALTA.forEach(function (f) {
    var p = el('p', 'srcmini');
    p.appendChild(el('b', 0, f.n + ' — ' + f.sys + '. '));
    p.appendChild(document.createTextNode(f.det + ' Archivo: ' + f.file));
    fa.appendChild(p);
  });
  var sinmod = ATL_SYS.filter(function (x) {
    return !atModels(x[0]).length;
  }).map(function (x) {
    return x[1];
  });
  if (sinmod.length)
    fa.appendChild(
      el('p', 'srcmini', 'Sistemas sin ningún modelo adjunto: ' + sinmod.join(', ') + '.'),
    );
  msg('alic', ATL_LIC);
  if (!estado.atCur) atFicha(null);
}
export function atFicha(m) {
  var f = $('aficha');
  f.textContent = '';
  if (!m) {
    f.appendChild(el('p', 's', 'Elige un modelo para ver su ficha.'));
    $('apartbox').style.display = 'none';
    return;
  }
  $('apartbox').style.display = '';
  [
    ['Modelo', m.n],
    [
      'Sistemas',
      m.sys
        .map(function (x) {
          return ATL_SYS.filter(function (y) {
            return y[0] === x;
          })[0][1];
        })
        .join(', '),
    ],
    ['Geometría', m.tri.toLocaleString('es') + ' triángulos'],
    ['Estructura interna', m.parts + ' · ' + kindLabel(m.kind)],
    ['Archivo original', m.file],
    ['Exportado por', m.gen],
  ].forEach(function (r) {
    var p = el('p', 'srcmini');
    p.appendChild(el('b', 0, r[0] + ': '));
    p.appendChild(document.createTextNode(r[1]));
    f.appendChild(p);
  });
  var nt = el('p', 'srcmini');
  nt.appendChild(el('b', 0, 'Nota: '));
  nt.appendChild(document.createTextNode(m.nota));
  f.appendChild(nt);
}
export function atInit() {
  if (estado.AT3) return true;
  if (!tresListo()) {
    con3D(null, 'amsg');
    return false;
  }
  var box = $('acv'),
    w = box.clientWidth || 320,
    h = box.clientHeight || 400;
  var r = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });
  r.setSize(w, h);
  r.setPixelRatio(Math.min(devicePixelRatio, 2));
  box.insertBefore(r.domElement, box.firstChild);
  var sc = new THREE.Scene(),
    cam = new THREE.PerspectiveCamera(45, w / h, 0.01, 2000);
  cam.position.set(0, 0, 3);
  sc.add(new THREE.AmbientLight(0xffffff, 0.75));
  var d1 = new THREE.DirectionalLight(0xffffff, 0.9);
  d1.position.set(2, 3, 4);
  sc.add(d1);
  var d2 = new THREE.DirectionalLight(0x65c3b5, 0.4);
  d2.position.set(-3, -2, -3);
  sc.add(d2);
  var ctl = new THREE.OrbitControls(cam, r.domElement);
  ctl.enableDamping = true;
  ctl.autoRotate = atRotOn && !estado.RM;
  ctl.autoRotateSpeed = 0.9;
  estado.AT3 = {
    sc: sc,
    cam: cam,
    r: r,
    ctl: ctl,
    box: box,
    ray: new THREE.Raycaster(),
    root: null,
    meshes: [],
    sel: null,
  };
  (function loop() {
    requestAnimationFrame(loop);
    ctl.update();
    r.render(sc, cam);
    if ((++estado.atTick & 3) === 0) atLabel();
  })();
  var px = 0,
    py = 0;
  r.domElement.addEventListener('pointerdown', function (e) {
    px = e.clientX;
    py = e.clientY;
  });
  r.domElement.addEventListener('pointerup', function (e) {
    if (Math.abs(e.clientX - px) + Math.abs(e.clientY - py) < 6) atPick(e);
  });
  addEventListener('resize', atSize2);
  return true;
}
export function atSize2() {
  if (!estado.AT3) return;
  var w = estado.AT3.box.clientWidth,
    h = estado.AT3.box.clientHeight;
  estado.AT3.r.setSize(w, h);
  estado.AT3.cam.aspect = w / h;
  estado.AT3.cam.updateProjectionMatrix();
}
export function atClear() {
  if (!estado.AT3) return;
  if (estado.AT3.root) {
    estado.AT3.sc.remove(estado.AT3.root);
    estado.AT3.root = null;
  }
  estado.AT3.meshes = [];
  estado.AT3.sel = null;
  estado.AT3.selg = [];
  if ($('aest')) {
    $('aest').textContent = '';
    $('aest').hidden = true;
  }
  pinDraw(estado.AT3.box, estado.AT3.cam, [], null, function () {
    return '';
  });
  $('albl').style.display = 'none';
  $('aparts').textContent = '';
  msg('ainfo', 'Ninguna.');
}
export function atEmpty() {
  atClear();
  estado.atCur = null;
  estado.HA_CUR = null;
  renderHA();
  atFicha(null);
  $('aov').style.display = '';
  $('aov').textContent = 'Elige un modelo de la lista.';
  msg('amsg', 'Visor vacío.');
}
export function atLoad(m) {
  if (!tresListo()) {
    con3D(function () {
      atLoad(m);
    }, 'amsg');
    return;
  }
  if (!atInit()) return;
  if (estado.atCur && estado.atCur.id === m.id) {
    msg('amsg', 'Ese modelo ya está cargado.');
    return;
  }
  atClear();
  estado.atCur = m;
  atFicha(m);
  $('aov').style.display = '';
  $('aov').textContent = 'Cargando ' + m.n + '…';
  msg('amsg', 'Cargando ' + m.n + '…');
  atChunks(m.id, function (buf) {
    if (!buf) {
      atFail(m);
      return;
    }
    try {
      new THREE.GLTFLoader().parse(
        buf,
        '',
        function (g) {
          atAdd(g.scene, m);
        },
        function () {
          atFail(m);
        },
      );
    } catch (e) {
      atFail(m);
    }
  });
}
export function atFail(m) {
  $('aov').textContent = 'No se pudo cargar el modelo.';
  msg(
    'amsg',
    'No se pudo leer «' +
      m.id +
      '.glb». Si abriste el HTML por tu cuenta, deja los archivos .glb en la misma carpeta, o usa «Abrir un modelo desde mi dispositivo».',
  );
}
export function atChunks(id, cb) {
  /* [Rouviere PWA] Los modelos se sirven como archivos binarios (antes base64 dentro de .js). */
  atUrl(id, cb);
}
export function atUrl(id, cb) {
  fetch(id + '.glb')
    .then(function (r) {
      if (!r.ok) throw 0;
      return r.arrayBuffer();
    })
    .then(cb)
    .catch(function () {
      cb(null);
    });
}
export function atAdd(obj, m) {
  var grp = new THREE.Group();
  grp.add(obj);
  obj.traverse(function (o) {
    if (o.isMesh) {
      if (o.material && o.material.clone) o.material = o.material.clone();
      estado.AT3.meshes.push(o);
    }
  });
  if (!estado.AT3.meshes.length) {
    atFail(m);
    return;
  }
  var bb = new THREE.Box3().setFromObject(grp),
    sz = bb.getSize(new THREE.Vector3()),
    c = bb.getCenter(new THREE.Vector3()),
    mx = Math.max(sz.x, sz.y, sz.z);
  if (!isFinite(mx) || mx <= 0) {
    atFail(m);
    return;
  }
  var k = 2 / mx;
  grp.scale.setScalar(k);
  grp.position.sub(c.multiplyScalar(k));
  estado.AT3.sc.add(grp);
  estado.AT3.root = grp;
  grp.updateMatrixWorld(true);
  atFit();
  pinCache(estado.AT3.meshes);
  estado.AT3.meshes.forEach(function (x) {
    if (x.material && x.material.color) x._oc = x.material.color.getHex();
  });
  if (m.kind === 'named') {
    estado.atColor = 'orig';
    $('acol').textContent = 'Colorear estructuras';
    msg('acolw', 'Mostrando los colores que trae el archivo original.');
  } else {
    estado.atColor = 'pal';
    applyColors(estado.AT3.meshes, 'pal');
    $('acol').textContent = 'Colores del archivo';
    msg(
      'acolw',
      m.kind === 'shells'
        ? 'El archivo no trae color. La plataforma asignó un color distinto a cada cuerpo para poder diferenciarlos: NO son colores anatómicos reales.'
        : 'El archivo no trae color ni partes separadas, así que el color se aplica a toda la malla y NO es anatómico.',
    );
  }
  atProc(m);
  $('aov').style.display = 'none';
  msg(
    'amsg',
    m.n +
      ' cargado: ' +
      estado.AT3.meshes.length +
      ' ' +
      (m.kind === 'named'
        ? 'estructuras con nombre'
        : m.kind === 'shells'
          ? 'cuerpos sin nombre'
          : 'malla') +
      '.' +
      (m.kind === 'named'
        ? ' Los rótulos con punto y línea guía ya están puestos.'
        : NM_GEO[m.id]
          ? ' Las piezas están identificadas por su posición y medidas, no por el archivo: revisa cada nombre antes de estudiarlo.'
          : ' El archivo no trae nombres anatómicos, así que no hay nada que rotular: ponle nombre a una estructura con el botón ＋ de la lista y su rótulo aparecerá sobre el modelo.'),
  );
  log('Atlas 3D: ' + m.n);
  atParts('');
}
export function atPretty(n) {
  var un = estado.atCur ? unGet(estado.atCur.id, n) : null;
  if (un) return un;
  if (estado.HA_MAP[n]) return estado.HA_MAP[n].n;
  var es = esName(n, estado.atCur ? estado.atCur.id : null);
  if (es) return es;
  if (/^Cuerpo[ _]\d+$/.test(String(n)))
    return 'Estructura sin nombre nº ' + String(n).replace(/^Cuerpo[ _]/, '');
  var raw = String(n || '').replace(/^(VH_[MF]_|Allen_)/, ''),
    lat = '';
  var mm = raw.match(/_(L|R)$/);
  if (mm) {
    lat = mm[1] === 'L' ? ' (izquierdo)' : ' (derecho)';
    raw = raw.replace(/_(L|R)$/, '');
  }
  return raw.replace(/_/g, ' ') + lat;
}
export function atParts(q) {
  var l = $('aparts');
  l.textContent = '';
  if (!estado.AT3 || !estado.AT3.meshes.length) {
    l.appendChild(el('p', 's', 'Carga un modelo para ver sus partes.'));
    return;
  }
  if (estado.atCur && estado.atCur.kind === 'single') {
    l.appendChild(
      el(
        'p',
        's',
        'Este archivo es una sola malla fusionada: no tiene partes que mostrar u ocultar.',
      ),
    );
    return;
  }
  if (estado.atCur && estado.atCur.kind === 'shells')
    l.appendChild(
      el(
        'p',
        's',
        'Son cuerpos geométricamente separados, sin nombre anatómico dentro del archivo.',
      ),
    );
  var qq = nz(q),
    out = estado.AT3.meshes.filter(function (m) {
      return (
        !qq ||
        nz(atPretty(m.name) + ' ' + m.name + (m._ha ? ' ' + m._ha.e + ' ' + m._ha.c : '')).indexOf(
          qq,
        ) >= 0
      );
    });
  l.appendChild(el('p', 's', out.length + ' de ' + estado.AT3.meshes.length));
  out.slice(0, 150).forEach(function (mh) {
    var b = el('button', 'bitem' + (estado.AT3.sel === mh ? ' on' : ''));
    b.type = 'button';
    var cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = mh.visible;
    cb.onclick = function (e) {
      e.stopPropagation();
      mh.visible = cb.checked;
      if (!cb.checked && estado.AT3.sel === mh) atSelect(null);
    };
    b.appendChild(cb);
    b.appendChild(el('span', 0, atPretty(mh.name)));
    b.onclick = function () {
      atSelect(mh);
      atFocus([mh]);
    };
    var ed = el(
      'button',
      'lnk',
      unGet(estado.atCur ? estado.atCur.id : 'local', mh.name) ? '✎' : '＋',
    );
    ed.type = 'button';
    ed.style.marginLeft = 'auto';
    ed.title = 'Poner nombre a esta estructura';
    ed.onclick = function (e) {
      e.stopPropagation();
      askName(mh);
    };
    b.appendChild(ed);
    l.appendChild(b);
  });
  if (out.length > 150)
    l.appendChild(el('p', 's', 'Se muestran las primeras 150. Afina la búsqueda.'));
}
/* El atlas entrega 2.234 mallas para 1.659 entidades: el cartílago cricoideo
   viene en dos trozos y el cerebelo también. Tocar una pieza tiene que
   iluminar la estructura entera, no uno de sus pedazos. Se agrupa por FMA. */
export function atGrupo(m) {
  if (!m) return [];
  if (!m._ha || !m._ha.c || !estado.AT3) return [m];
  var r = [];
  estado.AT3.meshes.forEach(function (x) {
    if (x._ha && x._ha.c === m._ha.c) r.push(x);
  });
  return r.length ? r : [m];
}
export function atSelect(m) {
  (estado.AT3.selg || []).forEach(function (x) {
    if (x.material && x.material.emissive && x._e != null) x.material.emissive.setHex(x._e);
  });
  if (
    estado.AT3.sel &&
    estado.AT3.sel.material &&
    estado.AT3.sel.material.emissive &&
    estado.AT3.sel._e != null
  )
    estado.AT3.sel.material.emissive.setHex(estado.AT3.sel._e);
  estado.AT3.selg = [];
  estado.AT3.sel = m;
  if (!m) {
    $('albl').style.display = 'none';
    atLabel();
    msg('ainfo', 'Ninguna.');
    estPanel(null);
    atParts($('aq').value);
    return;
  }
  estado.AT3.selg = atGrupo(m);
  estado.AT3.selg.forEach(function (x) {
    if (x.material && x.material.emissive) {
      x._e = x.material.emissive.getHex();
      x.material.emissive.setHex(0x1f7f77);
    }
  });
  var v =
    m.geometry && m.geometry.attributes && m.geometry.attributes.position
      ? m.geometry.attributes.position.count
      : 0;
  var mid = estado.atCur ? estado.atCur.id : null,
    un = mid ? unGet(mid, m.name) : null,
    es = esName(m.name, mid),
    gh = mid ? geoHow(mid, String(m.name).replace(/_/g, ' ')) : null,
    fi = NM_FICHA[m.name];
  var txt;
  if (m._ha) {
    txt =
      atPretty(m.name) +
      ' · nombre original en inglés: ' +
      m._ha.e +
      ' · sistema: ' +
      m._ha.s +
      ' · identificador BodyParts3D: ' +
      m._ha.i +
      (m._ha.c ? ' · concepto FMA: ' + m._ha.c : '') +
      ' · ' +
      v +
      ' vértices' +
      (estado.AT3.selg.length > 1
        ? ', iluminada entera con sus ' + estado.AT3.selg.length + ' mallas'
        : '') +
      '. ' +
      'Nombre traducido al español de forma automática a partir del nombre original; revísalo antes de usarlo en un examen. ';
    msg('ainfo', txt);
    estPanel(m);
    atParts($('aq').value);
    return;
  }
  txt = atPretty(m.name) + ' · nombre en el archivo: ' + m.name + ' · ' + v + ' vértices. ';
  if (fi) txt += 'Función: ' + fi[0] + ' (Fuente: ' + NM_FSP[0] + ')';
  else if (gh && !un) txt += 'Cómo se identificó: ' + gh + ' ' + NM_GEO_AVISO;
  else if (es)
    txt +=
      'Nombre traducido del propio archivo. Descripción educativa: pendiente de redactar con fuente y de revisión docente.';
  else if (un) txt += 'Nombre puesto por ti, no por el archivo ni por una fuente verificada.';
  else
    txt +=
      'El archivo no da nombre para esta malla, así que su identificación queda pendiente. No le asigno un nombre anatómico al azar: puedes ponérselo tú con el botón ＋.';
  msg('ainfo', txt);
  estPanel(m);
  $('albl').textContent = atPretty(m.name);
  atLabel();
  atParts($('aq').value);
}

/* La ficha de la pieza seleccionada, debajo del visor. Si no hay ficha, se dice. */
export function estPanel(m) {
  var w = $('aest');
  if (!w) return;
  w.textContent = '';
  if (!m || !m._ha || !m._ha.c) {
    w.hidden = true;
    return;
  }
  w.hidden = false;
  if (estado.EST_LD !== 2) {
    w.appendChild(el('p', 'efsin', 'Cargando las fichas…'));
    estCarga(function () {
      if (estado.AT3 && estado.AT3.sel === m) estPanel(m);
    });
    return;
  }
  var e = estDeFma(m._ha.c);
  if (!e) {
    w.appendChild(
      el(
        'p',
        'efsin',
        'Esta pieza todavía no tiene ficha en ROUVIÈRE. ' +
          'Su código FMA es ' +
          m._ha.c +
          '; cuando exista una ficha con ese código, aparecerá aquí.',
      ),
    );
    return;
  }
  estPinta(e, w, 'corto');
}
export function atNamed(m) {
  return !!(
    m._ha ||
    unGet(estado.atCur ? estado.atCur.id : 'local', m.name) ||
    esName(m.name, estado.atCur ? estado.atCur.id : null)
  );
}
export function atLabel() {
  if (!estado.AT3) return;
  pinDraw(
    estado.AT3.box,
    estado.AT3.cam,
    pinList(estado.AT3.meshes, estado.atPin, estado.AT3.sel, atNamed, estado.AT3.box),
    estado.AT3.sel,
    function (m) {
      return atPretty(m.name);
    },
  );
}
export function atPick(e) {
  if (!estado.AT3 || !estado.AT3.meshes.length) return;
  var rc = estado.AT3.r.domElement.getBoundingClientRect();
  estado.AT3.ray.setFromCamera(
    new THREE.Vector2(
      ((e.clientX - rc.left) / rc.width) * 2 - 1,
      -((e.clientY - rc.top) / rc.height) * 2 + 1,
    ),
    estado.AT3.cam,
  );
  var hits = estado.AT3.ray.intersectObjects(
    estado.AT3.meshes.filter(function (m) {
      return m.visible;
    }),
    false,
  );
  atSelect(hits.length ? hits[0].object : null);
}
export function atFocus(ms) {
  if (!estado.AT3 || !ms.length) return;
  var b = new THREE.Box3();
  ms.forEach(function (m) {
    b.expandByObject(m);
  });
  var c = b.getCenter(new THREE.Vector3()),
    sz = b.getSize(new THREE.Vector3()),
    r = Math.max(sz.x, sz.y, sz.z) || 1;
  estado.AT3.ctl.target.copy(c);
  estado.AT3.cam.position.set(c.x + r * 1.4, c.y + r * 0.5, c.z + r * 2);
  estado.AT3.ctl.update();
}
export function atFit() {
  if (!estado.AT3 || !estado.AT3.meshes.length) return;
  atFocus(
    estado.AT3.meshes.filter(function (m) {
      return m.visible;
    }),
  );
  msg('amsg', 'Modelo ajustado a la pantalla.');
}
export function atShowAll() {
  if (!estado.AT3) return;
  estado.AT3.meshes.forEach(function (m) {
    m.visible = true;
  });
  atParts($('aq').value);
  atFit();
  msg('amsg', 'Todas las partes visibles.');
}
export function atReset2() {
  if (estado.AT3) {
    estado.AT3.cam.position.set(0, 0, 3);
    estado.AT3.ctl.target.set(0, 0, 0);
    estado.AT3.ctl.update();
    atFit();
    msg('amsg', 'Vista restablecida.');
  }
}
export function atRotToggle() {
  if (!estado.AT3) return;
  estado.AT3.ctl.autoRotate = !estado.AT3.ctl.autoRotate;
  $('arot').textContent = estado.AT3.ctl.autoRotate ? 'Pausar giro' : 'Girar solo';
}
export function atUpload(f) {
  if (!f) return;
  if (!/\.(glb|gltf)$/i.test(f.name)) {
    msg('amsg', 'Formato no compatible. Usa .glb o .gltf.');
    return;
  }
  if (!atInit()) return;
  atClear();
  var u = URL.createObjectURL(f);
  msg('amsg', 'Abriendo ' + f.name + '…');
  $('aov').style.display = '';
  $('aov').textContent = 'Cargando ' + f.name + '…';
  new THREE.GLTFLoader().load(
    u,
    function (g) {
      estado.atCur = {
        id: 'local',
        n: f.name,
        kind: 'named',
        tri: 0,
        parts: 0,
        sys: [],
        file: f.name + ' (desde tu dispositivo)',
        gen: 'Archivo abierto por ti',
      };
      atFicha(estado.atCur);
      atAdd(g.scene, estado.atCur);
      URL.revokeObjectURL(u);
    },
    null,
    function () {
      msg('amsg', 'No se pudo leer ese archivo.');
      $('aov').textContent = 'No se pudo cargar.';
    },
  );
}
/* ===== atlas 3D de embriología ===== */
