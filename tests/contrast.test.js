import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';

/**
 * Spec 005 · CA-04 / RNF-01 / RN-01: contraste WCAG 2.2 AA calculado desde `tokens.json`.
 * Mismo listado de pares que `docs/02-diseno-y-tokens.md` §4.
 */
const root = resolve(import.meta.dirname, '..');
const tokens = JSON.parse(readFileSync(resolve(root, 'src/tokens/tokens.json'), 'utf8'));

/** @type {Record<'light'|'dark', Record<string, string>>} */
const theme = { light: {}, dark: {} };
for (const t of tokens.color.tokens) {
  if (typeof t.value === 'object') {
    theme.light[t.name] = t.value.light;
    theme.dark[t.name] = t.value.dark ?? t.value.light;
  }
}

/**
 * Luminancia relativa WCAG de un color `#rrggbb`.
 * @param {string} hex Color en hexadecimal de 6 dígitos.
 * @returns {number} Luminancia entre 0 y 1.
 */
const luminance = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/**
 * Razón de contraste WCAG entre dos colores.
 * @param {string} a Primer color `#rrggbb`.
 * @param {string} b Segundo color `#rrggbb`.
 * @returns {number} Razón de 1 a 21.
 */
const ratio = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const TEXT = 4.5;
const NON_TEXT = 3;
/** Pares [primer plano, fondo, mínimo]. */
const PAIRS = [
  ['text', 'surface', TEXT],
  ['text', 'bg', TEXT],
  ['text', 'surface-2', TEXT],
  ['text-muted', 'bg', TEXT],
  ['text-muted', 'surface', TEXT],
  ['on-primary', 'primary', TEXT],
  ['on-primary', 'primary-hover', TEXT],
  ['text-inverse', 'band', TEXT],
  ['accent-text', 'surface', TEXT],
  ['accent-text', 'bg', TEXT],
  ['accent-text', 'accent-subtle', TEXT],
  ['on-accent', 'accent', TEXT],
  ['gold-text', 'surface', TEXT],
  ['gold-text', 'gold-subtle', TEXT],
  ['success-text', 'success-subtle', TEXT],
  ['warning-text', 'warning-subtle', TEXT],
  ['danger-text', 'danger-subtle', TEXT],
  ['info-text', 'info-subtle', TEXT],
  ['sidebar-text', 'sidebar-bg', TEXT],
  ['sidebar-active-text', 'sidebar-active-bg', TEXT],
  ['border-control', 'surface', NON_TEXT],
  ['border-control', 'bg', NON_TEXT],
  ['focus-ring', 'surface', NON_TEXT],
  ['focus-ring', 'bg', NON_TEXT],
  // El menú lateral es navy en ambos temas: allí el foco usa `focus-ring-on-dark`.
  ['focus-ring-on-dark', 'sidebar-bg', NON_TEXT],
  ['focus-ring-on-dark', 'sidebar-active-bg', NON_TEXT],
];

describe('contraste AA desde tokens.json (spec 005 · CA-04)', () => {
  // En claro el primario es navy con texto blanco; en oscuro es turquesa con texto navy (RF-07).
  it('light: text-inverse sobre primary ≥ 4.5:1', () => {
    expect(ratio(theme.light['text-inverse'], theme.light.primary)).toBeGreaterThanOrEqual(TEXT);
  });

  for (const mode of /** @type {const} */ (['light', 'dark'])) {
    for (const [fg, bg, min] of PAIRS) {
      it(`${mode}: ${fg} sobre ${bg} ≥ ${min}:1`, () => {
        const a = theme[mode][fg];
        const b = theme[mode][bg];
        expect(a, `falta el token ${fg}`).toBeTruthy();
        expect(b, `falta el token ${bg}`).toBeTruthy();
        expect(ratio(a, b)).toBeGreaterThanOrEqual(min);
      });
    }
  }
});

describe('RN-01: turquesa y champagne no son color de texto sobre claro', () => {
  it('los tokens de marca de relleno no alcanzan AA sobre blanco (por eso existen *-text)', () => {
    expect(ratio(theme.light.accent, '#ffffff')).toBeLessThan(TEXT);
    expect(ratio(theme.light['gold-accent'], '#ffffff')).toBeLessThan(TEXT);
  });

  it('ningún SCSS usa `color: var(--au-accent|gold-accent)` como color de texto', () => {
    /**
     * Lista los `.scss` de un directorio, de forma recursiva.
     * @param {string} dir Directorio raíz.
     * @returns {string[]} Rutas de archivos `.scss`.
     */
    const walk = (dir) =>
      readdirSync(dir).flatMap((f) => {
        const p = join(dir, f);
        return statSync(p).isDirectory() ? walk(p) : p.endsWith('.scss') ? [p] : [];
      });
    const re = /(^|[\s;{])color:\s*var\(--au-(accent|gold-accent)\)/;
    const bad = walk(resolve(root, 'src/scss')).flatMap((p) =>
      readFileSync(p, 'utf8')
        .split('\n')
        .map((l, i) => (re.test(l) ? `${p}:${i + 1}: ${l.trim()}` : ''))
        .filter(Boolean),
    );
    expect(bad).toEqual([]);
  });
});
