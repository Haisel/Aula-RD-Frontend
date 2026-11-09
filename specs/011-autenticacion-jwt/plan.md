# Plan — 011-autenticacion-jwt

> Estado: Borrador · Fecha: 08/11/2026 · Spec: [011-autenticacion-jwt.md](011-autenticacion-jwt.md)

## Situación de partida
Implementada y pendiente de aprobación. Es la spec que bloquea el login real. Su código (`src/js/services/auth-service.js`, `tests/auth.test.js` y cambios en `kernel.js`, `facade.js`, `login.html`) está **sin commit**. El flujo SDD pide aprobar antes de implementar; aquí se hizo al revés, como reconoce `specs/README.md`.

## Verificado el 08/11/2026
| Criterio | Resultado |
|---|---|
| CA-02, CA-03, CA-04, CA-05, CA-07, CA-09, CA-10 | Cubiertos por `tests/auth.test.js` y `tests/services.test.js`; pasan dentro de las 181 pruebas de `npm run check` |
| Sin JWT en `AU` ni en el almacenamiento | Las pruebas lo cubren (CA-03); no repetido en navegador |

## Brechas
1. **CA-01, CA-06 y CA-08 dependían de una "API simulada"** y no se pueden repetir hoy: `scripts/mock-api.mjs` y `npm run mock`, que menciona `CLAUDE.md` como opcionales, **no existen en el repo**. Sin ellos no hay forma de reproducir el login, la restauración de sesión y el cierre de sesión en navegador.
2. **Información faltante sin respuesta** (la necesita el backend): rutas reales de la API, duración del token de acceso y del de renovación, rotación del token de renovación (afecta a R-02) y si API y frontend comparten dominio (si no, CORS con credenciales).
3. **Aprobación pendiente.** Hasta que el propietario la apruebe, el código ya escrito queda como borrador.
4. **Código sin commit** junto con el de la spec 010.

## Enfoque
Crear la API simulada (`scripts/mock-api.mjs` y `npm run mock`) con pruebas primero, para poder verificar CA-01, CA-06 y CA-08 en navegador; después repetir esos criterios; pedir la aprobación y recién entonces hacer el commit. La simulación va rotulada como fixture y no se presenta como datos reales.

## Riesgos
| Riesgo | Mitigación |
|---|---|
| La API simulada difiere de la real | Es solo para pruebas locales; las rutas reales se confirman con el backend (brecha 2) |
| El token de renovación no rota en el backend real (R-02) | Anotar la respuesta en la spec y, si cambia el diseño, en un ADR |
| Confiar en que el frontend protege algo | El frontend nunca es barrera de seguridad; `data-au-can` y `AU.can()` solo ocultan |
