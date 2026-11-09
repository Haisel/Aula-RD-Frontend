// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve, relative, sep } from 'node:path';
import Handlebars from 'handlebars';
import { pageContext, helpers } from '../src/data/pages.js';

/**
 * Spec 013 · T-06/T-07 (RF-01, RF-04, RF-05): páginas de módulo con arquetipo de tabla. Se
 * generan con el mismo mecanismo que el build (parciales y ayudantes reales), con los datos
 * reales de `public/data/`.
 */
const SRC = resolve(import.meta.dirname, '../src');
const PARTIALS = resolve(SRC, 'partials');

/** Páginas de módulo publicadas hasta ahora con el arquetipo de tabla. */
const MODULE_PAGES = [
  'superadmin-instituciones.html',
  'superadmin-usuarios.html',
  'superadmin-suscripciones.html',
  'superadmin-cobros.html',
  'institucion-estudiantes.html',
  'institucion-docentes.html',
  'institucion-cobros.html',
  'familia-estado-de-cuenta.html',
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
 * Genera el HTML de una página de módulo.
 * @param {string} file Página.
 * @returns {string} HTML.
 */
const render = (file) =>
  hb.compile(readFileSync(resolve(SRC, file), 'utf8'))(pageContext(file, { dev: false }));

/**
 * Contexto de módulo de una página.
 * @param {string} file Página.
 * @returns {{ title: string, rows: Record<string, unknown>[], columns: { label: string }[], labelKey: string, actionsIndex: number }} Módulo.
 */
const moduleOf = (file) => /** @type {any} */ (pageContext(file)).module;

describe('páginas de módulo con arquetipo de tabla (spec 013)', () => {
  for (const file of MODULE_PAGES) {
    describe(file, () => {
      it('existe y tiene su configuración de módulo', () => {
        expect(existsSync(resolve(SRC, file))).toBe(true);
        expect(moduleOf(file).rows.length).toBeGreaterThan(0);
      });

      it('muestra un solo h1 con el título del módulo', () => {
        const html = render(file);
        expect((html.match(/<h1[\s>]/g) ?? []).length).toBe(1);
        expect(html).toContain(`>${moduleOf(file).title}</h1>`);
      });

      it('tiene migas de pan con la página actual al final (RF-05)', () => {
        const html = render(file);
        expect(html).toMatch(/<nav aria-label="Migas de pan"/);
        expect(html).toMatch(new RegExp(`aria-current="page">${moduleOf(file).title}</li>`));
        expect(html).toMatch(
          /<li class="breadcrumb-item"><a href="dashboard-[a-z]+\.html">Inicio<\/a><\/li>/,
        );
      });

      it('la tabla trae una fila por registro y una columna por campo más las acciones', () => {
        const html = render(file);
        const m = moduleOf(file);
        const body = html.slice(html.indexOf('<tbody>'), html.indexOf('</tbody>'));
        expect((body.match(/<tr>/g) ?? []).length).toBe(m.rows.length);
        const head = html.slice(html.indexOf('<thead>'), html.indexOf('</thead>'));
        expect((head.match(/<th /g) ?? []).length).toBe(m.columns.length + 1);
        expect(html).toContain(`data-au-no-sort="${m.actionsIndex}"`);
        expect(html).toContain('data-au-datatable');
      });

      it('cada acción de fila tiene un nombre accesible que dice a qué registro se refiere', () => {
        const html = render(file);
        const m = moduleOf(file);
        const first = String(m.rows[0][m.labelKey]).replaceAll('&', '&amp;');
        expect(html).toContain(`aria-label="Ver detalle: ${first}`);
        expect(html).toContain(`aria-label="Editar: ${first}`);
        expect(html).toContain(`aria-label="Eliminar: ${first}`);
      });

      it('el menú de su portal marca esta página como activa', () => {
        const { nav } = /** @type {{ nav: { href?: string, active?: boolean }[] }} */ (pageContext(file));
        expect(nav.filter((i) => i.active).map((i) => i.href)).toEqual([file]);
      });

      it('lleva el aviso de demostración y su fuente no tiene enlaces vacíos', () => {
        // Se revisa la fuente de la página: los `href="#"` de la barra superior compartida son deuda
        // que ya controla el trinquete de tests/links.test.js.
        expect(render(file)).toContain('au-demo-note');
        expect(readFileSync(resolve(SRC, file), 'utf8')).not.toContain('href="#"');
      });
    });
  }

  it('los datos no se insertan sin escapar: un nombre con HTML no llega como etiqueta', () => {
    const html = hb.compile('{{{cell column row}}}')({
      column: { kind: 'entity', key: 'n' },
      row: { n: '<script>alert(1)</script>' },
    });
    expect(html).not.toContain('<script>');
  });
});
