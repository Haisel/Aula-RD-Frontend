# 005-identidad-visual-b

> Estado: Implementada (08/11/2026) · pendiente de aprobación · Versión 1.0 · ADR-006, ADR-011

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
| CA-01 | `tokens.json` modificado | `npm run tokens && npm run build` | El CSS refleja el cambio en ambos temas | Manual |
| CA-02 | Preferencia `dark` guardada | Se carga cualquier página | `<html data-bs-theme="dark">` antes del CSS | `tests/theme-registry.test.js` + `public/js/theme-boot.js` |
| CA-03 | Tema `system` | El SO cambia a oscuro | La página cambia sin recargar | Manual |
| CA-04 | Cualquier página | Se revisa con herramienta de contraste | Pares de `docs/02` §4 cumplen AA | Verificado (tabla) |
| CA-05 | Tema oscuro | Se abre un SweetAlert, Choices, Flatpickr, DataTable | Superficie, texto y bordes del tema oscuro | Revisión visual 08/11/2026 |
| CA-06 | Gráfico visible | Se cambia el tema | Se recolorea sin recargar | Manual (evento `au:theme:changed`) |
| CA-07 | Código SCSS | `npm run lint:css` | Sin errores | Stylelint |

## Información faltante
- ¿Se mantiene "usted" como tratamiento en toda la interfaz?
- ¿Se aprueba retirar Inter/Outfit/JetBrains Mono del proyecto v1?

## Riesgos
- Bootstrap fuerza `transparent !important` en `.offcanvas-lg` ≥ lg: el fondo de la sidebar va en `.au-sidebar-body` (resuelto).

## Trazabilidad
| Requisito | Archivos | Prueba |
|---|---|---|
| RF-01/02 | `src/tokens/tokens.json`, `scripts/build-tokens.mjs`, `src/scss/abstracts/*` | build |
| RF-03/04 | `src/js/core/theme.js`, `public/js/theme-boot.js`, `src/scss/base/_root.scss` | `tests/theme-registry.test.js` |
| RF-05/06 | `src/scss/components/*`, `src/scss/vendors/*` | Revisión visual |
| RF-07 | `tokens.json` (`primary`, `on-primary`) | Revisión visual |

## Aprobación
- [ ] Revisada por el propietario — fecha:
