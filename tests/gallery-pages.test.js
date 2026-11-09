// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pageContext } from '../src/data/pages.js';

/**
 * Spec 012: contrato de las páginas de la galería de funcionalidades.
 * RF-01 (índice), RF-02 (menú "Galería"), RF-11 (bloque "Cómo se usa"), RF-12 (rótulo de
 * demostración), RF-14 (enlace desde el menú de la spec 009), RNF-05 (sin JS ni estilos en línea).
 */
const SRC = resolve(import.meta.dirname, '../src');

/** Páginas de la galería publicadas hasta ahora (se amplía en cada fase). */
const PAGES = [
  'ejemplo-botones.html',
  'ejemplo-alertas.html',
  'ejemplo-modales.html',
  'ejemplo-tarjetas.html',
  'ejemplo-estados.html',
];
const HUB = 'galeria.html';
const ALL = [HUB, ...PAGES];

/**
 * Lee una página fuente.
 * @param {string} file Nombre del archivo en `src/`.
 * @returns {string} Contenido.
 */
const read = (file) => readFileSync(resolve(SRC, file), 'utf8');

describe('páginas de la galería (spec 012)', () => {
  it('existen todas las páginas publicadas', () => {
    for (const file of ALL) expect(existsSync(resolve(SRC, file)), file).toBe(true);
  });

  for (const file of ALL) {
    describe(file, () => {
      it('no tiene JavaScript ni estilos en línea (RNF-05)', () => {
        const html = read(file);
        expect(html, 'onclick u otro manejador en línea').not.toMatch(/\son[a-z]+\s*=/i);
        expect(html, 'atributo style').not.toMatch(/\sstyle\s*=/i);
        const inline = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].filter(
          ([, attrs, body]) => body.trim() && !/application\/json/.test(attrs),
        );
        expect(inline, 'script con código').toEqual([]);
      });

      it('no carga nada de otro origen (CA-15)', () => {
        const external = [...read(file).matchAll(/(?:src|href)\s*=\s*"(https?:)?\/\/[^"]+"/gi)].map(
          (m) => m[0],
        );
        expect(external).toEqual([]);
      });

      it('tiene el aviso de página de demostración (RF-12)', () => {
        expect(read(file)).toMatch(/components\/demo-note/);
      });

      it('sus enlaces a otras páginas apuntan a archivos que existen', () => {
        const hrefs = [...read(file).matchAll(/href\s*=\s*"([a-z0-9-]+\.html)(?:#[^"]*)?"/gi)].map(
          (m) => m[1],
        );
        for (const href of hrefs) expect(existsSync(resolve(SRC, href)), `${file} → ${href}`).toBe(true);
      });
    });
  }

  it('el índice enlaza cada página de la galería (RF-01)', () => {
    const hub = read(HUB);
    for (const page of PAGES) expect(hub, page).toContain(`href="${page}"`);
  });

  it('las páginas de ejemplo traen el bloque "Cómo se usa" (RF-11)', () => {
    for (const page of PAGES) expect(read(page), page).toMatch(/Cómo se usa/);
  });
});

describe('menú "Galería" (spec 012 · RF-02, RF-14)', () => {
  for (const file of ALL) {
    it(`${file} tiene menú con su página activa y enlaces válidos`, () => {
      const { nav } = /** @type {{ nav: { href: string, active: boolean }[] }} */ (pageContext(file));
      expect(nav.length).toBeGreaterThan(0);
      expect(nav.filter((i) => i.active).map((i) => i.href)).toEqual([file]);
      for (const item of nav.filter((i) => /\.html$/.test(i.href))) {
        expect(existsSync(resolve(SRC, item.href)), `${file} → ${item.href}`).toBe(true);
      }
    });
  }

  it('el menú de la spec 009 enlaza la galería (RF-14)', () => {
    const { nav } = /** @type {{ nav: { href: string }[] }} */ (pageContext('dashboard-superadmin.html'));
    expect(nav.map((i) => i.href)).toContain(HUB);
  });

  it('el menú de la galería lista todas las páginas publicadas y enlaza las de la spec 009', () => {
    const { nav } = /** @type {{ nav: { href: string }[] }} */ (pageContext(HUB));
    const files = nav.map((i) => i.href).filter((h) => /\.html$/.test(h));
    expect(files).toEqual(expect.arrayContaining(ALL));
    expect(files).toContain('componentes.html');
  });
});
