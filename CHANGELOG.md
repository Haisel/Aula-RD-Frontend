# Cambios

## Sin publicar

Cierre de la spec 005 (identidad visual B): pruebas de guarda y corrección de accesibilidad del foco.

**Nuevo**
- Galería de funcionalidades, Fase 1 (spec 012): `galeria.html` (índice) y las páginas de ejemplo de botones, alertas, modales, tarjetas y estados, con menú "Galería", aviso de demostración y bloques "Cómo se usa" (`{{{{code}}}}`). `tests/gallery-pages.test.js` (35 pruebas). Sin cambios en `app.js`.
- `tests/contrast.test.js`: contraste WCAG AA calculado desde `tokens.json` (26 pares en ambos temas + 1 solo en claro); comprueba que turquesa y champagne no se usan como color de texto.
- `tests/tokens-sync.test.js`: `_tokens.scss` debe coincidir con lo que genera `tokens.json`.
- `tests/no-important.test.js`: `!important` solo en las excepciones documentadas.
- Token `focus-ring-on-dark` (`#52CABB`) para el foco sobre superficies navy.
- `specs/005-identidad-visual-b/plan.md` y `tasks.md`.
- API simulada de autenticación para pruebas locales: `npm run mock` (`scripts/mock-api.mjs`, puerto 3100, usuario de demostración). Sin dependencias nuevas; `tests/mock-api.test.js` (10 pruebas).
- Pruebas de contrato de la fachada (CSRF, carga fallida de librerías, diálogos) y de formularios y máscaras: `tests/facade-contract.test.js` y `tests/forms-masks.test.js`.

**Corregido**
- Barra del editor Quill: el selector de títulos no tenía nombre accesible y los botones tenían etiquetas en inglés. Ahora los 11 controles tienen nombre en español (`labelToolbar()` en `src/js/adapters/editor.js`; `tests/editor-a11y.test.js`).
- `showErrors` (formularios) duplicaba el id del mensaje de error en `aria-describedby` en cada reintento de envío.
- Foco del menú lateral: el anillo en tema claro tenía 2.59:1 sobre el navy del menú (mínimo 3:1) y los enlaces de navegación y el botón de cerrar tenían un halo navy invisible. Ahora el contraste mínimo medido es 7.1:1 (claro) y 9.7:1 (oscuro).
- El botón de cerrar del menú usa una cruz blanca por fondo en vez de `filter`.

## 0.3.0 — 08/11/2026

Autenticación JWT, opción A (spec 011, decisión 015).

**Nuevo**
- `AuthService`: token de acceso solo en memoria; renovación con cookie `httpOnly`; renovación única ante N solicitudes simultáneas; proactiva antes de vencer; `restore()` al cargar.
- `Authorization: Bearer` automático en `AU.api` / `AU.request` (salvo `auth: false`); un reintento tras renovar.
- `AU.configureAuth()`, `AU.login()`, `AU.logout()`; `au-config` → `auth`; formularios `data-au-submit="login"`.
- Con JWT, los componentes con datos se activan después de tener token, usuario e institución.
- 16 pruebas nuevas (124 en total) + prueba de extremo a extremo contra una API JWT simulada.

**Cambios de comportamiento**
- Un 401 a un visitante sin sesión ya no muestra "Su sesión expiró" ni pasa la sesión a `expired`: queda en `unauthenticated`.
- Con `auth` configurado, el API se llama sin cookies (`withCredentials: false`); solo `/auth/*` las usa.

## 0.2.0 — 08/11/2026

Fusión del núcleo de la Fase 4 (`E:\AulaRD`) en la plantilla. Spec 010, ADR 013.

**Nuevo**
- Kernel (`src/js/kernel.js`): errores tipados (`AU.errors`), bus de eventos, logger con redacción, manejador central (`au:app:error`), `Scope` (`AU.createScope()`), contenedor y cargador de módulos.
- Servicios: `HttpClient` (endpoints con `:param`, estrategia de contexto institucional, reintentos solo en GET, URLs absolutas bloqueadas), `SessionService`, `InstitutionContext`, `AccessPolicy`.
- Fachada: `AU.session.*`, `AU.institution.*`, `AU.configurePorts()`, `AU.request()`, `AU.report()`, `AU.busy()`, `AU.progress()`, `AU.inlineAlert()`, `AU.toggleModal/getModal/destroyModal/setModalContent`, `AU.isValidPlaca/isValidCurrency/isNullOrEmpty/isEmpty`, `AU.humanize/truncate/normalizeSpaces`, `AU.toggleFullscreen`, `AU.openIframe`, `AU.assetUrl`, `AU.customSet/customGet`, `AU.storeRemove`, `AU.on(…, { delegate })`, `AU.events.off`.
- Componente `data-au-tabs` (pestañas accesibles). `data-au-action` ejecuta acciones registradas con `AU.customSet`.
- `au-config`: `apiRetries`, `loginUrl`, `assetBaseUrl`, `debug`, `institutionHeader`.
- **Contexto institucional por cabecera** (decisión 014, D-02 resuelta): cada solicitud lleva `X-Institution-Id` con la institución activa; sin institución no se envía. `headerContextStrategy()` en `services/http-client.js`.
- Spec 010 y decisiones 013 y 014 aprobadas por el propietario.
- 46 pruebas nuevas (108 en total).

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
