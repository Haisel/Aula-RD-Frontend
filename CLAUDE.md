# CLAUDE.md — Aula RD · Plantilla UI (`aulard-frontend`)

@AGENTS.md

## Reglas del propietario para las respuestas
- Responder en español.
- La primera frase cuestiona la suposición, señala lo que se pasa por alto o hace una pregunta que revele una falla.
- Etiquetar afirmaciones: [Seguro], [Probable], [Suposición].
- El frontend nunca es barrera de seguridad; nada de datos ficticios presentados como reales.

## Estado al 09/11/2026 (versión 0.5.0)
- Specs 005 a 013 implementadas y aprobadas (006, 007 y 009 el 10/11/2026), con sus planes y tareas cerrados. La plantilla tiene unas 100 páginas (galería por contexto, autenticación, cuenta, aplicaciones, paneles, formularios, impresión). Límite de `app.js` en 110 kB gzip (decisión 016), verificado por `npm run budget` dentro de `npm run check`.
- Escala compacta con AdminKit como referencia aproximada (decisión 017): cuerpo 14 px, relleno de tarjeta 16 px, contenido 20 px.
- `tests/coverage.test.js` exige que cada `data-au-*` y cada función de `AU` aparezca en alguna página (`referencia-au.html` cubre las funciones sin demostración).
- Plantilla visual neutra (Bootstrap 5 + Vite + Handlebars), línea gráfica B, fachada única `window.AU`.
- Kernel de la Fase 4 (`E:\AulaRD`, antes `window.AR`) fusionado en `AU`: spec 010, decisión 013 (aprobadas).
- Institución activa por cabecera `X-Institution-Id`: decisión 014 (aprobada).
- Autenticación JWT opción A (token en memoria + renovación en cookie `httpOnly`): spec 011 (aprobada e implementada), decisión 015.
- `npm run check` en verde.

## Pendiente
- Revisar la escala compacta en las pantallas que no se vieron (decisión 017) y la medición completa con Lighthouse (solo se midieron 3 páginas).
- Aclarar el catálogo de permisos por rol: ¿lo envía completo el backend, o hay que redactarlo como spec?
- No hay backend todavía: el trabajo es local con `#au-context` y `public/data/*.json`. Opcional: API simulada (`scripts/mock-api.mjs`, `npm run mock`) para probar el login JWT.
- Regenerar `docs/api/` con `npm run docs` tras cambios en JSDoc.

## Antes de terminar cualquier cambio
`npm run check` en verde, JSDoc completo, documentación (`docs/`, `CHANGELOG.md`) y spec/decisión actualizadas según `AGENTS.md`.
