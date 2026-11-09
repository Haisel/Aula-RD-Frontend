# 02 · Diseño, tokens y SCSS

## 1. Fuente única

`src/tokens/tokens.json` es el **mismo archivo** del sistema de diseño publicado ("Aula RD — Sistema de diseño"). Flujo:

```
tokens.json  ──npm run tokens──▶  src/scss/abstracts/_tokens.scss  (mapas Sass, GENERADO)
                                        │
                                        ▼
       abstracts/_bootstrap-variables.scss (Sass de Bootstrap)  +  base/_root.scss (variables CSS --au-* por tema)
```

Nunca edite `_tokens.scss` ni escriba hex en componentes. Funciones disponibles: `au-scale("navy", "700")`, `au-token("primary", "dark")`, `au-space("space-24")`, `au-radius("radius-lg")`, `au-rgb($color)`; mixins: `au-type("h1")`, `au-focus-ring`, `au-surface("radius-lg")`.

## 2. Marca

| Rol | Valor | Uso |
|---|---|---|
| Navy | `#142B4A` | Escudo, primario (claro), sidebar |
| Turquoise | `#18B6A4` | Rellenos, indicador activo, primario (oscuro), gráficos |
| Champagne | `#C6A15B` | Detalles premium (≤ 5 % de la pantalla), meta en gráficos, plan Premium |
| White | `#FFFFFF` | Superficies |

Tipografía: Plus Jakarta Sans 400/500/600/700/800. Display (800) solo en la landing; dashboards hasta `h1` 32 px.

## 3. Tokens semánticos (variables CSS `--au-*`)

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `bg` | `#F4F6F8` | `#0A1628` | Fondo de página |
| `surface` | `#FFFFFF` | `#0F2139` | Tarjetas, tablas, modales |
| `surface-2` | `#EBEFF3` | `#142B4A` | Encabezados de tabla, hover |
| `band` | `#142B4A` | `#0F2139` | Bandas oscuras de la landing, footer |
| `border` | `#DCE2E9` | `#22385A` | Divisores (decorativo) |
| `border-control` | `#7D8A9C` | `#5A77A0` | Borde de inputs (≥ 3:1) |
| `text` / `text-muted` | `#1F2937` / `#4E5B6C` | `#E7EDF4` / `#9FB0C6` | Texto |
| `primary` / `on-primary` | `#142B4A` / blanco | `#18B6A4` / `#0A1628` | Acción principal |
| `accent` / `accent-text` | `#18B6A4` / `#0E766B` | `#18B6A4` / `#52CABB` | Relleno / texto turquesa |
| `gold-accent` / `gold-text` | `#C6A15B` / `#6E5328` | `#C6A15B` / `#D6B57A` | Champagne |
| `focus-ring` | `#0E766B` | `#52CABB` | Anillo de foco 2 px + halo 25 % |
| `focus-ring-on-dark` | `#52CABB` | `#52CABB` | Anillo de foco sobre superficies navy (menú lateral, navy en ambos temas); 7.1:1 sobre `sidebar-bg` |
| `success` · `warning` · `danger` · `info` | `#1B7A43` · `#E09A1A` · `#C0392B` · `#2F6FDB` | `#3FBF78` · `#E09A1A` · `#C0392B` · `#2F6FDB` | Estados; cada uno con `-subtle` (fondo) y `-text` |
| `sidebar-bg` · `sidebar-text` · `sidebar-active-bg` | `#142B4A` · `#B3C3D8` · `#1E3A5F` | `#060E1A` · `#9FB0C6` · `#142B4A` | Menú lateral |

Lista completa con descripción de uso: `src/tokens/tokens.json`.

## 4. Contraste verificado (WCAG 2.2 AA)

Verificación automática: `tests/contrast.test.js` calcula la razón de contraste desde `tokens.json` para 26 pares en ambos temas (más 1 solo en claro) (texto ≥ 4.5:1; borde de control y foco ≥ 3:1). Si cambia un token y rompe AA, `npm run test` falla. La tabla siguiente muestra los pares principales.

| Par | Ratio |
|---|---|
| `text` / `surface` (claro · oscuro) | 14.7 : 1 · 13.7 : 1 |
| `text-muted` / `bg` (claro · oscuro) | 6.4 : 1 · 7.3 : 1 |
| blanco / `primary` (claro) | 14.3 : 1 |
| `on-primary` / `primary` (oscuro) | 7.1 : 1 |
| `accent-text` / blanco | 5.5 : 1 |
| `border-control` / `surface` | 3.5 : 1 |
| `success-text` / `success-subtle` | 5.8 : 1 |

**Prohibidos:** texto `accent` sobre blanco (2.5:1), texto `gold-accent` sobre blanco (2.4:1), texto blanco sobre `accent` (2.5:1; use `on-accent`), texto blanco sobre `warning` (use navy).

## 5. Temas

`<html data-bs-theme="light|dark">`. `base/_root.scss` emite para cada tema: los tokens `--au-*`, las sombras, los tripletes `--bs-*-rgb` y un **puente** que reasigna las variables de Bootstrap (`--bs-body-bg`, `--bs-border-color`, `--bs-link-color`…) a los tokens. Resultado: cualquier componente de Bootstrap ya sale con la marca en ambos temas, sin CSS adicional.

## 6. Arquitectura SCSS (`src/scss/app.scss`)

1. `abstracts/` — tokens (generado), funciones, variables de Bootstrap.
2. `bootstrap/scss/bootstrap` — framework completo.
3. `abstracts/_mixins.scss`.
4. `base/` — raíz de temas, base global, tipografía (`.au-type-*`, `.au-display-*`, `.au-eyebrow`, `.au-tabular`).
5. `components/` — botones, formularios, tarjetas/modales/dropdowns, tablas/paginación, estados/alertas, KPI/gráficos/listas.
6. `layouts/` — `app-shell` (sidebar/topbar/contenido), `landing`, `auth`.
7. `vendors/` — SweetAlert2, Choices, Flatpickr, DataTables, Quill, FullCalendar (+ firma y sortable).
8. `utilities/` — grids (`au-grid-kpi`, `au-grid-auto`, `au-split`), anchos `au-w-0…100`, paleta, estado vacío.

**`!important` permitidos (excepciones documentadas, constitución §6.11):** `prefers-reduced-motion` (accesibilidad); `.btn.is-loading` (oculta el texto bajo el spinner); `.badge.bg-accent` (las utilidades `bg-*` de Bootstrap usan `!important`); DataTables (`margin`), FullCalendar (`box-shadow` de foco) y SweetAlert2 (máscaras del ícono de éxito) porque esas librerías fijan valores con `!important`.

## 7. Escala y forma

Espaciado (grid de 4 px): `space-4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96`. Bootstrap conserva `p-1…p-5` (4, 8, 16, 24, 48) y se añaden `p-6` (64) y `p-7` (96).
Radios: `radius-sm` 6 · `radius-md` 10 (controles) · `radius-lg` 16 (tarjetas) · `radius-xl` 24 (landing) · `radius-pill`.
Medidas: `sidebar-width` 264 · `sidebar-collapsed` 76 · `topbar-height` 64 · `container-max` 1200 · `content-max` `none` (el contenido de los dashboards ocupa todo el ancho junto al menú lateral; ponga un valor en px, p. ej. 1440, para limitarlo en pantallas muy anchas).
