# Plan — 006-plantilla-neutra-dist

> Estado: Implementado (08/11/2026) · Fecha: 08/11/2026 · Spec: [006-plantilla-neutra-dist.md](006-plantilla-neutra-dist.md)

## Situación de partida
Implementada y pendiente de aprobación. Este plan ordena el cierre: lo verificado hoy, las brechas y las decisiones del propietario.

## Verificado el 08/11/2026 (build real y navegador)
| Criterio | Resultado |
|---|---|
| RF-01 / CA-01 | Cumple: `dist/` tiene `css/app.css`, `js/app.js`, 43 chunks, `fonts/`, `img/` y 8 páginas |
| RF-03 | Cumple: ninguna página usa `src`/`href` que empiece con `/` |
| RF-06 / CA-04 | Cumple en `login.html`: no se descarga ningún chunk de Chart.js |
| RNF-02 | Cumple: `app.css` ≈ 70 KB gzip (límite 80) |
| RNF-03 | Cumple: sin `onclick` ni `style` en línea; el único script en línea es el JSON `#au-context` |
| RF-02 / CA-03 | El build de archivo único funciona (un solo `app.js`, `<script defer>`), pero **solo ejecutado con Git Bash** (ver brecha 2) |

## Brechas
1. **RNF-01 no se cumple.** `app.js` pesa 103 KB gzip con `gzip -9` (107 KB según Vite); el límite es ≤ 100 KB y la spec dice "actual 97 KB". [Probable] El aumento viene del kernel, los servicios y la autenticación añadidos en las versiones 0.2.0 y 0.3.0; no lo medí por separado.
2. **`npm run build:single` falla en Windows.** El script usa `AU_SINGLE=1 vite build`, sintaxis que `cmd.exe` no entiende ("AU_SINGLE no se reconoce como un comando"). Ejecutado con variables de entorno de Git Bash sí compila.
3. **CA-05 sin prueba.** Nada prueba que `loadConfig()` lea `<meta name="au-config">` y que `AU.api.get('/x')` pida `/api/x`.
4. CA-02 y CA-03 (QR, gráfico y firma; build único en navegador) se verificaron con Playwright el 08/11/2026, antes de las versiones 0.2.0 y 0.3.0. No los repetí hoy.

## Enfoque
- **Decisión del propietario sobre el peso (brecha 1):** (a) subir el límite a un valor nuevo con ADR, o (b) reducir el núcleo moviendo código a carga diferida. Recomendación: medir primero qué módulos pesan más (análisis del bundle) y decidir con datos.
- **Brecha 2:** guion de Node (`scripts/build-single.mjs`) que fija `AU_SINGLE=1` y llama a Vite y al generador de páginas. No añade dependencias. La alternativa, `cross-env`, es una dependencia nueva y exige ADR (AGENTS.md §4.5).
- **Brecha 3:** prueba de `loadConfig()` con un `<meta>` simulado.

## Riesgos
| Riesgo | Mitigación |
|---|---|
| Reducir el núcleo rompe la fachada `AU` | Las 181 pruebas y `npm run check` en verde antes y después |
| Subir el límite oculta una regresión de peso | Registrar el nuevo límite y la causa en el ADR |
