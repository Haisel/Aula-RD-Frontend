# 014 — Contexto institucional por cabecera (resuelve D-02)

## Contexto
Aula RD es multiinstitución. Una persona puede tener acceso a varias instituciones (un tutor con hijos en dos colegios, un docente en dos centros). El backend necesita saber en qué institución actúa cada solicitud. La Fase 4 dejó el mecanismo pendiente (D-02) y la spec 010 lo mantuvo así: por defecto no se enviaba nada.

## Opciones
1. **Cabecera HTTP** (`X-Institution-Id: <id>`). Las URLs no cambian; el frontend la añade en cada solicitud.
2. **Subdominio** (`san-rafael.aulard.do`). Necesita DNS y certificados comodín. El usuario con varias instituciones cambia de dominio y pierde la sesión, salvo con cookies compartidas.
3. **Segmento de ruta** (`/api/v1/instituciones/:id/...`). Explícito, pero obliga a reescribir todos los endpoints y a pasar el id en cada llamada.

## Decisión
Opción 1, elegida por el propietario el 08/11/2026.
- Cabecera por defecto: `X-Institution-Id`. Configurable con `institutionHeader` en `au-config`; vacía la desactiva.
- Valor: el `id` opaco de la institución activa (`AU.institution.current().id`), leído en el momento de cada solicitud.
- Sin institución activa (superadmin en vista global, login, landing), la cabecera no se envía. Nunca se inventa un valor.
- La envía `HttpClient` mediante `headerContextStrategy()`. Solo sale hacia rutas relativas o bajo `baseURL`; las URLs externas ya se rechazan.
- Se puede reemplazar en tiempo de ejecución: `AU.configureApi({ contextStrategy })`, o `null` para desactivarla.

## Consecuencias
- (+) Las URLs y endpoints no cambian; cambiar de institución no recarga ni cambia de dominio.
- (+) Un único punto en el cliente; las pruebas cubren el valor vigente, la ausencia y la validación del nombre.
- (−) **Obligación del backend:** validar en cada solicitud que el usuario autenticado pertenece a la institución de la cabecera. Si no pertenece, responder 403. Si la ruta exige institución y falta la cabecera, responder 400 o 403. La cabecera es una indicación del cliente, nunca una autorización.
- (−) Con API en otro origen (CORS), añadir la cabecera a `Access-Control-Allow-Headers`. Las peticiones con cabeceras propias disparan preflight `OPTIONS`.
- (−) Los registros y la caché del servidor deben incluir la cabecera (`Vary: X-Institution-Id`) si se cachean respuestas por institución.

## Estado: Aceptada
## Fecha: 2026-11-08
## Arquitecto: Claude · Aprobó: Haisel Ramírez (propietario)
