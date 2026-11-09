# Cambios

## 0.4.0 — 09/11/2026

Cierre de la Fase 1 de la plantilla profesional (spec 013): los 30 ítems de menú abren una página, cero enlaces vacíos, 73 páginas verificadas en claro y oscuro, y cierre de la spec 005 (identidad visual B) con pruebas de guarda y corrección de accesibilidad del foco.

**Nuevo**
- Decisión 016: el límite de peso de `app.js` (spec 006, RNF-01) sube de 100 KB a 110 KB gzip. El archivo ya pesaba unos 107 KB desde las versiones 0.2.0 y 0.3.0; el límite se ajusta a esa realidad y no se permite crecer sin justificación.
- `npm run budget` (`scripts/check-budget.mjs`) hace cumplir ese límite y forma parte de `npm run check`, después del build. Mide 106.76 kB gzip (nivel 9, kB decimales), cerca de 1 kB menos que el informe de Vite.
- Corrección de accesibilidad (verificación T-12): el control de rango (`form-range`) tenía la pista casi del color del fondo, el pulgar hueco y ningún indicador de foco claro. Ahora la pista usa `--au-border-control`, el pulgar es sólido con `--au-accent-text` y con el teclado muestra el anillo sólido `--au-focus-ring`. `tests/focus-ring.test.js`.
- Fase 1 cerrada en enlaces (spec 013, T-11): páginas públicas `contacto.html` (formulario validado con el esquema nuevo `contacto`), `terminos.html` y `privacidad.html` (texto de **relleno** rotulado), y los 15 `href="#"` vacíos ahora llevan a una página real: pie de página, términos del registro, avisos y menú de usuario de la barra superior, botones de los paneles y "Solicitar demostración". Los trinquetes de `tests/links.test.js` quedan en 0. `tests/public-pages.test.js`.
- Módulos, tanda 3 (spec 013, Fase 1): los 8 ítems de menú que faltaban, con arquetipo propio: Planes (tarjetas de precios), Configuración del superadmin y de la institución (pestañas con formulario), Asistencia (cuadrícula validada con el esquema `asistencia`) y Calificaciones (cuadrícula de notas) del docente, Mensajes (bandeja con pestañas accesibles), y Planificación y Horario (calendario). Datos `planes.json` y `mensajes.json`, helpers `money`, `date`, `num` e `inc`, y estilos de bandeja y notas. El trinquete de ítems de menú muertos llega a **0**; `tests/archetype-pages.test.js`.
- Módulos, tanda 2 (spec 013, Fase 1): 14 páginas más con el arquetipo de tabla (Soporte, Publicidad y Contabilidad del superadmin; Matrícula, Calificaciones, Asistencia, Comunicados y Reportes de la institución; Mis secciones y Comunicados del docente; Calificaciones, Asistencia, Comunicados y Autorizaciones de la familia). Nueve archivos de datos nuevos generados sin red por `scripts/build-fixtures-modulos.mjs`, celdas de porcentaje y estados nuevos, y modo `readOnly` (solo "Ver") para las páginas de familia, reportes y secciones. El trinquete de menú bajó de 22 a 8 ítems muertos.
- Índice de la galería y menú (spec 013, V-04): `galeria.html` ahora tiene las secciones Autenticación (8), Perfiles (6) y Formularios (9) con sus tarjetas, y el menú de la galería el grupo "Autenticación". "Próximas fases" ya no anuncia lo que existe. `tests/gallery-index.test.js` (10 pruebas) exige que todo ítem del menú de la galería esté enlazado desde el índice.
- Formularios (spec 013, V-03): nueve páginas `formulario-*` (controles básicos, diseños horizontal/en línea/flotante, validación, por secciones, avanzado, asistente por pasos, editor de texto, carga de archivos y firma), grupo "Formularios" en el menú de la galería y `tests/form-pages.test.js`. Nuevo atributo `data-au-tab-go` para asistentes por pasos.
- Corrección de accesibilidad: al fallar la validación, el foco ahora llega al widget que sustituye al campo (lista de Choices, editor, firma) y abre el paso oculto de un asistente. Antes `focus()` sobre un campo oculto no hacía nada y el foco caía en `body`. `tests/wizard-tabs.test.js`.
- Variantes de perfil (spec 013, V-02): `perfil-portada` (con pestañas), `perfil-lateral`, `perfil-compacto` (línea de tiempo), `perfil-credencial` (imprimible, con QR), `perfil-institucion` y `perfil-editable` (esquema `perfil`), con datos de `public/data/perfiles.json`, los parciales `components/profile-*`, estilos en `_profile.scss` y el grupo "Perfiles" en el menú de la galería. Nueva acción declarativa `data-au-action="print"`. `tests/profile-pages.test.js`, `profile-schema.test.js` y `action-print.test.js`.
- Variantes de inicio de sesión (spec 013, V-01): `login-centrado`, `login-ilustracion` (con acceso por proveedor externo de demostración), `login-minimo`, `login-portada`, `login-portales` (pestañas `data-au-tabs`), `login-codigo` (código de un solo uso de 6 dígitos) y `recuperar-contrasena`, con el parcial `auth/login-form` y los esquemas `recuperar` y `codigo-acceso`. `tests/auth-pages.test.js` (67) y `tests/auth-schemas.test.js` (13).
- Corrección: los botones de mostrar contraseña de `login.html` y `suscribir.html` no tenían nombre accesible; ahora llevan `aria-label`. El enlace "¿La olvidó?" apunta a `recuperar-contrasena.html`.
- Galería de funcionalidades, Fase 1 (spec 012): `galeria.html` (índice) y las páginas de ejemplo de botones, alertas, modales, tarjetas y estados, con menú "Galería", aviso de demostración y bloques "Cómo se usa" (`{{{{code}}}}`). `tests/gallery-pages.test.js` (35 pruebas). Sin cambios en `app.js`.
- Módulos de gestión de tipo tabla (spec 013, 8 de 30): Instituciones, Usuarios internos, Suscripciones y Cobros (superadmin), Estudiantes, Docentes y Cobros (institución) y Estado de cuenta (familia). Cada ítem de menú abre su página, con migas de pan, aviso de demostración y una tabla con búsqueda, orden y paginación. El arquetipo `archetypes/table`, las celdas `src/data/cells.js` (formatos `RD$ 12,500.00` y `08/11/2026`, todo escapado) y 5 archivos de datos nuevos en `public/data/`. Quedan 22 ítems de menú sin página (el trinquete de `tests/links.test.js` los lista).
- Páginas de error y de mantenimiento (spec 013): `403.html`, `404.html`, `500.html` y `mantenimiento.html`, con el diseño de la plantilla, logo según el tema y siempre una salida. `tests/error-pages.test.js` (24 pruebas).
- Menú lateral con grupos plegables (spec 013): un ítem con `children` se dibuja como botón con colapso de Bootstrap (sin JS propio), accesible con teclado, abierto si contiene la página activa, y compatible con el menú contraído a íconos y con el móvil. La galería agrupa sus páginas de interfaz. `tests/sidebar-groups.test.js` (10 pruebas) y `tests/links.test.js` (prueba de trinquete contra enlaces muertos: 30 ítems de menú y 15 `href="#"` vacíos de deuda inicial).
- Los cuatro dashboards (superadmin, institución, docente y familia) enlazan la galería desde su menú lateral ("Galería", en la sección "Ejemplos"), y la galería enlaza de vuelta a cada dashboard desde su menú y su índice. Probado con clics reales: dashboard docente → Galería → Botones → Portal de familia. `tests/gallery-pages.test.js` pasa a 40 pruebas.
- `tests/contrast.test.js`: contraste WCAG AA calculado desde `tokens.json` (26 pares en ambos temas + 1 solo en claro); comprueba que turquesa y champagne no se usan como color de texto.
- `tests/tokens-sync.test.js`: `_tokens.scss` debe coincidir con lo que genera `tokens.json`.
- `tests/no-important.test.js`: `!important` solo en las excepciones documentadas.
- Token `focus-ring-on-dark` (`#52CABB`) para el foco sobre superficies navy.
- `specs/005-identidad-visual-b/plan.md` y `tasks.md`.
- API simulada de autenticación para pruebas locales: `npm run mock` (`scripts/mock-api.mjs`, puerto 3100, usuario de demostración). Sin dependencias nuevas; `tests/mock-api.test.js` (10 pruebas).
- Pruebas de contrato de la fachada (CSRF, carga fallida de librerías, diálogos) y de formularios y máscaras: `tests/facade-contract.test.js` y `tests/forms-masks.test.js`.

**Corregido**
- Foco por teclado de los botones, `.btn-check`, paginación y acordeón: Bootstrap lo reducía a un halo al 25 % (1.4:1 en claro y 1.7:1 en oscuro, por debajo de WCAG 1.4.11). Ahora usan el anillo sólido de la marca (5.07:1 en claro y 9.09:1 en oscuro, medido con la tecla Tab real). `tests/focus-ring.test.js`.
- Los dashboards no ocupaban todo el ancho: el contenido tenía un tope de 1440 px y quedaba pegado a la izquierda, dejando una banda vacía a la derecha en pantallas anchas (200 px a 1920, más de 800 a 2560). El token `content-max` pasa a `none`; medido a 1440, 1920 y 2560 px en los 4 dashboards y 2 páginas de la galería: sin banda vacía y sin desbordamiento. Para limitarlo de nuevo, ponga un valor en px en `src/tokens/tokens.json` y ejecute `npm run tokens`.
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
