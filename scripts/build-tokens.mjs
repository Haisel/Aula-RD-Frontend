#!/usr/bin/env node
/**
 * Genera `src/scss/abstracts/_tokens.scss` a partir de `src/tokens/tokens.json`.
 *
 * `tokens.json` es la ÚNICA fuente de verdad de color, tipografía, espaciado, radios,
 * sombras y medidas. Es el mismo archivo del sistema de diseño "Aula RD — Sistema de diseño".
 * Nunca edite `_tokens.scss` a mano: edite `tokens.json` y ejecute `npm run tokens`.
 *
 * Salida (mapas Sass):
 *   $au-scales        escalas de marca  ("navy": ("50": #…, …), …)
 *   $au-theme-light   tokens semánticos del tema claro
 *   $au-theme-dark    tokens semánticos del tema oscuro
 *   $au-spacing, $au-radius, $au-layout, $au-shadow-light, $au-shadow-dark
 *   $au-type-styles   estilos tipográficos (font-size, line-height, weight, letter-spacing)
 *   $au-font-stack
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(here, '../src/tokens/tokens.json');
const OUT = resolve(here, '../src/scss/abstracts/_tokens.scss');

const tokens = JSON.parse(readFileSync(SRC, 'utf8'));
const SCALE_FAMILIES = ['navy', 'turquoise', 'gold', 'gray'];

const q = (s) => `"${s}"`;
const map = (entries, indent = '  ') =>
  `(\n${entries.map(([k, v]) => `${indent}${q(k)}: ${v}`).join(',\n')}\n)`;

const scales = {};
const light = [];
const dark = [];
for (const t of tokens.color.tokens) {
  const fam = SCALE_FAMILIES.find((f) => t.name.startsWith(`${f}-`));
  if (fam && typeof t.value === 'string') {
    (scales[fam] ??= []).push([t.name.slice(fam.length + 1), t.value]);
  } else {
    const l = typeof t.value === 'string' ? t.value : t.value.light;
    const d = typeof t.value === 'string' ? t.value : (t.value.dark ?? t.value.light);
    light.push([t.name, l]);
    dark.push([t.name, d]);
  }
}

const list = (fam) => (tokens[fam]?.tokens ?? []).map((t) => [t.name, t.value]);
const shadows = tokens.shadow.tokens;
const typeStyles = tokens.type.groups
  .flatMap((g) => g.styles)
  .map((s) => [
    s.name,
    `(size: ${s.fontSize}, line-height: ${s.lineHeight}, weight: ${s.fontWeight}, letter-spacing: ${s.letterSpacing ?? 'normal'})`,
  ]);

const out = `// ============================================================================
// ARCHIVO GENERADO por scripts/build-tokens.mjs desde src/tokens/tokens.json
// NO EDITAR A MANO. Cambie tokens.json y ejecute: npm run tokens
// ============================================================================

$au-font-stack: ${tokens.type.families.sans};

$au-scales: (
${Object.entries(scales)
  .map(([f, e]) => `  ${q(f)}: ${map(e, '    ').replace(/\n\)$/, '\n  )')}`)
  .join(',\n')}
);

$au-theme-light: ${map(light)};

$au-theme-dark: ${map(dark)};

$au-spacing: ${map(list('spacing'))};

$au-radius: ${map(list('radius'))};

$au-layout: ${map(list('layout'))};

$au-shadow-light: ${map(shadows.map((s) => [s.name, `(${s.value.light})`]))};

$au-shadow-dark: ${map(shadows.map((s) => [s.name, `(${s.value.dark})`]))};

$au-type-styles: ${map(typeStyles)};
`;

writeFileSync(OUT, out);
console.warn(
  `✔ tokens → ${OUT.replace(resolve(here, '..') + '/', '')} (${light.length} semánticos, ${Object.values(scales).flat().length} de escala)`,
);
