# Tareas — 012-galeria-de-funcionalidades

> Estado: Aprobado (08/11/2026) · Plan: [plan.md](plan.md) · Spec: [012-galeria-de-funcionalidades.md](012-galeria-de-funcionalidades.md)

Leyenda: `[x]` hecho · `[ ]` pendiente · `P` en paralelo. Cada tarea termina con `npm run check` en verde y, si es una página, con su verificación en navegador.

## Fase 1 — índice, botones, alertas, modales, tarjetas, estados
| Id | Tarea | Cubre | Hecho cuando |
|---|---|---|---|
| T-01 | Medir `dist/js/app.js` (gzip -9 y bytes exactos) y anotarlo como referencia | RNF-04, CA-12 | Cifra en esta lista |
| T-02 | Prueba primero (en rojo): `tests/gallery-pages.test.js` recorre las páginas de la galería (sin JS ni estilos en línea, enlaces internos existentes, listadas en el índice, rótulo de datos de demostración) | RF-01, RF-02, RF-12, RNF-05 | Prueba escrita y fallando por falta de páginas |
| T-03 | Grupo de menú "Galería" en `src/data/pages.js` y parcial del menú | RF-02, RF-14 | Menú visible en las páginas de la galería |
| T-04 P | `galeria.html` (índice por contexto) y parciales "tarjeta de índice" y "Cómo se usa" | RF-01, RF-11 | Página generada y enlazada desde el menú de la 009 |
| T-05 P | `ejemplo-botones.html` | RF-10 | Verificada en navegador |
| T-06 P | `ejemplo-alertas.html` | RF-10 | Verificada en navegador |
| T-07 P | `ejemplo-modales.html` | RF-10 | Verificada en navegador |
| T-08 P | `ejemplo-tarjetas.html` | RF-07 | Verificada en navegador |
| T-09 P | `ejemplo-estados.html` (vacío, cargando, error, sin permiso, sin conexión, 403/404/500) | RF-15 | Verificada en navegador |
| T-10 | Verificación de la fase: consola sin errores, teclado, 390 px, tema oscuro, red solo del propio origen, `app.js` sin cambios | CA-01, CA-10, CA-11, CA-12, CA-15 | Resultados en la spec |
| T-11 | `CHANGELOG.md`, spec y commit de la Fase 1 | — | Commit hecho |

## Fase 2 — tablas, CRUD, reporte, tablero
| Id | Tarea | Cubre | Hecho cuando |
|---|---|---|---|
| T-12 | `scripts/build-fixtures.mjs` con `randomuser.me` (semilla fija) y `public/data/README.md` | RF-12, CA-16 | JSON generados y origen documentado |
| T-13 | Segunda entrada de Vite para demostraciones y verificación de que `app.js` no cambia | RF-13, CA-12 | `app.js` idéntico byte a byte |
| T-14 | Pruebas primero y lógica del CRUD en memoria | RF-03 | Pruebas en verde |
| T-15 P | `ejemplo-tablas.html` | RF-06 | Verificada en navegador |
| T-16 P | `ejemplo-crud.html` | RF-03, RF-09 | Verificada en navegador |
| T-17 P | `ejemplo-reporte.html` (filtros, gráficos, exportar Excel, impresión) | RF-04 | Verificada en navegador |
| T-18 P | `ejemplo-kanban.html` | RF-15 | Verificada en navegador |
| T-19 | Verificación y commit de la Fase 2 | CA-03, CA-05, CA-07 | Resultados en la spec |

## Fase 3 — formularios avanzados, edición, perfiles por rol, archivos
| Id | Tarea | Cubre | Hecho cuando |
|---|---|---|---|
| T-20 | Pruebas primero y lógica de deshacer y de cambios sin guardar | RF-09 | Pruebas en verde |
| T-21 P | `ejemplo-formularios.html` (asistente, listas dependientes, filas repetibles) | RF-05 | Verificada en navegador |
| T-22 P | `ejemplo-edicion.html` | RF-09 | Verificada en navegador |
| T-23 P | `ejemplo-perfiles.html` con los cinco roles | RF-08 | Verificada en navegador |
| T-24 P | `ejemplo-archivos.html` | RF-15 | Verificada en navegador |
| T-25 | Verificación y commit de la Fase 3 | CA-04, CA-06, CA-08, CA-09 | Resultados en la spec |

## Fase 4 — calendario, navegación, impresión y códigos
| Id | Tarea | Cubre | Hecho cuando |
|---|---|---|---|
| T-26 P | `ejemplo-calendario.html` | RF-15 | Verificada en navegador |
| T-27 P | `ejemplo-navegacion.html` | RF-15 | Verificada en navegador |
| T-28 P | `ejemplo-impresion.html` (carnet con QR, boleta con código de barras y firma, `@media print`) | RF-15 | Verificada en navegador, incluida la vista de impresión |
| T-29 | Verificación final de las 17 páginas, `npm run check` y cierre de la spec (estado "Implementada") | CA-01 a CA-16 | Spec cerrada |
