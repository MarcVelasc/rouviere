# Arquitectura

Rouviere se publica como **una PWA con dos páginas**:

| Página          | Entrada          | Código          | Qué es                                          |
| --------------- | ---------------- | --------------- | ----------------------------------------------- |
| Acceso          | `index.html`     | `src/` (React)  | Inicio, crear cuenta, cerrar sesión             |
| App de Rouviere | `app/index.html` | `src/rouviere/` | Atlas 3D, tarjetas, simulacros, ruta, Rou, etc. |

Al entrar se pasa a `app/`. Si alguien abre `app/` sin sesión, vuelve a `#/inicio`.
`#/salir` cierra la sesión.

## Estructura

```
rouviere/
  index.html                 página de acceso
  app/index.html             página de la app: solo el marcado HTML original
  src/
    app/, features/auth/,    ACCESO en React + TypeScript (ver más abajo)
    shared/, services/
    assets/rou/              Rou: ilustración sin fondo y sus capas (huesos, músculos, nervios)
    rouviere/                APP DE ROUVIERE en JavaScript con módulos ES
      main.js                entrada: fuentes, estilos y boot()
      boot.js                arranque: inicializa el estado y engancha eventos (mismo orden que el original)
      estado.js              estado compartido, en un solo objeto `estado`
      core/
        dom.js               utilidades ($, el, msg, nz, shuffle…)
        almacenamiento.js    progreso del estudiante en localStorage (clave rv_s) y constantes
        navegacion.js        rutas por # (route) y menú
      features/<sección>/    una carpeta por sección de la app
      data/*.json            contenido: tarjetas, preguntas, ruta, biblioteca, nombres anatómicos…
      estilos/               CSS dividido por sección; index.css los importa en el orden original
      test/                  tests (Vitest)
  public/app/                archivos que se sirven tal cual
    img/                     imágenes
    *.glb, atlas/*.bin       modelos 3D (binarios)
    atlas/atlas-index.json   índice del atlas BodyParts3D
    est.js                   fichas de estructura (se carga cuando hace falta)
    vendor/three/            three.js r128 (el 3D funciona sin internet)
```

## Mapa de secciones

Para cambiar una pantalla, este es el archivo:

| Pantalla (`#ruta`)  | Archivos principales                                                                            | Función que la dibuja      |
| ------------------- | ----------------------------------------------------------------------------------------------- | -------------------------- |
| Inicio (`#home`)    | `features/inicio/inicio.js` · marcado en `app/index.html` · `estilos/33-pantalla-de-inicio.css` | `renderInicio`             |
| Anatomía            | `features/anatomia/` (anatomia, competencias, categorias)                                       | `renderComp`, `renderAn`   |
| Atlas 3D            | `features/atlas/` (atlas-sistemas, human-atlas, apartados, rotulos, buscar-estructuras)         | `renderHA`, `renderAp`     |
| Sistema nervioso    | `features/snc/snc.js`                                                                           | `renderSNC`                |
| Embriología         | `features/embriologia/`                                                                         | `renderEmb`                |
| Estructuras         | `features/estructuras/` (estructuras, fichas-est)                                               | `renderEst`, `renderFicha` |
| Tarjetas            | `features/tarjetas/` (tarjetas, ficha-estudio) · datos en `data/bank.json`                      | `renderCards`              |
| Simulacros          | `features/simulacros/` · preguntas en `data/qb.json`                                            | `exSetup`                  |
| Ruta de aprendizaje | `features/ruta/ruta.js` · tramos en `data/ruta.json`                                            | `renderRuta`               |
| Mi progreso         | `features/progreso/progreso.js`                                                                 | `renderPg`                 |
| Exámenes            | `features/examenes/examenes.js`                                                                 | `renderEx`                 |
| Estudio con IA      | `features/estudio-ia/` y `features/documentos/`                                                 | —                          |
| Biblioteca          | `features/biblioteca/` · recursos en `data/lib.json`                                            | `renderLib`                |
| Fuentes             | `features/fuentes/` · `data/bib.json`                                                           | `renderBib`                |
| Módulos             | `features/modulos/modulos.js`                                                                   | `renderMods`               |
| Práctica            | `features/practica/practica.js`                                                                 | `renderPrac`               |
| Voces               | `features/voces/voces.js`                                                                       | `renderCm`                 |
| Rou (asistente)     | `features/rou/rou.js`                                                                           | `renderTabs`               |

**Barra de pestañas** (`#tabbar` en `app/index.html`, estilos en `14-barra-de-pestanas.css`):
Inicio, Aprender, Rou (en el centro, abre el chat), Biblioteca y Perfil. En el celular va abajo;
desde 960px de ancho es una barra lateral. Qué pestaña se enciende en cada sección y a dónde
lleva cada una está en `TAB_DE` y `TAB_A` (`features/rou/rou.js`).

**Pantalla de inicio**: las herramientas son enlaces fijos (Evaluaciones → `#simulacros`,
Modelo 3D → `#atlas`, Flashcards → `#tarjetas`, Calendario → `#examenes`). Casos clínicos
todavía no existe y figura como "Próximamente". Las competencias y su avance salen de
`data/comp.json` y del progreso guardado en el dispositivo.

Quedaron sin uso, del inicio anterior: `features/inicio/carrusel.js` y `features/buscador/`
(el buscador del inicio), y varias reglas de los CSS 10, 11, 15, 21, 22 y 23. Se pueden
borrar con cuidado: algunas acciones de `boot.js` las nombran por su posición en la lista `HT`.

Los estilos de cada sección están en `src/rouviere/estilos/` con nombres descriptivos
(`20-practica.css`, `08-rou.css`…). `01-base.css` tiene la base común.

