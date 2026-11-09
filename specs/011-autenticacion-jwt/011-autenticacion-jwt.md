# 011-autenticacion-jwt

> Estado: Aprobada (08/11/2026, por Haisel Ramirez) · Implementada (08/11/2026) · Versión 1.1
> Decisión de base: 015 (opción A, elegida por el propietario). Relacionadas: 010 (kernel), 014 (cabecera de institución).

## Objetivo
Que la plantilla se autentique contra la API JWT de Aula RD sin guardar tokens donde un script inyectado pueda leerlos, y que renueve la sesión de forma transparente para el usuario y para el código de las páginas.

## Alcance
| Pieza | Archivo | Qué hace |
|---|---|---|
| `AuthService` | `src/js/services/auth-service.js` | Login, renovación única, `restore()` al cargar, logout; token en memoria |
| Integración HTTP | `src/js/services/http-client.js` | `Authorization: Bearer`, renovación ante 401 con un reintento, `auth: false` por solicitud |
| Cableado | `src/js/kernel.js` | `configureAuth()`, `login()`, puertos de sesión (`meUrl`, logout) |
| Arranque | `src/js/app.js` | Con `auth` en `au-config`: token → `/me` → institución → componentes |
| Fachada | `src/js/facade.js` | `AU.configureAuth()`, `AU.login()`, `AU.logout()` |
| Formularios | `src/js/components/forms.js` | `data-au-submit="login"` |
| Configuración | `src/js/config/index.js` | `auth: { loginUrl, refreshUrl, logoutUrl, meUrl, refreshMarginMs, apiCookies }` |

## Exclusiones
- Verificar firmas JWT o leer permisos del token en el cliente. Solo se lee `exp` para saber cuándo renovar.
- Registro de usuarios, recuperación de contraseña y MFA: son pantallas y endpoints de una spec futura.
- Sincronizar el token entre pestañas (`BroadcastChannel`): por ahora cada pestaña renueva por su cuenta (riesgo R-02).

## Reglas de negocio
- RN-01 El token de acceso solo existe en memoria. Nunca en `localStorage`, `sessionStorage`, cookies legibles por JS, el DOM ni `window.AU`.
- RN-02 El token de renovación es una cookie `httpOnly` que pone y lee el backend. El frontend no la ve ni la envía a mano.
- RN-03 Ante un 401 en una solicitud que llevaba token: una renovación (compartida) y un reintento. Si la renovación falla, la sesión pasa a `expired` y se avisa una sola vez.
- RN-04 Ante un 401 sin token (visitante): la sesión queda en `unauthenticated` sin aviso ni redirección.
- RN-05 Si `login` responde 401/400 sin mensaje, se muestra "Correo o contraseña incorrectos.". Nunca se indica cuál de los dos falló.
- RN-06 Con JWT activo, ninguna solicitud de los componentes sale antes de conocer token, usuario e institución.

## Requisitos no funcionales
| Id | Requisito | Medida |
|---|---|---|
| RNF-01 | Llamadas de renovación | 1 por carga de página + 1 por vencimiento, aunque haya N solicitudes simultáneas |
| RNF-02 | Tokens cortos | Con `expiresIn` menor que el margen, no se renueva en cada solicitud (margen ≤ ½ de la vida del token) |
| RNF-03 | Superficie | Las rutas de `auth` solo pueden ser relativas o estar bajo `baseURL` |
| RNF-04 | Compatibilidad | Sin `auth` en `au-config`, el comportamiento es idéntico al de la 0.2 |

## Criterios de aceptación
| Id | Dado | Cuando | Entonces | Prueba |
|---|---|---|---|---|
| CA-01 | Credenciales válidas | `AU.login()` | Sesión `authenticated`, institución de `/me`, `data-au-can` y `data-au-bind` actualizados | Playwright con API simulada |
| CA-02 | Contraseña incorrecta | `AU.login()` | `UnauthorizedError` "Correo o contraseña incorrectos." | `tests/auth.test.js` + Playwright |
| CA-03 | Sesión iniciada | Se buscan tokens en `localStorage`, `sessionStorage`, `document.cookie`, `AU` | No aparecen | `tests/auth.test.js` + Playwright |
| CA-04 | Token vencido | 3 solicitudes simultáneas | 1 renovación, 3 respuestas correctas | `tests/auth.test.js` + Playwright |
| CA-05 | Renovación rechazada | Solicitud con 401 | `expired`, `au:session:expired` una vez, sin bucle | `tests/auth.test.js` |
| CA-06 | Página recargada con cookie válida | Arranca | Sesión restaurada; los componentes piden datos con `Bearer` y `X-Institution-Id` | Playwright |
| CA-07 | Visitante sin sesión | Un componente recibe 401 | `unauthenticated`, sin renovación ni aviso | `tests/auth.test.js`, `tests/services.test.js`, Playwright |
| CA-08 | `AU.logout()` | — | Token olvidado, cookie borrada por el servidor, siguiente solicitud 401 | Playwright |
| CA-09 | Token que vence en < margen | Solicitud | Se renueva antes de enviarla | `tests/auth.test.js` |
| CA-10 | `auth.refreshUrl` absoluta externa | `configureAuth` | `INVALID_ARGUMENT` | `tests/auth.test.js` |

