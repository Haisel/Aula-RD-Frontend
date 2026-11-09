# 03 · Componentes, atributos y contratos de datos

Catálogo vivo: `componentes.html`. Todo se usa con **clases** (estilo) y **atributos `data-au-*`** (comportamiento). No requiere JavaScript propio.

## 1. Estructura de dashboard

```html
<div class="au-app" data-au-app>
  <aside class="au-sidebar offcanvas-lg offcanvas-start" id="au-sidebar">
    <nav class="au-sidebar-body">…<a class="nav-link active" aria-current="page">…</a>…</nav>
  </aside>
  <div class="au-main">
    <header class="au-topbar">… <button data-au-sidebar-toggle> … <button data-au-theme-toggle> …</header>
    <main id="contenido" class="au-content">…</main>
  </div>
</div>
```
- ≥ lg: sidebar fija; `data-au-sidebar-toggle` la colapsa a 76 px (se recuerda). < lg: offcanvas (`data-bs-toggle="offcanvas" data-bs-target="#au-sidebar"`).
- Si el backend no marca `.active`, la sidebar marca el enlace cuyo `href` coincide con la página.
- Superadmin: `<span class="au-role-chip">Superadmin</span>`. Institución: `<button class="au-tenant">` con nombre y plan.

## 2. Clases de estilo

| Clase | Qué es |
|---|---|
| `btn btn-primary · btn-outline-primary · btn-accent · btn-ghost · btn-link · btn-danger · btn-inverse · btn-outline-inverse` | Botones (accent y inverse solo en landing/bandas) |
| `au-btn-icon` | Botón cuadrado solo ícono (requiere `aria-label`) |
| `is-loading` (en `.btn`) | Spinner; use `AU.btnLoading()` |
| `au-page-header` `au-page-title` `au-page-subtitle` `au-page-actions` | Encabezado de página |
| `au-stat` `au-stat-label` `au-stat-icon[.is-warning/.is-danger/.is-success/.is-info/.is-lg]` `au-stat-value` `au-stat-delta[.is-up/.is-down/.is-warning]` | KPI |
| `card` + `au-card-header` `au-card-title` `au-card-subtitle` | Tarjeta |
| `au-table-card` `au-table-toolbar` `au-table-footer` · `au-cell-entity` `au-cell-meta` | Tabla en tarjeta |
| `au-status au-status-{success,warning,danger,info,neutral,brand}` | Estado en píldora (punto + texto) |
| `au-plan`, `au-plan-pro`, `au-plan-premium` | Etiqueta de plan |
| `alert alert-{success,warning,danger,info}` + `au-alert-title` | Alerta con ícono |
| `au-chart[.is-sm]` + `au-legend` | Contenedor de gráfico (240 / 180 px) |
| `au-feed` · `au-date-tile` | Lista de actividad / eventos |
| `au-empty` | Estado vacío |
| `au-choice` | Opción seleccionable con radio (planes) |
| `au-form-section` · `form-label.is-required` | Secciones de formulario / asterisco |
| `au-grid-kpi` · `au-grid-auto` · `au-split > .is-main + .is-side` | Rejillas |
| `au-w-0 … au-w-100` | Ancho % (barras de progreso, sin estilos en línea) |
| `au-signature` | Lienzo de firma |
| Landing: `au-navbar` `au-hero` `au-section[.is-alt]` `au-section-head[.is-center]` `au-feature` `au-step` `au-pricing[.is-featured]` `au-billing-toggle` `au-band` `au-cta` `au-footer` `au-logo-light/au-logo-dark` | |
| Auth: `au-auth` `au-auth-aside` `au-auth-main` `au-auth-form[.is-narrow]` | |

## 3. Atributos de comportamiento

