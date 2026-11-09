import { NM_BLA, NM_BRAIN, NM_EYE, NM_UTE, geoName } from '../../core/almacenamiento.js';
export /* ===== nombres anatómicos en español y color ===== */
function esName(raw, mid) {
  var n = String(raw || '');
  if (/^Cuerpo[ _]\d+$/.test(n)) {
    if (mid) {
      var g = geoName(mid, n.replace(/_/g, ' '));
      if (g) return g;
    }
    return null;
  }
  var lado = '';
  var m = n.match(/_(L|R)$/);
  if (m) {
    lado = m[1] === 'L' ? ' (izquierdo)' : ' (derecho)';
    n = n.replace(/_(L|R)$/, '');
  }
  if (n.indexOf('VH_M_') === 0 || n.indexOf('VH_F_') === 0) {
    var k = n.slice(5);
    var d = n.indexOf('VH_F_') === 0 ? NM_UTE : null;
    if (NM_EYE[k]) return NM_EYE[k] + lado;
    if (NM_UTE[k]) return NM_UTE[k] + lado;
    if (NM_BLA[k]) return NM_BLA[k] + lado;
    for (var j = 0; j < NM_BRAIN.length; j++) {
      if (n === NM_BRAIN[j][0]) return NM_BRAIN[j][1] + lado;
    }
    return null;
  }
  if (n.indexOf('Allen_') === 0) {
    var q = n.slice(6);
    for (var i = 0; i < NM_BRAIN.length; i++) {
      if (q === NM_BRAIN[i][0]) return NM_BRAIN[i][1] + lado;
    }
    return null;
  }
  return null;
}
export function labelFor(mesh, i) {
  var es = esName(mesh.name);
  if (es) return es;
  if (/^Cuerpo[ _]\d+$/.test(mesh.name))
    return 'Estructura sin nombre nº ' + mesh.name.replace(/^Cuerpo[ _]/, '');
  return 'Estructura pendiente de identificación (' + mesh.name + ')';
}
export const PAL = [
  0xe8a598, 0xc9d6a3, 0x9bbbd4, 0xe0c38a, 0xb8a3c9, 0x8fc9b6, 0xd9a441, 0x7fa8c9, 0xcba0a0,
  0xa3c4bc, 0xd4b483, 0x9db4c0, 0xc2a878, 0xafc8a8, 0xbfa6b8, 0x8db9a4, 0xd2b59b, 0x96aec4,
  0xc6b5a0, 0xa8bda0,
];
export function applyColors(meshes, mode) {
  meshes.forEach(function (m, i) {
    if (!m.material) return;
    if (mode === 'pal' && meshes.length === 1) {
      if (m._oc === undefined && m.material.color) m._oc = m.material.color.getHex();
      if (m.material.color) m.material.color.setHex(0xd9a98a);
      return;
    }
    if (mode === 'orig') {
      if (m._oc !== undefined && m.material.color) m.material.color.setHex(m._oc);
    } else {
      if (m._oc === undefined && m.material.color) m._oc = m.material.color.getHex();
      if (m.material.color) m.material.color.setHex(PAL[i % PAL.length]);
    }
  });
}
/* ===== atlas 3D por sistemas ===== */
