# Tareas — 007-fachada-au

> Estado: Borrador · Fecha: 08/11/2026 · Plan: [plan.md](plan.md) · Spec: [007-fachada-au.md](007-fachada-au.md)

Leyenda: `[x]` hecho · `[ ]` pendiente · `P` en paralelo. Cada tarea termina con `npm run check` en verde.

## Hecho (verificado el 08/11/2026)
- [x] RF-01, RF-02, RF-05, RF-07, RNF-01 y CA-01, CA-02, CA-06 comprobados en navegador y con `npm run check`
- [x] CA-03, CA-04, CA-05, CA-07 cubiertos por pruebas existentes

## Pendiente
| Id | Tarea | Cubre | Hecho cuando |
|---|---|---|---|
| T-01 P | Prueba (primero en rojo): `AU.api` envía el token CSRF de `<meta name="csrf-token">` en métodos que modifican | RF-06 | Prueba en `tests/http.test.js` que pasa |
| T-02 P | Prueba (primero en rojo): una librería diferida cuya carga falla rechaza con `AppError` y código estable | RF-08 | Prueba nueva que pasa |
| T-03 P | Prueba de que cada función de diálogo de RF-03 existe en `AU` | RF-03 | Prueba nueva que pasa |
| T-04 | Corregir la exclusión desactualizada en la spec (sesión y autenticación ya existen: spec 010 y 011) | Alcance | Spec coherente con el código |
| T-05 | Trazabilidad, `CHANGELOG.md` y `specs/README.md` | — | Cada RF tiene prueba o verificación registrada |
| T-06 | Pedir aprobación al propietario | — | Spec `Aprobada (fecha, por)` |

## Cobertura
| Requisito | Tarea | Verificación |
|---|---|---|
| RF-03 | T-03 | Automática (existencia) + revisión visual |
| RF-06 | T-01 | Automática |
| RF-08 | T-02 | Automática |
