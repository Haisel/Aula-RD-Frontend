# Especificaciones (SDD)

Cada capacidad tiene **una carpeta y un archivo**: `specs/NNN-nombre/NNN-nombre.md` (mismo formato que el proyecto v1). Las specs 001–004 están en el repositorio original (`E:\AulaRD\specs`) y siguen siendo la base; estas continúan la numeración.

| Spec | Capacidad | Estado |
|---|---|---|
| [000](000-plantilla/000-plantilla.md) | Plantilla para nuevas specs | — |
| [005](005-identidad-visual-b/005-identidad-visual-b.md) | Identidad visual B en la interfaz (tokens, temas, SCSS) · [plan](005-identidad-visual-b/plan.md) · [tareas](005-identidad-visual-b/tasks.md) | **Aprobada** (08/11/2026) · implementada |
| [006](006-plantilla-neutra-dist/006-plantilla-neutra-dist.md) | Plantilla neutra y salida `dist/` | Implementada · pendiente de aprobación |
| [007](007-fachada-au/007-fachada-au.md) | Fachada `window.AU` | Implementada · pendiente de aprobación |
| [008](008-componentes-declarativos/008-componentes-declarativos.md) | Componentes declarativos `data-au-*` y librerías diferidas · [plan](008-componentes-declarativos/plan.md) · [tareas](008-componentes-declarativos/tasks.md) | **Aprobada** (08/11/2026) · implementada |
| [009](009-paginas-de-ejemplo/009-paginas-de-ejemplo.md) | Páginas de ejemplo (landing, auth, 4 portales, catálogo) | Implementada · pendiente de aprobación |
| [010](010-integracion-kernel/010-integracion-kernel.md) | Integración del kernel y servicios de la Fase 4 en `AU` | **Aprobada** (08/11/2026) · implementada |
| [011](011-autenticacion-jwt/011-autenticacion-jwt.md) | Autenticación JWT (token en memoria, renovación con cookie `httpOnly`) · [plan](011-autenticacion-jwt/plan.md) · [tareas](011-autenticacion-jwt/tasks.md) | **Aprobada** (08/11/2026) · implementada |
| [012](012-galeria-de-funcionalidades/012-galeria-de-funcionalidades.md) | Galería de páginas de ejemplo por contexto (CRUD, reporte, formularios avanzados, tablas, tarjetas, perfiles, edición, botones, modales, alertas) | **Aprobada** (08/11/2026) · en implementación · [plan](012-galeria-de-funcionalidades/plan.md) · [tareas](012-galeria-de-funcionalidades/tasks.md) |
| [013](013-plantilla-profesional/013-plantilla-profesional.md) | Plantilla profesional completa al nivel de AdminLTE, AdminKit y CoreUI: menú por categorías, todas las páginas enlazadas, demostración de todo, calidad medida y guía de integración | **Borrador** · pendiente de aprobación |

**Nota de proceso:** estas specs se redactaron junto con la implementación porque el propietario pidió la plantilla completa en una sola entrega (08/11/2026). Según la constitución §5.3 deben **revisarse y aprobarse**; cualquier cambio que surja de la revisión se implementa después de aprobado.

## Flujo para una spec nueva

1. Copiar `000-plantilla/000-plantilla.md` a `NNN-nombre/NNN-nombre.md`.
2. Completar todas las secciones (sin "TBD": lo que falte va en "Información faltante").
3. Estado `Borrador` → pedir revisión → `Aprobada` (con fecha y quién aprobó).
4. Implementar; cada `RF` debe tener `CA` y prueba.
5. `npm run check` en verde → estado `Implementada` + fecha.
