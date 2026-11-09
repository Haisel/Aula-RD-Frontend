# 005-identidad-visual-b

> Estado: Aprobada (08/11/2026, por Haisel Ramirez) · Implementada (08/11/2026) · Versión 1.1 · ADR-006, ADR-011

## Objetivo
Aplicar la identidad visual B (logo, paleta, tipografía) a toda la interfaz web con tokens semánticos accesibles, tema claro/oscuro/sistema y Bootstrap 5.3 tematizado.

## Contexto
El propietario eligió el logo B y la paleta Navy/Turquoise/Champagne/White (08/11/2026). Existe un sistema de diseño publicado ("Aula RD — Sistema de diseño") cuyo `tokens.json` se adopta como fuente única. Constitución §10 exige tokens semánticos y temas.

## Alcance
- Tokens: escalas de marca + 36 tokens semánticos × 2 temas, espaciado, radios, sombras, medidas, tipografía.
- Generación automática de Sass desde `tokens.json`.
- Variables CSS `--au-*` por tema y puente a `--bs-*`.
- Tema de todos los componentes de Bootstrap usados y de las librerías del ecosistema.
- Logos, isotipos, favicon e íconos de app.

## Exclusiones
- Temas institucionales (variaciones por colegio): fase posterior.
- Modo alto contraste específico.

## Requisitos funcionales
| Id | Requisito |
|---|---|
| RF-01 | Todo color, tamaño tipográfico, espaciado y radio debe provenir de `tokens.json`. |
| RF-02 | `npm run tokens` debe regenerar `_tokens.scss` sin edición manual. |
| RF-03 | La interfaz debe soportar `light`, `dark` y `system`, guardar la preferencia y reaccionar a cambios del sistema operativo. |
| RF-04 | El tema debe aplicarse antes del primer pintado (sin destello). |
| RF-05 | Los componentes de Bootstrap deben heredar la marca sin clases adicionales. |
| RF-06 | SweetAlert2, Choices, Flatpickr, DataTables, Quill, FullCalendar y Chart.js deben verse con la marca en ambos temas. |
| RF-07 | En tema oscuro el color primario debe ser turquesa con texto navy. |

## Requisitos no funcionales
| Id | Requisito | Medida |
|---|---|---|
| RNF-01 | Contraste de texto | ≥ 4.5:1 (≥ 3:1 en ≥ 24 px, bordes de control y foco) en ambos temas |
| RNF-02 | Peso de fuentes | Solo subconjunto latin, woff2 + woff |
| RNF-03 | `!important` | Solo excepciones listadas en `docs/02` §6 |

## Reglas de negocio
- RN-01 Turquesa `#18B6A4` y champagne `#C6A15B` no se usan como color de texto sobre fondos claros.
- RN-02 El champagne no supera ~5 % de una pantalla (detalle premium).
- RN-03 El turquesa es marca, no "éxito"; los estados usan `success/warning/danger/info`.

## Criterios de aceptación
| Id | Dado | Cuando | Entonces | Prueba |
|---|---|---|---|---|
| CA-01 | `tokens.json` modificado | `npm run tokens && npm run build` | El CSS refleja el cambio en ambos temas | `tests/tokens-sync.test.js` (SCSS al día) + build |
| CA-02 | Preferencia `dark` guardada | Se carga cualquier página | `<html data-bs-theme="dark">` antes del CSS | `tests/theme-registry.test.js` + `public/js/theme-boot.js` |
| CA-03 | Tema `system` | El SO cambia a oscuro | La página cambia sin recargar | Manual |
| CA-04 | Cualquier página | Se revisa con herramienta de contraste | Pares de `docs/02` §4 cumplen AA | `tests/contrast.test.js` (26 pares × 2 temas + 1 par solo en claro) |
| CA-05 | Tema oscuro | Se abre un SweetAlert, Choices, Flatpickr, DataTable | Superficie, texto y bordes del tema oscuro | Revisión visual 08/11/2026 |
| CA-06 | Gráfico visible | Se cambia el tema | Se recolorea sin recargar | Manual (evento `au:theme:changed`) |
| CA-07 | Código SCSS | `npm run lint:css` | Sin errores | Stylelint |

## Información faltante
Resuelta el 08/11/2026 por el propietario:
- Se mantiene "usted" como tratamiento en toda la interfaz.
- Se retiran Inter, Outfit y JetBrains Mono. Esta plantilla ya usa solo Plus Jakarta Sans (fuente de marca); no hubo que reemplazar nada.

## Riesgos
- Bootstrap fuerza `transparent !important` en `.offcanvas-lg` ≥ lg: el fondo de la sidebar va en `.au-sidebar-body` (resuelto).

