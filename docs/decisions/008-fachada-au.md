# 008 — Fachada pública `window.AU` y prefijo `au`

## Contexto
El proyecto v1 expone `window.AR` (estilo Yalia: funciones planas). El propietario indicó que la "máscara o fachada" sea `AU.funciones()`.

## Opciones consideradas
1. Mantener `AR` → no coincide con lo pedido.
2. `AulaRD` (namespace largo) → verboso en el HTML y en el código de los backends.
3. **`AU`** con el mismo estilo plano que `AR` y nombres compatibles donde tenga sentido.

## Decisión
Opción 3. `window.AU` se define con `Object.defineProperty` (no reescribible) y está congelado (`Object.freeze`). Mantiene los nombres de `AR` (`success`, `error`, `toast`, `confirm`, `confirmDelete`, `loading`, `btnLoading`, `openModal`, `validForm`, `serializeForm`, `createSelect`, `createDataTable`, `exportRows`, `openChart`, `openCalendar`, `editWithQuill`, `dragSort`, `barcode`, `qrcode`, `attachSignature`, `events`…) y añade `api`, `render`, `validate`, `registerSchema`, `mask`, `format*`, `setContext`/`can`.

Prefijo único `au`: clases `.au-*`, variables `--au-*`, atributos `data-au-*`, eventos `au:*`, almacenamiento `localStorage["au-*"]`.

## Consecuencias
- Código que llamaba `AR.*` debe migrarse a `AU.*` (en la mayoría de casos, reemplazo directo).
- Algunas funciones ahora son asíncronas porque cargan librerías diferidas: `validForm`, `validate`, `render`, `mask`, `openChart`… (ver ADR-012 y `docs/04-api-au.md`).

## Estado: Propuesta — decidida por el propietario
## Fecha: 2026-11-08
## Arquitecto: Claude
