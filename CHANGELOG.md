# Cambios

## 0.1.0 — 08/11/2026

Primera versión de la plantilla UI neutra con la línea gráfica B.

- Tokens del sistema de diseño como fuente única (`src/tokens/tokens.json` → Sass + variables CSS) con temas claro/oscuro/sistema.
- Bootstrap 5.3 tematizado completo y 10+ componentes propios `au-*`.
- Fachada `window.AU` congelada (estilo `AR`), 23 componentes declarativos `data-au-*`.
- Ecosistema aprobado con carga diferida: Chart.js, DataTables 2, Choices.js, Flatpickr, FullCalendar, Quill, SheetJS, JsBarcode, QR, Signature Pad, SortableJS; robustez: Zod, IMask, DOMPurify, Handlebars.
- Build neutro: `css/app.css` + `js/app.js` (+ chunks) + fuentes + imágenes; modo `build:single`.
- 8 páginas de ejemplo (landing, registro, login, 4 portales, catálogo).
- Calidad: ESLint+JSDoc, TypeScript checkJs, Stylelint, Prettier, 62 pruebas Vitest.
- Documentación técnica, constitución v2 (enmiendas pendientes de aprobación), ADR 006–012, specs SDD 005–009.
