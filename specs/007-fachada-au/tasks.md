# Tareas — 007-fachada-au

> Estado: Implementado (08/11/2026) · Fecha: 08/11/2026 · Plan: [plan.md](plan.md) · Spec: [007-fachada-au.md](007-fachada-au.md)

Leyenda: `[x]` hecho · `[ ]` pendiente · `P` en paralelo. Cada tarea termina con `npm run check` en verde.

## Hecho (verificado el 08/11/2026)
- [x] RF-01, RF-02, RF-05, RF-07, RNF-01 y CA-01, CA-02, CA-06 comprobados en navegador y con `npm run check`
- [x] CA-03, CA-04, CA-05, CA-07 cubiertos por pruebas existentes

## Hecho el 08/11/2026: pruebas de contrato (`tests/facade-contract.test.js`, 24 pruebas)
- [x] T-01 CSRF: `AU.api` envía `X-CSRF-TOKEN` y `X-XSRF-TOKEN` si hay `<meta name="csrf-token">`, y no los envía si no hay (RF-06)
- [x] T-02 Carga fallida: `lazy()` rechaza con `AppError` y código `LIB_LOAD_FAILED`, reintenta tras un fallo y memoriza la carga correcta (RF-08)
- [x] T-03 Diálogos: las 19 funciones de RF-03 existen en `AU` y son funciones

Nota: son pruebas de caracterización de código ya escrito, así que no hubo fase en rojo. La prueba de `AU` necesita definir `__AU_VERSION__` (lo define Vite, no Vitest) con `vi.hoisted`.

## Pendiente
| Id | Tarea | Cubre | Hecho cuando |
|---|---|---|---|
| T-04 | Corregir la exclusión desactualizada en la spec (sesión y autenticación ya existen: spec 010 y 011) | Alcance | Spec coherente con el código |
| T-05 | Trazabilidad, `CHANGELOG.md` y `specs/README.md` | — | Cada RF tiene prueba o verificación registrada |
| T-06 | Pedir aprobación al propietario | — | Spec `Aprobada (fecha, por)` |

## Cobertura
| Requisito | Tarea | Verificación |
|---|---|---|
| RF-03 | T-03 | Automática (existencia) + revisión visual |
| RF-06 | T-01 | Automática |
| RF-08 | T-02 | Automática |