## Reglas para trabajar en la app

1. **El contenido va en `data/*.json`**, no en el código. Para agregar una tarjeta,
   una pregunta o un recurso, se edita el JSON. Los tests de `test/datos.test.js` revisan
   que no falten campos ni haya ids repetidos.
2. **El estado compartido vive en `estado.js`.** Si una variable la usan varias funciones,
   va ahí y se accede como `estado.nombre`. Lo que usa una sola función, queda local.
3. **Cada sección importa lo que usa.** No hay variables globales: si falta un import,
   la consola lo dice al cargar la página.
4. **Los estilos nuevos van en el archivo de su sección** y se agregan a `estilos/index.css`
   si es un archivo nuevo. El orden importa (cascada).
5. **Antes de subir:** `npm run lint`, `npm test` y probar la sección en el celular.

## Cómo se llegó a esta estructura

La app original era un solo HTML con todo el código y los estilos adentro. Se separó con
análisis del código (no a mano), para no cambiar ningún comportamiento:

- 452 funciones repartidas en 41 módulos según las secciones marcadas en los comentarios originales.
- 71 variables globales que cambian pasaron al objeto `estado`. 111 constantes quedaron en
  su sección y las 12 más grandes (contenido) pasaron a `data/*.json`.
- Los modelos 3D pasaron de base64 dentro de `.js` (formato que exigía claude.ai) a binarios
  `.glb` y `.bin`: de ~150 MB a 97 MB, con el mismo contenido. Los cargadores ya tenían
  previsto leer esos binarios.
- Se quitó una función duplicada que nunca se ejecutaba (`allCards` usaba `DC`, que no existía).

**Verificación:** se compararon capturas de las 19 secciones, original y nueva, en tamaño de
celular, y fueron idénticas píxel por píxel. También se repitieron 44 toques en las dos:
coincidieron todos, salvo los que abren el visor 3D, porque en la prueba la original no
pudo bajarlo de internet y la nueva lo trae incluido. Se probaron los cinco tipos de modelo 3D:
atlas por sistema, apartados, embriología, encéfalo y modelos GLB.

## Deuda técnica conocida

- ESLint deja 11 avisos del código original: variables declaradas dos veces dentro de una
  misma función y algunas sin usar. No afectan el funcionamiento; conviene limpiarlos al
  trabajar en esas secciones.
- Algunos módulos son largos (`tarjetas.js`, `estudio-ia.js` superan las 900 líneas):
  se pueden dividir más cuando se trabaje en ellos.
- `estado.js` es un objeto compartido: funciona, pero a futuro conviene que cada sección
  sea dueña de su propio estado.
- La IA de "Estudio con IA" y de Rou usa la API de claude.ai, que no existe fuera de ese sitio.
  Fuera de claude.ai la app usa su modo local sin IA, como ya estaba previsto en el código original.

## El acceso (`src/` en React)

| Ruta         | Pantalla                        | Archivo                                   |
| ------------ | ------------------------------- | ----------------------------------------- |
| `#/inicio`   | Pantalla 0 · Inicio             | `src/features/auth/pages/WelcomePage.tsx` |
| `#/registro` | Pantalla 1 · Crear cuenta       | `src/features/auth/pages/SignUpPage.tsx`  |
| `#/salir`    | Cierra la sesión y va al inicio | `src/features/auth/pages/LogoutPage.tsx`  |

- **Rou por capas** (`components/RouAnatomy.tsx`): pasa sola por huesos, músculos, nervios y
  completo. Huesos y músculos son las ilustraciones finales del equipo de diseño
  (`src/assets/rou/huesos.svg` y `musculos.svg`; originales en `disenos/rou/`). Nervios todavía
  es provisoria: `rou.webp` teñido con `nervios.svg` encima. Las primeras versiones de huesos y
  músculos quedaron guardadas en `src/assets/rou/anteriores/`.
- **Lo que dice Rou** al crear la cuenta está todo en `features/auth/model/rouMessages.ts`.
- **Reglas del formulario** (datos obligatorios, contraseña, año de Medicina) en
  `features/auth/model/signUp.ts`, sin React, con sus tests al lado.
- El botón **Tutorial** todavía no hace nada (pedido del equipo).
- Las pantallas no conocen el backend: usan `services` desde `@/services`
  (ESLint bloquea importar la implementación `mock*` directamente).
- **Acceso de prueba (`mock`)**: Google entra con una cuenta de ejemplo y "Crear cuenta" guarda
  la cuenta solo en ese navegador, sin contraseña. No sirve para datos reales.
- **Para Google de verdad**: crear otra implementación de `AuthService` en `src/services/auth/`
  (por ejemplo con Firebase Authentication o Supabase Auth, que ya traen "Iniciar sesión con
  Google"), agregarla en `src/services/index.ts` y cambiar `VITE_AUTH_PROVIDER`. La sesión debe
  seguir guardándose con la clave `rouviere.session`, que es la que revisa `app/index.html`.
- **Pendiente de diseño**: la pantalla de inicio no tiene "Ya tengo cuenta". Quien cree su cuenta
  con correo y cierre sesión no tiene por dónde volver a entrar con ese correo.
- Colores, fuentes y espacios del acceso salen de `src/shared/styles/tokens.css`.

## PWA y modo sin conexión

- Al instalar se guardan las dos páginas, su código, estilos, imágenes, el índice del atlas
  y three.js (~5 MB).
- Cada modelo 3D se guarda la primera vez que se abre; después funciona sin internet.
- Las librerías externas que usa "Estudio con IA" (lector de PDF, OCR) se guardan al usarlas.
