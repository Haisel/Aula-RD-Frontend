# 007 — Plantilla neutra: salida `dist/` tipo AdminKit

## Contexto
El propietario no usará Blade ni ningún motor de plantillas de servidor concreto. Pide "una plantilla visual neutra que pueda usar con cualquier backend" que al compilar entregue un CSS, un JS, imágenes y fuentes. La ADR-003 exige además carga diferida de librerías pesadas.

## Opciones consideradas
1. Un solo `app.js` clásico con todo → simple, pero 589 KB gzip en cada página (incluye FullCalendar, Quill, SheetJS…), contradice ADR-003.
2. Módulos ES con chunks automáticos → cumple ADR-003, requiere servir por http(s) y `type="module"`.
3. **Ambos modos**: por defecto (2) y opcional (1) con `npm run build:single`.

## Decisión
Opción 3.
- `npm run build` → `css/app.css` (72 KB gzip), `js/app.js` (97 KB gzip: Bootstrap, Axios, SweetAlert2, DOMPurify, Day.js, núcleo y fachada), `js/chunks/*` (Chart.js, DataTables, Choices, Flatpickr, FullCalendar, Quill, SheetJS, JsBarcode, QR, Signature Pad, Sortable, Zod, IMask, Handlebars), `fonts/`, `img/`, `*.html`.
- `npm run build:single` → `js/app.js` IIFE con todo (`<script defer>`), para backends que no puedan servir módulos.
- Las páginas de ejemplo se generan con `scripts/build-html.mjs` (Handlebars en Node) con rutas relativas.
- La configuración del backend llega por `<meta name="au-config">`, el contexto por `<script type="application/json" id="au-context">` y el CSRF por `<meta name="csrf-token">`.

## Consecuencias
- Abrir los HTML con doble clic (`file://`) no funciona en el modo por defecto; usar `npm run preview` o cualquier servidor.
- Los nombres de chunks llevan hash; no se referencian a mano (Vite los resuelve desde `app.js`).

## Estado: Propuesta — decidida por el propietario
## Fecha: 2026-11-08
## Arquitecto: Claude
