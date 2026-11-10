# Plan — 012-galeria-de-funcionalidades

> Estado: Implementado (09/11/2026) · Aprobado (08/11/2026) · Spec: [012-galeria-de-funcionalidades.md](012-galeria-de-funcionalidades.md)

## Punto de partida
Spec aprobada. Dieciséis páginas de ejemplo más un índice. Se construyen por fases, cada una con su `npm run check` en verde, su verificación en navegador y su commit.

## Cómo encaja con lo que ya existe
- **Generación de páginas:** `src/*.html` + `src/partials/**`, con el contexto de `src/data/pages.js` (`PAGES`, `NAV`). Las páginas nuevas añaden un grupo de menú "Galería" y entradas en `PAGES`.
- **Componentes:** los `data-au-*` ya registrados (24) y `AU.*`. No se crean componentes nuevos de la librería.
- **Datos:** `public/data/*.json` (hoy `cobros.json`, `eventos.json`, `charts/*`). Se añaden `estudiantes.json`, `docentes.json`, `reporte.json` y los que pidan las demás páginas.
- **Peso de `app.js`:** hoy 103 KB gzip con `gzip -9` (107 KB según Vite). El código de demostración **no puede** sumar bytes (RF-13, CA-12).

## Decisiones de diseño
1. **Código de demostración fuera de `app.js`.** Opción elegida: una **segunda entrada de Vite por demostración** (por ejemplo `dist/js/demo/crud.js`), que usa la fachada global `window.AU` y no importa nada del núcleo. Cada página incluye su propio `<script type="module">` solo si lo necesita. Así `app.js` queda **idéntico byte a byte**. La alternativa (un componente cargador dentro de `app.js`) suma un poco de código al núcleo y contradice RNF-04. Se confirma midiendo `app.js` antes y después (T-03).
2. **Datos reproducibles.** `scripts/build-fixtures.mjs` pide los nombres una sola vez a `randomuser.me` (semilla fija, solo nombre y género, sin fotos ni correos) y escribe los JSON. No forma parte de `npm run check` (necesita red) y se documenta en `public/data/README.md`. Las páginas nunca llaman a una API externa.
3. **Pruebas de lo que sí se puede probar sin navegador:** una prueba que recorre `src/*.html` de la galería (sin JS ni estilos en línea, enlaces internos que existen, cada página listada en el índice, rótulo de datos de demostración) y pruebas unitarias de la lógica pura de cada demostración (CRUD en memoria, filtros del reporte, deshacer). El resto (aspecto, teclado, 390 px, tema oscuro) se verifica en navegador y se registra en la spec.
4. **Perfiles por rol:** una sola página con los cinco perfiles (superadmin, administrador, docente, estudiante, tutor), cada uno con datos, pestañas y acciones propios, sobre el contexto de `data-au-bind` y `data-au-can` existente.

## Fases
| Fase | Páginas | Qué exige |
|---|---|---|
| 1 | Índice, botones, alertas, modales, tarjetas, estados | Casi solo HTML y CSS; menú "Galería"; prueba de páginas; sin datos nuevos |
| 2 | Tablas, CRUD, reporte, tablero (kanban) | `build-fixtures`, JSON de demostración, segunda entrada de Vite, lógica con pruebas |
| 3 | Formularios avanzados, edición, perfiles por rol, archivos | Asistente por pasos, filas repetibles, lista dependiente, deshacer, perfiles |
| 4 | Calendario, navegación, impresión y códigos | FullCalendar con eventos, `@media print`, QR y código de barras |

## Riesgos
| Riesgo | Mitigación |
|---|---|
| `app.js` ya excede el límite de la spec 006 | Medir antes y después de cada fase; la galería no suma bytes |
| Mucho volumen de páginas | Fases con commit propio; el índice solo enlaza lo ya publicado hasta que cada fase cierre |
| Una API pública deja de existir o cambia | Los JSON ya están en el repositorio; `build-fixtures` solo los regenera |
| Los ejemplos se leen como la única forma de integrar | Bloque "Cómo se usa" y aviso de datos de demostración |
| Dos entradas de Vite complican `build:single` | Verificar `build:single` con Git Bash (en Windows `npm run build:single` no funciona, ver spec 006) |
