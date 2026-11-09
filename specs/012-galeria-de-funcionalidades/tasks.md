# Tareas — 012-galeria-de-funcionalidades

> Estado: Aprobado (08/11/2026) · Plan: [plan.md](plan.md) · Spec: [012-galeria-de-funcionalidades.md](012-galeria-de-funcionalidades.md)

Leyenda: `[x]` hecho · `[ ]` pendiente · `P` en paralelo. Cada tarea termina con `npm run check` en verde y, si es una página, con su verificación en navegador.

## Fase 1 — índice, botones, alertas, modales, tarjetas, estados
**Estado 08/11/2026: hecha.** T-01 a T-11 cumplidas; resultados en "Verificación — Fase 1" de la spec. Referencia de peso (T-01): `app.js` 333 485 bytes, 106 236 con `gzip -9`, huella `929e56f92a44b641`; sigue idéntico tras la fase. Prueba (T-02): `tests/gallery-pages.test.js`, 35 pruebas, vistas en rojo antes de crear las páginas. Pendiente trasladado a la Fase 2: el marco `AU.openIframe` de la página de modales.

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
**Estado 08/11/2026: en curso.** Hechas **T-12** (datos con `randomuser.me`, reproducibles, commit `ae753a3`) y **T-14** (lógica pura con 23 pruebas, commit `4f5c2e2`). **T-13 hecha 09/11/2026:** segunda entrada de Vite `demo` (`src/js/demo/galeria.js` → `dist/js/demo.js`, 0.35 kB gzip), que una página activa con la variable de contexto `demo` en `head.hbs`; `app.js` quedó idéntico byte a byte (334 369 bytes, huella `e0d1b3d8e70c6f58`, 106.76 kB gzip con `gzip -9`). `build:single` no la emite (IIFE no admite varias entradas) y sigue generando las 73 páginas. Nota: el script `build:single` de `package.json` usa `AU_SINGLE=1 comando`, que no funciona en el cmd de Windows (ya venía así). **T-16 hecha 09/11/2026:** `ejemplo-crud.html` + `src/js/demo/crud.js` (usa `store.js`, esquema `crud-estudiante` registrado desde la demostración para no tocar `app.js`) y `tests/crud-page.test.js` (6 pruebas, vistas en rojo antes). `app.js` sigue idéntico (huella `e0d1b3d8e70c6f58`); `demo.js` pesa 2.68 kB gzip. Verificado en Chrome sobre el build: carga 24 estudiantes paginados de 8 en 8; el alta vacía marca 5 campos en español con el foco en el primero; alta, edición (formulario precargado) y borrado (confirmación que nombra el registro) actualizan la tabla; tres «Deshacer» devuelven los 24 originales; los cuatro estados simulados (con datos, vacío, cargando, error con reintento) responden; el foco vuelve al botón que abrió el modal; sin errores de consola, sin recursos externos, sin desbordamiento y modal legible en oscuro (texto `#E7EDF4` sobre `#0F2139`). **Límites:** la ventana mínima del navegador fue de 500 px, no 390; el teclado se probó en el flujo del modal, no tabulando toda la página. **T-17 hecha 09/11/2026:** `ejemplo-reporte.html` + `src/js/demo/reporte-page.js` (usa `reporte.js`, `AU.openChart`, `AU.exportRows`) y `_report.scss` con `@media print`; `tests/reporte-page.test.js` (7 pruebas, vistas en rojo antes). `app.js` sigue en 106.76 kB gzip. Verificado en Chrome sobre el build: 60 estudiantes, 85.4 % de asistencia, promedio 77.8 y RD$ 257,800.00 por cobrar (cifras coinciden con un cálculo aparte sobre el JSON); el filtro 3.º Primaria da 5 estudiantes; Retirado + Vencido da 1; una combinación sin resultados muestra el estado vacío y limpiar devuelve los 60 con el foco en el primer filtro; cambios de filtro seguidos dejan una sola tabla y dos gráficos; «Exportar a Excel» carga el chunk de SheetJS solo al pulsar y descarga el archivo; sin errores de consola, sin recursos externos y sin desbordamiento a 390 px. **Límites:** la vista previa de impresión no se vio (solo se comprobó que las reglas están en el CSS final); el modo oscuro de la aplicación no se revisó en esta página; el contenido del `.xlsx` descargado no se abrió; los iconos de orden de los encabezados alineados a la derecha se ven algo desordenados. **T-18 hecha 09/11/2026:** `ejemplo-kanban.html` + `src/js/demo/tablero-page.js` (usa `tablero.js` y `AU.dragSort`) y `_kanban.scss`; `tests/tablero-page.test.js` (6 pruebas, vistas en rojo antes). `app.js` sigue en 106.76 kB gzip. Verificado en Chrome sobre el build: 12 tarjetas en 3 columnas (4/4/4); el botón «Mover a En revisión» pasa la tarjeta, actualiza conteos a 3/5/4, anuncia «pasó a En revisión, posición 5» y deja el foco en un botón de la misma tarjeta; «Restablecer» vuelve a 4/4/4; un arrastre real con el ratón (CDP) pasó una tarjeta de Nuevas a En revisión en la posición 2 con aviso y conteos correctos; sin errores de consola, sin recursos externos y sin desbordamiento a 390 px. **Límites:** el arrastre se probó con el ratón simulado de Chrome, no con un dedo real; el recorrido con Tab y Enter se comprobó con clics sobre los botones, no pulsando las teclas; una columna que queda vacía no se probó; tema oscuro sin revisar. **T-15 hecha 09/11/2026:** `ejemplo-tablas.html` + `src/js/demo/tablas-page.js` y `seleccion.js` (lógica pura de la casilla de cabecera); `tests/tablas-page.test.js` (12 pruebas). La prueba se escribió antes que el código, pero no se ejecutó en rojo por separado. `app.js` sigue en 106.76 kB gzip. **CA-07 verificado en Chrome sobre el build:** con 0 filas marcadas las 4 acciones están deshabilitadas; con 2 se habilitan y la cabecera queda indeterminada; «seleccionar todo» marca las 60 y la cabecera se marca; al filtrar por 3.º Primaria la selección baja de 60 a 5 (no se actúa sobre filas ocultas). Desactivar cambia los 5 estados a Inactivo y limpia la selección; exportar descarga solo lo marcado (2 filas, SheetJS cargado al pulsar); eliminar muestra el diálogo, cancelar no cambia nada y confirmar deja 58; restablecer devuelve los 60; el detalle se abre y se cierra con `aria-expanded`; sin errores de consola, sin recursos externos y sin desbordamiento de página a 390 px (la tabla se desplaza en su contenedor). **Límites:** el contenido del `.xlsx` no se abrió; el teclado se probó con clics sobre las casillas, no pulsando Tab y Espacio; tema oscuro sin revisar; la selección se pierde al cambiar el texto de la búsqueda de DataTables solo si deja de verse la fila (comportamiento deseado, no probado con la búsqueda). Pendiente: T-19 (verificación de la fase). Diseño acordado para lo que falta: un solo punto de entrada `src/js/demo/galeria.js` que activa lo que encuentre por `data-demo="tablas|crud|reporte|tablero"`, usa solo `window.AU` y se incluye únicamente en esas páginas (en `build:single` no se emite).

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
