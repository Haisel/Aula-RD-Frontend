# 007-fachada-au

> Estado: Implementada (08/11/2026) · pendiente de aprobación · Versión 1.0 · ADR-008, ADR-012

## Objetivo
Exponer una única superficie global `window.AU`, inmutable, con funciones planas al estilo de `AR`, para que páginas y backends nunca dependan de librerías internas.

## Alcance
Diálogos, modales, DOM, formularios/validación, formato es-DO, plantillas, sanitización, API HTTP, contexto, tema, eventos, librerías diferidas, archivos. Referencia: `docs/04-api-au.md`.

## Exclusiones
Sesión/autenticación reales (port de `AR.session` queda para cuando exista el contrato de backend).

## Requisitos funcionales
| Id | Requisito |
|---|---|
| RF-01 | `window.AU` debe existir tras cargar `app.js`, estar congelado y no poder reasignarse. |
| RF-02 | Ninguna otra global propia (salvo `window.bootstrap` para uso avanzado). |
| RF-03 | Diálogos: `alert/success/error/warning/info`, `toast` (+ variantes), `confirm` (firma `AR` y objeto), `confirmDanger/Insert/Update/Delete/DeleteByName`, `loading/close`, `btnLoading`. |
| RF-04 | Validación: `validForm`, `validate`, `registerSchema` (fábrica), validadores puros de cédula, RNC, teléfono y correo. |
| RF-05 | Formato es-DO: moneda `RD$ 12,500.00`, fechas `DD/MM/AAAA`, hora `p. m.`, cédula, RNC, teléfono. |
| RF-06 | `AU.api` con CSRF automático y errores normalizados para Laravel/Express, ASP.NET, Django y texto. |
| RF-07 | `AU.render` debe escapar por defecto y sanitizar el resultado (incluidas filas de tabla). |
| RF-08 | Funciones que cargan librerías deben devolver `Promise` y rechazar con `AppError` tipado si falla la carga. |

## Requisitos no funcionales
| Id | Requisito | Medida |
|---|---|---|
| RNF-01 | Documentación | JSDoc en 100 % de funciones públicas (ESLint) y tipos verificados (`npm run typecheck`) |

## Criterios de aceptación
| Id | Dado | Cuando | Entonces | Prueba |
|---|---|---|---|---|
| CA-01 | Página cargada | `Object.isFrozen(AU)` | `true`; `AU = {}` no tiene efecto | Playwright 08/11/2026 |
| CA-02 | — | `AU.formatCurrency(12500)` | `RD$ 12,500.00` | `tests/format.test.js` |
| CA-03 | Cédula con verificador erróneo | `AU.isValidCedula(v)` | `false` | `tests/validators.test.js` |
| CA-04 | Respuesta 422 estilo Laravel | `AU.api.post` falla | `fieldErrors.email = [...]` | `tests/http.test.js` |
| CA-05 | ProblemDetails con `Email` | idem | `fieldErrors.email` | `tests/http.test.js` |
| CA-06 | Dato con `<img onerror>` | `AU.render('{{x}}', {x})` | Texto escapado, sin atributos peligrosos | Playwright + `tests/sanitize-status.test.js` |
| CA-07 | `AU.validate('login', {email:'x'})` | — | Mensajes en español por campo | `tests/validators.test.js` |

## Trazabilidad
`src/js/facade.js`, `src/js/app.js`, `src/js/components/dialogs.js`, `src/js/helpers/*`, `src/js/core/http.js`, `src/js/core/templates.js`.

## Aprobación
- [ ] Revisada por el propietario — fecha:
