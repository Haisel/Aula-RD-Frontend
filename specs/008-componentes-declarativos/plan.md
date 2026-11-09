# Plan — 008-componentes-declarativos

> Estado: Borrador · Fecha: 08/11/2026 · Spec: [008-componentes-declarativos.md](008-componentes-declarativos.md)

## Situación de partida
Implementada y pendiente de aprobación. Hay 24 componentes `data-au-*` registrados; la prueba automática que existe cubre solo el registro (`tests/theme-registry.test.js`).

## Verificado el 08/11/2026 (navegador, build real)
| Criterio | Resultado |
|---|---|
| CA-03 | Cumple en `suscribir.html`: al enviar vacío hay 10 campos con `aria-invalid="true"`, foco en el primer error y mensajes en español ("Escriba el nombre de la institución.") enlazados con `aria-describedby` |
| CA-05 | Cumple en `dashboard-institucion.html`: 6 filas, 6 píldoras de estado y 6 montos en `RD$` |
| CA-06 | Cumple en `dashboard-superadmin.html`: el selector de tamaño muestra "5 por página" |
| RF-01 / RF-02 | Cumple: llamar de nuevo a `AU.init(document)` no cambia las marcas `data-au-ready` (13) ni duplica filas |
| RF-03 | Cumple en la práctica: 0 elementos con `data-au-error` en las páginas probadas |
| CA-01, CA-02 | Cubiertos por `tests/theme-registry.test.js` |

## Brechas
1. **RF-05 sin prueba automática.** Los atributos `aria-invalid` y `aria-describedby` y el foco al primer error solo se vieron en navegador.
2. **RF-08 (máscaras) sin prueba.** Ninguna prueba cubre las máscaras de cédula, RNC, teléfono, moneda y entero.
3. **CA-04 y CA-07 no repetidos hoy** (formulario válido con toast de éxito; error de Choices bajo el control).
4. **Accesibilidad (hallazgo de la spec 005).** El selector de la barra de Quill (`.ql-picker-label`) no tiene nombre accesible (WCAG 4.1.2). Pertenece a esta spec.
5. Los tres modos de envío (`native`, `ajax`, `event`) no tienen verificación registrada.

## Enfoque
Pruebas primero para RF-05 (lógica de errores por campo, aislada del DOM completo) y RF-08 (máscaras), con jsdom. La corrección de Quill se hace al final, porque cambia un adaptador de terceros.

## Riesgos
| Riesgo | Mitigación |
|---|---|
| El nombre accesible del selector de Quill lo genera la librería | Asignar `aria-label` al inicializar el editor, sin tocar `node_modules` |
| Las máscaras dependen del navegador (cursor, entrada) | Probar la función pura de formato; el comportamiento con teclado queda manual |
