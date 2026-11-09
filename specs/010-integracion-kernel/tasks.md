# Tareas — 010-integracion-kernel

> Estado: Borrador · Fecha: 08/11/2026 · Plan: [plan.md](plan.md) · Spec: [010-integracion-kernel.md](010-integracion-kernel.md)

Leyenda: `[x]` hecho · `[ ]` pendiente · `P` en paralelo. Cada tarea termina con `npm run check` en verde.

## Hecho (verificado el 08/11/2026)
- [x] CA-03 a CA-07 y CA-13 cubiertos por pruebas automáticas (181 en verde)
- [x] CA-12 con el build normal: 8 páginas sin errores de JavaScript

## Pendiente
| Id | Tarea | Cubre | Hecho cuando |
|---|---|---|---|
| T-01 | Repetir en navegador, con el build actual, CA-01 y CA-02 (arranque sin y con `#au-context`) | CA-01, CA-02 | Resultado y fecha en la spec |
| T-02 P | Repetir en navegador CA-08, CA-09, CA-10 y CA-11 | CA-08 a CA-11 | Resultado y fecha en la spec |
| T-03 | Repetir CA-12 con `build:single` cuando exista el guion de la spec 006 (T-04) | CA-12 | 8 páginas sin errores con el build de archivo único |
| T-04 P | **Decisión del propietario:** endpoints reales de sesión e institución, catálogo de permisos por rol, reintentos en producción | Información faltante | Respuestas anotadas; spec o ADR nuevos si cambia el diseño |
| T-05 | **Decisión del propietario:** commit de la 010 y la 011 | — | Commit hecho |
| T-06 | Actualizar trazabilidad y `specs/README.md` | — | Consistente con el estado real |
