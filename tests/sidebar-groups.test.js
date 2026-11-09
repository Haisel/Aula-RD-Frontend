// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import Handlebars from 'handlebars';
import { pageContext } from '../src/data/pages.js';

/**
 * Spec 013 · T-02 / RF-02: menú lateral con grupos plegables, accesibles y sin JavaScript propio
 * (colapso de Bootstrap). El grupo se abre solo si contiene la página activa.
 */
const SIDEBAR = readFileSync(resolve(import.meta.dirname, '../src/partials/app/sidebar.hbs'), 'utf8');
const render = Handlebars.compile(SIDEBAR);

/**
 * @typedef {object} Item
 * @property {string} label Texto.
 * @property {string} [href] Destino (los grupos no tienen).
 * @property {boolean} [active] Página actual.
 * @property {boolean} [open] Grupo abierto.
 * @property {Item[]} [children] Ítems del grupo.
 */

/**
 * Menú de una página.
 * @param {string} page Página.
 * @returns {Item[]} Ítems.
 */
const navOf = (page) => /** @type {{ nav: Item[] }} */ (pageContext(page)).nav;

/**
 * Dibuja el menú de una página.
 * @param {string} page Página.
 * @returns {string} HTML.
 */
const html = (page) => render({ nav: navOf(page), isSuperAdmin: false });

describe('datos del menú con grupos (spec 013 · T-02)', () => {
  it('la galería tiene el grupo "Interfaz" con sus páginas', () => {
    const grupo = navOf('galeria.html').find((i) => i.label === 'Interfaz');
    expect(grupo?.href).toBeUndefined();
    expect(grupo?.children?.map((c) => c.href)).toEqual(
      expect.arrayContaining(['ejemplo-botones.html', 'ejemplo-alertas.html', 'ejemplo-modales.html']),
    );
  });

  it('el grupo se abre solo si contiene la página activa', () => {
    expect(navOf('ejemplo-botones.html').find((i) => i.label === 'Interfaz')?.open).toBe(true);
    expect(navOf('galeria.html').find((i) => i.label === 'Interfaz')?.open).toBe(false);
  });

  it('marca activo el hijo, no el grupo', () => {
    const grupo = navOf('ejemplo-botones.html').find((i) => i.label === 'Interfaz');
    expect(grupo?.active).toBe(false);
    expect(grupo?.children?.filter((c) => c.active).map((c) => c.href)).toEqual(['ejemplo-botones.html']);
  });

  it('los ítems sin hijos conservan su comportamiento', () => {
    const hub = navOf('galeria.html').find((i) => i.href === 'galeria.html');
    expect(hub?.active).toBe(true);
    expect(hub?.children).toBeUndefined();
  });
});

describe('menú lateral dibujado (spec 013 · T-02)', () => {
  it('el grupo es un botón con colapso de Bootstrap, no un enlace', () => {
    const out = html('galeria.html');
    expect(out).toMatch(/<button[^>]*data-bs-toggle="collapse"[^>]*>/);
    expect(out).not.toMatch(/<a[^>]*data-bs-toggle="collapse"/);
    expect(out).toMatch(
      /<button[^>]*type="button"[^>]*data-bs-toggle="collapse"|<button[^>]*data-bs-toggle="collapse"[^>]*type="button"/,
    );
  });

  it('cerrado: aria-expanded="false" y el panel sin la clase show', () => {
    const out = html('galeria.html');
    expect(out).toMatch(/aria-expanded="false"/);
    expect(out).not.toMatch(/class="collapse show"/);
  });

  it('abierto: aria-expanded="true" y el panel con la clase show', () => {
    const out = html('ejemplo-botones.html');
    expect(out).toMatch(/aria-expanded="true"/);
    expect(out).toMatch(/class="collapse show"/);
  });

  it('aria-controls apunta al panel que controla y los ids no se repiten', () => {
    const out = html('galeria.html');
    const controls = [...out.matchAll(/aria-controls="([^"]+)"/g)].map((m) => m[1]);
    const ids = [...out.matchAll(/\sid="(nav-g-[^"]+)"/g)].map((m) => m[1]);
    expect(controls.length).toBeGreaterThan(0);
    for (const c of controls) expect(ids).toContain(c);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('el enlace de la página activa lleva aria-current="page" dentro del grupo', () => {
    const out = html('ejemplo-botones.html');
    expect(out).toMatch(/<a[^>]*href="ejemplo-botones.html"[^>]*aria-current="page"/);
  });

  it('los enlaces de un grupo cerrado siguen existiendo en el HTML (se pliegan, no se quitan)', () => {
    const out = html('galeria.html');
    expect(out).toContain('href="ejemplo-botones.html"');
  });
});
