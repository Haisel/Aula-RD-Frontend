// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve, relative, sep } from 'node:path';
import Handlebars from 'handlebars';
import { pageContext, helpers } from '../src/data/pages.js';

/**
 * Spec 013 · V-01 (RF-06, RF-12, CA-13): variantes de inicio de sesión y recuperación de
 * contraseña. Cada una tiene una estructura distinta (no es la misma página con otro color) y
 * todas cumplen lo mismo de accesibilidad. Se generan con los parciales reales.
 */
const SRC = resolve(import.meta.dirname, '../src');
const PARTIALS = resolve(SRC, 'partials');

/**
 * Páginas de acceso: archivo, esquema de validación y la marca que identifica su estructura.
 * La marca debe ser única entre variantes: así se comprueba que no son copias.
 */
const PAGES = [
  { file: 'login.html', schema: 'login', marca: 'au-auth-aside' },
  { file: 'login-centrado.html', schema: 'login', marca: 'au-auth-center' },
  { file: 'login-ilustracion.html', schema: 'login', marca: 'au-auth-art' },
  { file: 'login-minimo.html', schema: 'login', marca: 'au-auth-min' },
  { file: 'login-portada.html', schema: 'login', marca: 'au-auth-cover' },
  { file: 'login-portales.html', schema: 'login', marca: 'data-au-tabs' },
  { file: 'login-codigo.html', schema: 'codigo-acceso', marca: 'one-time-code' },
  { file: 'recuperar-contrasena.html', schema: 'recuperar', marca: 'au-auth-recover' },
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

/**
 * Genera el HTML de una página.
 * @param {string} file Página.
 * @returns {string} HTML.
 */
const render = (file) =>
  hb.compile(readFileSync(resolve(SRC, file), 'utf8'))(pageContext(file, { dev: false }));

describe('variantes de inicio de sesión y recuperación (spec 013 · V-01)', () => {
  for (const { file, schema, marca } of PAGES) {
    describe(file, () => {
      it('existe y tiene título y descripción propios', () => {
        expect(existsSync(resolve(SRC, file))).toBe(true);
        const ctx = /** @type {{ title: string, description?: string }} */ (pageContext(file));
        expect(ctx.title).not.toBe('Aula RD');
        expect(ctx.description?.length ?? 0).toBeGreaterThan(10);
      });

      it('tiene un solo h1, un enlace para saltar al contenido y un main', () => {
        const html = render(file);
        expect((html.match(/<h1[\s>]/g) ?? []).length).toBe(1);
        expect(html).toMatch(/class="au-skip-link"/);
        expect(html).toMatch(/<main id="contenido"/);
        expect(html).toMatch(/<html lang="es-DO">/);
      });

      it(`valida con el esquema "${schema}" y tiene botón de envío`, () => {
        const html = render(file);
        expect(html).toContain(`data-au-validate="${schema}"`);
        expect(html).toMatch(/<button[^>]*type="submit"/);
      });

      it('todo campo tiene una etiqueta enlazada y los ids no se repiten', () => {
        const html = render(file);
        const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
        expect(new Set(ids).size, 'ids repetidos').toBe(ids.length);
        for (const m of html.matchAll(/<input[^>]*\sid="([^"]+)"[^>]*>/g)) {
          if (/type="(hidden|checkbox|radio)"/.test(m[0]) && !/type="checkbox"/.test(m[0])) continue;
          expect(html, `falta <label for="${m[1]}">`).toMatch(new RegExp(`<label[^>]*for="${m[1]}"`));
        }
      });

      it('el botón de mostrar contraseña tiene nombre accesible', () => {
        const html = render(file);
        for (const m of html.matchAll(/<button[^>]*data-au-password-toggle[^>]*>/g)) {
          expect(m[0]).toMatch(/aria-label="[^"]+"/);
        }
      });

      it('no tiene JavaScript ni estilos en línea, ni recursos externos, ni enlaces vacíos', () => {
        const src = readFileSync(resolve(SRC, file), 'utf8');
        const html = render(file);
        expect(html).not.toMatch(/\son[a-z]+\s*=/i);
        expect(html).not.toMatch(/\sstyle\s*=/i);
        expect(html).not.toMatch(/<script\b(?![^>]*src=)[^>]*>[^<]+<\/script>/i);
        expect(html).not.toMatch(/(?:src|href)\s*=\s*"(https?:)?\/\/[^"]+"/i);
        expect(src).not.toContain('href="#"');
      });

      it('sus enlaces a otras páginas apuntan a archivos que existen', () => {
        for (const m of render(file).matchAll(/href\s*=\s*"([a-z0-9-]+\.html)"/gi)) {
          expect(existsSync(resolve(SRC, m[1])), m[1]).toBe(true);
        }
      });

      it(`tiene su estructura propia (${marca})`, () => {
        expect(render(file)).toContain(marca);
      });
    });
  }

  it('cada variante tiene una estructura distinta: ninguna marca aparece en dos páginas', () => {
    for (const a of PAGES) {
      const otras = PAGES.filter((b) => b.file !== a.file && render(b.file).includes(a.marca)).map(
        (b) => b.file,
      );
      expect(otras, `${a.marca} también está en ${otras.join(', ')}`).toEqual([]);
    }
  });

  it('el código de acceso es un solo campo numérico de un solo uso, sin JavaScript', () => {
    const html = render('login-codigo.html');
    expect(html).toMatch(/autocomplete="one-time-code"/);
    expect(html).toMatch(/inputmode="numeric"/);
    expect(html).toMatch(/maxlength="6"/);
  });

  it('la variante por portales usa las pestañas accesibles de la plantilla', () => {
    const html = render('login-portales.html');
    expect(html).toContain('data-au-tabs');
    expect(html).toMatch(/class="nav nav-/);
    expect((html.match(/class="tab-pane/g) ?? []).length).toBe(3);
  });
});
