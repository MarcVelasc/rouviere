# Cómo trabajar en el repo

## Ramas

- `main`: lo que está publicado. Solo se actualiza desde `develop` con un pull request.
- `develop`: integración del trabajo en curso.
- `feat/...`, `fix/...`: una rama por cambio, que sale de `develop` y vuelve a `develop`.

```bash
git switch develop
git pull
git switch -c feat/camino-de-lecciones
# ...cambios...
git push -u origin feat/camino-de-lecciones   # y abrir el pull request hacia develop
```

## Trabajar en la app (`src/rouviere/`)

- Buscá la sección en el mapa de [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md).
- El contenido (tarjetas, preguntas, recursos) se edita en `src/rouviere/data/*.json`.
- Los cambios de diseño se coordinan con el equipo de diseño gráfico.

## Commits

Formato [Conventional Commits](https://www.conventionalcommits.org/es/):

```
feat(atlas): agrega modelo del sistema óseo
fix(auth): corrige mensaje de error con correo vacío
docs: explica cómo instalar la app en iPhone
```

Tipos: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.

## Antes de abrir un pull request

```bash
npm run format && npm run lint && npm run typecheck && npm test
```

El workflow de CI repite estas revisiones en GitHub.
