# 017 — Escala compacta: tipografía, relleno y márgenes más pequeños (referencia AdminKit)

## Contexto
Al revisar la plantilla terminada, el propietario señaló tres defectos: el tamaño de letra es muy grande, el relleno general es muy amplio (los componentes se ven enormes) y hay demasiado margen. Pidió tomar como referencia los tamaños de AdminKit. La escala original (cuerpo de 16 px, `h1` de 32 px, tarjetas con 24 px de relleno, contenido con 32 px) venía de la spec 005.

## Opciones
1. **Reducir la escala completa** (tokens y variables de Bootstrap) a una densidad tipo AdminKit.
2. **Solo bajar el tamaño del cuerpo** y dejar relleno y márgenes como estaban.
3. **No cambiar** y ofrecer una clase de «modo compacto» opcional.

## Decisión
Opción 1, pedida por el propietario el 09/11/2026. Los valores son una aproximación a la densidad de AdminKit, **no una copia verificada** de sus variables; se ajustan con el propietario si algo sigue grande.

| Elemento | Antes | Ahora |
|---|---|---|
| Cuerpo (`body`) | 16 / 24 px | 14 / 22 px |
| `h1` · `h2` · `h3` · `h4` | 32 · 24 · 20 · 16 px | 24 · 20 · 18 · 15 px |
| Texto pequeño y etiquetas | 14 px | 13 px |
| Indicador (`kpi`) | 32 px | 24 px |
| Espaciado Bootstrap 3 · 4 · 5 | 16 · 24 · 48 px | 12 · 16 · 32 px |
| Relleno de botones y campos (vertical · horizontal) | 9 · 14 px | 6 · 12 px |
| Relleno de tarjeta | 24 px | 16 px |
| Relleno de celda de tabla (vertical · horizontal) | 12 · 16 px | 8 · 12 px |
| Relleno del área de contenido | 32 px | 20 px |
| Barra superior | 64 px | 56 px (el menú lateral sigue en 264 px: con 240 px se recortaban los rótulos) |

Los tamaños tipográficos salen de `src/tokens/tokens.json` (`npm run tokens`); el resto, de `_bootstrap-variables.scss`, `_app-shell.scss`, `_stat.scss` y `_cards.scss`. Los estilos de **landing** (`display-1`, `display-2`) no cambian.

## Consecuencias
- (+) Pantallas más densas: caben más datos sin desplazarse, con una apariencia más cercana a un panel de administración.
- (+) El cuerpo es de 14 px y el texto pequeño de 13 px (nada por debajo de 12 px); el contraste AA no cambia (`npm run check` en verde).
- (−) El texto de 13 px y el relleno menor reducen el área táctil; los controles siguen ≥ 32 px de alto, por debajo de los 44 px recomendados en táctil. Si hay uso móvil intenso, conviene una variante táctil.
- (−) Los valores del documento de diseño y de capturas anteriores quedan desactualizados; se actualizó `docs/02-diseno-y-tokens.md`.
- (−) Los componentes con medidas fijas propias (no derivadas de las variables) pueden requerir ajustes puntuales: se corrigieron menú lateral, indicadores, cabecera de tarjeta y acordeón; pueden quedar otros.

## Estado: Aceptada
## Fecha: 2026-11-09
## Arquitecto: Claude · Aprobó: Haisel Ramírez (propietario)
