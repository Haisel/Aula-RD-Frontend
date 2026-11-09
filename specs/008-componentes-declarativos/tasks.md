# Tareas — 008-componentes-declarativos

> Estado: Borrador · Fecha: 08/11/2026 · Plan: [plan.md](plan.md) · Spec: [008-componentes-declarativos.md](008-componentes-declarativos.md)

Leyenda: `[x]` hecho · `[ ]` pendiente · `P` en paralelo. Cada tarea termina con `npm run check` en verde.

## Hecho (verificado el 08/11/2026)
- [x] CA-03, CA-05, CA-06 y RF-01, RF-02, RF-03 comprobados en navegador
- [x] CA-01, CA-02 cubiertos por `tests/theme-registry.test.js`

## Hecho el 08/11/2026: pruebas y un defecto corregido (`tests/forms-masks.test.js`, 13 pruebas)
- [x] T-01 Errores por campo: `aria-invalid`, `aria-describedby`, foco al primer error, error general y `clearErrors` (RF-05)
- [x] T-02 Máscaras de cédula, RNC, teléfono, moneda y entero, descarte de letras y rechazo de una máscara desconocida (RF-08)
- [x] **Defecto hallado y corregido (visto en rojo antes):** `showErrors` duplicaba el id del error en `aria-describedby` en cada reintento de envío (`clave-help clave-error clave-error`), porque el filtro comparaba la cadena entera y no cada id. Arreglado en `src/js/components/forms.js`.

## Hecho el 08/11/2026 (resultados en "Verificación" de la spec)
- [x] T-03 Modos de envío `native`, `event`, `ajax` y `login` verificados en navegador
- [x] T-04 CA-04 y CA-07 verificados en navegador
- [x] T-05 Quill: `labelToolbar()` en `src/js/adapters/editor.js`; `tests/editor-a11y.test.js` (6 pruebas, vistas en rojo antes) y medido en navegador: 11 controles con nombre en español, ninguno sin nombre
- [x] T-06 `CHANGELOG.md` actualizado

- [x] T-07 Aprobación del propietario: 08/11/2026 (Haisel Ramirez)

## Pendiente
Nada.

## Cobertura
| Requisito | Tarea | Verificación |
|---|---|---|
| RF-05 | T-01, T-03 | Automática + manual |
| RF-08 | T-02 | Automática |
| CA-04, CA-07 | T-04 | Manual |
| Quill sin nombre | T-05 | Medida en navegador |
