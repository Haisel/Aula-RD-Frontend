# Cambios

## 0.2.0 — 08/11/2026

Fusión del núcleo de la Fase 4 (`E:\AulaRD`) en la plantilla. Spec 010, ADR 013.

**Nuevo**
- Kernel (`src/js/kernel.js`): errores tipados (`AU.errors`), bus de eventos, logger con redacción, manejador central (`au:app:error`), `Scope` (`AU.createScope()`), contenedor y cargador de módulos.
- Servicios: `HttpClient` (endpoints con `:param`, estrategia de contexto institucional, reintentos solo en GET, URLs absolutas bloqueadas), `SessionService`, `InstitutionContext`, `AccessPolicy`.
- Fachada: `AU.session.*`, `AU.institution.*`, `AU.configurePorts()`, `AU.request()`, `AU.report()`, `AU.busy()`, `AU.progress()`, `AU.inlineAlert()`, `AU.toggleModal/getModal/destroyModal/setModalContent`, `AU.isValidPlaca/isValidCurrency/isNullOrEmpty/isEmpty`, `AU.humanize/truncate/normalizeSpaces`, `AU.toggleFullscreen`, `AU.openIframe`, `AU.assetUrl`, `AU.customSet/customGet`, `AU.storeRemove`, `AU.on(…, { delegate })`, `AU.events.off`.
- Componente `data-au-tabs` (pestañas accesibles). `data-au-action` ejecuta acciones registradas con `AU.customSet`.
- `au-config`: `apiRetries`, `loginUrl`, `assetBaseUrl`, `debug`.
- 44 pruebas nuevas (106 en total).

**Cambios que rompen compatibilidad**

| 0.1 | 0.2 |
|---|---|
| `au:theme-change` | `au:theme:changed` |
| `au:submit` | `au:form:submit` |
| `au:form-success` / `au:form-error` | `au:form:success` / `au:form:error` |
| `au:sidebar-toggle` | `au:sidebar:toggle` |
| `au:context-change` | `au:context:changed` |
| `au:rendered` | `au:render:done` |
| `au:ready` (tras cada `AU.init`) | `au:components:ready`; nuevo `au:app:ready` (una vez) |
| Errores `{ status, message, fieldErrors, raw }` con `code: 'HTTP_ERROR'` | Subclases de `AppError` con esas mismas propiedades y `code` específico |
| `AU.can()` concedía todo al rol `super-admin` | Sin comodín: el backend envía todos los permisos |
| `AU.storeSet` aceptaba cualquier clave | Rechaza claves sensibles (`token`, `session`, `auth`…) |

**Correcciones**
- `build:single`: `codeSplitting: false` en lugar de `inlineDynamicImports` (obsoleto). Se silenciaron los avisos de tamaño y de `import.meta`, esperados en ese modo.
- Cédula: se rechaza el municipio `000`.
- `npm run preview` devolvía 404 (`--outDir dist` se resolvía dentro de `src/`): ahora es `vite preview`.

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
