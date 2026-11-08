# 05 · Librerías

Todas se usan a través de `AU.*` o de atributos `data-au-*`. **Ninguna página importa una librería directamente.**

| Librería | Versión | Para qué | Carga | Tamaño aprox. (gzip) | Licencia |
|---|---|---|---|---|---|
| Bootstrap | 5.3.8 | Componentes, grid, utilidades, modales, offcanvas | Núcleo | 25 KB JS | MIT |
| Bootstrap Icons | 1.13 | Iconografía (fuente) | CSS | 134 KB woff2 | MIT |
| Plus Jakarta Sans (@fontsource) | 5.x | Tipografía (latin 400–800) | CSS | 5 × 12 KB woff2 | OFL-1.1 |
| Axios | 1.x | HTTP, CSRF, normalización de errores | Núcleo | 14 KB | MIT |
| SweetAlert2 | 11 | Alertas, confirmaciones, toasts, carga | Núcleo | 18 KB | MIT |
| DOMPurify | 3 | Sanitización (anti-XSS) | Núcleo | 9 KB | MPL-2.0/Apache-2.0 |
| Day.js | 1.11 | Fechas `es-do`, tiempo relativo | Núcleo | 3 KB | MIT |
| Zod | 4 | Esquemas de validación | Diferida | 92 KB | MIT |
| IMask | 7 | Máscaras | Diferida | 15 KB | MIT |
| Handlebars | 4.7 | Plantillas en el navegador | Diferida | 27 KB | MIT |
| Chart.js | 4.6 | Gráficos | Diferida | 70 KB | MIT |
| DataTables (+BS5) | 2.3 | Tablas con búsqueda/orden/paginación | Diferida | 62 KB (incluye jQuery interno) | MIT |
| Choices.js | 11 | Selects con búsqueda/múltiples | Diferida | 21 KB | MIT |
| Flatpickr | 4.6 | Fechas | Diferida | 15 KB | MIT |
| FullCalendar | 6 | Calendario escolar | Diferida | 80 KB | MIT |
| Quill | 2 | Editor de comunicados | Diferida | 59 KB | BSD-3 |
| SheetJS (xlsx) | 0.20.3 (CDN SheetJS) | Exportar Excel | Diferida | ~140 KB | Apache-2.0 |
| JsBarcode | 3.12 | Códigos de barras | Diferida | 11 KB | MIT |
| qr-code-styling | 1.9 | QR con colores de marca | Diferida | 14 KB | MIT |
| Signature Pad | 5 | Firmas | Diferida | 5 KB | MIT |
| SortableJS | 1.15 | Ordenar arrastrando | Diferida | 13 KB | MIT |

**Desarrollo:** Vite 8 · Sass · vite-plugin-handlebars · Vitest + jsdom · ESLint + @eslint/js + eslint-plugin-jsdoc · TypeScript (solo `checkJs`) · Stylelint + config SCSS · Prettier · JSDoc + docdash.

**Aprobadas en v1 pero no usadas todavía:** Animate.css, Toastr (los toasts usan SweetAlert2, como en `AR`).

Para agregar una librería: ADR + aprobación (constitución §7) → adaptador en `src/js/adapters/` con `lazy()` → tema en `src/scss/vendors/` → exposición en `AU` → documentación aquí.
