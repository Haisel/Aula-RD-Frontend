# AGENTS.md — Guía para agentes de IA (OpenCode/Cody, Claude y otros)

Este archivo es la **puerta de entrada** para cualquier agente que trabaje en este repositorio. Léalo completo antes de tocar código. Si algo aquí contradice una instrucción del chat, **detenga el trabajo y pregunte** (constitución 9.5).

## 0. Orden de lectura obligatorio

1. `.sdd/constitution.md` — principios que ningún cambio puede violar.
2. La spec de la capacidad en `specs/NNN-nombre/NNN-nombre.md`.
3. `docs/01-arquitectura.md` — capas y dónde va cada cosa.
4. `docs/04-api-au.md` — la fachada pública `AU`.
5. Las decisiones vigentes en `docs/decisions/` (README con el índice).

## 1. Flujo SDD (Spec-Driven Development)

```
analizar → especificar (spec.md) → criterios de aceptación → pruebas → APROBACIÓN DEL USUARIO
        → implementar → npm run check → documentar → actualizar estado de la spec
```

- **No programe sin spec aprobada** (constitución 5.3). Si la tarea no tiene spec, cree una con `specs/000-plantilla/000-plantilla.md` y pida aprobación.
- Cada requisito (`RF-xx`) debe mapear a criterios de aceptación (`CA-xx`) y a pruebas (`tests/*.test.js` o verificación manual documentada).
- Si descubre que una spec es incompleta o contradictoria: deténgase, explique el problema, proponga el cambio y espere aprobación (constitución 5.4).
- Al terminar: marque la spec con `Estado: Implementada` + fecha, y registre decisiones nuevas en `docs/decisions/`.

## 2. Comandos

| Necesito… | Ejecuto |
|---|---|
| Ver cambios en vivo | `npm run dev` |
| Validar todo antes de entregar | `npm run check` (lint → tipos → pruebas → build). **Debe terminar sin errores.** |
| Cambiar un color/tipo/espaciado | Editar `src/tokens/tokens.json` → `npm run tokens` |
| Regenerar la referencia JSDoc | `npm run docs` |

## 3. Dónde va cada cosa

| Quiero… | Archivo |
|---|---|
| Un color, tamaño o radio nuevo | `src/tokens/tokens.json` (nunca hex sueltos en SCSS/HTML) |
| Estilo de un componente propio | `src/scss/components/_<nombre>.scss`, clases `au-*` |
| Tema de una librería externa | `src/scss/vendors/_<libreria>.scss` |
| Estructura de página (dashboard, landing, auth) | `src/scss/layouts/` |
| Función pura (formato, validación, cálculo) | `src/js/helpers/` + prueba en `tests/` |
| Integrar una librería de terceros | `src/js/adapters/` con `lazy()` (carga diferida) |
| Comportamiento declarativo `data-au-*` | `src/js/components/` + registrarlo en `src/js/app.js` |
| Exponer algo a las páginas | `src/js/facade.js` (y documentarlo en `docs/04-api-au.md`) |
| Hablar con el backend (sesión, institución, endpoints) | `src/js/services/` (dependencias por constructor) y cablearlo en `src/js/kernel.js` |
| Un error nuevo | No cree clases sueltas: use `AU.errors` / `core/errors.js` y un `code` estable |
| Un evento nuevo | Constante en `EVENTS` (`core/events.js`) con el patrón `au:<ámbito>:<evento>` + fila en `docs/04-api-au.md` |
| Esquema de validación de formulario | `src/js/helpers/schemas.js` (o `AU.registerSchema` desde la app) |
| Parcial HTML reutilizable | `src/partials/` (Handlebars, solo para las páginas de ejemplo) |
| Datos de ejemplo | `public/data/` (marcados como fixtures, nunca en componentes) |

## 4. Reglas que más se rompen (y cómo cumplirlas)

