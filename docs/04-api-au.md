# 04 · Referencia de la fachada `AU`

`window.AU` es la **única** superficie global. Está congelada: `Object.isFrozen(AU) === true`.
Referencia generada con tipos y parámetros: `npm run docs` → `docs/api/`.

> 🕒 = asíncrona (devuelve `Promise`) porque descarga una librería la primera vez.

## Meta y ciclo de vida

| Miembro | Descripción |
|---|---|
| `AU.version` | Versión de la plantilla (de `package.json`). |
| `AU.config` | Configuración efectiva (incluye `<meta name="au-config">`). |
| `AU.breakpoints` | `{ xs, sm, md, lg, xl, xxl }` iguales a Bootstrap. |
| `AU.init(root?)` | Inicializa los `data-au-*` dentro de `root` (por defecto `document`). Devuelve cuántos inicializó. Úselo tras insertar HTML. |
| `AU.destroy(el)` | Destruye los componentes de un elemento (llama su limpieza). |
| `AU.components()` | Nombres de componentes registrados. |
| `AU.ready(fn)` | Ejecuta `fn` cuando el DOM está listo. |

## Tema y estructura

| Miembro | Ejemplo |
|---|---|
| `AU.setTheme('dark' \| 'light' \| 'system')` | `AU.setTheme('system')` |
| `AU.getTheme()` → `'light' \| 'dark'` | |
| `AU.toggleTheme()` | |
| `AU.theme.preference()` | Preferencia guardada. |
| `AU.theme.token('accent')` | Valor actual de `--au-accent`. |
| `AU.toggleSidebar(force?)` | Colapsa/expande la sidebar (≥ lg). |

## Diálogos (SweetAlert2)

```js
AU.success('Estudiante guardado');                         // también error, warning, info
AU.alert('Texto', 'warning', () => {...}, { title: 'Ojo' });
AU.toast('Pago registrado');                               // tipo por defecto: success
AU.toastError('No se pudo guardar');                       // toastSuccess/Warning/Info
if (await AU.confirm('¿Publicar?', 'Se notificará a 1,248 tutores.')) {...}
if (await AU.confirm({ title, text, confirmText: 'Publicar', variant: 'primary' })) {...}
await AU.confirmDelete('Se eliminará a Camila Reyes.');    // confirmDanger, confirmInsert, confirmUpdate, confirmDeleteByName(nombre)
AU.loading('Importando estudiantes…');  …  AU.close();      // AU.loading(false) también cierra
AU.btnLoading(boton, true);  …  AU.btnLoading(boton, false);
```

## Modales (Bootstrap)

`AU.openModal(selector, datos?)` · `AU.closeModal(selector)` · `AU.toggleModal(selector, datos?)` · `AU.getModal(selector)` (instancia de Bootstrap) · `AU.destroyModal(selector)` · `AU.getModalData(selector)` · `AU.setModalTitle(selector, texto)` · `AU.setModalBody(selector, html)` (sanitizado) · `AU.setModalContent(selector, { title, body })` · `AU.onModalOpen(selector, fn(datos, el))` · `AU.onModalClose(selector, fn)` → cada `on*` devuelve una función para dejar de escuchar.

## Retroalimentación en la página

| Miembro | Descripción |
|---|---|
| `AU.busy(region, true \| false, { label })` | Atenúa la región, superpone un spinner y pone `aria-busy`; al liberar restaura el estado previo. |
| `AU.isBusy(region)` | `true` si `aria-busy="true"`. |
| `AU.progress(barra, valor, { max, label })` | Actualiza `.progress` con ARIA (`aria-valuenow`, `aria-valuetext`). Devuelve el valor acotado. Emite `au:progress:change`. |
| `AU.inlineAlert(mensaje, { variant, title, dismissible, container, prepend })` | Alerta de Bootstrap con texto plano. `variant: 'error'` = `danger`. Contenedor por defecto: `[data-au-alerts]`, `main` o `body`. |
| `AU.dismissInlineAlert(alerta)` | Cierra con animación. |

