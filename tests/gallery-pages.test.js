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
  'ejemplo-crud.html',
  'ejemplo-reporte.html',
  'ejemplo-kanban.html',
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

/**
 * @typedef {object} NavNode
 * @property {string} [href] Destino (los grupos no tienen).
 * @property {boolean} [active] Página actual.
 * @property {NavNode[]} [children] Hijos de un grupo plegable.
 */

/**
 * Aplana el menú: los grupos se sustituyen por sus hijos (spec 013, T-02).
 * @param {NavNode[]} items Ítems del menú.
 * @returns {NavNode[]} Solo enlaces.
 */
const flat = (items) => items.flatMap((i) => (i.children ? flat(i.children) : [i]));

/**
 * Menú aplanado de una página.
 * @param {string} page Página.
 * @returns {{ href: string, active: boolean }[]} Enlaces del menú.
 */
const linksOf = (page) =>
  /** @type {{ href: string, active: boolean }[]} */ (
    flat(/** @type {{ nav: NavNode[] }} */ (pageContext(page)).nav)
  );

describe('menú "Galería" (spec 012 · RF-02, RF-14)', () => {
  for (const file of ALL) {
    it(`${file} tiene menú con su página activa y enlaces válidos`, () => {
      const nav = linksOf(file);
      expect(nav.length).toBeGreaterThan(0);
      expect(nav.filter((i) => i.active).map((i) => i.href)).toEqual([file]);
      for (const item of nav.filter((i) => /\.html$/.test(i.href))) {
        expect(existsSync(resolve(SRC, item.href)), `${file} → ${item.href}`).toBe(true);
      }
    });
  }

  const DASHBOARDS = [
    'dashboard-superadmin.html',
    'dashboard-institucion.html',
    'dashboard-docente.html',
    'dashboard-tutor.html',
  ];

  for (const dash of DASHBOARDS) {
    it(`el menú de ${dash} enlaza la galería (RF-14)`, () => {
      const { nav } = /** @type {{ nav: { href: string }[] }} */ (pageContext(dash));
      expect(nav.map((i) => i.href)).toContain(HUB);
    });
  }

  it('desde la galería se llega a cada uno de los dashboards', () => {
    const { nav } = /** @type {{ nav: { href: string }[] }} */ (pageContext(HUB));
    const hrefs = nav.map((i) => i.href);
    for (const dash of DASHBOARDS) expect(hrefs, dash).toContain(dash);
  });

  it('el índice de la galería enlaza cada dashboard', () => {
    const hub = read(HUB);
    for (const dash of DASHBOARDS) expect(hub, dash).toContain(`href="${dash}"`);
  });

  it('el menú de la galería lista todas las páginas publicadas y enlaza las de la spec 009', () => {
    const files = linksOf(HUB)
      .map((i) => i.href)
      .filter((h) => /\.html$/.test(h));
    expect(files).toEqual(expect.arrayContaining(ALL));
    expect(files).toContain('componentes.html');
  });
});
