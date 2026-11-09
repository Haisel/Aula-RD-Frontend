// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve, relative, sep } from 'node:path';
import Handlebars from 'handlebars';
import { pageContext, helpers } from '../src/data/pages.js';

/**
 * Spec 013 · V-04 (RF-02, RF-12): el índice de la galería y el menú de la plantilla enlazan todas
 * las variantes de autenticación, perfiles y formularios, y el índice no promete como pendiente
 * lo que ya existe.
 */
const SRC = resolve(import.meta.dirname, '../src');
const PARTIALS = resolve(SRC, 'partials');

const AUTENTICACION = [
  'login.html',
  'login-centrado.html',
  'login-ilustracion.html',
  'login-minimo.html',
  'login-portada.html',
  'login-portales.html',
  'login-codigo.html',
  'recuperar-contrasena.html',
];

const hb = Handlebars.create();
hb.registerHelper(helpers);

/**
 * Registra los parciales de `src/partials/` con el nombre "carpeta/archivo".
 * @param {string} dir Directorio.
 * @returns {void}
 */
function register(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = resolve(dir, e.name);
    if (e.isDirectory()) register(p);
    else if (/\.(hbs|html)$/.test(e.name)) {
      const id = relative(PARTIALS, p)
        .split(sep)
        .join('/')
        .replace(/\.(hbs|html)$/, '');
      hb.registerPartial(id, readFileSync(p, 'utf8'));
    }
  }
}
register(PARTIALS);

const html = hb.compile(readFileSync(resolve(SRC, 'galeria.html'), 'utf8'))(
  pageContext('galeria.html', { dev: false }),
);
/** @type {any[]} */
const nav = /** @type {any} */ (pageContext('galeria.html')).nav;
const grupo = (/** @type {string} */ label) => nav.find((i) => i.label === label);

/**
 * Enlaces `.html` de las tarjetas que hay dentro de la sección con ese título.
 * @param {string} titulo Texto del h2 de la sección.
 * @returns {string[]} Destinos.
 */
function tarjetasDe(titulo) {
  const m = html.match(new RegExp(`<h2[^>]*>${titulo}</h2>([\\s\\S]*?)</section>`));
  return [...(m?.[1] ?? '').matchAll(/class="au-gallery-card" href="([^"]+)"/g)].map((x) => x[1]);
}

describe('menú de la galería (spec 013 · V-04)', () => {
  it('tiene los grupos Interfaz, Autenticación, Perfiles y Formularios', () => {
    for (const g of ['Interfaz', 'Autenticación', 'Perfiles', 'Formularios']) {
      expect(grupo(g)?.children?.length, g).toBeGreaterThan(0);
    }
  });

  it('"Autenticación" lista las ocho páginas de acceso, en orden', () => {
    expect(grupo('Autenticación').children.map((/** @type {any} */ c) => c.href)).toEqual(AUTENTICACION);
  });

  it('todo enlace del menú de la galería existe como archivo', () => {
    for (const i of nav.flatMap((x) => x.children ?? [x])) {
      expect(existsSync(resolve(SRC, i.href)), i.href).toBe(true);
    }
  });

  it('los hijos de cada grupo tienen texto, ícono y destino únicos', () => {
    const hijos = nav.flatMap((x) => x.children ?? []);
    expect(new Set(hijos.map((h) => h.href)).size).toBe(hijos.length);
    for (const h of hijos) {
      expect(h.label?.length, h.href).toBeGreaterThan(0);
      expect(h.icon?.length, h.href).toBeGreaterThan(0);
    }
  });
});

describe('índice de la galería (galeria.html)', () => {
  it('enlaza todo lo que está en el menú de la galería', () => {
    const enlaces = new Set([...html.matchAll(/class="au-gallery-card" href="([^"]+)"/g)].map((m) => m[1]));
    const faltan = nav
      .flatMap((x) => x.children ?? [x])
      .map((i) => i.href)
      .filter((h) => h !== 'galeria.html' && !enlaces.has(h));
    expect(faltan).toEqual([]);
  });

  it('tiene una sección con tarjetas para Autenticación, Perfiles y Formularios', () => {
    expect(tarjetasDe('Autenticación')).toEqual(AUTENTICACION);
    expect(tarjetasDe('Perfiles')).toEqual(grupo('Perfiles').children.map((/** @type {any} */ c) => c.href));
    expect(tarjetasDe('Formularios')).toEqual(
      grupo('Formularios').children.map((/** @type {any} */ c) => c.href),
    );
  });

  it('cada sección tiene su título como h2 enlazado con aria-labelledby', () => {
    for (const t of ['Autenticación', 'Perfiles', 'Formularios']) {
      const id = html.match(new RegExp(`<h2[^>]*id="([^"]+)"[^>]*>${t}</h2>`))?.[1];
      expect(id, t).toBeTruthy();
      expect(html).toContain(`aria-labelledby="${id}"`);
    }
  });

  it('todos sus enlaces a páginas existen', () => {
    for (const m of html.matchAll(/href="([a-z0-9-]+\.html)"/g)) {
      expect(existsSync(resolve(SRC, m[1])), m[1]).toBe(true);
    }
  });

  it('"Próximas fases" ya no anuncia como pendiente lo que existe (formularios, perfiles, archivos)', () => {
    const fases = html.match(/id="g-proximas"[\s\S]*?<\/section>/)?.[0] ?? '';
    expect(fases).not.toMatch(/Formularios avanzados/i);
    expect(fases).not.toMatch(/perfiles/i);
    expect(fases).not.toMatch(/carga de archivos/i);
  });

  it('no tiene JavaScript ni estilos en línea', () => {
    expect(html).not.toMatch(/\son[a-z]+\s*=/i);
    expect(html).not.toMatch(/\sstyle\s*=/i);
  });
});
