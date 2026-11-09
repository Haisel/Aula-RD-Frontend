import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, join, relative, sep } from 'node:path';

/**
 * Spec 005 · RNF-03: `!important` solo en las excepciones de `docs/02-diseno-y-tokens.md` §6.
 * Si añade una excepción, documéntela en ese apartado y actualice esta lista.
 */
const scssDir = resolve(import.meta.dirname, '../src/scss');

/** Excepciones documentadas: archivo → número de apariciones permitidas. */
const ALLOWED = {
  'base/_base.scss': 3, // prefers-reduced-motion
  'components/_buttons.scss': 1, // .btn.is-loading
  'components/_status.scss': 1, // .badge.bg-accent
  'vendors/_datatables.scss': 1,
  'vendors/_fullcalendar.scss': 1,
  'vendors/_sweetalert2.scss': 1,
};

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

describe('!important (spec 005 · RNF-03)', () => {
  it('solo aparece en las excepciones documentadas', () => {
    /** @type {Record<string, number>} */
    const found = {};
    for (const p of walk(scssDir)) {
      const n = readFileSync(p, 'utf8')
        .split('\n')
        .filter((l) => !l.trim().startsWith('//'))
        .filter((l) => /!important/.test(l.split('//')[0])).length;
      if (n) found[relative(scssDir, p).split(sep).join('/')] = n;
    }
    expect(found).toEqual(ALLOWED);
  });
});
