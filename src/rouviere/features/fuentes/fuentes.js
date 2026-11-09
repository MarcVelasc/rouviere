import { estado } from '../../estado.js';
import { BCAMPOS, BIB, BNOTA, BREGLAS } from '../../core/almacenamiento.js';
import { $, el, msg } from '../../core/dom.js';
import { fueraAsig } from '../embriologia/histologia-embriologia.js';
import { li } from '../modulos/modulos.js';
export function accLabel(a) {
  return a === 'abierto'
    ? 'Acceso abierto · gratuito'
    : a === 'compra'
      ? 'Requiere compra o suscripción'
      : 'Acceso por verificar';
}
export function bibCard(b) {
  var d = el('div', 'bib');
  d.appendChild(el('span', 'tagacc acc-' + b.acc, accLabel(b.acc)));
  d.appendChild(el('h3', 0, b.tit));
  d.appendChild(el('p', 'au', b.aut));
  var dl = document.createElement('dl');
  [
    ['Edición', b.ed],
    ['Año', b.anio],
    ['Editorial', b.edit],
    ['ISBN', b.isbn || 'No registrado'],
    ['Utilidad', b.uti],
  ].forEach(function (r) {
    dl.appendChild(el('dt', 0, r[0]));
    dl.appendChild(el('dd', 0, r[1]));
  });
  d.appendChild(dl);
  if (b.links.length)
    b.links.forEach(function (l) {
      var a = el('a', 'src', l[0]);
      a.href = l[1];
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      d.appendChild(a);
    });
  else d.appendChild(el('p', 'vf', 'Sin enlace verificado en el documento.'));
  d.appendChild(el('p', 'vf', 'Verificación: ' + b.ver));
  if (b.nota) d.appendChild(el('p', 'vf', 'Nota: ' + b.nota));
  d.appendChild(el('p', 'vf', 'Revisión docente: pendiente.'));
  return d;
}
export function bfilt(n) {
  estado.bfil = ['all', 'ana', 'his', 'emb'][n];
  document.querySelectorAll('#btabs .tb').forEach(function (x, j) {
    x.classList.toggle('on', j === n);
  });
  renderBib();
}
export function renderBib() {
  msg('bnota', BNOTA);
  li($('bcampos'), BCAMPOS);
  li($('breglas'), BREGLAS);
  var l = $('bibl');
  l.textContent = '';
  var list = BIB.filter(function (b) {
    /* una fuente que solo sirve a una asignatura fuera del foco no se lista */
    if (
      b.subj.every(function (x) {
        return fueraAsig(x);
      })
    )
      return false;
    return estado.bfil === 'all' || b.subj.indexOf(estado.bfil) >= 0 || b.subj.indexOf('gen') >= 0;
  });
  var cats = [];
  list.forEach(function (b) {
    if (cats.indexOf(b.cat) < 0) cats.push(b.cat);
  });
  cats.forEach(function (c) {
    l.appendChild(el('h2', 'h2s', c));
    list
      .filter(function (b) {
        return b.cat === c;
      })
      .forEach(function (b) {
        l.appendChild(bibCard(b));
      });
  });
}
export function srcFor(sid) {
  return BIB.filter(function (b) {
    return b.subj.indexOf(sid) >= 0 || b.subj.indexOf('gen') >= 0;
  });
}
export function renderGroupSrc(sid) {
  var box = $('mdsrc');
  box.textContent = '';
  srcFor(sid).forEach(function (b) {
    var p = el('p', 'srcmini');
    p.appendChild(
      document.createTextNode(
        b.aut + '. ' + b.tit + '. ' + b.ed + '. ' + b.anio + '. ' + b.edit + '. ',
      ),
    );
    if (b.links.length) {
      var a = el('a', 0, 'Ver fuente');
      a.href = b.links[0][1];
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      p.appendChild(a);
      p.appendChild(document.createTextNode(' · '));
    }
    p.appendChild(el('span', 'tagacc acc-' + b.acc, accLabel(b.acc)));
    box.appendChild(p);
  });
  var a2 = el('a', 'pill', 'Ver todas las fuentes ');
  a2.href = '#fuentes';
  a2.appendChild(el('span', 0, '→'));
  box.appendChild(a2);
}

/* ===== biblioteca académica ===== */