## Información faltante
- Rutas reales de la API (por defecto en la documentación: `/auth/login`, `/auth/refresh`, `/auth/logout`, `/me`).
- Duración del token de acceso y del de renovación, y si se rota el de renovación (afecta a R-02).
- ¿La API y el frontend comparten dominio? Si no, hay que configurar CORS con credenciales en las rutas de autenticación.

## Riesgos
- R-01 **XSS sigue siendo grave.** Un script inyectado no roba el token, pero puede hacer solicitudes mientras la página está abierta. La defensa principal sigue siendo no inyectar HTML sin sanitizar (DOMPurify ya está en todos los puntos de la plantilla) y una CSP estricta.
- R-02 **Pestañas múltiples con rotación.** Ver decisión 015.

## Trazabilidad
`src/js/services/auth-service.js`, `src/js/services/http-client.js`, `src/js/services/session-service.js` (`handleUnauthorized`), `src/js/kernel.js`, `src/js/app.js`, `src/js/facade.js`, `src/js/components/forms.js`, `src/js/config/index.js`, `tests/auth.test.js`, `docs/04-api-au.md`, `docs/06-integracion-backend.md`.

## Verificación en navegador (08/11/2026)
Build compilado servido con `vite preview` (puerto distinto) y la API simulada `npm run mock` (`scripts/mock-api.mjs`, solo pruebas locales, usuario de demostración rotulado como fixture). La configuración `au-config` se inyectó antes del arranque de la página. Chrome en Windows.

| Criterio | Resultado | Detalle |
|---|---|---|
| CA-07 | Cumple | Visitante sin sesión: `AU.session.status() = unauthenticated`, `AU.institution.status() = none` |
| CA-02 | Cumple | Contraseña incorrecta: `UnauthorizedError`, "Correo o contraseña incorrectos."; la sesión sigue `unauthenticated` |
| CA-01 | Cumple | `AU.login()` correcto: sesión `authenticated`, institución `selected` tomada de `/me`, `AU.can('students.read')` verdadero y `AU.can('teachers.delete')` falso |
| CA-03 | Cumple | Ningún JWT en `localStorage`, `sessionStorage`, `document.cookie` (vacío: la cookie es `httpOnly`), `AU` ni el DOM |
| CA-06 | Cumple | Al recargar: `POST /auth/refresh` 200, luego `GET /me` 200; sesión restaurada. Las solicitudes de los componentes llevaron `Authorization: Bearer …` y `X-Institution-Id: inst-demo` |
| CA-08 | Cumple | `AU.logout()`: `POST /auth/logout` 204, sesión `unauthenticated`; `POST /auth/refresh` y `GET /me` posteriores dan 401 |
| CA-04, CA-05, CA-09, CA-10 | Sin repetir en navegador | Cubiertos por `tests/auth.test.js`; la API simulada tiene token de acceso de 15 min, lo que no permite ver el vencimiento sin esperar |

**Observación:** con `apiBaseUrl` configurado, las rutas relativas de datos (`data-au-source="data/cobros.json"`) se piden a la API, no a la página (404 en la API simulada). Es coherente con el diseño, pero conviene recordarlo al integrar: los fixtures de `public/data/` no se sirven desde la API.

**Límites:** una sola sesión de Chrome; `login.html` sigue en modo demostración (`data-au-submit="event"`). Primero se probó `AU.login()` y después, en la verificación de la spec 008, el envío del formulario real con `data-au-submit="login"` (cambiando el atributo): clave incorrecta da el error "Correo o contraseña incorrectos." y la sesión sigue `unauthenticated`; clave correcta deja la sesión `authenticated` sin token en `localStorage` ni `sessionStorage`.

## Aprobación
- [x] Revisada por el propietario — fecha: 08/11/2026 (Haisel Ramirez)
