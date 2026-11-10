# Plan — 005-identidad-visual-b

> Estado: Implementado (08/11/2026) · Fecha: 08/11/2026 · Spec: [005-identidad-visual-b.md](005-identidad-visual-b.md)

## Situación de partida
La spec 005 ya está **implementada** (08/11/2026) y **aprobada** por el propietario (08/11/2026). Este plan no construye la identidad visual: ordena el **cierre**. Cubre los criterios de aceptación que hoy solo tienen verificación manual o una tabla, resuelve las dos preguntas abiertas y deja la spec lista para aprobar.

## Qué ya existe (verificado por nombre de archivo, no por ejecución)
| Requisito | Evidencia en el repo |
|---|---|
| RF-01/02 | `src/tokens/tokens.json`, `scripts/build-tokens.mjs`, `src/scss/abstracts/_tokens.scss`, script `npm run tokens` |
| RF-03/04 | `src/js/core/theme.js`, `public/js/theme-boot.js`, `src/scss/base/_root.scss`, `tests/theme-registry.test.js` |
| RF-05 | `src/scss/abstracts/_bootstrap-variables.scss`, `src/scss/components/*` |
| RF-06 | `src/scss/vendors/` (choices, datatables, flatpickr, fullcalendar, quill, sweetalert2). **Chart.js no tiene archivo SCSS**: se colorea desde JS (`tests/chart-config.test.js`). |
| RNF-01 | Tabla en `docs/02-diseno-y-tokens.md` §4 (manual) |
| CA-07 | `npm run lint:css` |

## Brechas
1. **CA-04 / RNF-01 (contraste)**: solo hay una tabla escrita a mano. Si alguien cambia `tokens.json`, nada avisa de que se rompió AA. Es el riesgo mayor, porque CA-01 invita a cambiar tokens.
2. **CA-01 (tokens → CSS)**: manual. No hay prueba de que `_tokens.scss` coincida con `tokens.json`.
3. **RNF-03 (`!important`)**: sin comprobación automática de que solo existan las excepciones de `docs/02` §6.
4. **CA-03, CA-05, CA-06**: manuales y solo con revisión visual del 08/11/2026. Falta registrarlas con el procedimiento de `AGENTS.md` §6 (claro/oscuro, 390 px, teclado).
5. **Información faltante**: tratamiento "usted" y retiro de Inter/Outfit/JetBrains Mono. Son decisiones del propietario.
6. **RN-02** (≤ ~5 % champagne) es de criterio visual y se deja manual.

## Enfoque
Pruebas primero (TDD) para lo automatizable, verificación manual documentada para lo demás. No se cambian valores de diseño: si una prueba falla, se informa y el propietario decide.

### Fase A — Pruebas de guarda (sin tocar el diseño)
- A1 Prueba de contraste: lee `tokens.json`, calcula la razón WCAG de los pares de `docs/02` §4 en ambos temas y exige ≥ 4.5 (texto) o ≥ 3 (bordes de control, foco, texto ≥ 24 px). Incluye RN-01: turquesa y champagne nunca como texto sobre claro.
- A2 Prueba de coherencia de tokens: regenerar en memoria y comparar con `_tokens.scss` (detecta edición manual y regeneración olvidada).
- A3 Auditoría de `!important` en `src/scss/**`: la lista de coincidencias debe igualar las excepciones documentadas.

### Fase B — Verificación manual registrada
- B1 Checklist con evidencia para CA-03, CA-05, CA-06 en claro/oscuro, 390 px y teclado. Resultado en la sección "Verificación" de la spec.
- B2 Comprobar RNF-02: solo latin, woff2 + woff, en lo que se publica en `dist/`.

### Fase C — Cierre
- C1 Resolver las dos preguntas abiertas con el propietario y anotarlas en la spec (ADR si cambia algo).
- C2 `npm run check` en verde, actualizar trazabilidad y `CHANGELOG.md`.
- C3 Solicitar aprobación; con la aprobación marcar `Aprobada (fecha, por)`.

## Orden y dependencias
A1, A2 y A3 son independientes. B depende de que `npm run build` esté en verde. C1 puede hacerse en paralelo con todo. C3 depende de A, B y C1.

## Riesgos
| Riesgo | Mitigación |
|---|---|
| A1 revela pares que hoy no cumplen AA | No se corrige en silencio: se reporta, y cualquier cambio en `tokens.json` lo aprueba el propietario |
| La tabla de §4 usa pares distintos de los del código | A1 toma los pares de un único listado versionado, y la tabla se regenera o se alinea |
| Cambiar la tipografía (pregunta abierta) obliga a rehacer RNF-02 | Resolver C1 antes de B2 |

## Fuera de plan
Temas institucionales, alto contraste específico (exclusiones de la spec) y cualquier cambio visual nuevo.
