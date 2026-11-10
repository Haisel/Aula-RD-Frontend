# Tareas — 005-identidad-visual-b

> Estado: Implementado (08/11/2026) · Fecha: 08/11/2026 · Plan: [plan.md](plan.md) · Spec: [005-identidad-visual-b.md](005-identidad-visual-b.md)

Leyenda: `[ ]` pendiente · `[x]` hecho · `P` puede hacerse en paralelo. Cada tarea termina con `npm run check` en verde.

## Ya hecho (implementación original, sin tareas nuevas)
- [x] RF-01/02 Tokens y generación de `_tokens.scss`
- [x] RF-03/04 Tema claro/oscuro/sistema y arranque sin destello
- [x] RF-05/06/07 Bootstrap y librerías tematizados, primario turquesa con texto navy en oscuro
- [x] CA-07 Stylelint

## Fase A — Pruebas de guarda
**Estado 08/11/2026: T-01 a T-04 hechas.** `contrast`, `no-important` y `tokens-sync` pasan (53 pruebas) sin que ningún par falle. T-10 resuelta (ver Fase C).

| Id | Tarea | Cubre | Archivo | Hecho cuando |
|---|---|---|---|---|
| T-01 P ✔ | Escribir la prueba de contraste (primero en rojo si algún par falla), con listado único de pares de `docs/02` §4 | CA-04, RNF-01, RN-01 | `tests/contrast.test.js` | Todos los pares cumplen en claro y oscuro, o los fallos están reportados al propietario |
| T-02 P | Prueba de coherencia `tokens.json` ↔ `_tokens.scss` | RF-01/02, CA-01 | `tests/tokens-sync.test.js` | Falla si `_tokens.scss` difiere de lo generado |
| T-03 P | Prueba de `!important` frente a las excepciones de `docs/02` §6 | RNF-03 | `tests/no-important.test.js` | Las coincidencias en `src/scss/**` son exactamente las documentadas |
| T-04 | Alinear la tabla de `docs/02` §4 con el listado de T-01 | RNF-01 | `docs/02-diseno-y-tokens.md` | Tabla y prueba usan los mismos pares |

## Fase B — Verificación manual registrada
**Estado 08/11/2026: T-05 a T-09 hechas.** Resultados en la sección "Verificación" de la spec. Un hallazgo fuera de alcance (selector de Quill sin nombre accesible, spec 008).

| Id | Tarea | Cubre | Hecho cuando |
|---|---|---|---|
| T-05 | Cambio de tema `system` con el SO en vivo | CA-03 | Resultado y fecha en la spec |
| T-06 | SweetAlert2, Choices, Flatpickr, DataTable, Quill y FullCalendar en tema oscuro | CA-05, RF-06 | Resultado por componente en la spec |
| T-07 | Gráfico visible: cambiar el tema y ver que se recolorea (`au:theme:changed`) | CA-06 | Resultado en la spec |
| T-08 | Repetir T-05 a T-07 a 390 px y solo con teclado, con foco visible | `AGENTS.md` §6 | Resultado en la spec |
| T-09 | Comprobar fuentes en `dist/` (solo latin, woff2 + woff) | RNF-02 | Lista de archivos de fuente registrada |

## Corrección añadida (08/11/2026): foco en el menú lateral ✔
Hallada en la verificación de la Fase B y aprobada por el propietario. Hecha con pruebas primero: token `focus-ring-on-dark`, dos pares nuevos en `tests/contrast.test.js` (vistos en rojo antes del token), CSS en `src/scss/layouts/_app-shell.scss`. `npm run check` en verde (181 pruebas, sin avisos). Medido en navegador: contraste mínimo de foco 7.14:1 (claro) y 9.7:1 (oscuro).

## Fase C — Cierre
**Estado 08/11/2026: T-10 a T-14 hechas. Spec aprobada por el propietario el 08/11/2026.**

| Id | Tarea | Hecho cuando |
|---|---|---|
| T-10 P | Preguntar al propietario: ¿se mantiene "usted"? y ¿se aprueba retirar Inter/Outfit/JetBrains Mono? | Respuestas anotadas en "Información faltante" (ADR si cambia algo) |
| T-11 | Actualizar trazabilidad de la spec con las pruebas nuevas | Cada RF/CA tiene prueba o verificación registrada |
| T-12 | `CHANGELOG.md` y `specs/README.md` (enlazar plan y tareas) | Entradas coherentes con el estado real |
| T-13 | `npm run check` en verde | Sin errores de lint, tipos, pruebas ni build |
| T-14 | Pedir aprobación al propietario | La spec queda `Aprobada (fecha, por)` y se marca el check de "Aprobación" |

## Mapa de cobertura
| CA | Tarea | Tipo de verificación |
|---|---|---|
| CA-01 | T-02 | Automática |
| CA-02 | existente (`theme-registry.test.js`) | Automática |
| CA-03 | T-05, T-08 | Manual |
| CA-04 | T-01, T-04 | Automática |
| CA-05 | T-06, T-08 | Manual |
| CA-06 | T-07, T-08 | Manual |
| CA-07 | existente (Stylelint) | Automática |
| RNF-02 | T-09 | Manual |
| RNF-03 | T-03 | Automática |
