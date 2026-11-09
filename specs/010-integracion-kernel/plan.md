# Plan — 010-integracion-kernel

> Estado: Borrador · Fecha: 08/11/2026 · Spec: [010-integracion-kernel.md](010-integracion-kernel.md)

## Situación de partida
Aprobada e implementada (08/11/2026, versión 1.1). Este plan no reabre el diseño: confirma que lo aprobado sigue cumpliéndose tras la spec 011 y deja visibles las preguntas que dependen del backend.

## Verificado el 08/11/2026
| Criterio | Resultado |
|---|---|
| CA-03, CA-04, CA-05, CA-06, CA-13 | Cubiertos por `tests/http-client.test.js` y `tests/services.test.js`; pasan dentro de las 181 pruebas de `npm run check` |
| CA-07 | Cubierto por `tests/kernel.test.js` |
| CA-12 | Cumple con el build normal: las 8 páginas cargan sin errores de JavaScript. **No repetido con `build:single`**, que en Windows no compila con `npm run` (ver spec 006) |

## Brechas
1. **CA-01, CA-02, CA-08 a CA-11 solo con revisión en navegador del 08/11/2026**, hecha antes de la 011. Conviene repetirlas porque la 011 cambió el arranque (los componentes con datos esperan token, usuario e institución).
2. **Información faltante sin respuesta** (dependen del backend): endpoints reales de sesión e institución, catálogo oficial de permisos por rol (necesario porque ya no hay comodín de superadmin) y si se activan reintentos en producción.
3. **Código sin confirmar.** Los cambios de `http-client.js`, `session-service.js`, `kernel.js`, `facade.js` y el resto de los archivos de la 010 y la 011 están modificados en el árbol de trabajo y sin commit.

## Enfoque
Repetir en navegador los criterios de la brecha 1 sobre el build actual; confirmar con el propietario el commit de la 010 junto con la 011 (o por separado, si se pueden separar los cambios); dejar las preguntas del backend como bloqueantes de la integración, no de esta spec.

## Riesgos
| Riesgo | Mitigación |
|---|---|
| La 011 rompió algo aprobado en la 010 | Repetir CA-01, CA-02 y CA-08 a CA-11 en navegador |
| Mezclar 010 y 011 en un solo commit dificulta revertir | Separar por archivos solo si el propietario lo pide |
