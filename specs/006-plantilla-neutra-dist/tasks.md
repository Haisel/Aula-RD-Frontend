# Tareas — 006-plantilla-neutra-dist

> Estado: Implementado (08/11/2026) · Fecha: 08/11/2026 · Plan: [plan.md](plan.md) · Spec: [006-plantilla-neutra-dist.md](006-plantilla-neutra-dist.md)

Leyenda: `[x]` hecho · `[ ]` pendiente · `P` en paralelo. Cada tarea termina con `npm run check` en verde.

## Hecho (verificado el 08/11/2026)
- [x] RF-01, RF-03, RF-06, RNF-02, RNF-03 y CA-01, CA-04 comprobados sobre `dist/` y en navegador
- [x] RF-02: el build de archivo único compila (con Git Bash)

## Pendiente
| Id | Tarea | Cubre | Hecho cuando |
|---|---|---|---|
| T-01 P | Medir qué módulos pesan más en `app.js` (análisis del bundle) | RNF-01 | Lista de los mayores contribuyentes en la spec |
| T-02 | **Decisión del propietario:** ¿subir el límite o reducir el núcleo? | RNF-01 | Decisión anotada; ADR si cambia el límite |
| T-03 | Aplicar la decisión de T-02 | RNF-01 | `app.js` dentro del límite acordado y la spec con la cifra real |
| T-04 P | Prueba (primero en rojo): guion de Node para `build:single`, con `AU_SINGLE=1` | RF-02 | `npm run build:single` termina en Windows y genera un único `app.js` |
| T-05 P | Prueba de `loadConfig()` con `<meta name="au-config">` simulado | RF-04, CA-05 | La prueba pasa y `AU.api` usa `apiBaseUrl` |
| T-06 | Repetir en navegador CA-02 y CA-03 (QR, gráfico, firma; build único) | CA-02, CA-03 | Resultado y fecha en la spec |
| T-07 | Actualizar trazabilidad, `CHANGELOG.md` y `specs/README.md` | — | Sin cifras desactualizadas ("actual 97 KB") |
| T-08 | Pedir aprobación al propietario | — | Spec `Aprobada (fecha, por)` |

## Cobertura
| Criterio | Tarea | Verificación |
|---|---|---|
| CA-01, CA-04 | hecho | Manual |
| CA-02, CA-03 | T-06 | Manual |
| CA-05 | T-05 | Automática |
| RF-02 | T-04 | Automática |
| RNF-01 | T-01 a T-03 | Medida |
