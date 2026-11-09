# Rouviere

App para estudiar anatomía: atlas 3D, tarjetas, simulacros y seguimiento del progreso.
Medicina · UCB Tarija.

Es una **app web instalable (PWA)**: se abre desde un link, se agrega a la pantalla de inicio
y funciona como una app en **Android y iPhone**. No necesita tiendas.

## Instalarla en el celular

1. Abrir el link de la app (GitHub Pages) en el celular.
2. **Android (Chrome):** menú ⋮ → **Instalar app** o **Agregar a la pantalla principal**.
3. **iPhone (Safari):** botón Compartir → **Agregar a inicio**.

Por ahora el acceso es de prueba: **Continuar con Google** entra con una cuenta de ejemplo y
**Crear cuenta** guarda la cuenta solo en ese navegador. Todavía no hay servidor.

## Cómo está armada

| Parte               | Dónde                                 | Qué es                                                             |
| ------------------- | ------------------------------------- | ------------------------------------------------------------------ |
| **Acceso**          | `src/` (React + TypeScript)           | Inicio (Rou por capas, Google), crear cuenta, cerrar sesión        |
| **App de Rouviere** | `src/rouviere/` (JavaScript, módulos) | Atlas 3D, tarjetas, simulacros, ruta, Rou… una carpeta por sección |
| **Contenido**       | `src/rouviere/data/*.json`            | Tarjetas, preguntas, ruta, biblioteca, nombres anatómicos          |
| **Modelos 3D**      | `public/app/` (`.glb`, `atlas/*.bin`) | Modelos anatómicos                                                 |

Para cerrar sesión: abrir `#/salir`. El mapa de qué archivo dibuja cada pantalla está en
[docs/ARQUITECTURA.md](docs/ARQUITECTURA.md).

## Desarrollo

Requisitos: Node 22 (ver `.nvmrc`).

```bash
npm install
npm run dev        # abre http://localhost:5173
```

Para probar en el celular, con el celular y la compu en la misma red WiFi:

```bash
npm run dev -- --host   # usa la dirección "Network" que aparece en la consola
```

| Comando             | Qué hace                         |
| ------------------- | -------------------------------- |
| `npm run dev`       | Servidor de desarrollo           |
| `npm run build`     | Versión final en `dist/`         |
| `npm run preview`   | Sirve `dist/` para probar la PWA |
| `npm test`          | Tests (Vitest)                   |
| `npm run lint`      | Reglas de código (ESLint)        |
| `npm run typecheck` | Revisión de tipos (TypeScript)   |
| `npm run format`    | Da formato al código (Prettier)  |

## Publicación

Cada cambio que llega a `main` se publica solo en GitHub Pages
(`.github/workflows/deploy.yml`). La primera vez hay que activar Pages:
**Settings → Pages → Source: GitHub Actions**.

## Créditos

- Diseño y contenido de la app: equipo Rouviere.
- Modelos anatómicos: BodyParts3D y otras fuentes citadas dentro de la app (sección Fuentes).
- Visor 3D: three.js r128 (licencia MIT, incluida en `public/app/vendor/three/`).
