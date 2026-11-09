import { estado } from '../../estado.js';
import {
  SNC_ALC,
  SNC_COMP,
  SNC_FU,
  SNC_G,
  SNC_LIM,
  SNC_OBJ,
  SNC_QA,
  SNC_TAB,
  log,
} from '../../core/almacenamiento.js';
import { $, el, msg, nz } from '../../core/dom.js';
import { PINTXT, pinCache, pinDraw, pinList, pinNext } from '../atlas/rotulos.js';
import { con3D, tresListo } from '../documentos/documentos.js';
import { li } from '../modulos/modulos.js';
import { esName } from '../nombres/nombres-anatomicos.js';
export const brRot = true;
export function sncState() {
  try {
    return JSON.parse(localStorage.getItem('rv_snc') || '{}');
  } catch (e) {
    return {};
  }
}
export function sncSave(o) {
  try {
    localStorage.setItem('rv_snc', JSON.stringify(o));
  } catch (e) {}
}
export function renderSNC() {
  msg('sncalc', SNC_ALC);
  msg('snccomp', SNC_COMP);
  li($('sncobj'), SNC_OBJ);
  li($('snclim'), SNC_LIM);
  var tb = $('snctabs');
  tb.textContent = '';
  SNC_G.forEach(function (g, i) {
    var b = el('button', 'tb' + (i === estado.curSNC ? ' on' : ''), g.g);
    b.type = 'button';
    b.onclick = function () {
      estado.curSNC = i;
      renderSNC();
    };
    tb.appendChild(b);
  });
  var st = sncState(),
    g = SNC_G[estado.curSNC],
    bd = $('sncbody');
  bd.textContent = '';
  var h = el('h3', 0, 'Grupo ' + g.g + '. ' + g.t);
  h.style.cssText = 'font:500 1.9rem "Cormorant Garamond",serif;margin:4px 0 8px';
  bd.appendChild(h);
  bd.appendChild(el('p', 0, g.d));
  var b1 = el('div', 'box');
  b1.appendChild(el('b', 0, 'Estructuras para identificar'));
  var u = el('ul', 'vl');
  li(u, g.e);
  b1.appendChild(u);
  bd.appendChild(b1);
  var b2 = el('div', 'box');
  b2.appendChild(el('b', 0, 'Actividad sugerida'));
  b2.appendChild(el('p', 's', g.a));
  bd.appendChild(b2);
  var b3 = el('div', 'box');
  b3.appendChild(el('b', 0, 'Ver en el modelo 3D'));
  if (g.m.length) {
    b3.appendChild(
      el(
        'p',
        's',
        'Accesos que coinciden con mallas reales del archivo. La etiqueta indica si la correspondencia es completa, parcial o solo por nombre.',
      ),
    );
    var sh = el('div', 'sh');
    g.m.forEach(function (x) {
      var b = el('button', 0, x[0]);
      b.type = 'button';
      var sm = el('span', 'mini', 'coincidencia ' + x[2]);
      b.appendChild(sm);
      b.onclick = function () {
        isolate(x[1], x[0]);
      };
      sh.appendChild(b);
    });
    b3.appendChild(sh);
  } else
    b3.appendChild(
      el(
        'p',
        's',
        'Este grupo no tiene correspondencia en el modelo: el archivo no incluye esas estructuras. Estúdialo con el texto y las fuentes.',
      ),
    );
  bd.appendChild(b3);
  var b4 = el('div', 'box');
  b4.appendChild(el('b', 0, 'Fuentes de este grupo'));
  SNC_FU.forEach(function (f) {
    var p = el('p', 'srcmini');
    p.appendChild(document.createTextNode(f[0] + ' '));
    var a = el('a', 0, 'Abrir');
    a.href = f[1];
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    p.appendChild(a);
    b4.appendChild(p);
  });
  bd.appendChild(b4);
  var mk = el(
    'button',
    'pill' + (st[g.g] ? ' done' : ''),
    st[g.g] ? 'Estudiado ✓' : 'Marcar como estudiado',
  );
  mk.type = 'button';
  mk.onclick = function () {
    var o = sncState();
    if (o[g.g]) delete o[g.g];
    else o[g.g] = Date.now();
    sncSave(o);
    log('SNC grupo ' + g.g + (o[g.g] ? ' estudiado' : ' sin marcar'));
    renderSNC();
  };
  bd.appendChild(mk);
  var done = SNC_G.filter(function (x) {
    return st[x.g];
  }).length;
  bd.appendChild(
    el('p', 's', 'Progreso del módulo: ' + done + ' de ' + SNC_G.length + ' grupos marcados.'),
  );
  renderSNCQ();
  var tt = $('snctab');
  tt.textContent = '';
  SNC_TAB.forEach(function (r) {
    var d = el('div', 'item');
    var w = el('div');
    w.appendChild(el('b', 0, r[0]));
    w.appendChild(el('small', 0, r[1] + ' · ' + r[2]));
    d.appendChild(w);
    tt.appendChild(d);
  });
  var fu = $('sncfu');
  fu.textContent = '';
  SNC_FU.forEach(function (f) {
    var p = el('p', 'srcmini');
    p.appendChild(document.createTextNode(f[0] + ' '));
    var a = el('a', 0, 'Abrir');
    a.href = f[1];
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    p.appendChild(a);
    fu.appendChild(p);
  });
}
export function renderSNCQ() {
  var c = $('sncq');
  c.textContent = '';
  SNC_QA.forEach(function (q, i) {
    var b = el('div', 'box');
    b.appendChild(el('b', 0, i + 1 + '. ' + q[0]));
    var fb = el('p', 's');
    q[2].forEach(function (o, j) {
      var bt = el('button', 'opt', o);
      bt.type = 'button';
      bt.onclick = function () {
        var okk = o === q[1];
        bt.className = 'opt ' + (okk ? 'ok' : 'no');
        estado.sncAns[i] = okk;
        fb.textContent = (okk ? 'Correcto. ' : 'No. ') + 'Respuesta del documento: ' + q[1];
        sncScore();
      };
      b.appendChild(bt);
    });
    b.appendChild(fb);
    c.appendChild(b);
  });
  var sc = el('p', 's');
  sc.id = 'sncsc';
  c.appendChild(sc);
  var rb = el('button', 'pill', 'Repetir actividad');
  rb.type = 'button';
  rb.onclick = function () {
    estado.sncAns = [];
    renderSNCQ();
  };
  c.appendChild(rb);
  sncScore();
}
export function sncScore() {
  var n = 0,
    a = 0;
  estado.sncAns.forEach(function (v) {
    if (v !== undefined) {
      a++;
      if (v) n++;
    }
  });
  var e = $('sncsc');
  if (e)
    e.textContent = a
      ? 'Respondidas ' + a + ' de ' + SNC_QA.length + ' · aciertos ' + n
      : 'Aún no has respondido.';
  if (a === SNC_QA.length) log('Actividad SNC: ' + n + ' / ' + SNC_QA.length);
}
/* --- visor del cerebro --- */
export function brInit() {
  if (estado.BR) return true;
  if (!tresListo()) {
    con3D(null, 'bmsg');
    return false;
  }
  var box = $('bcv'),
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
  sc.add(new THREE.AmbientLight(0xffffff, 0.75));
  var d1 = new THREE.DirectionalLight(0xffffff, 0.85);
  d1.position.set(2, 3, 4);
  sc.add(d1);
  var d2 = new THREE.DirectionalLight(0x65c3b5, 0.35);
  d2.position.set(-3, -1, -2);
  sc.add(d2);
  var ctl = new THREE.OrbitControls(cam, r.domElement);
  ctl.enableDamping = true;
  ctl.autoRotate = brRot && !estado.RM;
  ctl.autoRotateSpeed = 0.9;
  estado.BR = {
    sc: sc,
    cam: cam,
    r: r,
    ctl: ctl,
    box: box,
    ray: new THREE.Raycaster(),
    meshes: [],
    sel: null,
    root: null,
  };
  (function loop() {
    requestAnimationFrame(loop);
    ctl.update();
    r.render(sc, cam);
    if ((++estado.brTick & 3) === 0) brLabel();
  })();
  var px = 0,
    py = 0;
  r.domElement.addEventListener('pointerdown', function (e) {
    px = e.clientX;
    py = e.clientY;
  });
  r.domElement.addEventListener('pointerup', function (e) {
    if (Math.abs(e.clientX - px) + Math.abs(e.clientY - py) < 6) brPick(e);
  });
  addEventListener('resize', brSize);
  return true;
}
export function brSize() {
  if (!estado.BR) return;
  var w = estado.BR.box.clientWidth,
    h = estado.BR.box.clientHeight;
  estado.BR.r.setSize(w, h);
  estado.BR.cam.aspect = w / h;
  estado.BR.cam.updateProjectionMatrix();
}
export function brParse(buf, label) {
  try {
    new THREE.GLTFLoader().parse(
      buf,
      '',
      function (g) {
        brAdd(g.scene, label);
      },
      function () {
        brFail(label);
      },
    );
  } catch (e) {
    brFail(label);
  }
}
export function brFail(label) {
  $('bload').disabled = false;
  $('bov').textContent = 'No se pudo cargar el modelo.';
  msg(
    'bmsg',
    'No se pudo leer el modelo. Si abriste el archivo HTML por tu cuenta, coloca allen-brain.glb en la misma carpeta, o ábrelo con el botón «Abrir otro .glb desde mi dispositivo».',
  );
}
export function brLoad(url, label) {
  if (!brInit()) return;
  msg('bmsg', 'Cargando el modelo…');
  $('bov').textContent = 'Cargando… puede tardar la primera vez.';
  $('bload').disabled = true;
  /* [Rouviere PWA] Los modelos se sirven como archivos binarios (antes base64 dentro de .js). */
  brLoadUrl(url, label);
}
export function brLoadUrl(url, label) {
  new THREE.GLTFLoader().load(
    url,
    function (g) {
      brAdd(g.scene, label);
    },
    function (p) {
      if (p && p.total)
        $('bov').textContent = 'Cargando… ' + Math.round((p.loaded / p.total) * 100) + '%';
    },
    function () {
      brFail(label);
    },
  );
}
export function brAdd(obj, label) {
  if (estado.BR.root) {
    estado.BR.sc.remove(estado.BR.root);
  }
  estado.BR.meshes = [];
  estado.BR.sel = null;
  $('blb').style.display = 'none';
  pinDraw(estado.BR.box, estado.BR.cam, [], null, function () {
    return '';
  });
  var grp = new THREE.Group();
  grp.add(obj);
  obj.traverse(function (o) {
    if (o.isMesh) {
      if (o.material && o.material.clone) o.material = o.material.clone();
      estado.BR.meshes.push(o);
    }
  });
  if (!estado.BR.meshes.length) {
    msg('bmsg', 'El archivo no contiene geometría visible.');
    $('bload').disabled = false;
    return;
  }
  var bb = new THREE.Box3().setFromObject(grp),
    sz = bb.getSize(new THREE.Vector3()),
    c = bb.getCenter(new THREE.Vector3()),
    mx = Math.max(sz.x, sz.y, sz.z);
  if (!isFinite(mx) || mx <= 0) {
    msg('bmsg', 'El modelo no tiene dimensiones válidas.');
    $('bload').disabled = false;
    return;
  }
  var k = 2 / mx;
  grp.scale.setScalar(k);
  grp.position.sub(c.multiplyScalar(k));
  estado.BR.sc.add(grp);
  estado.BR.root = grp;
  grp.updateMatrixWorld(true);
  pinCache(estado.BR.meshes);
  estado.BR.cam.position.set(0, 0, 3);
  estado.BR.ctl.target.set(0, 0, 0);
  estado.BR.ctl.saveState();
  estado.BR.ctl.update();
  $('bov').style.display = 'none';
  $('bload').disabled = false;
  msg(
    'bmsg',
    (label || 'Modelo') + ' cargado: ' + estado.BR.meshes.length + ' estructuras con nombre.',
  );
  log('Modelo 3D del encéfalo cargado');
  brList('');
}
export function pretty(n) {
  var es = esName(n);
  if (es) return es;
  return String(n || '')
    .replace(/^Allen_/, '')
    .replace(/_/g, ' ')
    .replace(/ L$/, ' (izquierdo)')
    .replace(/ R$/, ' (derecho)');
}
export function brList(q) {
  var l = $('blist');
  l.textContent = '';
  if (!estado.BR || !estado.BR.meshes.length) {
    l.appendChild(el('p', 's', 'Carga el modelo para ver sus estructuras.'));
    return;
  }
  var qq = nz(q),
    out = estado.BR.meshes.filter(function (m) {
      return !qq || nz(pretty(m.name) + ' ' + m.name).indexOf(qq) >= 0;
    });
  l.appendChild(el('p', 's', out.length + ' de ' + estado.BR.meshes.length + ' estructuras'));
  out.slice(0, 120).forEach(function (m) {
    var b = el('button', 'bitem' + (estado.BR.sel === m ? ' on' : ''));
    b.type = 'button';
    var cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = m.visible;
    cb.onclick = function (e) {
      e.stopPropagation();
      m.visible = cb.checked;
    };
    b.appendChild(cb);
    b.appendChild(el('span', 0, pretty(m.name)));
    b.onclick = function () {
      brSelect(m);
      brFocus([m]);
    };
    l.appendChild(b);
  });
  if (out.length > 120)
    l.appendChild(el('p', 's', 'Se muestran las primeras 120. Afina la búsqueda.'));
}
export function brSelect(m) {
  if (
    estado.BR.sel &&
    estado.BR.sel.material &&
    estado.BR.sel.material.emissive &&
    estado.BR.sel._e != null
  )
    estado.BR.sel.material.emissive.setHex(estado.BR.sel._e);
  estado.BR.sel = m;
  if (!m) {
    $('blb').style.display = 'none';
    brLabel();
    msg('binfo', 'Ninguna. Toca una estructura del modelo o búscala en la lista.');
    brList($('bq').value);
    return;
  }
  if (m.material && m.material.emissive) {
    m._e = m.material.emissive.getHex();
    m.material.emissive.setHex(0x1f7f77);
  }
  var v =
    m.geometry && m.geometry.attributes && m.geometry.attributes.position
      ? m.geometry.attributes.position.count
      : 0;
  msg(
    'binfo',
    pretty(m.name) +
      ' · nombre en el archivo: ' +
      m.name +
      ' · ' +
      v +
      ' vértices. Descripción educativa: no incluida en el archivo 3D; usa el texto del grupo y las fuentes.',
  );
  $('blb').textContent = pretty(m.name);
  brLabel();
  brList($('bq').value);
}
export function brLabel() {
  if (!estado.BR) return;
  pinDraw(
    estado.BR.box,
    estado.BR.cam,
    pinList(
      estado.BR.meshes,
      estado.brPin,
      estado.BR.sel,
      function () {
        return true;
      },
      estado.BR.box,
    ),
    estado.BR.sel,
    function (m) {
      return pretty(m.name);
    },
  );
}
export function brPinCycle() {
  estado.brPin = pinNext(estado.brPin);
  $('blbt').textContent = PINTXT[estado.brPin];
  if (estado.BR) brLabel();
  msg(
    'bmsg',
    estado.brPin === 'top'
      ? 'Se rotulan las estructuras más grandes en pantalla; gira el modelo y los rótulos se recolocan.'
      : estado.brPin === 'all'
        ? 'Se rotulan hasta 30 estructuras a la vez.'
        : estado.brPin === 'sel'
          ? 'Solo se rotula la estructura que elijas.'
          : 'Rótulos ocultos.',
  );
}
export function brPick(e) {
  if (!estado.BR || !estado.BR.meshes.length) return;
  var rc = estado.BR.r.domElement.getBoundingClientRect();
  estado.BR.ray.setFromCamera(
    new THREE.Vector2(
      ((e.clientX - rc.left) / rc.width) * 2 - 1,
      -((e.clientY - rc.top) / rc.height) * 2 + 1,
    ),
    estado.BR.cam,
  );
  var hits = estado.BR.ray.intersectObjects(
    estado.BR.meshes.filter(function (m) {
      return m.visible;
    }),
    false,
  );
  brSelect(hits.length ? hits[0].object : null);
}
export function brFocus(ms) {
  if (!estado.BR || !ms.length) return;
  var b = new THREE.Box3();
  ms.forEach(function (m) {
    b.expandByObject(m);
  });
  var c = b.getCenter(new THREE.Vector3()),
    sz = b.getSize(new THREE.Vector3()),
    r = Math.max(sz.x, sz.y, sz.z) || 1;
  estado.BR.ctl.target.copy(c);
  estado.BR.cam.position.set(c.x + r * 1.6, c.y + r * 0.6, c.z + r * 2);
  estado.BR.ctl.update();
}
export function isolate(sub, label) {
  if (!estado.BR || !estado.BR.meshes.length) {
    msg('bmsg', 'Carga primero el modelo para usar estos accesos.');
    $('bcv').scrollIntoView({
      block: 'start',
    });
    return;
  }
  var hit = estado.BR.meshes.filter(function (m) {
    return m.name.toLowerCase().indexOf(sub.toLowerCase()) >= 0;
  });
  if (!hit.length) {
    msg('bmsg', 'No hay mallas que coincidan con «' + sub + '» en este archivo.');
    return;
  }
  estado.BR.meshes.forEach(function (m) {
    m.visible = hit.indexOf(m) >= 0;
  });
  brSelect(hit[0]);
  brFocus(hit);
  msg(
    'bmsg',
    label +
      ': ' +
      hit.length +
      ' malla(s) aisladas de ' +
      estado.BR.meshes.length +
      '. Usa «Mostrar todas» para volver.',
  );
  $('bcv').scrollIntoView({
    block: 'start',
  });
}
export function brAll() {
  if (!estado.BR) return;
  estado.BR.meshes.forEach(function (m) {
    m.visible = true;
  });
  brList($('bq').value);
  if (estado.BR.root) {
    brFocus(estado.BR.meshes);
  }
  msg('bmsg', 'Todas las estructuras visibles.');
}
export function brReset() {
  if (estado.BR) {
    estado.BR.ctl.reset();
    msg('bmsg', 'Vista restablecida.');
  }
}
export function brCenter() {
  if (estado.BR && estado.BR.meshes.length) {
    brFocus(
      estado.BR.meshes.filter(function (m) {
        return m.visible;
      }),
    );
    msg('bmsg', 'Modelo centrado.');
  }
}
export function brToggleRot() {
  if (!estado.BR) return;
  estado.BR.ctl.autoRotate = !estado.BR.ctl.autoRotate;
  $('brot').textContent = estado.BR.ctl.autoRotate ? 'Pausar giro' : 'Girar solo';
}
export function brFileSel(f) {
  if (!f) return;
  if (!/\.(glb|gltf)$/i.test(f.name)) {
    msg('bmsg', 'Formato no compatible. Usa .glb o .gltf.');
    return;
  }
  if (!brInit()) return;
  var u = URL.createObjectURL(f);
  msg('bmsg', 'Abriendo ' + f.name + '…');
  new THREE.GLTFLoader().load(
    u,
    function (g) {
      brAdd(g.scene, f.name);
      URL.revokeObjectURL(u);
    },
    null,
    function () {
      msg('bmsg', 'No se pudo leer ese archivo.');
    },
  );
}

/* ===== rótulos con punto y línea guía ===== */
