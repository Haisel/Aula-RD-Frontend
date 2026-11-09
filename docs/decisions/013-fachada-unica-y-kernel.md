# 013 — Fachada única `AU` con el kernel de la Fase 4

## Contexto
Existían dos frontends:
- `E:\AulaRD` (Fase 4), con el núcleo maduro y la fachada `window.AR`.
- La plantilla `aulard-frontend` 1.0, con la línea gráfica B y la fachada `window.AU`.

El núcleo de la Fase 4 incluye taxonomía de errores, bus de eventos, logger, scope, contenedor, sesión, institución, política de acceso y un `HttpClient` con estrategia de contexto. Los dos frontends repetían piezas (errores, eventos, almacenamiento, HTTP) con contratos distintos.

## Opciones
1. **Convivir:** `AR` y `AU` en la misma página. Cada módulo usaría una u otra; dos fuentes de verdad para sesión y eventos.
2. **Volver a `AR`:** reescribir la plantilla sobre la Fase 4. Se pierde el trabajo de componentes declarativos y la marca B, o hay que reconstruirlo.
3. **Fusionar en `AU`:** portar el kernel y los servicios a la plantilla, adaptando los nombres.

## Decisión
Opción 3.
- `window.AU` es la única superficie global. `AR` no se publica.
- Eventos con el patrón de la Fase 3, prefijo nuevo: `au:<ámbito>:<evento>`.
- `kernel.js` es la raíz de composición del núcleo. El contenedor y el `HttpClient` no se exponen.
- Una sola fuente de verdad para el contexto: `SessionService` + `InstitutionContext`. `AU.getContext()` se deriva de ellos.
- `AccessPolicy` reemplaza el `can()` de la 1.0. Se elimina el comodín de `super-admin`.
- Se conservan las exclusiones de la Fase 4: la identidad solo viene del backend. D-02 se resolvió después con la decisión 014 (cabecera).

## Consecuencias
- (+) Un solo contrato para errores (`AU.errors`), eventos y sesión, documentado en JSDoc y probado (106 casos).
- (+) Los formularios AJAX reciben `ValidationError` con `fieldErrors` directamente.
- (−) Cambian los nombres de los eventos de la 1.0 (tabla en `CHANGELOG.md`).
- (−) El núcleo pesa 8 KB gzip más (97 → 105 KB).
- (−) Los scripts de la Fase 4 que llamen `AR.*` deben migrarse a `AU.*`. Los nombres coinciden en su mayoría (`toast`, `confirm`, `openModal`, `busy`, `can`…).

## Estado: Aceptada
## Fecha: 2026-11-08
## Arquitecto: Claude · Aprobó: Haisel Ramírez (propietario)