## Trazabilidad
| Requisito | Archivos | Prueba |
|---|---|---|
| RF-01/02 | `src/tokens/tokens.json`, `scripts/build-tokens.mjs`, `src/scss/abstracts/*` | `tests/tokens-sync.test.js`, build |
| RF-03/04 | `src/js/core/theme.js`, `public/js/theme-boot.js`, `src/scss/base/_root.scss` | `tests/theme-registry.test.js` |
| RF-05/06 | `src/scss/components/*`, `src/scss/vendors/*` | Revisión visual |
| RF-07 | `tokens.json` (`primary`, `on-primary`) | `tests/contrast.test.js`, revisión visual |
| RNF-01 / RN-01 | `tokens.json`, `src/scss/layouts/_app-shell.scss` (foco del menú, token `focus-ring-on-dark`) | `tests/contrast.test.js` |
| RNF-02 | `src/js/app.js` (`@fontsource/plus-jakarta-sans`, latin) | Manual: listado de `dist/fonts/` (08/11/2026) |
| RNF-03 | `src/scss/**` | `tests/no-important.test.js` |
| CA-03, CA-05, CA-06 | `src/js/core/theme.js`, `src/scss/vendors/*` | Manual en navegador (sección "Verificación") |

## Verificación (08/11/2026)
Versión compilada (`vite preview` sobre `dist/`), Chrome con emulación de esquema de color y de viewport. Evidencia: valores de estilo calculados en el navegador.

| Criterio | Resultado | Detalle |
|---|---|---|
| CA-03 | Cumple | Con `au-theme = system`, al cambiar el SO de oscuro a claro el `data-bs-theme` pasó de `dark` a `light` sin recargar (fondo `#0A1628` → `#F4F6F8`) |
| CA-05 | Cumple | En oscuro, SweetAlert2, Choices, Flatpickr (campo y calendario), Quill, DataTables y FullCalendar usan superficie `#0F2139`/`#142B4A`, texto `#E7EDF4` y bordes del tema. El botón de confirmar es turquesa con texto navy (RF-07) |
| CA-06 | Cumple | Los 3 gráficos de `componentes.html` se recolorean al conmutar claro/oscuro (3 eventos `au:theme:changed`) y se repiten igual al volver. El 4.º canvas es el campo de firma, no un gráfico |
| 390 px | Cumple | Sin desbordamiento horizontal en `dashboard-docente.html` |
| Teclado | Cumple (tras corregir el menú) | Foco visible en el contenido, en el enlace "Saltar al contenido" (2 px `#52CABB`) y en el buscador (borde turquesa + halo 3 px). Menú lateral corregido: ver "Defecto corregido" |
| RNF-02 | Cumple | `dist/fonts/` contiene solo Plus Jakarta Sans latin (400–800, woff2 + woff) y Bootstrap Icons |

**Defecto corregido (08/11/2026, aprobado por el propietario):** el menú lateral es navy `#142B4A` en ambos temas, pero en tema claro el anillo de foco era `focus-ring` `#0E766B` (2.59:1; mínimo 3:1, WCAG 1.4.11 / 2.4.11). Además, los 10 enlaces de navegación y el botón de cerrar tenían un halo navy al 25 % sobre fondo navy, invisible (1:1). `tests/contrast.test.js` no lo detectó porque solo comparaba `focus-ring` con `surface` y `bg`.

Corrección:
- Token nuevo `focus-ring-on-dark` (`#52CABB`) en `tokens.json`; pares nuevos en `tests/contrast.test.js` contra `sidebar-bg` y `sidebar-active-bg` (se vieron fallar antes de crear el token).
- `.au-sidebar` redefine `--au-focus-ring` con ese token; `.nav-link:focus-visible` usa un anillo sólido de 2 px hacia dentro; `.btn-close` usa cruz blanca por fondo (no por `filter`, que invertía el anillo) y anillo de 2 px separado del fondo.
- Medido a 390 px en `dashboard-institucion.html`, con el menú abierto: los 12 elementos enfocables tienen anillo con contraste mínimo 7.14:1 en claro y 9.7:1 en oscuro.

**Hallazgo (no es de la identidad visual):** en el editor Quill, el selector de la barra (`.ql-picker-label`) no tiene nombre accesible (WCAG 4.1.2). Pertenece a la spec 008 (componentes declarativos). Pendiente de decidir si se corrige allí.

**Límites de esta verificación:** una sola sesión de Chrome en Windows; el foco por teclado se comprobó solo en 3 elementos; no se recorrió el modo claro a 390 px ni se probaron Firefox o Safari.

## Aprobación
- [x] Revisada por el propietario — fecha: 08/11/2026 (Haisel Ramirez)
