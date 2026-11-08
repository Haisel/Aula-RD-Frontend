# 06 · Integración con cualquier backend

La plantilla no conoce su servidor. Se comunica con él por **cuatro contratos**: archivos estáticos, metadatos en el `<head>`, contexto JSON en la página y API HTTP JSON.

## 1. Archivos

Copie de `dist/` a su carpeta pública: `css/`, `js/` (incluida `js/chunks/`), `fonts/`, `img/`, `favicon.*`, `manifest.webmanifest`. Mantenga la estructura relativa (`css/` y `fonts/` como hermanas). Configure caché larga para `js/chunks/*` (llevan hash) y corta para `css/app.css` y `js/app.js`.

## 2. `<head>` mínimo

```html
<meta name="csrf-token" content="…">                                  <!-- si su backend usa CSRF -->
<meta name="au-config" content='{"apiBaseUrl":"/api/v1","apiTimeoutMs":20000}'>
<script src="/js/theme-boot.js"></script>
<link rel="stylesheet" href="/css/app.css">
<script type="module" src="/js/app.js"></script>      <!-- build:single → <script defer src="/js/app.js"> -->
```

`au-config` admite: `apiBaseUrl`, `apiTimeoutMs`, `apiRetries` (reintentos de GET ante red caída o 5xx; por defecto 0), `loginUrl` (ruta del mismo origen a la que se redirige tras un 401; vacía = no redirige), `assetBaseUrl` (base para `AU.assetUrl`), `defaultTheme` (`light|dark|system`), `locale`, `debug` (`true` muestra el log `debug` en consola; solo desarrollo).

## 3. Contexto de sesión e institución

Al final del `<body>`, el servidor imprime **datos** (no código):

```html
<script type="application/json" id="au-context">
{"user":{"name":"Ana Martínez","role":"Directora"},"institution":{"id":"san-rafael","name":"Colegio San Rafael","plan":"Profesional"},
 "roles":["institution-admin"],"permissions":["estudiantes.ver","cobros.registrar"]}
</script>
```

Serialícelo con el codificador JSON de su lenguaje (escapa `</script>`): PHP `json_encode($ctx, JSON_HEX_TAG)`, .NET `JsonSerializer.Serialize(ctx)`, Node `JSON.stringify(ctx).replace(/</g,'\\u003c')`, Python `json.dumps(ctx).replace('<','\\u003c')`.

Luego: `data-au-bind="institution.name"` muestra valores; `data-au-can="cobros.registrar"` oculta lo no permitido (**solo visual**; su API debe validar cada operación).

Desde la 1.1 ese JSON alimenta el núcleo: la sesión pasa a `authenticated`, la institución a `selected` y la política de acceso toma `roles` y `permissions`. Envíe `id` en `user` e `institution`: el cambio de institución se detecta por `id`.

**Alternativa por API: puertos.** Si prefiere no imprimir el contexto, conecte funciones que consulten su backend. La plantilla las llama al arrancar y cuando usted lo pida:

```js
await AU.configurePorts({
  session: {
    resolve: async () => {                       // GET /api/me → { user, roles, permissions } o 401
      try { const me = await AU.api.get('/me'); return { status: 'authenticated', user: { ...me.user, roles: me.roles, permissions: me.permissions } }; }
      catch { return { status: 'unauthenticated' }; }
    },
    signOut: () => AU.api.post('/logout'),
  },
  institution: {
    resolveCurrent: () => AU.api.get('/institucion-activa'),   // { id, name, plan } o null
    available: () => AU.api.get('/mis-instituciones'),
    select: (id) => AU.api.post('/institucion-activa', { id }),
  },
});
```

Sin contexto ni puertos, la sesión queda en `unauthenticated` y la institución en `none`. La plantilla nunca inventa identidad.

**Superadmin.** `AU.can()` ya no da todos los permisos a quien tenga el rol `super-admin`. Envíe la lista completa de permisos de cada rol: una sola regla, la de su backend.

