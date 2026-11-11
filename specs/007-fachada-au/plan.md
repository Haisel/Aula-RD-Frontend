# Plan — 007-fachada-au

> Estado: Implementado (08/11/2026) · Fecha: 08/11/2026 · Spec: [007-fachada-au.md](007-fachada-au.md)

## Situación de partida
Implementada y aprobada por el propietario (10/11/2026). Es la fachada `window.AU`; las specs 010 y 011 la ampliaron después (sesión, institución, autenticación).

## Verificado el 08/11/2026
| Criterio | Resultado |
|---|---|
| RF-01 / CA-01 | Cumple en navegador: `Object.isFrozen(AU)` es `true` y `window.AU = {}` no tiene efecto |
| RF-02 | Cumple: la única global propia es `AU` (no existe `AR`) |
| RF-05 / CA-02 | Cumple: `AU.formatCurrency(12500)` da `RD$ 12,500.00` (más `tests/format.test.js`) |
| RF-07 / CA-06 | Cumple: `AU.render('{{x}}', {x:'<img src=x onerror=alert(1)>'})` devuelve el texto escapado |
| RNF-01 | Cumple: `npm run check` (ESLint con JSDoc y `tsc`) termina sin errores ni avisos |
| CA-03, CA-04, CA-05, CA-07 | Cubiertos por `tests/validators.test.js` y `tests/http.test.js` (pasan dentro de las 181 pruebas) |

## Brechas
1. **RF-06 (CSRF automático) sin prueba.** Ninguna prueba menciona CSRF.
2. **RF-08 (rechazo con `AppError` si falla la carga de una librería) sin prueba.**
3. **RF-03 (diálogos) solo con revisión visual.** Hoy comprobé `AU.confirm` en tema oscuro; no hay prueba de las variantes (`confirmDanger`, `toast…`, `loading/close`).
4. **Exclusión desactualizada.** La spec dice que la sesión y la autenticación quedan fuera ("port de `AR.session` queda para cuando exista el contrato"), pero la 010 y la 011 ya las incorporaron.

## Enfoque
Pruebas primero para las brechas 1 y 2; para la 3, una prueba de que cada función de diálogo está expuesta y es una función. La brecha 4 se corrige en la spec con una nota que remite a la 010 y la 011.

## Riesgos
| Riesgo | Mitigación |
|---|---|
| La prueba de CSRF depende de cómo se lee el token (`<meta name="csrf-token">`) | Probar con un `<meta>` simulado en jsdom, sin tocar el código |
| Una prueba de carga fallida necesita simular `import()` | Probar el contenedor de `lazy()` con un cargador que rechaza |
