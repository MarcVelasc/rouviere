export /* ===== rótulos con punto y línea guía ===== */
function pinLayer(box) {
  if (box._pl) return box._pl;
  var ov = document.createElement('div');
  ov.className = 'pins';
  var sv = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  ov.appendChild(sv);
  box.appendChild(ov);
  box._pl = {
    ov: ov,
    sv: sv,
  };
  return box._pl;
}
export function pinCache(meshes) {
  meshes.forEach(function (m) {
    try {
      var g = m.geometry;
      if (!g) {
        m._pc = null;
        return;
      }
      if (!g.boundingBox && g.computeBoundingBox) g.computeBoundingBox();
      var bb = g.boundingBox;
      if (!bb) {
        m._pc = null;
        return;
      }
      m._pc = bb.getCenter(new THREE.Vector3());
      var s = bb.getSize(new THREE.Vector3());
      m._pv = Math.max(s.x, 1e-9) * Math.max(s.y, 1e-9) * Math.max(s.z, 1e-9);
    } catch (e) {
      m._pc = null;
    }
  });
}
export function pinMax(box) {
  var w = box.clientWidth || 320,
    h = box.clientHeight || 380;
  return Math.max(4, Math.min(10, Math.floor(h / 46), Math.floor(w / 44)));
}
export function pinList(meshes, mode, sel, named, box) {
  if (mode === 'off') return [];
  if (mode === 'sel') return sel && sel._pc ? [sel] : [];
  var ok = meshes.filter(function (m) {
    return m.visible && m._pc && named(m);
  });
  ok.sort(function (a, b) {
    return (b._pv || 0) - (a._pv || 0);
  });
  var n = mode === 'all' ? Math.min(ok.length, 30) : Math.min(ok.length, pinMax(box));
  var out = ok.slice(0, n);
  if (sel && sel._pc && out.indexOf(sel) < 0) out.push(sel);
  return out;
}
export function pinDraw(box, cam, list, sel, label) {
  var L = pinLayer(box),
    ov = L.ov,
    sv = L.sv,
    w = box.clientWidth,
    h = box.clientHeight;
  while (ov.childNodes.length > 1) ov.removeChild(ov.lastChild);
  sv.textContent = '';
  sv.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
  if (!list || !list.length) return 0;
  var v = new THREE.Vector3(),
    pts = [];
  list.forEach(function (m) {
    v.copy(m._pc);
    if (m.matrixWorld) v.applyMatrix4(m.matrixWorld);
    v.project(cam);
    if (!isFinite(v.x) || v.z > 1) return;
    var x = ((v.x + 1) / 2) * w,
      y = ((1 - v.y) / 2) * h;
    if (x < -30 || x > w + 30 || y < -30 || y > h + 30) return;
    pts.push({
      x: x,
      y: y,
      m: m,
      t: label(m),
    });
  });
  if (!pts.length) return 0;
  var lf = [],
    rt = [],
    ns = 'http://www.w3.org/2000/svg';
  pts.forEach(function (p) {
    p.side = p.x < w / 2 ? -1 : 1;
    (p.side < 0 ? lf : rt).push(p);
    var lb = document.createElement('span');
    lb.className = 'pin' + (p.m === sel ? ' on' : '');
    lb.textContent = p.t;
    lb.style.maxWidth = Math.round(w * 0.4) + 'px';
    lb.style.top = '0px';
    if (p.side < 0) lb.style.left = '4px';
    else lb.style.right = '4px';
    ov.appendChild(lb);
    p.lb = lb;
  });
  pts.forEach(function (p) {
    p.h = p.lb.offsetHeight || 18;
    p.w = p.lb.offsetWidth || 60;
  });
  [lf, rt].forEach(function (g) {
    g.sort(function (a, b) {
      return a.y - b.y;
    });
    var top = 4;
    g.forEach(function (p) {
      p.ty = Math.max(top, p.y - p.h / 2);
      top = p.ty + p.h + 5;
    });
    var last = g[g.length - 1],
      over = g.length ? last.ty + last.h - (h - 4) : 0;
    if (over > 0) {
      var bot = h - 4;
      for (var i = g.length - 1; i >= 0; i--) {
        var q = g[i];
        q.ty = Math.min(q.ty, bot - q.h);
        bot = q.ty - 5;
      }
    }
    g.forEach(function (p) {
      if (p.ty < 4) p.ty = 4;
      p.ly = p.ty + p.h / 2;
      p.lb.style.top = p.ty + 'px';
    });
  });
  pts.forEach(function (p) {
    var bw = p.w,
      ax = p.side < 0 ? 4 + bw + 2 : w - 4 - bw - 2,
      ex = ax + p.side * 9;
    var pl = document.createElementNS(ns, 'polyline');
    pl.setAttribute(
      'points',
      ax + ',' + p.ly + ' ' + ex + ',' + p.ly + ' ' + p.x.toFixed(1) + ',' + p.y.toFixed(1),
    );
    pl.setAttribute('class', 'pll' + (p.m === sel ? ' on' : ''));
    sv.appendChild(pl);
    var c = document.createElementNS(ns, 'circle');
    c.setAttribute('cx', p.x.toFixed(1));
    c.setAttribute('cy', p.y.toFixed(1));
    c.setAttribute('r', p.m === sel ? 5.5 : 4.2);
    c.setAttribute('class', 'pdot' + (p.m === sel ? ' on' : ''));
    sv.appendChild(c);
  });
  return pts.length;
}
export const PINMODES = ['top', 'all', 'sel', 'off'];
export const PINTXT = {
  top: 'Rótulos: principales',
  all: 'Rótulos: todos',
  sel: 'Rótulos: solo la elegida',
  off: 'Rótulos: ocultos',
};
export function pinNext(m) {
  return PINMODES[(PINMODES.indexOf(m) + 1) % PINMODES.length];
}

/* ===== Human Atlas · BodyParts3D 4.0 (CC BY 4.0) ===== */
