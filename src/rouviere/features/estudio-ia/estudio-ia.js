import { estado } from '../../estado.js';
import { W, log, mn } from '../../core/almacenamiento.js';
import { $, copyTxt, dlFile, el, msg, nz, shuffle } from '../../core/dom.js';
/* ===== estudio con IA ===== */
export const SYS =
  'Eres tutor de anatomía para estudiantes de primer año de Medicina. Usa SOLO la información del texto dado; no inventes datos ni agregues contenido médico externo. Responde en español.\n\nTEXTO:\n';
export const STOP = [
  'para',
  'como',
  'pero',
  'donde',
  'cuando',
  'porque',
  'entre',
  'sobre',
  'desde',
  'hasta',
  'esta',
  'este',
  'estos',
  'estas',
  'tiene',
  'tienen',
  'puede',
  'pueden',
  'también',
  'cada',
  'otro',
  'otra',
  'sino',
  'aunque',
  'mientras',
  'durante',
  'través',
  'según',
  'cuya',
  'cuyo',
  'esto',
  'aquel',
  'aquella',
  'están',
  'estar',
  'siendo',
  'hacia',
  'parte',
  'partes',
  'además',
  'donde',
  'cual',
  'cuales',
  'forma',
  'formas',
  'tipo',
  'tipos',
  'otros',
  'otras',
  'algunos',
  'algunas',
  'muchos',
  'muchas',
];
export function stat(t) {
  msg('aist', t);
}
export function aiLen() {
  var e = $('ailen');
  return e ? e.value : 'media';
}
export const AILEN = {
  breve: 3,
  media: 6,
  extensa: 12,
};
export function busy(b) {
  document.querySelectorAll('#aibtns button').forEach(function (x) {
    x.disabled = b;
  });
}
export function sents(t) {
  return (t.replace(/\s+/g, ' ').match(/[^.!?]+[.!?]?/g) || [])
    .map(function (x) {
      return x.trim();
    })
    .filter(function (x) {
      return x.split(' ').length >= 5;
    });
}
export function kws(t) {
  var f = {};
  (t.toLowerCase().match(/[a-záéíóúñü]{5,}/g) || []).forEach(function (w) {
    if (STOP.indexOf(w) < 0) f[w] = (f[w] || 0) + 1;
  });
  return f;
}
export function topSents(t, n) {
  var f = kws(t),
    ss = sents(t);
  return ss
    .map(function (s, i) {
      var ws = s.toLowerCase().match(/[a-záéíóúñü]{5,}/g) || [],
        sc =
          ws.reduce(function (a, w) {
            return a + (f[w] || 0);
          }, 0) / Math.max(ws.length, 1);
      return {
        s: s,
        i: i,
        sc: sc,
      };
    })
    .sort(function (a, b) {
      return b.sc - a.sc;
    })
    .slice(0, n)
    .sort(function (a, b) {
      return a.i - b.i;
    })
    .map(function (x) {
      return x.s;
    });
}
export function cloze(s) {
  var ws = (s.match(/[A-Za-záéíóúñüÁÉÍÓÚÑ]{6,}/g) || []).filter(function (w) {
    return STOP.indexOf(w.toLowerCase()) < 0;
  });
  if (!ws.length) return null;
  ws.sort(function (a, b) {
    return b.length - a.length;
  });
  var w = ws[0];
  return {
    w: w,
    q: s.replace(w, '_____'),
  };
}
export function localGen(k, t) {
  var out;
  if (k === 'res') {
    out = topSents(t, AILEN[aiLen()] || 6)
      .map(function (s) {
        return '• ' + s;
      })
      .join('\n');
    if (!out) throw 0;
    showGen('res', out, 'local');
  } else if (k === 'tar') {
    var cs = [];
    t.split(/\n/).forEach(function (l) {
      var m = l.match(/^\s*[-•*]?\s*([^:–—]{2,60}?)\s*[:–—]\s+(.{8,})$/);
      if (m)
        cs.push({
          q: 'Define: ' + m[1].trim(),
          a: m[2].trim(),
          h: '',
        });
    });
    if (!cs.length)
      topSents(t, 6).forEach(function (s) {
        var c = cloze(s);
        if (c)
          cs.push({
            q: c.q,
            a: c.w,
            h: '',
          });
      });
    if (!cs.length) throw 0;
    showGen('tar', cs.slice(0, 12), 'local');
  } else if (k === 'pre') {
    var f = kws(t),
      all = Object.keys(f).filter(function (w) {
        return w.length >= 6;
      }),
      qs = [];
    if (all.length >= 4)
      topSents(t, 8).forEach(function (s) {
        if (qs.length >= 5) return;
        var c = cloze(s);
        if (!c) return;
        var w = c.w.toLowerCase(),
          ds = shuffle(
            all.filter(function (x) {
              return x !== w;
            }),
          ).slice(0, 3);
        if (ds.length < 3) return;
        var o = shuffle([w].concat(ds));
        qs.push({
          q: 'Completa: ' + c.q,
          o: o,
          a: o.indexOf(w),
          e: 'La oración original dice: ' + s,
        });
      });
    if (!qs.length) throw 0;
    showGen('pre', qs, 'local');
  } else if (k === 'tem') {
    var f2 = kws(t),
      ks = Object.keys(f2)
        .sort(function (a, b) {
          return f2[b] - f2[a];
        })
        .slice(0, 8),
      ss = sents(t),
      tm = ks.map(function (w) {
        var s = ss.filter(function (x) {
          return x.toLowerCase().indexOf(w) >= 0;
        })[0];
        return {
          tema: w,
          puntos: s ? [s] : [],
        };
      });
    if (!tm.length) throw 0;
    showGen('tem', tm, 'local');
  } else if (k === 'esq') {
    var es = esquema(t);
    if (!es.length) throw 0;
    showGen('esq', es, 'local');
  } else if (k === 'glo') {
    var gl = glosario(t);
    if (!gl.length) throw 0;
    showGen('glo', gl, 'local');
  } else if (k === 'con') {
    var co = conceptos(t);
    if (!co.length) throw 0;
    showGen('con', co, 'local');
  } else if (k === 'gui') {
    var gu = guia(t);
    if (!gu.res.length) throw 0;
    showGen('gui', gu, 'local');
  } else {
    var ln =
        t.split(/\n/).filter(function (x) {
          return x.trim();
        })[0] || 'Apunte',
      ti = ln.split(/\s+/).slice(0, 6).join(' '),
      pu = topSents(t, 4).map(function (s) {
        return s.split(/\s+/).slice(0, 12).join(' ');
      });
    if (!pu.length) throw 0;
    showGen(
      'afi',
      {
        titulo: ti,
        puntos: pu,
        frase: 'Repasa, practica, corrige.',
      },
      'local',
    );
  }
}