**Cómo viaja la institución en cada petición (D-02, pendiente).** Por defecto no se añade nada; basta con la sesión del servidor. Si su API la necesita en cada solicitud, defina la estrategia una vez:

```js
AU.configureApi({ contextStrategy: { apply: (req, inst) => ({ ...req, headers: { ...req.headers, 'X-Institution-Id': inst?.id ?? '' } }) } });
```

La estrategia lee la institución vigente en cada solicitud. Su backend debe comprobar siempre que el usuario pertenece a esa institución.

## 4. API HTTP

**Petición.** `AU.api` envía `Accept: application/json`, `X-Requested-With: XMLHttpRequest`, cookies (`withCredentials`) y, si hay `<meta name="csrf-token">`, `X-CSRF-TOKEN` y `X-XSRF-TOKEN`. Para un token Bearer: `AU.configureApi({ headers: { Authorization: 'Bearer …' } })`.

**Errores.** Responda con el código HTTP correcto y alguno de estos cuerpos; la plantilla los entiende todos:

```json
{ "message": "Revise los datos.", "errors": { "email": ["Ya está registrado."] } }           // Laravel, Express, Nest
{ "title": "Validation failed", "errors": { "Email": ["Required"] } }                        // ASP.NET ProblemDetails
{ "detail": "No autorizado." }                                                               // Django REST
{ "error": "Texto" }   ·   "Texto plano"
```

Las claves de `errors` deben coincidir con el `name` de los campos (PascalCase se convierte a camelCase). Con `data-au-submit="ajax"` se pintan solas debajo de cada campo.

Cada respuesta de error llega como una clase de `AU.errors` (`ValidationError`, `ForbiddenError`, `ServerError`…, ver `docs/04-api-au.md` §Errores). Si no envía `message`, se usa uno en español: sin conexión, 401 (sesión expirada), 403, 404, 419, 400/422 y 5xx.

Ante un **401**: la sesión pasa a `expired`, se emite `au:session:expired` y se llama `onUnauthorized`. La plantilla muestra un aviso y, si `au-config` tiene `loginUrl`, redirige allí. Solo **reintenta** lecturas `GET` ante fallos de red o 5xx, y solo con `apiRetries > 0`; nunca reintenta un 4xx ni una escritura.

## 5. Formularios: tres modos

| Modo | Uso típico | Qué pasa al enviar un formulario válido |
|---|---|---|
| `native` (por defecto) | Backends con formularios clásicos (PHP, MVC) | `form.submit()` normal al `action` |
| `ajax` | APIs JSON | `AU.api` envía JSON al `action` con el `method`; éxito → `data-au-success` (toast) y `data-au-redirect`; error → mensajes por campo |
| `event` | Lógica propia | Emite `au:form:submit` con `{ form, data }` |

```js
// Modo event:
document.addEventListener('au:form:submit', async (e) => {
  if (e.target.id !== 'form-estudiante') return;
  try { await AU.api.post('/estudiantes', e.detail.data); AU.toastSuccess('Estudiante guardado'); }
  catch (err) { AU.showErrors(e.target, err.fieldErrors, err.message); }
});
```

## 6. Datos para componentes

Cambie las URL de ejemplo (`data/*.json`) por sus endpoints. Formas exactas en `docs/03-componentes.md` §4. Para tablas grandes con paginación en servidor use `AU.createDataTable(tabla, { serverSide: true, ajax: { url, dataSrc: 'data' } })` (opciones nativas de DataTables 2).

## 7. Contenido dinámico

Después de insertar HTML que contenga `data-au-*` (respuesta AJAX, modal cargado), llame `AU.init(contenedor)`.

## 8. Política de seguridad de contenido (CSP)

Funciona con `script-src 'self'` (no hay JS en línea; el contexto es `application/json`). SweetAlert2, Choices y Flatpickr insertan estilos en línea: añada `style-src 'self' 'unsafe-inline'` o use nonces si su backend los soporta. Las fuentes son locales (`font-src 'self'`).
