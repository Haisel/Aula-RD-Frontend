# 010-integracion-kernel

> Estado: Aprobada e implementada (08/11/2026) · Versión 1.1
> Origen: núcleo y servicios de la Fase 4 de `E:\AulaRD` (SPEC-004) + plantilla `aulard-frontend` 1.0.

## Objetivo
Que la plantilla visual tenga el núcleo de la aplicación: errores tipados, eventos, sesión, institución activa, autorización visual y un cliente HTTP con contexto institucional. Todo detrás de una sola fachada, `AU`, sin inventar identidad. El mecanismo de contexto (D-02) se resolvió con una cabecera (decisión 014).

## Alcance
| Pieza | Origen | Destino | Cambio principal |
|---|---|---|---|
| Taxonomía de errores | `src/js/core/errors.js` | `core/errors.js` | Se añade `ExpiredPageError` (419). `name` explícito (sobrevive a la minificación). Las subclases traen `fieldErrors` y `raw`. |
| `EventBus` | `core/event-bus.js` | `core/events.js` | Prefijo `ar:` → `au:`. Bus compartido sobre `document`. |
| `Logger` | `core/logger.js` | `core/logger.js` | Redacta claves sensibles en objetos. `child(contexto)`. |
| `ErrorHandler` | `core/error-handler.js` | `core/error-handler.js` | Ignora cancelaciones. |
| `Scope` | `core/scope.js` | `core/scope.js` | `child()`. Expuesto como `AU.createScope()`. |
| `ServiceContainer` | `core/container.js` | `core/container.js` | Solo lo usa `kernel.js` (no se expone). |
| `ModuleLoader` | `core/module-loader.js` | `core/module-loader.js` | Contrato parcial. Sin cambios de comportamiento; no se expone. |
| `HttpClient` | `services/api/http-client.js` | `services/http-client.js` | Usa la instancia de axios con CSRF. No antepone `baseURL` (axios ya lo hace; evitaba `/api/v1/api/v1`). Admite rutas relativas sin `/`. |
| `SessionService` | `services/auth/session-service.js` | `services/session-service.js` | `apply(resultado)` para datos que ya vienen del backend. `setPorts()`. |
| `InstitutionContext` | `services/institution/institution-context.js` | `services/institution-context.js` | `apply()`, `setPorts()`, `available()`. `select()` sin puerto lanza error. |
| `AccessPolicy` | `services/auth/access-policy.js` | `services/access-policy.js` | `data-ar-requires` → `data-au-can`. Se elimina el comodín de `super-admin` de la plantilla 1.0. |
| `StorageService` | `services/storage/storage-service.js` | `core/storage.js` | Separador `au-` (compatible con `theme-boot.js`). `clear()` borra solo `au-*`. |
| Cableado de `app.js` | `src/js/app.js` | `kernel.js` | Mismas reacciones; el aviso se inyecta (`notify`). |
| Helpers | `helpers/**` | `helpers/validators.js`, `strings.js`, `format.js`, `browser.js` | `isValidPlaca`, `isValidCurrency`, `isNullOrEmpty`, `isEmpty`, `truncate`, `normalizeSpaces`, `humanize`, `toggleFullscreen`, `openIframe`, `assetUrl`, `customSet/Get`, `AU.on` con `delegate`. |
| Componentes | `components/**` | `components/feedback.js`, `tabs.js`, `modal.js` | `busy`, `progress`, `inlineAlert`, `data-au-tabs`, `toggleModal`, `getModal`, `destroyModal`, `setModalContent`. |

## Exclusiones
- `window.AR`. La fachada única es `AU` (ADR 013).
- `ThemeService`, `dialogs`, `confirm`, `loading` y adaptadores de la Fase 4: la plantilla ya tiene equivalentes con la marca B.
- `select2.js`: jQuery está prohibido por la constitución.
- Endpoints reales de sesión e institución y caché offline: siguen pendientes del backend.
- Estilos de `src/styles/**` de la Fase 4: la línea gráfica vigente es la B.

## Reglas de negocio
- RN-01 La identidad, los roles, los permisos y la institución solo provienen del backend: el JSON `#au-context` impreso por el servidor, o los puertos configurados con `AU.configurePorts`. Sin ellos, la sesión queda en `unauthenticated` y la institución en `none`.
- RN-02 `AU.can()` y `data-au-can` son solo presentación. No hay comodín por rol.
- RN-03 La institución activa la decide el backend. `AU.institution.select(id)` sin puerto lanza error.
- RN-04 La institución activa viaja en la cabecera `X-Institution-Id` (configurable con `institutionHeader` en `au-config`, decisión 014). El valor se lee en el momento de cada solicitud. Sin institución activa, la cabecera no se envía. El backend valida la pertenencia en cada solicitud.
- RN-05 Al pasar de `authenticated` a `unauthenticated`, o al cambiar de una institución a otra, se borran las preferencias `au-*` salvo `theme` y `sidebar-collapsed`.
- RN-06 Ante un 401, la sesión pasa a `expired`, se emite `au:session:expired` una sola vez, se avisa al usuario y, si existe `loginUrl` (mismo origen), se redirige.

