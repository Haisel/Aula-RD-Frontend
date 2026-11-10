# Guía de integración

Cómo llevar una página de esta plantilla a su proyecto sin tocar nada más. Lea antes `AGENTS.md` (reglas) y `docs/04-api-au.md` (la fachada `AU`).

## 1. Qué se entrega

`npm run build` genera `dist/`: HTML, `css/app.css`, `js/app.js` (núcleo, ≤ 110 kB gzip), `js/demo.js` (solo las páginas de demostración) y `js/chunks/*` (librerías pesadas que cargan al usarse). Las páginas de ejemplo (`src/*.html`) usan Handlebars solo para armar el menú y los parciales; **el HTML resultante es estático**.

## 2. Pasos para usar una página en su proyecto

1. Copie del `dist/` la página que quiera (por ejemplo `ejemplo-tablas.html`) **y** las carpetas `css/`, `js/`, `fonts/` e `img/`.
2. Si la página tiene `<div data-demo="…">`, es una demostración: copie también `js/demo.js` o, mejor, reemplace ese código por el suyo (use el archivo `src/js/demo/<nombre>-page.js` como guía).
3. Cambie los datos de `data/*.json` por su API con `AU.api` (paso 4). Los JSON de `public/data/` son **ficticios**.
4. Reemplace el menú: el del `dist/` es el de la galería. En el proyecto fuente se define en `src/data/pages.js`.
5. Quite el aviso «Página de demostración» (`components/demo-note`) y el bloque «Cómo se usa» de la página.

## 3. Conectar su backend

```js
AU.configureApi({ baseURL: '/api/v1', timeout: 15000 });
const estudiantes = await AU.api.get('/estudiantes', { params: { grado: '4S' } });
```

- **HTTP solo por `AU.api` / `AU.request`.** No importe `axios` en páginas ni componentes.
- **Contexto de sesión:** el usuario, la institución, los roles y los permisos llegan de su servidor, ya sea en `<script type="application/json" id="au-context">` o con `AU.setContext(...)`. Nunca los invente en el navegador.
- **Autenticación:** use `data-au-submit="login"` o `AU.login()`. El token vive solo dentro del servicio de sesión (decisión 015); no existe `AU.token` ni se guarda en `localStorage`.
- **Institución activa:** viaja en la cabecera `X-Institution-Id` (decisión 014).

## 4. Seguridad: lo que el frontend no hace

`data-au-can` y `AU.can()` **solo ocultan** elementos. La autorización real, la validación de datos y los límites de archivos se repiten **en el servidor**. Todo HTML que venga de datos del usuario pasa por `AU.sanitize` (o `AU.render`, que ya lo hace).

## 5. Personalizar el diseño

- Colores, tipografía y espaciado: `src/tokens/tokens.json` → `npm run tokens`. **Nunca edite** `src/scss/abstracts/_tokens.scss` a mano.
- La escala actual es compacta (decisión 017). Para cambiarla, ajuste los tamaños de `tokens.json` y las variables de `src/scss/abstracts/_bootstrap-variables.scss`.
- Estilos propios: clases `au-*` en `src/scss/components/_<nombre>.scss`.

## 6. Comandos

| Necesito… | Ejecuto |
|---|---|
| Ver cambios en vivo | `npm run dev` |
| Validar todo | `npm run check` (lint → tipos → pruebas → build → presupuesto) |
| Regenerar tokens | `npm run tokens` |
| Regenerar la referencia JSDoc | `npm run docs` |
| API simulada para probar el login | `npm run mock` |

## 7. Lista de comprobación antes de publicar

- [ ] Los datos de `public/data/` no se usan: todo sale de su API.
- [ ] Sin `data-demo`, sin avisos de demostración y sin textos de relleno (términos, privacidad).
- [ ] `npm run check` en verde y `app.js` dentro del presupuesto.
- [ ] Probado en tema claro y oscuro, a 390 px y con teclado.
- [ ] El servidor valida y autoriza todo lo que el navegador solo oculta.

## 8. Dónde mirar

- Catálogo visual de componentes: `componentes.html`; galería por contexto: `galeria.html`.
- Referencia de la fachada `AU`: `referencia-au.html` y `docs/04-api-au.md`.
- Una página en blanco para empezar: `inicio-rapido.html`.
- Decisiones de diseño y de arquitectura: `docs/decisions/`.