| Atributo | Elemento | Efecto | Opciones |
|---|---|---|---|
| `data-au-app` | contenedor | Estructura de dashboard | — |
| `data-au-sidebar-toggle` | button | Colapsa la sidebar | — |
| `data-au-theme-toggle` / `data-au-theme-set="dark"` | button | Tema | — |
| `data-au-navbar` | header | `.is-scrolled` al desplazarse | — |
| `data-au-validate="esquema"` | form | Validación Zod | `data-au-submit="native\|ajax\|event"`, `data-au-success`, `data-au-redirect`, `[data-au-form-error]` dentro |
| `data-au-mask` | input | Máscara | `cedula`, `rnc`, `telefono`, `moneda`, `entero` |
| `data-au-select` | select | Choices.js | `multiple`, `data-au-placeholder`, `data-au-create="true"` |
| `data-au-datepicker` | input | Flatpickr | `="range"`, `="datetime"`, `data-au-min`, `data-au-max` |
| `data-au-password-toggle="#id"` | button | Mostrar/ocultar | — |
| `data-au-confirm="texto"` | a / button | Confirma antes de seguir | `data-au-confirm-title`, `-text`, `-variant="danger"` |
| `data-au-action` | button | Diálogo declarativo o acción propia | `success\|error\|warning\|info\|toast\|confirm\|confirm-delete\|loading\|print`, `data-au-message`, `data-au-type`, `data-au-duration`. Cualquier otro nombre ejecuta la función registrada con `AU.customSet(nombre, (el, evento) => …)` |
| `data-au-tabs` | contenedor de un `.nav` | Pestañas accesibles: completa `role`, `aria-controls`, `aria-labelledby`, `tabindex`; emite `au:tabs:change` | botones con `data-bs-target="#panel"` |
| `data-au-alerts` | contenedor | Destino por defecto de `AU.inlineAlert()` | — |
| `data-au-chart="url\|json"` | canvas | Chart.js | Ver contrato §4 |
| `data-au-datatable` | table | DataTables 2 | `data-au-page-length`, `data-au-no-sort="5,6"`, `data-au-order='[[0,"asc"]]'` |
| `data-au-render="#tpl"` + `data-au-source="url\|json"` | contenedor / tbody | Pinta JSON con Handlebars | `data-au-path="data.items"` |
| `data-au-export="#tabla"` | button | Descarga la tabla | `data-au-format="csv"`, `data-au-filename` |
| `data-au-calendar="url\|json"` | div | FullCalendar | `data-au-view`, `data-au-initial-date` |
| `data-au-editor` | div | Quill | `data-au-input="#hidden"`, `data-au-placeholder` |
| `data-au-signature` | canvas | Signature Pad | `data-au-input="#hidden"`; botón `data-au-signature-clear="#canvas"` |
| `data-au-sortable` | ul/ol | SortableJS | `data-au-input="#hidden"`, hijos con `data-id`, asa `data-au-handle` |
| `data-au-barcode="valor"` | svg | JsBarcode | — |
| `data-au-qrcode="dato"` | div | QR con la marca | `data-au-size` |
| `data-au-billing` | grupo | Mensual/anual | botones `data-au-billing-option`, precios `data-au-price-mensual/anual`, `[data-au-period-label]` |
| `data-au-relative-time="ISO"` | time | "hace 5 minutos" | — |
| `data-au-format` | cualquiera | Formatea su texto | `currency`, `compact-currency`, `number`, `percent`, `date`, `cedula`, `rnc`, `phone` |
| `data-au-bind="user.name"` | cualquiera | Texto del contexto | — |
| `data-au-can="permiso"` | cualquiera | Oculta si falta el permiso (solo visual) | — |
| `data-bs-toggle="tooltip"` | cualquiera | Tooltip de Bootstrap | `data-bs-title` |

## 4. Contratos de datos (lo que su API debe devolver)

**Gráfico** (`data-au-chart` / `AU.openChart`):
```json
{ "type": "bar|line|doughnut", "labels": ["Lun","Mar"],
  "series": [{ "label": "Esta semana", "data": [95.1, 96.0], "color": "accent|navy|gold|primary|muted|success|warning|danger|info" }],
  "format": "number|currency|compact-currency|percent", "target": { "value": 450000, "label": "Meta" },
  "stacked": false, "min": 0, "max": 100 }
```

**Calendario** (`data-au-calendar`): arreglo de eventos FullCalendar `{ "title", "start", "end"?, "allDay"?, "className"?: "au-event-accent|au-event-navy|au-event-gold|au-event-danger" }`.

**Render** (`data-au-render`): cualquier arreglo u objeto; `data-au-path` elige una propiedad anidada (p. ej. `data.items` en respuestas paginadas).

**Errores de API**: ver `docs/06-integracion-backend.md` §4.

## 5. Estados de interacción

Todos los controles tienen hover, foco visible (`focus-ring` 2 px + halo), activo y deshabilitado. Validación: `.is-invalid` + `.invalid-feedback` enlazado por `aria-describedby`; foco al primer error. Carga: `aria-busy="true"` en el elemento mientras se descarga su librería; si falla, `data-au-error` y mensaje.