## Requisitos no funcionales
| Id | Requisito | Medida |
|---|---|---|
| RNF-01 | Peso del núcleo | `js/app.js` ≤ 110 KB gzip (medido: 105.3 KB; antes 97.1 KB) |
| RNF-02 | Seguridad HTTP | URLs absolutas fuera de `baseURL` rechazadas; reintentos solo en GET/HEAD/OPTIONS; nunca en 4xx |
| RNF-03 | Privacidad | El logger redacta `token`, `password`, `authorization`, `cookie`, `body`, `data` y `raw`; el almacenamiento rechaza claves sensibles |
| RNF-04 | Robustez | Un listener o un aviso que falla no impide notificar a los demás ni rompe el arranque |
| RNF-05 | Calidad | `npm run check` en verde; JSDoc en todo lo público |

## Criterios de aceptación
| Id | Dado | Cuando | Entonces | Prueba |
|---|---|---|---|---|
| CA-01 | Página sin `#au-context` ni puertos | Arranca | `AU.session.status() === 'unauthenticated'`, `AU.institution.status() === 'none'` | Playwright, superadmin |
| CA-02 | `#au-context` con usuario, institución y permisos | Arranca | Sesión `authenticated`; `data-au-bind` pintado; `data-au-can` sin permiso oculto | Playwright, institución |
| CA-03 | Respuesta 422 con `errors` | `AU.api.post` | Rechaza `ValidationError` con `fieldErrors` en camelCase | `tests/http-client.test.js` |
| CA-04 | Respuesta 503 en GET con `retries: 2` | `AU.api.get` | Reintenta; en POST no reintenta | `tests/http-client.test.js` |
| CA-05 | Respuesta 401 | Cualquier solicitud | `handleUnauthorized` una vez, `au:session:expired` una vez | `tests/http-client.test.js`, `tests/services.test.js` |
| CA-06 | `contextStrategy` configurada | Cambia la institución entre dos solicitudes | Cada solicitud lleva la institución vigente en ese momento | `tests/http-client.test.js` |
| CA-13 | Institución activa `inst-7` | Cualquier solicitud del cliente | Lleva `X-Institution-Id: inst-7`; sin institución no lleva la cabecera; un nombre inválido en `au-config` se registra y la página arranca igual | `tests/http-client.test.js` |
| CA-07 | `AU.createScope()` con solicitud en curso | `scope.destroy()` | Rechaza `CancelledError`; no se reporta como error | Playwright + `tests/kernel.test.js` |
| CA-08 | URL `https://evil.example/x` | `AU.api.get` | `INVALID_ARGUMENT`, no sale la solicitud | Playwright + pruebas |
| CA-09 | `AU.storeSet('token', …)` | — | `INVALID_ARGUMENT` | Playwright |
| CA-10 | Cambio de institución vía `AU.setContext` | — | Un solo `au:institution:changed`; `data-au-bind` actualizado | Playwright |
| CA-11 | `data-au-action="nombre"` registrado con `AU.customSet` | Clic | Se ejecuta la función | Playwright |
| CA-12 | 8 páginas, `build` y `build:single` | Se abren | Sin errores de consola | Playwright 08/11/2026 |

## Información faltante
- Endpoints reales de sesión (`/me`, `/logout`) e institución (`/institucion-activa`, `/mis-instituciones`).
- Catálogo oficial de permisos por rol (necesario porque ya no hay comodín de superadmin).
- ¿Se activan reintentos en producción (`apiRetries`)? Por defecto, 0.

## Riesgos
- R-01 **Nombres de eventos.** Los eventos de la 1.0 (`au:theme-change`, `au:submit`…) cambiaron. Ver la tabla de equivalencias en `CHANGELOG.md`.
- R-02 **Superadmin.** Si el backend no envía todos los permisos al superadmin, verá menos botones que en la 1.0. Es el comportamiento correcto según RN-02.

## Trazabilidad
`src/js/kernel.js`, `src/js/core/{errors,events,logger,error-handler,scope,container,module-loader,storage,http,context}.js`, `src/js/services/*.js`, `src/js/helpers/{validators,strings,format,browser}.js`, `src/js/components/{feedback,tabs,modal,misc,forms}.js`, `src/js/facade.js`, `src/js/app.js`, `src/scss/components/_feedback.scss`, `tests/{kernel,services,http-client,ported-helpers}.test.js`, `docs/04-api-au.md`, `docs/06-integracion-backend.md`.

## Aprobación
- [x] Revisada y aprobada por el propietario (Haisel Ramírez) — fecha: 08/11/2026
- Versión 1.1 (08/11/2026): RN-04 y CA-13 por la decisión 014 (D-02 resuelta: cabecera).