/* Herramientas locales nuevas. Todo sale del texto del estudiante: no se añade
   información de fuera, y lo que se destaca se marca como procedente del apunte. */
export function esquema(t) {
  var ls = t.replace(/\r/g, '').split('\n'),
    out = [],
    act = null;
  ls.forEach(function (l) {
    var x = l.trim();
    if (!x) return;
    var tit =
      /^#{1,6}\s+/.test(x) ||
      /^[0-9]+[.)]\s+/.test(x) ||
      (x.length < 70 && !/[.;]$/.test(x) && x.split(' ').length <= 9);
    var vin = /^\s*[-•*]\s+/.test(l);
    if (vin && act) {
      act.p.push(x.replace(/^\s*[-•*]\s+/, ''));
      return;
    }
    if (tit) {
      act = {
        t: x.replace(/^#{1,6}\s+/, '').replace(/^[0-9]+[.)]\s+/, ''),
        p: [],
      };
      out.push(act);
    } else if (act) act.p.push(x);
    else {
      act = {
        t: 'Ideas sueltas',
        p: [x],
      };
      out.push(act);
    }
  });
  if (out.length < 2) {
    /* sin títulos: se agrupa por los términos más repetidos */
    var f = kws(t),
      ks = Object.keys(f)
        .sort(function (a, b) {
          return f[b] - f[a];
        })
        .slice(0, 6),
      ss = sents(t);
    out = ks
      .map(function (w) {
        return {
          t: w.charAt(0).toUpperCase() + w.slice(1),
          p: ss
            .filter(function (x) {
              return x.toLowerCase().indexOf(w) >= 0;
            })
            .slice(0, 3),
        };
      })
      .filter(function (x) {
        return x.p.length;
      });
  }
  out.forEach(function (x) {
    x.p = x.p.slice(0, 6);
  });
  return out.slice(0, 12);
}
export function glosario(t) {
  var g = [],
    vis = {};
  t.replace(/\r/g, '')
    .split('\n')
    .forEach(function (l) {
      var m = l.match(/^\s*[-•*]?\s*([^:–—]{3,60}?)\s*[:–—]\s+(.{10,})$/);
      if (m && !vis[nz(m[1])]) {
        vis[nz(m[1])] = 1;
        g.push({
          t: m[1].trim(),
          d: m[2].trim(),
        });
      }
    });
  if (g.length < 4) {
    var f = kws(t),
      ss = sents(t);
    Object.keys(f)
      .sort(function (a, b) {
        return f[b] - f[a];
      })
      .slice(0, 14)
      .forEach(function (w) {
        if (vis[w] || g.length >= 14) return;
        var s0 = ss.filter(function (x) {
          return x.toLowerCase().indexOf(w) >= 0;
        })[0];
        if (s0) {
          vis[w] = 1;
          g.push({
            t: w.charAt(0).toUpperCase() + w.slice(1),
            d: s0,
          });
        }
      });
  }
  return g.slice(0, 16);
}
export function conceptos(t) {
  var f = kws(t),
    ss = sents(t),
    tot = 0;
  Object.keys(f).forEach(function (w) {
    tot += f[w];
  });
  return Object.keys(f)
    .sort(function (a, b) {
      return f[b] - f[a];
    })
    .slice(0, 10)
    .map(function (w) {
      return {
        t: w,
        n: f[w],
        s:
          ss.filter(function (x) {
            return x.toLowerCase().indexOf(w) >= 0;
          })[0] || '',
      };
    });
}
export function guia(t) {
  return {
    res: topSents(t, AILEN[aiLen()] || 6),
    con: conceptos(t).slice(0, 6),
    glo: glosario(t).slice(0, 6),
    pre: (function () {
      var out = [];
      topSents(t, 8).forEach(function (s) {
        var c = cloze(s);
        if (c && out.length < 6) out.push(c.q);
      });
      return out;
    })(),
  };
}
export function normC(d) {
  if (!Array.isArray(d)) throw 0;
  var r = d
    .filter(function (x) {
      return x && typeof x.q === 'string' && typeof x.a === 'string' && x.q && x.a;
    })
    .map(function (x) {
      return {
        q: x.q.slice(0, 300),
        a: x.a.slice(0, 500),
        h: typeof x.h === 'string' ? x.h : '',
      };
    });
  if (!r.length) throw 0;
  return r;
}
export function normQ(d) {
  if (!Array.isArray(d)) throw 0;
  var r = d
    .filter(function (x) {
      return (
        x &&
        typeof x.q === 'string' &&
        Array.isArray(x.options) &&
        x.options.length >= 2 &&
        Number.isInteger(x.answer) &&
        x.answer >= 0 &&
        x.answer < x.options.length
      );
    })
    .map(function (x) {
      return {
        q: x.q.slice(0, 300),
        o: x.options.map(String),
        a: x.answer,
        e: typeof x.explain === 'string' ? x.explain : '',
      };
    });
  if (!r.length) throw 0;
  return r;
}
export async function aiRun(k, t, s) {
  var q = SYS + t.slice(0, 12000) + '\n\n';
  if (k === 'res') {
    var a = await s(
      q +
        'TAREA: resumen en viñetas para repasar, extensión ' +
        aiLen() +
        ' (breve≈3 ideas, media≈6, extensa≈12). Solo con lo que diga el texto.',
      {
        onText: function (x) {
          $('out').textContent = x.text;
        },
      },
    );
    showGen('res', a.text, 'IA');
  } else if (k === 'pre')
    showGen(
      'pre',
      normQ(
        await s.json(
          q +
            'TAREA: crea 5 preguntas de opción múltiple. Responde solo JSON: [{"q":"","options":["","","",""],"answer":0,"explain":""}] donde answer es el índice correcto.',
        ),
      ),
      'IA',
    );
  else if (k === 'tar')
    showGen(
      'tar',
      normC(
        await s.json(
          q +
            'TAREA: crea hasta 8 tarjetas de estudio. Responde solo JSON: [{"q":"pregunta","a":"respuesta breve","h":"pista corta"}]',
        ),
      ),
      'IA',
    );
  else if (k === 'tem') {
    var d = await s.json(
      q +
        'TAREA: organiza el contenido por temas. Responde solo JSON: [{"tema":"","puntos":["",""]}]',
    );
    if (!Array.isArray(d) || !d.length) throw 0;
    showGen(
      'tem',
      d.map(function (x) {
        return {
          tema: String(x.tema || ''),
          puntos: (x.puntos || []).map(String),
        };
      }),
      'IA',
    );
  } else if (k === 'esq' || k === 'glo' || k === 'con' || k === 'gui') {
    localGen(k, t);
  } else {
    var p = await s.json(
      q +
        'TAREA: crea un afiche de estudio. Responde solo JSON: {"titulo":"máx 6 palabras","puntos":["máx 5 puntos de máx 12 palabras"],"frase":"frase corta para recordar"}',
    );
    if (!p || !p.titulo || !Array.isArray(p.puntos)) throw 0;
    showGen(
      'afi',
      {
        titulo: String(p.titulo),
        puntos: p.puntos.map(String),
        frase: String(p.frase || ''),
      },
      'IA',
    );
  }
}
export async function ai(k) {
  var t = $('src').value.trim();
  if (t.length < 30) {
    stat('Escribe o sube un apunte de al menos 30 caracteres.');
    return;
  }
  busy(true);
  $('aoutbox').style.display = '';
  $('out').textContent = 'Generando…';
  stat('Generando…');
  var pre = '',
    s = null;
  try {
    s = window.claude && (await claude.use('sample'));
  } catch (e) {}
  if (s) {
    try {
      await aiRun(k, t, s);
      stat('Listo. Generado con IA a partir de tu texto.');
      busy(false);
      return;
    } catch (e) {
      if (e && e.code === 'rate_limited') {
        stat('Demasiadas solicitudes. Espera un momento e intenta de nuevo.');
        busy(false);
        return;
      }
      pre = 'La IA no respondió' + (e && e.code ? ' (' + e.code + ')' : '') + '. ';
    }
  } else pre = 'IA no disponible en esta vista. ';
  try {
    localGen(k, t);
    stat(pre + 'Se usó el modo local (sin IA): es un procesamiento sencillo del texto.');
  } catch (e) {
    $('out').textContent = '';
    stat(
      pre +
        'No se pudo generar algo útil con ese texto. Prueba con un texto más largo o con definiciones del tipo «Término: definición».',
    );
  }
  busy(false);
}
export function toText(g) {
  var k = g.kind,
    d = g.data;
  if (k === 'res') return d;
  if (k === 'esq')
    return d
      .map(function (x) {
        return (
          x.t +
          '\n' +
          x.p
            .map(function (p) {
              return '  - ' + p;
            })
            .join('\n')
        );
      })
      .join('\n\n');
  if (k === 'glo')
    return d
      .map(function (x) {
        return x.t + ': ' + x.d;
      })
      .join('\n');
  if (k === 'con')
    return d
      .map(function (x) {
        return x.t + ' (' + x.n + '): ' + x.s;
      })
      .join('\n');
  if (k === 'gui')
    return (
      'LO ESENCIAL\n' +
      d.res
        .map(function (x) {
          return '- ' + x;
        })
        .join('\n') +
      '\n\nCONCEPTOS CLAVE\n' +
      d.con
        .map(function (x) {
          return x.t;
        })
        .join(', ') +
      '\n\nTÉRMINOS\n' +
      d.glo
        .map(function (x) {
          return x.t + ': ' + x.d;
        })
        .join('\n') +
      '\n\nPARA AUTOEVALUARTE\n' +
      d.pre
        .map(function (x) {
          return '- ' + x;
        })
        .join('\n')
    );
  if (k === 'pre')
    return d
      .map(function (q, i) {
        return (
          i +
          1 +
          '. ' +
          q.q +
          '\n' +
          q.o
            .map(function (o, j) {
              return '   ' + String.fromCharCode(97 + j) + ') ' + o;
            })
            .join('\n') +
          '\n   Respuesta: ' +
          String.fromCharCode(97 + q.a) +
          (q.e ? '\n   ' + q.e : '')
        );
      })
      .join('\n\n');
  if (k === 'tar')
    return d
      .map(function (c) {
        return 'P: ' + c.q + '\nR: ' + c.a + (c.h ? '\nPista: ' + c.h : '');
      })
      .join('\n\n');
  if (k === 'tem')
    return d
      .map(function (x) {
        return (
          x.tema +
          '\n' +
          x.puntos
            .map(function (p) {
              return '  - ' + p;
            })
            .join('\n')
        );
      })
      .join('\n\n');
  return (
    d.titulo +
    '\n' +
    d.puntos
      .map(function (p) {
        return '- ' + p;
      })
      .join('\n') +
    '\n' +
    d.frase
  );
}
export function showGen(k, d, src) {
  estado.GEN = {
    kind: k,
    data: d,
    src: src,
  };
  var o = $('out');
  o.textContent = '';
  $('aoutbox').style.display = '';
  msg('abadge', src === 'IA' ? 'Generado por IA' : 'Modo local (sin IA)');
  $('asvc').style.display = k === 'tar' ? '' : 'none';
  $('asvq').style.display = k === 'pre' ? '' : 'none';
  $('aimod').style.display = k === 'tar' || k === 'pre' ? '' : 'none';
  msg('aam', '');
  if (k === 'res') {
    o.appendChild(el('p', 'gtx', d));
  } else if (k === 'pre') {
    d.forEach(function (q, n) {
      var b = el('div', 'box');
      b.appendChild(el('b', 0, n + 1 + '. ' + q.q));
      var ex = el('p', 's');
      q.o.forEach(function (t, j) {
        var bt = el('button', 'opt', t);
        bt.type = 'button';
        bt.onclick = function () {
          bt.className = 'opt ' + (j === q.a ? 'ok' : 'no');
          ex.textContent = q.e || '';
        };
        b.appendChild(bt);
      });
      b.appendChild(ex);
      o.appendChild(b);
    });
  } else if (k === 'tar') {
    d.forEach(function (c) {
      var b = el('div', 'box');
      b.appendChild(el('b', 0, c.q));
      b.appendChild(el('p', 's', 'Respuesta: ' + c.a));
      o.appendChild(b);
    });
  } else if (k === 'tem') {
    d.forEach(function (x) {
      var b = el('div', 'box');
      b.appendChild(el('b', 0, x.tema));
      x.puntos.forEach(function (p) {
        b.appendChild(el('p', 's', '• ' + p));
      });
      o.appendChild(b);
    });
  } else if (k === 'esq') {
    d.forEach(function (x) {
      var b = el('div', 'box');
      b.appendChild(el('b', 0, x.t));
      var u = el('ul', 'vl');
      x.p.forEach(function (p) {
        u.appendChild(el('li', 0, p));
      });
      b.appendChild(u);
      o.appendChild(b);
    });
  } else if (k === 'glo') {
    var tb = el('div', 'box');
    tb.appendChild(el('b', 0, 'Glosario del apunte'));
    d.forEach(function (x) {
      var r = el('div', 'item');
      r.appendChild(el('b', 0, x.t));
      r.appendChild(el('small', 0, x.d));
      tb.appendChild(r);
    });
    tb.appendChild(
      el('p', 's mini', 'Las definiciones están copiadas de tu texto; no se añadió nada de fuera.'),
    );
    o.appendChild(tb);
  } else if (k === 'con') {
    var cb = el('div', 'box');
    cb.appendChild(el('b', 0, 'Conceptos que más pesan en tu apunte'));
    d.forEach(function (x) {
      var r = el('div', 'item');
      r.appendChild(el('b', 0, x.t + ' (' + x.n + ')'));
      r.appendChild(el('small', 0, x.s));
      cb.appendChild(r);
    });
    cb.appendChild(el('p', 's mini', 'Ordenados por las veces que aparecen en tu texto.'));
    o.appendChild(cb);
  } else if (k === 'gui') {
    var gb = el('div', 'box');
    gb.appendChild(el('h2', 0, 'Guía de repaso'));
    gb.appendChild(el('b', 0, 'Lo esencial'));
    var u1 = el('ul', 'vl');
    d.res.forEach(function (x) {
      u1.appendChild(el('li', 0, x));
    });
    gb.appendChild(u1);
    gb.appendChild(el('b', 0, 'Conceptos clave'));
    gb.appendChild(
      el(
        'p',
        's',
        d.con
          .map(function (x) {
            return x.t;
          })
          .join(' · '),
      ),
    );
    if (d.glo.length) {
      gb.appendChild(el('b', 0, 'Términos'));
      d.glo.forEach(function (x) {
        var r = el('div', 'item');
        r.appendChild(el('b', 0, x.t));
        r.appendChild(el('small', 0, x.d));
        gb.appendChild(r);
      });
    }
    if (d.pre.length) {
      gb.appendChild(el('b', 0, 'Para autoevaluarte'));
      var u2 = el('ul', 'vl');
      d.pre.forEach(function (x) {
        u2.appendChild(el('li', 0, x));
      });
      gb.appendChild(u2);
    }
    o.appendChild(gb);
  } else {
    var p = el('div', 'post');
    p.appendChild(el('h2', 0, d.titulo));
    var u = el('ul');
    d.puntos.forEach(function (x) {
      u.appendChild(el('li', 0, x));
    });
    p.appendChild(u);
    p.appendChild(el('div', 'fr', d.frase));
    o.appendChild(p);
    var bt = el('button', 'pill gold', 'Descargar afiche (PNG)');
    bt.type = 'button';
    bt.onclick = function () {
      dlp(d);
    };
    o.appendChild(bt);
  }
}
export function saveCards() {
  if (!estado.GEN || estado.GEN.kind !== 'tar') return;
  var m = $('aimod').value;
  estado.GEN.data.forEach(function (c, i) {
    estado.S.cards.push({
      id: 'u' + Date.now() + i,
      m: m,
      t: 'Desde mis apuntes',
      d: 2,
      e: '',
      k: [],
      q: c.q,
      a: c.a,
      h: c.h ? [c.h] : [],
      u: true,
    });
  });
  W();
  log('Tarjetas guardadas desde Estudio: ' + estado.GEN.data.length);
  msg(
    'aam',
    'Se guardaron ' +
      estado.GEN.data.length +
      ' tarjetas en «' +
      mn(m) +
      '». Búscalas en Tarjetas.',
  );
}
export function saveQs() {
  if (!estado.GEN || estado.GEN.kind !== 'pre') return;
  var m = $('aimod').value;
  estado.GEN.data.forEach(function (q, i) {
    estado.S.bank.push({
      id: 'u' + Date.now() + i,
      m: m,
      t: 'Mis preguntas',
      d: 2,
      q: q.q,
      o: q.o,
      a: q.a,
      e: q.e,
    });
  });
  W();
  log('Preguntas guardadas desde Estudio: ' + estado.GEN.data.length);
  msg(
    'aam',
    'Se guardaron ' +
      estado.GEN.data.length +
      ' preguntas en tu banco. Úsalas en Simulacros (fuente «Mi banco»).',
  );
}
export function aCopy() {
  if (estado.GEN) copyTxt(toText(estado.GEN), 'aam');
}
export function aDl() {
  if (estado.GEN)
    dlFile(
      'rouviere-' + estado.GEN.kind + '.txt',
      new Blob([toText(estado.GEN)], {
        type: 'text/plain',
      }),
      'aam',
    );
}
export function wr(x, t, f, px, py, mw, lh) {
  x.font = f;
  var l = '';
  t.split(' ').forEach(function (s) {
    var tt = l ? l + ' ' + s : s;
    if (x.measureText(tt).width > mw && l) {
      x.fillText(l, px, py);
      py += lh;
      l = s;
    } else l = tt;
  });
  x.fillText(l, px, py);
  return py;
}
export function dlp(p) {
  var c = document.createElement('canvas');
  c.width = 1080;
  c.height = 1350;
  var x = c.getContext('2d'),
    g = x.createLinearGradient(0, 0, 1080, 1350);
  g.addColorStop(0, '#0A3A52');
  g.addColorStop(1, '#167A6D');
  x.fillStyle = g;
  x.fillRect(0, 0, 1080, 1350);
  x.fillStyle = '#D9A441';
  x.font = '600 36px sans-serif';
  x.fillText('ROUVIÈRE', 80, 110);
  x.fillStyle = '#fff';
  var y = wr(x, p.titulo, '600 84px Georgia', 80, 260, 920, 92);
  p.puntos.forEach(function (t) {
    y = wr(x, '• ' + t, '500 40px sans-serif', 80, y + 70, 920, 52);
  });
  x.fillStyle = '#D9A441';
  wr(x, p.frase, 'italic 44px Georgia', 80, 1230, 920, 52);
  c.toBlob(function (b) {
    if (b) dlFile('afiche-rouviere.png', b, 'aam');
    else msg('aam', 'No se pudo crear la imagen.');
  });
}
export function onUpl(f) {
  if (!f) return;
  if (f.size > 1048576) {
    stat('El archivo supera 1 MB.');
    return;
  }
  if (!/\.(txt|md|csv)$/i.test(f.name) && f.type.indexOf('text') !== 0) {
    stat('Formato no compatible. Usa .txt, .md o .csv.');
    return;
  }
  var rd = new FileReader();
  rd.onerror = function () {
    stat('No se pudo leer el archivo.');
  };
  rd.onload = function () {
    $('src').value = String(rd.result).slice(0, 20000);
    cnt();
    stat('Archivo cargado: ' + f.name);
  };
  rd.readAsText(f);
}
export function cnt() {
  msg('scnt', $('src').value.length.toLocaleString('es') + ' de 120.000 caracteres');
}
/* ===== documentos del estudiante ===== */
/* Lee de verdad el contenido de los archivos. DOCX y PPTX se abren aquí mismo
   (son archivos zip con XML dentro) usando DecompressionStream, que trae el propio
   navegador. El PDF necesita pdf.js y las imágenes necesitan OCR: ambos se descargan
   de un CDN solo cuando hace falta, y si no están disponibles se dice claramente. */
