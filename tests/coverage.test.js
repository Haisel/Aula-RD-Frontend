import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { createFacade } from '../src/js/facade.js';

/**
 * Spec 013, T-22 (CA-02, RF-07): cada atributo `data-au-*` registrado y cada función pública de `AU`
 * debe aparecer en al menos una página de ejemplo o en el bloque «Cómo se usa». Las listas
 * `PENDIENTES_*` son un trinquete: solo pueden achicarse.
 */
const SRC = resolve(import.meta.dirname, '../src');

/**
 * Lee de forma recursiva los archivos de una carpeta con ciertas extensiones.
 * @param {string} dir Carpeta.
 * @param {RegExp} ext Extensiones admitidas.
 * @returns {string[]} Rutas absolutas.
 */
const walk = (dir, ext) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name), ext) : ext.test(e.name) ? [join(dir, e.name)] : [],
  );

const pages = walk(SRC, /\.(html|hbs)$/)
  .map((f) => readFileSync(f, 'utf8'))
  .join('\n');
const demos = walk(resolve(SRC, 'js/demo'), /\.js$/)
  .map((f) => readFileSync(f, 'utf8'))
  .join('\n');
const usage = `${pages}\n${demos}`;

/** Atributos registrados por los componentes declarativos. */
const attrs = [
  ...new Set(
    walk(resolve(SRC, 'js/components'), /\.js$/).flatMap((f) =>
      [...readFileSync(f, 'utf8').matchAll(/selector:\s*'([^']+)'/g)].flatMap((m) =>
        [...m[1].matchAll(/data-au-[a-z-]+/g)].map((a) => a[0]),
      ),
    ),
  ),
].sort();

/** Atributos que todavía no tienen demostración (solo pueden quitarse de la lista). */
const PENDIENTES_ATRIBUTOS = /** @type {string[]} */ ([]);

/** Funciones de `AU` sin demostración (solo pueden quitarse de la lista). */
const PENDIENTES_FUNCIONES = /** @type {string[]} */ ([]);

describe('cobertura de la demostración (spec 013 · CA-02)', () => {
  it('encuentra los atributos declarativos registrados', () => {
    expect(attrs.length).toBeGreaterThan(15);
  });

  it('cada atributo data-au-* aparece en alguna página', () => {
    const sin = attrs.filter((a) => !usage.includes(a));
    expect(sin.sort()).toEqual([...PENDIENTES_ATRIBUTOS].sort());
  });

  const AU = /** @type {Record<string, unknown>} */ (
    createFacade({ config: {}, breakpoints: { sm: 576, md: 768, lg: 992, xl: 1200, xxl: 1400 } })
  );
  const funciones = Object.keys(AU)
    .filter((k) => typeof AU[k] === 'function')
    .sort();

  it('encuentra las funciones públicas de AU', () => {
    expect(funciones.length).toBeGreaterThan(40);
  });

  it('cada función de AU aparece en alguna página o demostración', () => {
    const sin = funciones.filter((f) => !new RegExp(`\\b${f}\\b`).test(usage));
    expect(sin.sort()).toEqual([...PENDIENTES_FUNCIONES].sort());
  });
});
