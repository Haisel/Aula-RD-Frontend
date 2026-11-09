// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve, relative, sep } from 'node:path';
import Handlebars from 'handlebars';
import { pageContext, helpers } from '../src/data/pages.js';
import { schemas } from '../src/js/helpers/schemas.js';

/**
 * Spec 013 · V-03 (RF-08, RF-12, CA-13): nueve páginas de formularios. Cada una enseña algo
 * distinto (no es el mismo formulario con otro color) y todas cumplen lo mismo de accesibilidad.
 */
const SRC = resolve(import.meta.dirname, '../src');
const PARTIALS = resolve(SRC, 'partials');

/** Páginas: archivo, esquema de validación (si lo usa) y marca única de su estructura. */
const PAGES = [
  { file: 'formulario-basico.html', schema: null, marca: 'au-form-basic' },
  { file: 'formulario-disenos.html', schema: null, marca: 'au-form-layouts' },
  { file: 'formulario-validacion.html', schema: 'pago', marca: 'au-form-validation' },
  { file: 'formulario-secciones.html', schema: 'registro-institucion', marca: 'au-form-sections' },
  { file: 'formulario-avanzado.html', schema: 'comunicado', marca: 'au-form-advanced' },
  { file: 'formulario-asistente.html', schema: 'estudiante', marca: 'au-form-wizard' },
  { file: 'formulario-editor.html', schema: 'comunicado', marca: 'au-form-editor' },
  { file: 'formulario-archivos.html', schema: null, marca: 'au-form-files' },
  { file: 'formulario-firma.html', schema: 'autorizacion', marca: 'au-form-signature' },
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

/**
 * Controles de formulario visibles de un HTML (sin ocultos ni botones).
 * @param {string} html HTML.
 * @returns {string[]} Etiquetas de apertura.
 */
const controls = (html) =>
  [...html.matchAll(/<(?:input|select|textarea)\b[^>]*>/g)]
    .map((m) => m[0])
    .filter((t) => !/type="(hidden|submit|reset|button)"/.test(t));

describe('páginas de formularios (spec 013 · V-03)', () => {
  for (const { file, schema, marca } of PAGES) {
    describe(file, () => {
      it('existe, con título y descripción propios', () => {
        expect(existsSync(resolve(SRC, file))).toBe(true);
        const ctx = /** @type {{ title: string, description?: string }} */ (pageContext(file));
        expect(ctx.title).not.toBe('Aula RD');
        expect(ctx.description?.length ?? 0).toBeGreaterThan(10);
      });

      it('usa el diseño de la aplicación: un solo h1, saltar al contenido, main y migas', () => {
        const html = render(file);
        expect((html.match(/<h1[\s>]/g) ?? []).length).toBe(1);
        expect(html).toMatch(/class="au-skip-link"/);
        expect(html).toMatch(/<main id="contenido"/);
        expect(html).toMatch(/class="au-breadcrumb"/);
        expect(html).toMatch(/<html lang="es-DO">/);
      });

      it('todo control tiene nombre accesible (etiqueta enlazada, aria-label o aria-labelledby)', () => {
        const html = render(file);
        for (const tag of controls(html)) {
          const id = tag.match(/\sid="([^"]+)"/)?.[1];
          const conEtiqueta = id && new RegExp(`<label[^>]*for="${id}"`).test(html);
          expect(conEtiqueta || /aria-label(ledby)?="[^"]+"/.test(tag), tag).toBeTruthy();
        }
      });

      it('los ids no se repiten', () => {
        const ids = [...render(file).matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
        const repetidos = ids.filter((id, i) => ids.indexOf(id) !== i);
        expect(repetidos).toEqual([]);
      });

      it('no tiene JavaScript ni estilos en línea, recursos externos ni enlaces vacíos', () => {
        const src = readFileSync(resolve(SRC, file), 'utf8');
        const html = render(file);
        expect(html).not.toMatch(/\son[a-z]+\s*=/i);
        expect(html).not.toMatch(/\sstyle\s*=/i);
        expect(html).not.toMatch(/(?:src|href)\s*=\s*"(https?:)?\/\/[^"]+"/i);
        expect(src).not.toContain('href="#"');
        expect(html).not.toMatch(/<script\b(?![^>]*src=)[^>]*>[^<]+<\/script>/i);
      });

      it('sus enlaces a otras páginas apuntan a archivos que existen', () => {
        for (const m of render(file).matchAll(/href\s*=\s*"([a-z0-9-]+\.html)"/gi)) {
          expect(existsSync(resolve(SRC, m[1])), m[1]).toBe(true);
        }
      });

      it(`tiene su estructura propia (${marca})`, () => {
        expect(render(file)).toContain(marca);
      });

      it('aparece en el menú de la galería y queda marcada como activa', () => {
        const ctx = /** @type {any} */ (pageContext(file));
        const todos = ctx.nav.flatMap((/** @type {any} */ i) => i.children ?? [i]);
        expect(todos.some((/** @type {any} */ i) => i.href === file && i.active)).toBe(true);
      });

      if (schema) {
        it(`valida con el esquema "${schema}", que existe, y tiene botón de envío`, () => {
          const html = render(file);
          expect(schemas.has(schema)).toBe(true);
          expect(html).toContain(`data-au-validate="${schema}"`);
          expect(html).toMatch(/<button[^>]*type="submit"/);
        });
      }
    });
  }

  it('cada página tiene una estructura distinta: ninguna marca aparece en dos páginas', () => {
    for (const a of PAGES) {
      const otras = PAGES.filter((b) => b.file !== a.file && render(b.file).includes(a.marca)).map(
        (b) => b.file,
      );
      expect(otras, `${a.marca} también está en ${otras.join(', ')}`).toEqual([]);
    }
  });

  it('controles básicos: muestra los tipos principales de campo, tamaños y estados', () => {
    const html = render('formulario-basico.html');
    for (const t of ['text', 'email', 'password', 'number', 'date', 'tel', 'range', 'checkbox', 'radio']) {
      expect(html, `type="${t}"`).toContain(`type="${t}"`);
    }
    for (const x of [
      '<select',
      '<textarea',
      'role="switch"',
      'form-control-lg',
      'form-control-sm',
      'input-group',
      ' disabled',
      ' readonly',
    ]) {
      expect(html, x).toContain(x);
    }
  });

  it('diseños: horizontal, en línea y con etiqueta flotante', () => {
    const html = render('formulario-disenos.html');
    expect(html).toContain('col-form-label');
    expect(html).toContain('row-cols-lg-auto');
    expect(html).toContain('form-floating');
  });

  it('validación: estados válido e inválido con mensajes enlazados por aria-describedby', () => {
    const html = render('formulario-validacion.html');
    expect(html).toContain('is-valid');
    expect(html).toContain('valid-feedback');
    expect(html).toContain('is-invalid');
    expect(html).toContain('invalid-feedback');
    for (const tag of controls(html).filter((t) => /is-invalid/.test(t))) {
      expect(tag).toMatch(/aria-invalid="true"/);
      const ref = tag.match(/aria-describedby="([^"]+)"/)?.[1];
      expect(ref, tag).toBeTruthy();
      expect(html).toContain(`id="${ref}"`);
    }
  });

  it('secciones: al menos tres fieldset con leyenda', () => {
    const html = render('formulario-secciones.html');
    expect((html.match(/<fieldset class="au-form-section"/g) ?? []).length).toBeGreaterThanOrEqual(3);
    expect((html.match(/<legend/g) ?? []).length).toBeGreaterThanOrEqual(3);
  });

  it('avanzado: listas con búsqueda, fechas, tres o más máscaras y orden por arrastre', () => {
    const html = render('formulario-avanzado.html');
    expect(html).toContain('data-au-select');
    expect(html).toMatch(/<select[^>]*multiple/);
    expect(html).toContain('data-au-datepicker');
    const mascaras = new Set([...html.matchAll(/data-au-mask="([a-z]+)"/g)].map((m) => m[1]));
    expect(mascaras.size).toBeGreaterThanOrEqual(3);
    expect(html).toContain('data-au-sortable');
  });

  describe('asistente por pasos', () => {
    it('usa pestañas accesibles, tres pasos y botones Siguiente/Anterior', () => {
      const html = render('formulario-asistente.html');
      expect(html).toContain('data-au-tabs');
      expect((html.match(/class="tab-pane/g) ?? []).length).toBe(3);
      expect((html.match(/data-au-tab-go="#[a-z0-9-]+"/g) ?? []).length).toBeGreaterThanOrEqual(4);
    });

    it('cada destino de un botón existe como paso', () => {
      const html = render('formulario-asistente.html');
      for (const m of html.matchAll(/data-au-tab-go="#([a-z0-9-]+)"/g)) {
        expect(html, m[1]).toMatch(
          new RegExp(`class="tab-pane[^"]*"[^>]*id="${m[1]}"|id="${m[1]}"[^>]*class="tab-pane`),
        );
      }
    });

    it('el último paso resume y envía (un solo botón de envío)', () => {
      const html = render('formulario-asistente.html');
      expect((html.match(/type="submit"/g) ?? []).length).toBe(1);
    });
  });

  it('editor: usa Quill enlazado a un campo oculto con nombre', () => {
    const html = render('formulario-editor.html');
    expect(html).toContain('data-au-editor');
    expect(html).toMatch(/data-au-input="#([a-z0-9-]+)"/);
    const id = html.match(/data-au-input="#([a-z0-9-]+)"/)?.[1];
    expect(html).toMatch(new RegExp(`<input type="hidden" name="mensaje" id="${id}"`));
  });

  it('archivos: campos nativos de archivo (uno, varios y solo imágenes) con ayuda de límites', () => {
    const html = render('formulario-archivos.html');
    expect((html.match(/type="file"/g) ?? []).length).toBeGreaterThanOrEqual(3);
    expect(html).toContain(' multiple');
    expect(html).toMatch(/accept="image\//);
    expect(html).toMatch(/class="form-text"/);
  });

  it('firma: lienzo con nombre, campo oculto "firma" y botón de borrar', () => {
    const html = render('formulario-firma.html');
    expect(html).toMatch(/<canvas[^>]*data-au-signature[^>]*aria-labelledby="[^"]+"/);
    expect(html).toMatch(/<input type="hidden" name="firma"/);
    expect(html).toContain('data-au-signature-clear');
  });
});
