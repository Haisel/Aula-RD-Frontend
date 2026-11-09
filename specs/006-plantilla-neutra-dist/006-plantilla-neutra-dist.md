# 006-plantilla-neutra-dist

> Estado: Implementada (08/11/2026) · pendiente de aprobación · Versión 1.0 · ADR-007

## Objetivo
Entregar una plantilla visual utilizable con **cualquier backend**: al compilar, `dist/` contiene un CSS, un JS principal, fuentes, imágenes y páginas de ejemplo, sin acoplarse a Blade ni a otro motor.

## Contexto
Pedido del propietario: "plantilla visual primero neutra… que al hacer el build me dé un dist con un bundle css y uno js y los archivos de imágenes y fuentes (tipo AdminKit)". ADR-003 exige carga diferida de librerías pesadas.

## Alcance
- Build por defecto (ES modules + chunks diferidos) y build de archivo único (`build:single`).
- Generador de páginas de ejemplo con Handlebars en Node (`scripts/build-html.mjs`).
- Contratos de integración: `<meta name="au-config">`, `<meta name="csrf-token">`, `#au-context` (JSON), API JSON.

## Exclusiones
- Integración con un backend concreto. Rutas de servidor, autenticación real.
- Service worker / modo sin conexión.

## Requisitos funcionales
| Id | Requisito |
|---|---|
| RF-01 | `npm run build` debe producir `dist/css/app.css`, `dist/js/app.js`, `dist/js/chunks/*`, `dist/fonts/*`, `dist/img/*`, `dist/*.html`. |
| RF-02 | `npm run build:single` debe producir un único `dist/js/app.js` ejecutable con `<script defer>`. |
| RF-03 | Las páginas generadas deben usar rutas relativas (funcionar en subcarpetas). |
| RF-04 | El backend debe poder configurar `apiBaseUrl`, timeout y tema por defecto sin recompilar. |
| RF-05 | El backend debe poder entregar usuario, institución, roles y permisos como JSON en la página. |
| RF-06 | Las librerías pesadas solo se descargan si la página las usa. |

## Requisitos no funcionales
| Id | Requisito | Medida |
|---|---|---|
| RNF-01 | Peso del núcleo | `app.js` ≤ 110 KB gzip, medido con Vite (actual 107.7 KB). Límite original 100 KB; subido por la [decisión 016](../../docs/decisions/016-limite-de-peso-de-app-js.md) |
| RNF-02 | Peso del CSS | ≤ 80 KB gzip (actual 72 KB) |
| RNF-03 | Sin JS en línea | CSP `script-src 'self'` compatible |

## Criterios de aceptación
| Id | Dado | Cuando | Entonces | Prueba |
|---|---|---|---|---|
| CA-01 | Repositorio limpio | `npm ci && npm run build` | Existen los archivos de RF-01 | Build verificado |
| CA-02 | `dist/` servido por http | Se abre `dashboard-tutor.html` | QR, gráfico y firma funcionan; sin errores de consola | Playwright 08/11/2026 |
| CA-03 | `build:single` | Se abre la misma página | Funciona igual con un solo JS | Playwright 08/11/2026 |
| CA-04 | Página sin gráficos | Se carga | No se descarga el chunk de Chart.js | DevTools › Red |
| CA-05 | `<meta name="au-config" content='{"apiBaseUrl":"/api"}'>` | `AU.api.get('/x')` | Pide `/api/x` | Manual |

## Riesgos
- `file://` no carga módulos ES: documentado; usar `npm run preview` o `build:single`.
- SheetJS se instala desde `cdn.sheetjs.com`: requiere acceso a ese dominio en la máquina que ejecuta `npm install`.

## Trazabilidad
| Requisito | Archivos |
|---|---|
| RF-01/02/06 | `vite.config.js`, `src/js/adapters/lazy.js` |
| RF-03 | `scripts/build-html.mjs`, `src/partials/layouts/head.hbs` |
| RF-04 | `src/js/config/index.js` |
| RF-05 | `src/js/core/context.js` (`tests/excel-context.test.js`) |

## Aprobación
- [ ] Revisada por el propietario — fecha:
