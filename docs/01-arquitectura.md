# 01 · Arquitectura

## 1. Capas (constitución §1.2)

| Capa | Carpeta | Responsabilidad | Puede importar |
|---|---|---|---|
| Presentación | `src/*.html`, `src/partials/`, `src/scss/` | HTML semántico, estilos de marca | — |
| Configuración | `src/js/config/` | Valores de app, portales, puntos de quiebre. Lee `<meta name="au-config">` | — |
| Núcleo | `src/js/core/` | Eventos `au:*`, registro de componentes, tema, HTTP, plantillas, contexto, errores, almacenamiento | helpers |
| Helpers | `src/js/helpers/` | Funciones **puras** y probadas: formato, validación, sanitización, estados, archivos, config de gráficos | — (salvo su propia librería) |
| Adaptadores | `src/js/adapters/` | Integran librerías de terceros con **carga diferida** (`lazy()`) | core, helpers |
| Componentes | `src/js/components/` | Comportamientos declarativos `data-au-*` y diálogos | core, helpers, adapters |
| Fachada | `src/js/facade.js` | Única superficie pública `window.AU` | todas |
| Raíz de composición | `src/js/app.js` | Importa estilos, registra componentes, publica `AU`, inicializa | todas |

Regla de dependencias: **helpers no conocen el DOM de la página ni la fachada; los adaptadores no conocen componentes; nadie fuera de `app.js`/`facade.js` toca `window`.**

## 2. Arranque (`src/js/app.js`)

```
<head>  js/theme-boot.js  → aplica data-bs-theme antes de pintar
        css/app.css
        js/app.js (módulo)
          1. loadConfig()          ← <meta name="au-config">
          2. configureHttp()       ← apiBaseUrl, timeout
          3. register(...)         ← 23 componentes data-au-*
          4. window.AU = createFacade()   (congelado, no reescribible)
          5. initTheme()           ← preferencia + escucha del sistema
          6. DOM listo:
             readContextFromPage() ← <script type="application/json" id="au-context">
             initAll(document)     ← inicializa cada [data-au-*] una sola vez
             applyContext()        ← data-au-bind / data-au-can
             <html class="au-ready">
```

Contenido insertado después (AJAX, modales): llame `AU.init(contenedor)`. Los elementos ya inicializados se marcan con `data-au-ready="nombre"` y no se duplican.

## 3. Carga diferida (ADR-003, ADR-007)

```js
// adapters/lazy.js
export const loadChart = lazy('Chart.js', async () => (await import('chart.js')).Chart);
```

- La primera llamada descarga el chunk; las siguientes reutilizan la promesa.
- Si falla (red), se rechaza con `AppError('LIB_LOAD_FAILED')` y la próxima llamada reintenta.
- Un componente cuya librería falla marca su elemento con `data-au-error` y la página sigue funcionando.

| Siempre en `app.js` | Diferido (chunk) |
|---|---|
| Bootstrap 5 (JS), Axios, SweetAlert2, DOMPurify, Day.js, núcleo, fachada | Chart.js, DataTables 2, Choices.js, Flatpickr, FullCalendar, Quill, SheetJS, JsBarcode, qr-code-styling, Signature Pad, SortableJS, Zod, IMask, Handlebars |

## 4. Estructura de carpetas

```
aulard-frontend/
├─ AGENTS.md · README.md · CHANGELOG.md
├─ .sdd/constitution.md            Principios (v2 con enmiendas)
├─ specs/NNN-nombre/NNN-nombre.md  Especificaciones SDD
├─ docs/                           Documentación técnica + decisions/ + api/ (JSDoc generado)
├─ scripts/
│  ├─ build-tokens.mjs             tokens.json → _tokens.scss
│  └─ build-html.mjs               páginas de ejemplo → dist/*.html
├─ public/                         Se copia tal cual a dist/ (favicon, img, data, js/theme-boot.js)
├─ src/
│  ├─ tokens/tokens.json           FUENTE ÚNICA de diseño (mismo archivo del sistema de diseño)
│  ├─ scss/                        abstracts · base · components · layouts · vendors · utilities · app.scss
│  ├─ js/                          app.js · facade.js · config · core · helpers · adapters · components · types.js
│  ├─ partials/                    Handlebars: layouts/, app/, landing/, components/
│  ├─ data/pages.js                Contexto de las páginas de ejemplo (menús, usuarios ficticios)
│  └─ *.html                       8 páginas de ejemplo
├─ tests/                          Vitest (62 casos)
└─ dist/                           Salida del build (no se versiona)
```

## 5. Seguridad (constitución §3)

- El frontend **no** es barrera de seguridad. `data-au-can` y `AU.can()` solo ocultan elementos.
- Todo HTML dinámico pasa por DOMPurify (`AU.sanitize`, `AU.render`, `AU.setModalBody`, salida de Quill).
- Los diálogos tratan el texto como texto plano; HTML solo con `options.html` (sanitizado).
- El cliente HTTP envía `X-CSRF-TOKEN`/`X-XSRF-TOKEN` si existe `<meta name="csrf-token">`, y `withCredentials: true`.
- Los errores del servidor se normalizan; el HTML de páginas de error nunca se muestra al usuario.
