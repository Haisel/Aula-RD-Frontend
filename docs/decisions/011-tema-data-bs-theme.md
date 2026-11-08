# 011 — Tema con `data-bs-theme` y preferencia `system`

## Contexto
La v1 documenta `data-theme`. Bootstrap 5.3 ya implementa modo oscuro con `data-bs-theme`, y todos sus componentes lo leen.

## Decisión
- Atributo `data-bs-theme="light|dark"` en `<html>`. Los tokens `--au-*` y el puente a `--bs-*` se definen para ambos valores (`src/scss/base/_root.scss`).
- Preferencia `light | dark | system` en `localStorage["au-theme"]`; `system` sigue `prefers-color-scheme` y reacciona a sus cambios.
- `js/theme-boot.js` (archivo externo, sin JS en línea) aplica el tema antes de pintar.
- Gráficos (Chart.js) se recolorean al evento `au:theme-change`.

## Estado: Propuesta
## Fecha: 2026-11-08
## Arquitecto: Claude
