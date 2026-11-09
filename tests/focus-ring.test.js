// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Spec 013 · RNF-01: el foco por teclado de los botones y controles de Bootstrap debe ser un
 * anillo sólido (`--au-focus-ring`, ≥ 3:1 sobre el fondo, ver tests/contrast.test.js) y no el halo
 * al 25 % que trae Bootstrap (1.4:1 en claro y 1.7:1 en oscuro, por debajo de WCAG 1.4.11).
 */
const BASE = readFileSync(resolve(import.meta.dirname, '../src/scss/base/_base.scss'), 'utf8');

/**
 * Devuelve el cuerpo de la regla cuyo selector contiene el texto dado.
 * @param {string} selector Fragmento del selector.
 * @returns {string} Declaraciones de la regla, o cadena vacía si no existe.
 */
const ruleFor = (selector) => {
  const i = BASE.indexOf(selector);
  if (i < 0) return '';
  const open = BASE.indexOf('{', i);
  const close = BASE.indexOf('}', open);
  return BASE.slice(open + 1, close);
};

const FORMS = readFileSync(resolve(import.meta.dirname, '../src/scss/components/_forms.scss'), 'utf8');

describe('control de rango (spec 013, T-12): pista y pulgar visibles y foco sólido', () => {
  it('la pista usa el color de borde de los controles (≥ 3:1), no el gris que se funde con el fondo', () => {
    expect(FORMS).toMatch(/::-webkit-slider-runnable-track\s*\{[^}]*--au-border-control/);
    expect(FORMS).toMatch(/::-moz-range-track\s*\{[^}]*--au-border-control/);
  });

  it('el pulgar es sólido con el color de acento accesible', () => {
    expect(FORMS).toMatch(/::-webkit-slider-thumb\s*\{[^}]*background-color:\s*var\(--au-accent-text\)/);
    expect(FORMS).toMatch(/::-moz-range-thumb\s*\{[^}]*background-color:\s*var\(--au-accent-text\)/);
  });

  it('con el teclado el pulgar muestra el anillo de foco sólido, no el halo al 25 %', () => {
    expect(FORMS).toMatch(/:focus-visible::-webkit-slider-thumb\s*\{[^}]*--au-focus-ring/);
    expect(FORMS).toMatch(/:focus-visible::-moz-range-thumb\s*\{[^}]*--au-focus-ring/);
  });
});

describe('anillo de foco sólido en componentes de Bootstrap (spec 013)', () => {
  for (const selector of [
    '.btn:focus-visible',
    '.btn-check:focus-visible + .btn',
    '.page-link:focus-visible',
    '.accordion-button:focus-visible',
  ]) {
    it(`${selector} usa el anillo de la marca y quita el halo`, () => {
      const body = ruleFor(selector);
      expect(body, `falta la regla ${selector}`).not.toBe('');
      expect(body).toMatch(/au-focus-ring/);
      expect(body).toMatch(/box-shadow:\s*none/);
    });
  }
});
