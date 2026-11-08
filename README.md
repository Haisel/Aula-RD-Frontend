# Aula RD · Plantilla UI

Plantilla visual **neutra respecto al backend** (tipo AdminKit) para Aula RD, la plataforma SaaS de gestión escolar para instituciones de República Dominicana. Implementa la **línea gráfica B** (escudo navy, A turquesa, libro champagne) con **Bootstrap 5.3 + Sass + JavaScript ES Modules + Vite**, tema claro/oscuro, y una fachada JavaScript única: **`window.AU`**.

> Versión 0.1.0 · 08/11/2026 · Estado: implementada, **pendiente de aprobación** (ver `specs/` y `docs/decisions/`).

---

## 1. Qué obtiene al compilar

```
dist/
├─ css/app.css          Un solo CSS: Bootstrap + marca + temas de las librerías (72 KB gzip)
├─ js/app.js            Núcleo + fachada window.AU (97 KB gzip)
├─ js/chunks/*.js       Librerías pesadas: se descargan SOLO cuando una página las usa
├─ js/theme-boot.js     Aplica el tema antes de pintar (evita el destello claro→oscuro)
├─ fonts/               Plus Jakarta Sans (400–800) + Bootstrap Icons
├─ img/                 Logos, isotipos e íconos de app
├─ data/                Datos de ejemplo (fixtures) para las páginas demo
├─ favicon.ico · favicon.svg · manifest.webmanifest
└─ *.html               8 páginas de ejemplo
```

¿Necesita un único archivo JavaScript sin chunks (por ejemplo, porque su servidor no sirve módulos ES)? Use `npm run build:single`: genera un `js/app.js` clásico de 589 KB gzip con todo incluido.

## 2. Usarlo en CUALQUIER backend

Copie `dist/css`, `dist/js`, `dist/fonts` e `dist/img` a la carpeta pública de su proyecto (PHP, .NET, Node, Python, Java…) y en cada página:

```html
<!doctype html>
<html lang="es-DO">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="csrf-token" content="TOKEN_DE_SU_BACKEND">                    <!-- opcional -->
  <meta name="au-config" content='{"apiBaseUrl":"/api/v1"}'>                <!-- opcional -->
  <script src="/js/theme-boot.js"></script>
  <link rel="stylesheet" href="/css/app.css">
  <script type="module" src="/js/app.js"></script>
</head>
<body>
  …HTML con clases de Bootstrap/au-* y atributos data-au-*…
  <script type="application/json" id="au-context">{"user":{"name":"Ana"},"permissions":["cobros.registrar"]}</script>
</body>
</html>
```

No hay que inicializar nada a mano: los componentes se activan por atributo (`data-au-select`, `data-au-chart`, `data-au-validate`…). Guía completa: [`docs/06-integracion-backend.md`](docs/06-integracion-backend.md).

> Las páginas deben servirse por **http(s)** (los módulos ES no cargan desde `file://`). Para verlas localmente: `npm run preview`.

## 3. Requisitos y comandos

Node ≥ 20.19 (recomendado 22, ver `.nvmrc`).

| Comando | Qué hace |
|---|---|
| `npm install` | Instala dependencias (SheetJS se descarga de `cdn.sheetjs.com`, como en el proyecto original). |
| `npm run dev` | Servidor de desarrollo con recarga en `http://localhost:5173`. |
| `npm run build` | Genera `dist/` (núcleo + chunks diferidos + páginas). |
| `npm run build:single` | Genera `dist/` con un único `js/app.js` clásico. |
| `npm run preview` | Sirve `dist/` para revisar el resultado. |
| `npm run tokens` | Regenera `src/scss/abstracts/_tokens.scss` desde `src/tokens/tokens.json`. |
| `npm run lint` | ESLint (con reglas JSDoc) + Stylelint. |
| `npm run typecheck` | Verifica los tipos declarados en JSDoc (TypeScript `checkJs`, sin compilar TS). |
| `npm test` | Pruebas unitarias (Vitest + jsdom). |
| `npm run docs` | Genera la referencia técnica JSDoc en `docs/api/`. |
| `npm run format` | Prettier. |
| `npm run check` | Todo lo anterior en orden: lint → tipos → pruebas → build. **Obligatorio antes de entregar.** |

## 4. Páginas de ejemplo

| Página | Portal | Muestra |
|---|---|---|
| `index.html` | Público | Landing de suscripción: hero, módulos, pasos, planes (mensual/anual), FAQ, CTA |
| `suscribir.html` | Público | Registro de institución: máscaras RNC/cédula/teléfono, Choices, Flatpickr, validación Zod |
| `login.html` | Público | Inicio de sesión |
| `dashboard-superadmin.html` | Superadmin | KPIs, MRR con meta, planes (dona), DataTables, actividad, exportación |
| `dashboard-institucion.html` | Administración | KPIs, asistencia, progreso, cobros desde JSON (Handlebars), modal con formulario |
| `dashboard-docente.html` | Docente | Asistencia rápida, comunicado (Quill + Choices múltiple), calendario (FullCalendar) |
| `dashboard-tutor.html` | Estudiante/tutor | Rendimiento (líneas), carné con QR y código de barras, firma (Signature Pad) |
| `componentes.html` | — | Catálogo vivo de todo el sistema |

## 5. Documentación

| Documento | Para quién |
|---|---|
| [`AGENTS.md`](AGENTS.md) | Agentes de IA (OpenCode/Cody, Claude): reglas, comandos y flujo SDD |
| [`.sdd/constitution.md`](.sdd/constitution.md) | Principios obligatorios del proyecto |
| [`specs/`](specs/) | Especificaciones SDD por capacidad, con criterios de aceptación y trazabilidad |
| [`docs/01-arquitectura.md`](docs/01-arquitectura.md) | Capas, flujo de arranque, carga diferida, estructura de carpetas |
| [`docs/02-diseno-y-tokens.md`](docs/02-diseno-y-tokens.md) | Marca, tokens, temas, contraste, arquitectura SCSS |
| [`docs/03-componentes.md`](docs/03-componentes.md) | Clases `au-*`, atributos `data-au-*` y contratos de datos |
| [`docs/04-api-au.md`](docs/04-api-au.md) | Referencia de la fachada `AU` con ejemplos |
| [`docs/05-librerias.md`](docs/05-librerias.md) | Cada librería: para qué, versión, carga, tamaño |
| [`docs/06-integracion-backend.md`](docs/06-integracion-backend.md) | Cómo conectarla a cualquier backend |
| [`docs/07-accesibilidad.md`](docs/07-accesibilidad.md) | WCAG 2.2 AA: qué cumple la plantilla y qué debe cumplir usted |
| [`docs/08-calidad-y-convenciones.md`](docs/08-calidad-y-convenciones.md) | Nombres, JSDoc, pruebas, lint, definición de terminado |
| [`docs/decisions/`](docs/decisions/) | Decisiones arquitectónicas (ADR) 006–012 |
| `docs/api/` | Referencia técnica generada con JSDoc (`npm run docs`) |