Pestañas accesibles: envuelva un `.nav` de Bootstrap en `<div data-au-tabs>` y la plantilla completa `role`, `aria-controls`, `aria-labelledby` y `tabindex` (ver `docs/03-componentes.md`). Emite `au:tabs:change`.

## DOM

`AU.q(selector, root?)` · `AU.qa(selector, root?)` (arreglo) · `AU.el(tag, attrs?, texto?)` (sin innerHTML) · `AU.show(x)` · `AU.hide(x)` · `AU.toggle(x, force?)` · `AU.isHidden(x)` · 🕒 `AU.toggleFullscreen(x?)` → `boolean` · `AU.isFullscreen()`.

`AU.on(destino, tipo, fn, opts?)` devuelve la función para quitar. `destino` puede ser un elemento o un selector. Con `{ delegate: 'selector' }` escucha en el contenedor y llama `fn(evento, coincidencia)` solo si el clic nace dentro de un elemento que cumple el selector (tablas y listas que cambian):

```js
AU.on('#tabla-estudiantes', 'click', (e, btn) => editar(btn.dataset.id), { delegate: '[data-editar]' });
```

## Formularios y validación

| Miembro | Descripción |
|---|---|
| 🕒 `AU.validForm(form, esquema?)` | Valida con el esquema (`data-au-validate` por defecto), pinta errores y devuelve `{ valid, data }`. |
| `AU.serializeForm(form)` | Objeto plano; campos repetidos → arreglo; `select[multiple]` → arreglo. |
| `AU.showErrors(form, { campo: 'mensaje' }, general?)` | Pinta errores (p. ej. los del servidor). |
| `AU.clearErrors(form)` | |
| 🕒 `AU.validate(nombreOFabrica, datos)` | `{ success, data, errors }` sin tocar el DOM. |
| `AU.registerSchema(nombre, (z, campos) => esquema)` | Registra un esquema propio. `campos` trae `nombre()`, `email`, `password`, `cedula`, `rnc`, `telefono`, `fecha`, `monto`, `aceptar`. |
| 🕒 `AU.zod()` | Devuelve `z` para usos avanzados. |
| `AU.isValidCedula(v)` · `AU.isValidRnc(v)` · `AU.isValidPhone(v)` · `AU.isValidEmail(v)` | Puras, inmediatas. La cédula rechaza el municipio `000`; el teléfono exige 809/829/849. |
| `AU.isValidPlaca(v)` · `AU.isValidCurrency(v)` · `AU.isNullOrEmpty(v)` · `AU.isEmpty(v)` | Puras, inmediatas. `isEmpty` cubre arreglos, `Map`, `Set` y objetos vacíos; `0` y fechas no están vacíos. |
| 🕒 `AU.mask(input, 'cedula' \| 'rnc' \| 'telefono' \| 'moneda' \| 'entero' \| opcionesIMask)` | |

Ejemplo de esquema propio:

```js
AU.registerSchema('evaluacion', (z, f) => z.object({
  titulo: f.nombre('el título'),
  fecha: f.fecha,
  peso: z.coerce.number().min(1, { message: 'Mínimo 1 %.' }).max(100, { message: 'Máximo 100 %.' }),
}));
// <form data-au-validate="evaluacion" data-au-submit="ajax" action="/api/evaluaciones" method="post">
```

## Formato (es-DO)

