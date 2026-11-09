# Registro de decisiones (ADR)

Formato heredado del proyecto v1: **Contexto · Opciones consideradas · Decisión · Consecuencias · Estado · Fecha · Arquitecto**.
Las ADR 001–005 viven en el repositorio original (`E:\AulaRD\docs\decisions`) y siguen vigentes salvo donde una ADR de esta lista las sustituya.

| ADR | Título | Estado | Sustituye/afecta |
|---|---|---|---|
| [006](006-identidad-visual-b.md) | Identidad visual B: paleta, tipografía y logo | Propuesta — decidida por el propietario, falta aprobación formal | 004, constitución §10.4 |
| [007](007-plantilla-neutra-dist.md) | Plantilla neutra: salida `dist/` tipo AdminKit | Propuesta — decidida por el propietario | 003 (la complementa) |
| [008](008-fachada-au.md) | Fachada pública `window.AU` y prefijo `au` | Propuesta — decidida por el propietario | Fachada `AR` |
| [009](009-librerias-de-robustez.md) | Librerías de robustez y herramientas de calidad | Propuesta — pendiente de confirmar la lista | 002, constitución §2.2 |
| [010](010-versiones-del-ecosistema.md) | Versiones fijadas del ecosistema | Propuesta | 002 |
| [011](011-tema-data-bs-theme.md) | Tema con `data-bs-theme` y preferencia `system` | Propuesta | 004 |
| [012](012-validacion-asincrona.md) | Validación asíncrona con Zod diferido | Propuesta | — |
| [013](013-fachada-unica-y-kernel.md) | Fachada única `AU` con el kernel de la Fase 4 | **Aceptada** (08/11/2026) | 008, fachada `AR`, eventos de la 1.0 |
| [014](014-contexto-institucional-por-cabecera.md) | Contexto institucional por cabecera `X-Institution-Id` (resuelve D-02) | **Aceptada** (08/11/2026) | Spec 010 RN-04 |
| [015](015-autenticacion-jwt-token-en-memoria.md) | Autenticación JWT: token de acceso en memoria + renovación en cookie `httpOnly` | **Aceptada** (08/11/2026) | Spec 011; modo cookies+CSRF pasa a opcional |
| [016](016-limite-de-peso-de-app-js.md) | Límite de `app.js`: de 100 KB a 110 KB gzip | **Aceptada** (09/11/2026) | Spec 006 RNF-01 |
