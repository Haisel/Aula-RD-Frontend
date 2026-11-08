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

`AU.openModal(selector, datos?)` · `AU.closeModal(selector)` · `AU.getModalData(selector)` · `AU.setModalTitle(selector, texto)` · `AU.setModalBody(selector, html)` (sanitizado) · `AU.onModalOpen(selector, fn(datos, el))` · `AU.onModalClose(selector, fn)` → cada `on*` devuelve una función para dejar de escuchar.

## DOM

`AU.q(selector, root?)` · `AU.qa(selector, root?)` (arreglo) · `AU.el(tag, attrs?, texto?)` (sin innerHTML) · `AU.on(target, tipo, fn, opts?)` → función para quitar · `AU.show(x)` · `AU.hide(x)` · `AU.toggle(x, force?)`.

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
| `AU.isValidCedula(v)` · `AU.isValidRnc(v)` · `AU.isValidPhone(v)` · `AU.isValidEmail(v)` | Puras, inmediatas. |
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

`AU.formatCurrency(12500)` → `RD$ 12,500.00` · `AU.formatCompactCurrency(386450)` → `RD$ 386.5K` · `AU.formatNumber(1248)` → `1,248` · `AU.formatPercent(94.6)` → `94.6%` · `AU.formatDate('2026-11-08')` → `08/11/2026` · `AU.formatDateTime(...)` → `08/11/2026 2:30 p. m.` · `AU.formatRelative(fecha)` → `hace 5 minutos` · `AU.formatCedula` · `AU.formatRnc` · `AU.formatPhone` · `AU.initials('Ana Martínez')` → `AM` · `AU.date` (Day.js con locale `es-do`) · `AU.statusVariant('Vencido')` → `danger` · `AU.format.*` (todas juntas).

## Plantillas y seguridad

| Miembro | Descripción |
|---|---|
| 🕒 `AU.render('#tpl' \| 'texto', datos)` | Handlebars; arreglo → concatena. Helpers: `currency`, `number`, `percent`, `date`, `status`, `eq`. Resultado sanitizado (también filas `<tr>`). |
| `AU.registerHelper(nombre, fn)` | Helper propio. |
| `AU.sanitize(html)` | DOMPurify. |
| `AU.escapeHtml(texto)` | |

## API HTTP (Axios, neutro respecto al backend)

```js
AU.configureApi({ baseURL: '/api/v1', timeout: 15000, headers: { 'X-Tenant': 'san-rafael' },
                  onUnauthorized: () => location.assign('/login.html') });
const estudiantes = await AU.api.get('/estudiantes', { params: { grado: '4S' } });
await AU.api.post('/pagos', { estudiante: 12, monto: 12500 });     // put, patch, delete
```

Errores: siempre `{ status, message, fieldErrors, raw }` (entiende Laravel/Express, ASP.NET ProblemDetails, Django REST, `{error}` y texto). Úselo con `AU.showErrors(form, err.fieldErrors, err.message)`.

## Contexto (solo presentación)

`AU.setContext({ user, institution, roles, permissions })` · `AU.getContext()` (copia) · `AU.can('cobros.registrar')` · `AU.hasRole('teacher')`. Al cambiar, se actualizan `[data-au-bind]` y `[data-au-can]` y se emite `au:context-change`.

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

`AU.download(blob, nombre)` · 🕒 `AU.readText(file)` · 🕒 `AU.readJson(file)` · 🕒 `AU.copy(texto)` → `boolean` · `AU.groupBy(lista, fn)` · `AU.print()` · `AU.storeGet(clave, defecto)` · `AU.storeSet(clave, valor)` (prefijo `au-`, seguro en modo privado).

## Eventos `au:*`

```js
const off = AU.events.on('au:theme-change', (e) => console.log(e.detail.theme));
AU.events.once('au:ready', …);   AU.events.emit('au:mi-evento', { … });   AU.events.names  // constantes
```

| Evento | `detail` |
|---|---|
| `au:theme-change` | `{ theme, preference }` |
| `au:submit` | `{ form, data }` (formularios `data-au-submit="event"`) |
| `au:form-success` | `{ form, data, response }` (modo `ajax`) |
| `au:form-error` | `{ form, error }` (modo `ajax`) |
| `au:sidebar-toggle` | `{ collapsed }` |
| `au:context-change` | `{ context }` |
| `au:rendered` | `{ data }` (en el elemento con `data-au-render`) |
| `au:ready` | `{ root, count }` tras cada `AU.init` |

## Errores

Todo lo que la fachada rechaza es `AppError` con `code`: `LIB_LOAD_FAILED`, `INVALID_ARGUMENT`, `NOT_FOUND`, `HTTP_ERROR`.