`AU.formatCurrency(12500)` → `RD$ 12,500.00` · `AU.formatCompactCurrency(386450)` → `RD$ 386.5K` · `AU.formatNumber(1248)` → `1,248` · `AU.formatPercent(94.6)` → `94.6%` · `AU.formatDate('2026-11-08')` → `08/11/2026` · `AU.formatDateTime(...)` → `08/11/2026 2:30 p. m.` · `AU.formatRelative(fecha)` → `hace 5 minutos` · `AU.formatCedula` · `AU.formatRnc` · `AU.formatPhone` · `AU.initials('Ana Martínez')` → `AM` · `AU.date` (Day.js con locale `es-do`) · `AU.statusVariant('Vencido')` → `danger` · `AU.humanize(1234567)` → `1.2 M` · `AU.truncate(texto, 80)` (no parte emojis) · `AU.normalizeSpaces(texto)` · `AU.format.*` (todas juntas).

## Plantillas y seguridad

| Miembro | Descripción |
|---|---|
| 🕒 `AU.render('#tpl' \| 'texto', datos)` | Handlebars; arreglo → concatena. Helpers: `currency`, `number`, `percent`, `date`, `status`, `eq`. Resultado sanitizado (también filas `<tr>`). |
| `AU.registerHelper(nombre, fn)` | Helper propio. |
| `AU.sanitize(html)` | DOMPurify. |
| `AU.escapeHtml(texto)` | |

## API HTTP (neutro respecto al backend)

```js
AU.configureApi({
  baseURL: '/api/v1', timeout: 15000, retries: 1,               // retries: solo GET ante red caída o 5xx
  headers: { Authorization: 'Bearer …' },
  endpoints: { 'estudiante.ver': '/estudiantes/:id' },           // registro clave → ruta
  contextStrategy: { apply: (req, inst) => ({ ...req, headers: { ...req.headers, 'X-Institution-Id': inst?.id ?? '' } }) },
  onUnauthorized: (err) => console.warn(err.code),
});
const estudiantes = await AU.api.get('/estudiantes', { params: { grado: '4S' } });
await AU.api.post('/pagos', { estudiante: 12, monto: 12500 });     // put, patch, delete
const { data, meta } = await AU.request({ endpointKey: 'estudiante.ver', pathParams: { id: 42 } });
```

