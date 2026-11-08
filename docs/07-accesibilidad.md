# 07 · Accesibilidad (WCAG 2.2 AA)

## Lo que la plantilla ya cumple

- **Contraste** AA verificado en ambos temas (tabla en `02-diseno-y-tokens.md` §4); bordes de controles y foco ≥ 3:1.
- **Foco visible** en todo: 2 px `focus-ring` + halo; nunca se elimina el contorno sin reemplazo.
- **Teclado:** sidebar en offcanvas con foco atrapado (Bootstrap), dropdowns, modales, acordeón, diálogos de SweetAlert2 (foco en "Cancelar" en acciones destructivas), Choices y Flatpickr navegables.
- **Saltar al contenido:** `.au-skip-link` en todas las páginas.
- **Formularios:** etiquetas visibles; errores con `aria-invalid`, `aria-describedby` y foco al primer error; obligatorios con asterisco y validación con texto.
- **Estados no solo por color:** píldoras con punto + texto; KPIs con flecha + texto; alertas con ícono + título.
- **Gráficos:** `role="img"` + `aria-label` con la conclusión en texto.
- **Movimiento reducido:** `prefers-reduced-motion` desactiva animaciones (también en Chart.js y Sortable).
- **Idioma:** `lang="es-DO"`.
- **Botones solo ícono** con `aria-label`; íconos decorativos con `aria-hidden="true"`.
- **Carga:** `aria-busy` mientras se descarga una librería; `btnLoading` marca `aria-busy` y deshabilita.

## Lo que usted debe cumplir al construir páginas

1. Un `h1` por página y jerarquía de títulos sin saltos.
2. Toda imagen informativa con `alt`; decorativa con `alt=""`.
3. Cada `<canvas data-au-chart>` con `role="img"` y un `aria-label` que diga **qué muestra el dato**, no "gráfico".
4. Tablas con `<th>` y, en columnas de acciones, texto oculto (`visually-hidden`).
5. No usar `placeholder` como única etiqueta.
6. Probar con teclado (Tab/Shift+Tab/Enter/Escape) y a 200 % de zoom y 390 px de ancho.
