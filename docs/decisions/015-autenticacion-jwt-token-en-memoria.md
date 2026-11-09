# 015 — Autenticación JWT con token de acceso en memoria (opción A)

## Contexto
El backend de Aula RD es una API que autentica con JWT. JWT define el formato del token, no dónde lo guarda el navegador, y esa elección determina el riesgo ante XSS. La plantilla 0.2 enviaba cookies y un token CSRF (modelo de sesión de servidor) y no tenía `Authorization`.

## Opciones
1. **A — Token de acceso en memoria + token de renovación en cookie `httpOnly`.** Un XSS no puede leer ninguno de los dos del almacenamiento. Como máximo usa el token de acceso mientras dura. Al recargar se pide uno nuevo.
2. **B — Ambos tokens en cookies `httpOnly`.** Igual de resistente a XSS, pero ya no es "Bearer" y exige protección CSRF en toda la API.
3. **C — `localStorage`.** Lo más simple. Cualquier XSS roba el token completo. Contradice la constitución (S-11) y el `StorageService`, que rechaza claves sensibles.

## Decisión
Opción A, elegida por el propietario el 08/11/2026.
- `AuthService` (`src/js/services/auth-service.js`) guarda el token en un campo privado. No se escribe en ningún almacenamiento ni se expone en `window.AU`.
- `HttpClient` añade `Authorization: Bearer …` a cada solicitud de `AU.api` / `AU.request` (salvo `auth: false`).
- Renovación:
  - **proactiva** cuando quedan menos de `refreshMarginMs` (30 s; acotado a la mitad de la vida del token);
  - **reactiva** ante un 401: una sola renovación compartida entre solicitudes simultáneas y un único reintento por solicitud;
  - solo si la solicitud llevaba token: un visitante sin sesión no "expira".
- Al cargar la página, `restore()` pide un token a `refreshUrl` con la cookie. En páginas con JWT, los componentes con datos se activan **después** de tener token, usuario e institución. Así nunca salen sin `Authorization` ni `X-Institution-Id`.
- `withCredentials` solo hacia `loginUrl`, `refreshUrl` y `logoutUrl`; el resto del API va sin cookies (`apiCookies: false`).
- La institución sigue en la cabecera `X-Institution-Id` (decisión 014). El JWT identifica al usuario; la cabecera elige el colegio activo.
- Configuración: `au-config` → `"auth": { "loginUrl", "refreshUrl", "logoutUrl", "meUrl" }`, o `AU.configureAuth()`. Formularios: `data-au-submit="login"`.

## Consecuencias
- (+) Un script inyectado no encuentra tokens en `localStorage`, `sessionStorage`, `document.cookie` ni `AU`.
- (+) Todo el manejo de 401 y renovación vive en un solo lugar y está probado (renovación única, reintento único, sin bucles, sesión expirada solo si existía).
- (−) **Una llamada a `refreshUrl` en cada carga de página** (la plantilla es multipágina). El backend debe soportarlo sin problema de rendimiento.
- (−) **Pestañas múltiples:** cada pestaña renueva por su cuenta. Si el backend rota el token de renovación y detecta reutilización, dos pestañas que renuevan a la vez pueden cerrar la sesión. El backend debe dar un margen de gracia (unos segundos) al token anterior, o no rotar.
- (−) **Obligaciones del backend:** cookie `HttpOnly; Secure; SameSite=Strict; Path=/auth`; CORS con origen exacto y `Access-Control-Allow-Credentials: true` para las rutas de autenticación; tokens de acceso cortos (10–15 min); firma y expiración verificadas en cada solicitud.
- (−) El modo de sesión de servidor (cookies + CSRF, `#au-context`) sigue disponible para otros backends: sin `auth` en `au-config` todo funciona como en la 0.2.

## Estado: Aceptada
## Fecha: 2026-11-08
## Arquitecto: Claude · Aprobó: Haisel Ramírez (propietario)