- `AU.api.*` devuelve `data`; `AU.request(spec)` devuelve `{ data, meta: { source, status } }`. `spec`: `method`, `url` o `endpointKey` + `pathParams`, `query`, `body`, `headers`, `signal`, `policy: { retries }`.
- Rutas relativas siempre; una URL absoluta solo si empieza por `baseURL`. Otra cosa rechaza con `INVALID_ARGUMENT` (no se envían cookies ni CSRF a terceros).
- `contextStrategy` decide cómo viaja la institución activa. Por defecto no se envía nada: la decisión D-02 sigue abierta.
- Un 401 pasa la sesión a `expired` y emite `au:session:expired`. La plantilla avisa y, si `au-config` trae `loginUrl`, redirige.
- Errores: ver [Errores](#errores). `ValidationError` trae `fieldErrors` → `AU.showErrors(form, err.fieldErrors, err.message)`.

## Cancelación y errores no controlados

```js
const scope = AU.createScope();
scope.on(window, 'resize', ajustar);                                  // se retira al destruir
const cursos = await AU.api.get('/cursos', { signal: scope.signal });
scope.destroy();                // cancela lo pendiente (CancelledError) y ejecuta limpiezas
try { … } catch (e) { AU.report(e, { context: 'importar-notas' }); }  // registra y emite au:app:error
```

Los errores globales (`error`, `unhandledrejection`) llegan solos al manejador central. Las cancelaciones no se reportan.

## Sesión, institución y contexto (datos del backend, autorización SOLO visual)

| Miembro | Descripción |
|---|---|
| `AU.session.status()` | `'unknown' \| 'unauthenticated' \| 'authenticated' \| 'expired'` |
| `AU.session.user()` | `{ id, displayName, roles, permissions, … }` o `null` |
| 🕒 `AU.session.resolve()` · 🕒 `AU.session.signOut()` | Usan los puertos conectados. |
| `AU.session.subscribe(fn)` | Devuelve la función para cancelar. |
| `AU.institution.status()` · `AU.institution.current()` | `'unknown' \| 'none' \| 'selected'` · `{ id, displayName, … }` |
| 🕒 `AU.institution.available()` · 🕒 `AU.institution.select(id)` · 🕒 `AU.institution.resolve()` | `select` sin puerto lanza error: el frontend no elige institución por su cuenta. |
| 🕒 `AU.configurePorts({ session, institution })` | Conecta el backend y vuelve a resolver. Ver `docs/06-integracion-backend.md` §3. |
| `AU.setContext({ user, institution, roles, permissions })` | Aplica datos que **ya vienen del backend** (p. ej. tras un `GET /me`). |
| `AU.getContext()` | Copia derivada de sesión + institución. |
| `AU.can('cobros.registrar')` · `AU.hasRole('teacher')` | Solo visibilidad. **No hay comodín para `super-admin`**: el backend envía la lista completa de permisos. |

Al cambiar, se actualizan `[data-au-bind]` y `[data-au-can]` (ocultos con `hidden` + `aria-hidden`) y se emite `au:context:changed`. Sin `#au-context` ni puertos, la sesión queda en `unauthenticated`: la plantilla **nunca inventa una identidad**.

## Librerías diferidas 🕒

| Miembro | Devuelve |
|---|---|
| `AU.openChart(canvas, spec)` | Instancia de Chart.js. `spec` = `{ type, labels, series:[{label,data,color}], format, target, stacked, min, max }`. |
| `AU.createDataTable(tabla, opciones?)` | Instancia de DataTables 2 (en español). |
| `AU.createSelect(select, opciones?)` | Instancia de Choices.js. |
| `AU.createDatepicker(input, opciones?)` | Instancia de Flatpickr (`d/m/Y`). |
| `AU.openCalendar(el, opciones?)` | Instancia de FullCalendar (ya renderizada). |
| `AU.editWithQuill(el, opciones?)` | `{ quill, getHTML(), setHTML(html) }` (HTML sanitizado). |
| `AU.exportRows({ rows, columns?, fileName?, sheetName?, format: 'xlsx' \| 'csv' })` | Nombre del archivo descargado. `AU.excelExport(...)` fuerza xlsx. |
| `AU.barcode(valor, { target? })` | `<svg>` CODE128. |
| `AU.qrcode(contenedor, dato, opciones?)` | `{ download(nombre?), update(dato) }`. |
| `AU.attachSignature(canvas, opciones?)` | `{ clear(), isEmpty(), toDataURL(), destroy() }`. |
| `AU.dragSort(lista, opciones?)` | Instancia de Sortable. |

## Archivos y utilidades

`AU.download(blob, nombre)` · 🕒 `AU.readText(file)` · 🕒 `AU.readJson(file)` · 🕒 `AU.copy(texto)` → `boolean` · `AU.groupBy(lista, fn)` · `AU.print()`.

`AU.openIframe(src, { title, width, height, sandbox, loading })` crea un `<iframe>` sin insertarlo. Solo acepta `http:`, `https:` o rutas relativas; `javascript:` y `data:` lanzan `ValidationError` con código `IFRAME_SRC_INVALID`.

`AU.assetUrl('/img/brand/logo.svg')` antepone `assetBaseUrl` de `au-config` (por ejemplo, un CDN).

`AU.customSet('nombre', (el, evento) => …)` · `AU.customGet('nombre')`: registran acciones propias. Un `<button data-au-action="nombre">` las ejecuta al hacer clic.

`AU.storeGet(clave, defecto)` · `AU.storeSet(clave, valor)` · `AU.storeRemove(clave)` guardan preferencias no sensibles con prefijo `au-` y son seguras en modo privado. Rechazan claves con `token`, `password`, `session`, `auth`, `secret` o `cookie` (`INVALID_ARGUMENT`). Al cerrar sesión o cambiar de institución se borran, salvo `theme` y `sidebar-collapsed`.

## Eventos `au:<ámbito>:<evento>`

```js
const off = AU.events.on('au:theme:changed', (e) => console.log(e.detail.theme));
AU.events.once(AU.events.names.APP_READY, …);   AU.events.off(nombre, fn);   AU.events.emit('au:mi-modulo:algo', { … });
```

| Constante (`AU.events.names`) | Evento | `detail` |
|---|---|---|
| `APP_READY` | `au:app:ready` | `{ session }`, una vez, tras resolver sesión e institución |
| `APP_ERROR` | `au:app:error` | `{ code, status }` |
| `COMPONENTS_READY` | `au:components:ready` | `{ root, count }` tras cada `AU.init` |
| `THEME_CHANGED` | `au:theme:changed` | `{ theme, preference }` |
| `SIDEBAR_TOGGLE` | `au:sidebar:toggle` | `{ collapsed }` |
| `FORM_SUBMIT` | `au:form:submit` | `{ form, data }` (formularios `data-au-submit="event"`) |
| `FORM_SUCCESS` | `au:form:success` | `{ form, data, response }` (modo `ajax`) |
| `FORM_ERROR` | `au:form:error` | `{ form, error }` (modo `ajax`; `error` es un `AppError`) |
| `RENDER_DONE` | `au:render:done` | `{ data }` (en el elemento con `data-au-render`) |
| `PROGRESS_CHANGE` | `au:progress:change` | `{ value, max, percent }` (en el `.progress`) |
| `TABS_CHANGE` | `au:tabs:change` | `{ tab, previous }` (en el `data-au-tabs`) |
| `SESSION_CHANGED` | `au:session:changed` | `{ from, to }` |
| `SESSION_EXPIRED` | `au:session:expired` | `{}` |
| `INSTITUTION_CHANGED` | `au:institution:changed` | `{ id, previous }` |
| `CONTEXT_CHANGED` | `au:context:changed` | `{ context }` |

> Cambio respecto a la 1.0: los nombres pasaron de `au:evento` a `au:ámbito:evento` (decisión 013). Tabla de equivalencias en `CHANGELOG.md`.

## Errores

Todo lo que la fachada lanza o rechaza es `AppError` o una subclase de `AU.errors`. Tiene `code`, `status?`, `fieldErrors` y `raw` (cuerpo del servidor; no lo registre).

| Clase | `code` | Cuándo |
|---|---|---|
| `AppError` | `APP_ERROR`, `INVALID_ARGUMENT`, `NOT_FOUND`, `LIB_LOAD_FAILED` | Base; argumentos y DOM; librería diferida que no descargó |
| `NetworkError` | `NETWORK_ERROR` | Sin respuesta del servidor |
| `TimeoutError` | `TIMEOUT_ERROR` | Se agotó `apiTimeoutMs` |
| `CancelledError` | `CANCELLED_ERROR` | `signal` abortado (p. ej. `scope.destroy()`) |
| `UnauthorizedError` | `UNAUTHORIZED` | 401 |
| `ForbiddenError` | `FORBIDDEN` | 403 |
| `NotFoundError` | `NOT_FOUND` | 404 |
| `ValidationError` | `VALIDATION_ERROR` | 400/422 (con `fieldErrors`), iframe inseguro |
| `ConflictError` | `CONFLICT` | 409 |
| `ExpiredPageError` | `PAGE_EXPIRED` | 419 (CSRF vencido) |
| `ServerError` | `SERVER_ERROR` | 5xx |
| `UnknownError` | `UNKNOWN_ERROR` | Lo demás |

```js
try { await AU.api.post('/pagos', datos); }
catch (e) {
  if (e instanceof AU.errors.ValidationError) AU.showErrors(form, e.fieldErrors, e.message);
  else if (e.code !== 'CANCELLED_ERROR') AU.toastError(e.message);
}
```
