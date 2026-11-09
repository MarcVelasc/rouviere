import { estado } from '../../estado.js';
import { EMB, EMB_ART, EMB_CONV, EMB_LIC, EMB_LIM, log } from '../../core/almacenamiento.js';
import { $, el, msg } from '../../core/dom.js';
import { pinCache, pinDraw } from '../atlas/rotulos.js';
import { con3D, tresListo } from '../documentos/documentos.js';
import { li } from '../modulos/modulos.js';
export const embLoaded = {};
export const embRot = true;
export function renderEmb() {
  var tb = $('embtabs');
  tb.textContent = '';
  EMB.forEach(function (m, i) {
    var b = el('button', 'tb' + (i === estado.curEmb ? ' on' : ''), m.st);
    b.type = 'button';
    b.onclick = function () {
      estado.curEmb = i;
      renderEmb();
      embShow(m.id, true);
    };
    tb.appendChild(b);
  });
  var m = EMB[estado.curEmb],
    f = $('embficha');
  f.textContent = '';
  var bx = el('div', 'box');
  bx.appendChild(el('b', 0, m.n));
  var dl = document.createElement('dl');
  dl.className = '';
  [
    ['Estadio', m.st],
    ['Edad', m.edad],
    ['Tamaño', m.tam || 'No indicado en el documento'],
    [
      'Geometría',
      m.tri.toLocaleString('es') + ' triángulos · ' + m.ver.toLocaleString('es') + ' vértices',
    ],
    ['Archivo original', m.orig],
    ['Partes separadas', 'Ninguna: una sola malla conectada'],
  ].forEach(function (r) {
    var p = el('p', 'srcmini');
    p.appendChild(el('b', 0, r[0] + ': '));
    p.appendChild(document.createTextNode(r[1]));
    bx.appendChild(p);
  });
  f.appendChild(bx);
  msg('econv', EMB_CONV);
  li($('elim'), EMB_LIM);
  msg('elic', EMB_LIC);
  var sr = $('esrc');
  sr.textContent = '';
  EMB.forEach(function (x) {
    var p = el('p', 'srcmini');
    p.appendChild(el('b', 0, x.st + ': '));
    p.appendChild(document.createTextNode(x.src + ' '));
    x.links.forEach(function (l) {
      var a = el('a', 0, l[0]);
      a.href = l[1];
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      p.appendChild(a);
      p.appendChild(document.createTextNode(' '));
    });
    sr.appendChild(p);
  });
  var pa = el('p', 'srcmini');
  pa.appendChild(el('b', 0, 'Artículo de contexto: '));
  pa.appendChild(document.createTextNode(EMB_ART[0] + ' '));
  var aa = el('a', 0, 'Abrir');
  aa.href = EMB_ART[1];
  aa.target = '_blank';
  aa.rel = 'noopener noreferrer';
  pa.appendChild(aa);
  sr.appendChild(pa);
  embTimeline();
}
export function embTimeline() {
  var t = $('etl');
  t.textContent = '';
  var bar = el('div', 'tlbar');
  EMB.forEach(function (m, i) {
    var d = el('span', 'dot' + (i === estado.curEmb ? ' on' : ''));
    bar.appendChild(d);
    var s2 = el('small', 0, m.st + (embLoaded[m.id] ? ' ✓' : ''));
    bar.appendChild(s2);
    if (i < EMB.length - 1) bar.appendChild(el('span', 'ln'));
  });
  t.appendChild(bar);
  t.appendChild(
    el(
      'p',
      's',
      'Estadio 16: 39 días. Estadio 23: unos 56 días. Ambas edades son las que describe la fuente.',
    ),
  );
}
export function embInit() {
  if (estado.EV) return true;
  if (!tresListo()) {
    con3D(null, 'emsg');
    return false;
  }
  var box = $('ecv'),
    w = box.clientWidth || 320,
    h = box.clientHeight || 380;
  var r = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });
  r.setSize(w, h);
  r.setPixelRatio(Math.min(devicePixelRatio, 2));
  box.insertBefore(r.domElement, box.firstChild);
  var sc = new THREE.Scene(),
    cam = new THREE.PerspectiveCamera(45, w / h, 0.01, 1000);
  cam.position.set(0, 0, 3);
  sc.add(new THREE.AmbientLight(0xffffff, 0.7));
  var d1 = new THREE.DirectionalLight(0xffffff, 0.9);
  d1.position.set(2, 3, 4);
  sc.add(d1);
  var d2 = new THREE.DirectionalLight(0x65c3b5, 0.4);
  d2.position.set(-3, -2, -2);
  sc.add(d2);
  var ctl = new THREE.OrbitControls(cam, r.domElement);
  ctl.enableDamping = true;
  ctl.autoRotate = embRot && !estado.RM;
  ctl.autoRotateSpeed = 1;
  estado.EV = {
    sc: sc,
    cam: cam,
    r: r,
    ctl: ctl,
    box: box,
    obj: {},
    cur: null,
  };
  (function loop() {
    requestAnimationFrame(loop);
    ctl.update();
    r.render(sc, cam);
    if ((++estado.embTick & 3) === 0) embLabel();
  })();
  addEventListener('resize', embSize);
  return true;
}
export function embLabel() {
  if (!estado.EV) return;
  var ms = [];
  if (
    estado.embPin !== 'off' &&
    estado.EV.cur &&
    estado.EV.obj[estado.EV.cur] &&
    estado.EV.obj[estado.EV.cur].visible
  )
    estado.EV.obj[estado.EV.cur].traverse(function (o) {
      if (o.isMesh && o.visible && o._pc) ms.push(o);
    });
  pinDraw(estado.EV.box, estado.EV.cam, ms, null, function (o) {
    return o._pn || 'Embrión';
  });
}
export function embPinCycle() {
  estado.embPin = estado.embPin === 'off' ? 'top' : 'off';
  $('elbt').textContent = estado.embPin === 'off' ? 'Rótulos: ocultos' : 'Rótulos: visibles';
  if (estado.EV) embLabel();
  msg(
    'emsg',
    estado.embPin === 'off'
      ? 'Rótulos ocultos.'
      : 'El archivo es una sola malla fusionada: solo puede rotularse el embrión completo, no sus órganos.',
  );
}
export function embSize() {
  if (!estado.EV) return;
  var w = estado.EV.box.clientWidth,
    h = estado.EV.box.clientHeight;
  estado.EV.r.setSize(w, h);
  estado.EV.cam.aspect = w / h;
  estado.EV.cam.updateProjectionMatrix();
}
export function embParse(buf, id, then) {
  try {
    new THREE.GLTFLoader().parse(
      buf,
      '',
      function (g) {
        embAdd(g.scene, id);
        if (then) then();
      },
      function () {
        embFail(id);
      },
    );
  } catch (e) {
    embFail(id);
  }
}
export function embFail(id) {
  $('eload').disabled = false;
  $('eov').textContent = 'No se pudo cargar el modelo.';
  msg(
    'emsg',
    'No se pudo leer el modelo «' +
      id +
      '.glb». Si abriste el archivo HTML por tu cuenta, deja ' +
      id +
      '.glb en la misma carpeta.',
  );
}
export function embLoad(id, then) {
  if (!embInit()) return;
  if (embLoaded[id]) {
    embShow(id);
    if (then) then();
    return;
  }
  msg('emsg', 'Cargando ' + id + '…');
  $('eov').textContent = 'Cargando…';
  $('eload').disabled = true;
  /* [Rouviere PWA] Los modelos se sirven como archivos binarios (antes base64 dentro de .js). */
  embUrl(id, then);
}
export function embUrl(id, then) {
  new THREE.GLTFLoader().load(
    id + '.glb',
    function (g) {
      embAdd(g.scene, id);
      if (then) then();
    },
    null,
    function () {
      embFail(id);
    },
  );
}
export function embAdd(obj, id) {
  var grp = new THREE.Group();
  grp.add(obj);
  var bb = new THREE.Box3().setFromObject(grp),
    sz = bb.getSize(new THREE.Vector3()),
    c = bb.getCenter(new THREE.Vector3()),
    mx = Math.max(sz.x, sz.y, sz.z);
  if (!isFinite(mx) || mx <= 0) {
    embFail(id);
    return;
  }
  var k = 2 / mx;
  grp.scale.setScalar(k);
  grp.position.sub(c.multiplyScalar(k));
  grp.visible = false;
  estado.EV.sc.add(grp);
  estado.EV.obj[id] = grp;
  embLoaded[id] = true;
  grp.updateMatrixWorld(true);
  var mm0 = EMB.filter(function (x) {
    return x.id === id;
  })[0];
  grp.traverse(function (o) {
    if (o.isMesh) {
      o._pn = (mm0 ? mm0.n : id) + ' · malla única';
      pinCache([o]);
    }
  });
  $('eload').disabled = false;
  $('eov').style.display = 'none';
  var m = EMB.filter(function (x) {
    return x.id === id;
  })[0];
  msg(
    'emsg',
    (m ? m.n : id) +
      ' cargado: ' +
      (m ? m.tri.toLocaleString('es') : '?') +
      ' triángulos, una sola malla.',
  );
  log('Modelo de embriología cargado: ' + id);
  embShow(id);
  embTimeline();
}
export function embShow(id, quiet) {
  if (!estado.EV || !estado.EV.obj[id]) {
    if (!quiet && !embLoaded[id])
      msg('emsg', 'Ese estadio aún no está cargado. Toca «Cargar modelo».');
    return;
  }
  for (var k in estado.EV.obj) estado.EV.obj[k].visible = k === id;
  estado.EV.cur = id;
  var i = 0;
  EMB.forEach(function (m, j) {
    if (m.id === id) i = j;
  });
  estado.curEmb = i;
  document.querySelectorAll('#embtabs .tb').forEach(function (x, j) {
    x.classList.toggle('on', j === i);
  });
  embWireApply();
  embTimeline();
  msg('ecmp', 'Mostrando ' + EMB[i].st + '.');
}
export function embBoth() {
  embLoad(EMB[0].id, function () {
    embLoad(EMB[1].id, function () {
      embShow(EMB[0].id);
      msg('ecmp', 'Los dos estadios están cargados. Usa «Alternar estadio».');
    });
  });
}
export function embSwap() {
  var ids = EMB.map(function (m) {
    return m.id;
  });
  if (!embLoaded[ids[0]] || !embLoaded[ids[1]]) {
    msg('ecmp', 'Primero toca «Cargar ambos».');
    return;
  }
  embShow(estado.EV.cur === ids[0] ? ids[1] : ids[0]);
}
export function embWireApply() {
  if (!estado.EV) return;
  for (var k in estado.EV.obj)
    estado.EV.obj[k].traverse(function (o) {
      if (o.isMesh && o.material) o.material.wireframe = estado.embWire;
    });
}
export function embToggleWire() {
  estado.embWire = !estado.embWire;
  embWireApply();
  msg('emsg', estado.embWire ? 'Vista en malla (wireframe) activada.' : 'Vista sólida.');
}
export function embReset() {
  if (estado.EV) {
    estado.EV.ctl.reset();
    estado.EV.cam.position.set(0, 0, 3);
    estado.EV.ctl.target.set(0, 0, 0);
    estado.EV.ctl.update();
    msg('emsg', 'Vista restablecida.');
  }
}
export function embCenter() {
  if (!estado.EV || !estado.EV.cur) return;
  estado.EV.ctl.target.set(0, 0, 0);
  estado.EV.cam.position.set(0, 0, 3);
  estado.EV.ctl.update();
  msg('emsg', 'Modelo centrado.');
}
export function embToggleRot() {
  if (!estado.EV) return;
  estado.EV.ctl.autoRotate = !estado.EV.ctl.autoRotate;
  $('erot').textContent = estado.EV.ctl.autoRotate ? 'Pausar giro' : 'Girar solo';
}
/* ===== módulo: sistema nervioso central ===== */
