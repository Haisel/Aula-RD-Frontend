# 01 · Arquitectura

## 1. Capas (constitución §1.2)

| Capa | Carpeta | Responsabilidad | Puede importar |
|---|---|---|---|
| Presentación | `src/*.html`, `src/partials/`, `src/scss/` | HTML semántico, estilos de marca | — |
| Configuración | `src/js/config/` | Valores de app, portales, puntos de quiebre. Lee `<meta name="au-config">` | — |
| Núcleo | `src/js/core/` | Errores tipados, bus de eventos `au:*`, logger, manejador de errores, scope, contenedor, cargador de módulos, registro de componentes, tema, HTTP, plantillas, contexto, almacenamiento | helpers, services |
| Servicios | `src/js/services/` | Puertos hacia el backend: `HttpClient`, `SessionService`, `InstitutionContext`, `AccessPolicy`. Reciben dependencias por constructor; nunca importan la fachada ni el contenedor | core (errores, eventos) |
| Kernel | `src/js/kernel.js` | Raíz de composición del núcleo: crea los servicios, los registra en el contenedor y cablea sus reacciones (401, cambio de institución, errores) | core, services |
| Helpers | `src/js/helpers/` | Funciones **puras** y probadas: formato, validación, sanitización, estados, archivos, config de gráficos | — (salvo su propia librería) |
| Adaptadores | `src/js/adapters/` | Integran librerías de terceros con **carga diferida** (`lazy()`) | core, helpers |
| Componentes | `src/js/components/` | Comportamientos declarativos `data-au-*` y diálogos | core, helpers, adapters |
| Fachada | `src/js/facade.js` | Única superficie pública `window.AU` | todas |
| Punto de entrada | `src/js/app.js` | Importa estilos, cablea el kernel, registra componentes, publica `AU`, inicializa | todas |

Regla de dependencias: **los helpers no conocen el DOM de la página ni la fachada; los adaptadores no conocen componentes; los servicios no conocen el contenedor ni la fachada; solo `app.js` y `facade.js` publican en `window`** (el kernel solo escucha eventos de `window`).

Origen: el núcleo y los servicios se portaron de la Fase 4 de `E:\AulaRD` (`window.AR`) y se fusionaron con la plantilla. La fachada única es `AU` (decisión 013, spec 010).

## 2. Arranque (`src/js/app.js`)

```
<head>  js/theme-boot.js  → aplica data-bs-theme antes de pintar
        css/app.css
        js/app.js (módulo)
          1. loadConfig()          ← <meta name="au-config">
          2. configureHttp()       ← apiBaseUrl, timeout, retries
          3. wireKernel()          ← reacciones a 401, cambio de institución, au:app:error
             errorHandler.install()← error / unhandledrejection
          4. register(...)         ← 24 componentes data-au-*
          5. window.AU = createFacade()   (congelado, no reescribible)
          6. initTheme()           ← preferencia + escucha del sistema
          7. DOM listo:
             readContextFromPage() ← #au-context → sesión + institución + acceso
             initAll(document)     ← inicializa cada [data-au-*] una sola vez
             bootKernel()          ← resuelve sesión/institución con los puertos (si hay)
             applyContext()        ← data-au-bind / data-au-can
             <html class="au-ready">  ·  emite au:app:ready
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
│  ├─ js/                          app.js · kernel.js · facade.js · config · core · services · helpers · adapters · components · types.js
│  ├─ partials/                    Handlebars: layouts/, app/, landing/, components/
│  ├─ data/pages.js                Contexto de las páginas de ejemplo (menús, usuarios ficticios)
│  └─ *.html                       8 páginas de ejemplo
├─ tests/                          Vitest (106 casos)
└─ dist/                           Salida del build (no se versiona)
```

## 5. Seguridad (constitución §3)

- El frontend **no** es barrera de seguridad. `data-au-can` y `AU.can()` solo ocultan elementos. No hay comodín para `super-admin`.
- La identidad y la institución solo provienen del backend (`#au-context` o puertos). Sin ellos, el estado es `unauthenticated`/`none`.
- `HttpClient` rechaza URLs absolutas fuera de `baseURL`; el almacenamiento rechaza claves sensibles; `AU.openIframe` solo admite `http(s)`.
- El logger redacta claves sensibles y nunca registra cuerpos de solicitud o respuesta.
- Todo HTML dinámico pasa por DOMPurify (`AU.sanitize`, `AU.render`, `AU.setModalBody`, salida de Quill).
- Los diálogos tratan el texto como texto plano; HTML solo con `options.html` (sanitizado).
- El cliente HTTP envía `X-CSRF-TOKEN`/`X-XSRF-TOKEN` si existe `<meta name="csrf-token">`, y `withCredentials: true`.
- Los errores del servidor se normalizan; el HTML de páginas de error nunca se muestra al usuario.
