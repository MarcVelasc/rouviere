export const $ = function (i) {
  return document.getElementById(i);
};
export function el(t, c, x) {
  var e = document.createElement(t);
  if (c) e.className = c;
  if (x != null) e.textContent = x;
  return e;
}
export function pad(n) {
  return ('0' + n).slice(-2);
}
export function nz(t) {
  return String(t)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}
export function shuffle(a) {
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1)),
      t = a[i];
    a[i] = a[j];
    a[j] = t;
  }
  return a;
}
export function fmt(t) {
  var d = new Date(t);
  return d.toLocaleDateString('es') + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
}
export function msg(id, t) {
  var e = $(id);
  if (e) e.textContent = t;
}
export function conf(b, fn, label) {
  if (b.dataset.c) {
    clearTimeout(b._t);
    delete b.dataset.c;
    b.firstChild.textContent = b.dataset.l || label;
    fn();
    return;
  }
  b.dataset.l = b.firstChild.textContent;
  b.dataset.c = '1';
  b.firstChild.textContent = '¿Seguro? Toca otra vez ';
  b._t = setTimeout(function () {
    delete b.dataset.c;
    b.firstChild.textContent = b.dataset.l;
  }, 4000);
}
export function copyTxt(t, mid) {
  function ok() {
    msg(mid, 'Copiado al portapapeles.');
  }
  function bad() {
    msg(mid, 'No se pudo copiar. Selecciona el texto y cópialo manualmente.');
  }
  function fb() {
    try {
      var ta = document.createElement('textarea');
      ta.value = t;
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      var r = document.execCommand('copy');
      document.body.removeChild(ta);
      r ? ok() : bad();
    } catch (e) {
      bad();
    }
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(t).then(ok, fb);
  } else fb();
}
export async function dlFile(name, blob, mid) {
  var d = null;
  try {
    d = window.claude && (await claude.use('downloads'));
  } catch (e) {}
  if (d) {
    try {
      await d.save({
        filename: name,
        data: blob,
      });
      msg(mid, 'Archivo listo: ' + name);
      return;
    } catch (e) {
      if (e && e.code === 'declined') {
        msg(mid, 'Descarga cancelada.');
        return;
      }
    }
  }
  try {
    var u = URL.createObjectURL(blob),
      a = document.createElement('a');
    a.href = u;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      URL.revokeObjectURL(u);
      a.remove();
    }, 500);
    msg(mid, 'Archivo descargado: ' + name);
  } catch (e2) {
    msg(mid, 'No se pudo descargar. Usa Copiar.');
  }
}
/* ===== datos y almacenamiento ===== */
