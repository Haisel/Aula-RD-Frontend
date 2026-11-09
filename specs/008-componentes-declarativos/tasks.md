# Tareas — 008-componentes-declarativos

> Estado: Borrador · Fecha: 08/11/2026 · Plan: [plan.md](plan.md) · Spec: [008-componentes-declarativos.md](008-componentes-declarativos.md)

Leyenda: `[x]` hecho · `[ ]` pendiente · `P` en paralelo. Cada tarea termina con `npm run check` en verde.

## Hecho (verificado el 08/11/2026)
- [x] CA-03, CA-05, CA-06 y RF-01, RF-02, RF-03 comprobados en navegador
- [x] CA-01, CA-02 cubiertos por `tests/theme-registry.test.js`

## Pendiente
| Id | Tarea | Cubre | Hecho cuando |
|---|---|---|---|
| T-01 P | Prueba (primero en rojo): errores por campo con `aria-invalid`, `aria-describedby` y foco al primer error | RF-05 | Prueba nueva que pasa |
| T-02 P | Prueba (primero en rojo): máscaras de cédula, RNC, teléfono, moneda y entero | RF-08 | Prueba nueva que pasa |
| T-03 | Verificar en navegador los modos de envío `native`, `ajax` y `event` | RF-05 | Resultado por modo en la spec |
| T-04 | Repetir en navegador CA-04 (formulario válido, toast de éxito) y CA-07 (error de Choices bajo el control) | CA-04, CA-07 | Resultado y fecha en la spec |
| T-05 | **Corregir** el nombre accesible del selector de la barra de Quill (`.ql-picker-label`): asignar `aria-label` al inicializar | Accesibilidad (WCAG 4.1.2) | Ningún elemento enfocable de la barra sin nombre; medido en navegador |
| T-06 | Trazabilidad, `CHANGELOG.md` y `specs/README.md` | — | Cada RF tiene prueba o verificación registrada |
| T-07 | Pedir aprobación al propietario | — | Spec `Aprobada (fecha, por)` |

## Cobertura
| Requisito | Tarea | Verificación |
|---|---|---|
| RF-05 | T-01, T-03 | Automática + manual |
| RF-08 | T-02 | Automática |
| CA-04, CA-07 | T-04 | Manual |
| Quill sin nombre | T-05 | Medida en navegador |
