import { describe, it, expect } from 'vitest';
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

/**
 * Spec 005 · CA-01 / RF-02: `_tokens.scss` debe ser exactamente lo que genera `tokens.json`.
 * Regenera el archivo; si difiere, lo restaura y falla (nunca deja la prueba modificando el repo).
 */
const root = resolve(import.meta.dirname, '..');
const out = resolve(root, 'src/scss/abstracts/_tokens.scss');

describe('tokens.json ↔ _tokens.scss (spec 005 · CA-01)', () => {
  it('el SCSS generado está al día y sin ediciones manuales', () => {
    const before = readFileSync(out, 'utf8');
    execFileSync(process.execPath, [resolve(root, 'scripts/build-tokens.mjs')], { stdio: 'pipe' });
    const after = readFileSync(out, 'utf8');
    if (before !== after) writeFileSync(out, before);
    expect(after === before, 'Ejecute `npm run tokens` y confirme el cambio').toBe(true);
  });
});
