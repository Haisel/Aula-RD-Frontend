# CLAUDE.md — Aula RD · Plantilla UI (`aulard-frontend`)

@AGENTS.md

## Reglas del propietario para las respuestas
- Responder en español.
- La primera frase cuestiona la suposición, señala lo que se pasa por alto o hace una pregunta que revele una falla.
- Etiquetar afirmaciones: [Seguro], [Probable], [Suposición].
- El frontend nunca es barrera de seguridad; nada de datos ficticios presentados como reales.

## Estado al 08/11/2026 (versión 0.3.0)
- Plantilla visual neutra (Bootstrap 5 + Vite + Handlebars), línea gráfica B, fachada única `window.AU`.
- Kernel de la Fase 4 (`E:\AulaRD`, antes `window.AR`) fusionado en `AU`: spec 010, decisión 013 (aprobadas).
- Institución activa por cabecera `X-Institution-Id`: decisión 014 (aprobada).
- Autenticación JWT opción A (token en memoria + renovación en cookie `httpOnly`): spec 011 (**pendiente de aprobación**), decisión 015.
- `npm run check` en verde: 124 pruebas.

## Pendiente
- Aprobar `specs/011-autenticacion-jwt`.
- Aclarar el catálogo de permisos por rol: ¿lo envía completo el backend, o hay que redactarlo como spec?
- No hay backend todavía: el trabajo es local con `#au-context` y `public/data/*.json`. Opcional: API simulada (`scripts/mock-api.mjs`, `npm run mock`) para probar el login JWT.
- Regenerar `docs/api/` con `npm run docs` tras cambios en JSDoc.

## Antes de terminar cualquier cambio
`npm run check` en verde, JSDoc completo, documentación (`docs/`, `CHANGELOG.md`) y spec/decisión actualizadas según `AGENTS.md`.
