/* ===== progreso en la nube (Supabase) =====
   La app sigue guardando todo en localStorage, como siempre. Este módulo solo copia ese
   progreso a la tabla «progreso» de Supabase (una fila por estudiante, ver
   supabase/esquema.sql) y lo trae de vuelta en otro dispositivo:

   - Al abrir la app: si la copia de la nube es más nueva que la del teléfono, la pone en el
     teléfono y recarga una vez. Si la del teléfono es más nueva, la sube.
   - Cada vez que cambia una clave de progreso, la sube unos segundos después (y al salir).
   - Si en el teléfono había progreso de otra cuenta, se borra antes de traer el de esta.

   Solo funciona con cuentas reales (provider 'password') y cuando la versión publicada usa
   Supabase (.env.production). Con «Probar sin cuenta» todo queda en el dispositivo. */
import { supabase, supabaseActivo } from '../../services/supabase/client';
import { usuarioSesion } from './sesion.js';

const CLAVES = [
  'rv_s',
  'rv_ex',
  'rv_names',
  'rv_lib',
  'rv_lib_t',
  'rv_snc',
  'rv_sim_best',
  'rv_comp',
];
const T = 'rv_nube_t'; // cuándo cambió el progreso del teléfono (ms)
const UID = 'rv_nube_uid'; // de qué cuenta es el progreso del teléfono
const ESPERA = 4000;

var setOrig = null,
  removeOrig = null,
  uid = null,
  timer = 0,
  subiendo = false,
  pendiente = false,
  /* Mientras se trae la copia de la nube, los cambios del arranque no cuentan como «más
     nuevos»: si no, el arranque pisaría el progreso de la nube con el del teléfono. */
  listo = false,
  tInicial = 0,
  cambioDurante = false;

/* «sin-cuenta» · «cargando» · «guardando» · «guardado» · «sin-conexion» */
var estadoActual = 'sin-cuenta';
export function estadoNube() {
  return estadoActual;
}
function avisar(e) {
  estadoActual = e;
  try {
    window.dispatchEvent(new CustomEvent('rv-nube', { detail: e }));
  } catch (x) {}
}

function poner(k, v) {
  (setOrig || localStorage.setItem).call(localStorage, k, v);
}
function quitar(k) {
  (removeOrig || localStorage.removeItem).call(localStorage, k);
}
function leerT() {
  return Number(localStorage.getItem(T)) || 0;
}

/* Copia de las claves de progreso, tal cual están guardadas (texto). */
function datosLocales() {
  var d = {},
    hay = false;
  CLAVES.forEach(function (k) {
    var v = localStorage.getItem(k);
    if (v != null) {
      d[k] = v;
      hay = true;
    }
  });
  return hay ? d : null;
}

/* Escucha los cambios de progreso sin tocar el resto de la app. */
function vigilar() {
  if (setOrig) return;
  setOrig = localStorage.setItem;
  removeOrig = localStorage.removeItem;
  var marcar = function (k) {
    if (CLAVES.indexOf(k) < 0) return;
    if (!listo) {
      cambioDurante = true;
      return;
    }
    setOrig.call(localStorage, T, String(Date.now()));
    programar();
  };
  localStorage.setItem = function (k, v) {
    setOrig.call(localStorage, k, v);
    marcar(k);
  };
  localStorage.removeItem = function (k) {
    removeOrig.call(localStorage, k);
    marcar(k);
  };
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden' && timer) {
      clearTimeout(timer);
      timer = 0;
      subir();
    }
  });
  window.addEventListener('online', function () {
    if (estadoActual === 'sin-conexion') subir();
  });
}

function programar() {
  if (!uid) return;
  avisar('guardando');
  clearTimeout(timer);
  timer = setTimeout(function () {
    timer = 0;
    subir();
  }, ESPERA);
}

export async function subir() {
  if (!uid) return;
  if (subiendo) {
    pendiente = true;
    return;
  }
  subiendo = true;
  var ahora = new Date();
  try {
    var r = await supabase()
      .from('progreso')
      .upsert({ user_id: uid, datos: datosLocales() || {}, actualizado: ahora.toISOString() });
    if (r.error) throw r.error;
    poner(T, String(ahora.getTime()));
    avisar('guardado');
  } catch (e) {
    avisar('sin-conexion');
  }
  subiendo = false;
  if (pendiente) {
    pendiente = false;
    subir();
  }
}

async function traer() {
  avisar('cargando');
  var ses = await supabase().auth.getSession();
  var s = ses.data && ses.data.session;
  if (!s) {
    avisar('sin-conexion');
    return;
  }
  uid = s.user.id;
  // Progreso de otra cuenta en este teléfono: no se mezcla con el de esta.
  var dueño = localStorage.getItem(UID);
  if (dueño && dueño !== uid) {
    CLAVES.concat([T]).forEach(quitar);
    tInicial = 0;
  }
  var r = await supabase()
    .from('progreso')
    .select('datos, actualizado')
    .eq('user_id', uid)
    .maybeSingle();
  if (r.error) throw r.error;
  poner(UID, uid);
  var fila = r.data,
    tNube = fila ? Date.parse(fila.actualizado) || 0 : 0;
  if (fila && tNube > tInicial) {
    var antes = JSON.stringify(datosLocales());
    CLAVES.forEach(quitar);
    var d = fila.datos || {};
    CLAVES.forEach(function (k) {
      if (typeof d[k] === 'string') poner(k, d[k]);
    });
    poner(T, String(tNube));
    listo = true;
    avisar('guardado');
    // La app ya leyó el progreso viejo al arrancar: se recarga una vez para mostrar el nuevo.
    if (JSON.stringify(datosLocales()) !== antes) location.reload();
    return;
  }
  listo = true;
  // La nube no tiene nada o tiene algo más viejo: se sube lo del teléfono.
  if (datosLocales() && (!fila || tInicial > tNube || cambioDurante)) {
    poner(T, String(Date.now()));
    await subir();
  } else avisar('guardado');
}

/* Se llama una vez al abrir la app, antes de boot(). No bloquea el arranque. */
export function iniciarNube() {
  var u = usuarioSesion();
  if (!supabaseActivo || !u || u.provider !== 'password') {
    avisar('sin-cuenta');
    return;
  }
  tInicial = leerT();
  vigilar();
  traer().catch(function () {
    listo = true;
    avisar('sin-conexion');
  });
}