1. **Una sola superficie global: `window.AU`.** No cree otras globales. Las páginas no importan Axios, SweetAlert2, Chart.js, etc.: usan `AU.*`.
2. **Sin JS en línea** (`onclick`, `<script>` con código). Use atributos `data-au-*` o módulos. Excepción: `<script type="application/json" id="au-context">` (son datos, no código).
3. **Sin estilos en línea.** Use clases (`au-w-78` para anchos de progreso, utilidades de Bootstrap).
4. **Sin `!important`.** Solo las excepciones documentadas en `docs/02-diseno-y-tokens.md` §6.
5. **Librerías pesadas, diferidas.** Todo `import()` de terceros pasa por `adapters/lazy.js`. No agregue librerías fuera del ecosistema aprobado (`docs/05-librerias.md`) sin ADR y aprobación.
6. **JSDoc en toda función pública**, con descripción de cada `@param` y `@returns`. `npm run typecheck` verifica los tipos.
7. **Texto de interfaz en español de RD**, tratamiento de usted, verbos en infinitivo en botones, sentence case. Formatos: `RD$ 12,500.00`, `08/11/2026`.
8. **Contraste AA.** Turquesa `#18B6A4` y champagne `#C6A15B` **nunca** como color de texto sobre blanco: use `--au-accent-text` y `--au-gold-text`.
9. **Seguridad real en el backend.** `data-au-can` y `AU.can()` solo ocultan; no protegen. Nunca invente identidad, roles ni institución: solo vienen de `#au-context` o de los puertos (`AU.configurePorts`).
11. **Nada de `window.AR`.** El kernel de la Fase 4 ya vive dentro de `AU` (spec 010). Si migra código viejo, traduzca `AR.*` → `AU.*` y los eventos `ar:*` → `au:*`.
12. **HTTP solo por `AU.api` / `AU.request`.** No importe axios en componentes ni páginas; los errores ya llegan tipados.
10. **HTML dinámico siempre sanitizado** (`AU.sanitize`, `AU.render` ya lo hace). Nunca `{{{triple}}}` con datos del usuario.

## 5. Receta: agregar un componente declarativo

1. Spec aprobada con su atributo (`data-au-xyz`), estados y criterios de aceptación.
2. Si usa una librería: `src/js/adapters/xyz.js` con `export const loadXyz = lazy('Xyz', () => import('xyz'))` y una función `createXyz(el, options)` documentada.
3. En `src/js/components/widgets.js` (o un archivo propio) agregue `{ name: 'xyz', selector: '[data-au-xyz]', init(el) { …; return () => limpiar(); } }`.
4. Regístrelo en `src/js/app.js` (lista de `register`).
5. Si debe usarse desde JS, expóngalo en `facade.js` (`AU.createXyz`).
6. Estilos en `src/scss/vendors/_xyz.scss` usando solo variables `--au-*`; impórtelo en `app.scss`.
7. Ejemplo en `componentes.html`; documentación en `docs/03-componentes.md` y `docs/04-api-au.md`.
8. Pruebas de la lógica pura en `tests/`. `npm run check` en verde.

## 6. Definición de terminado

- [ ] Spec con estado actualizado y criterios de aceptación verificados.
- [ ] `npm run check` sin errores (ESLint, tipos JSDoc, Stylelint, Vitest, build).
- [ ] Probado en tema claro y oscuro, y a 390 px de ancho.
- [ ] Navegable con teclado; foco visible; etiquetas en todos los campos.
- [ ] Documentación actualizada (`docs/`, JSDoc) y ADR si hubo decisión nueva.
- [ ] Sin datos ficticios fuera de `public/data/`.

## 7. Prohibido

React, Vue, Angular, Svelte, jQuery (como herramienta de desarrollo), Tailwind; dependencias no aprobadas; editar `src/scss/abstracts/_tokens.scss` a mano; exponer el cliente HTTP o servicios internos fuera de `AU`; presentar datos simulados como reales; cambiar alcance o decisiones sin registrarlo y aprobarlo.
