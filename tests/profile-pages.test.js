// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve, relative, sep } from 'node:path';
import Handlebars from 'handlebars';
import { pageContext, helpers } from '../src/data/pages.js';

/**
 * Spec 013 · V-02 (RF-06, RF-12, CA-13): seis variantes de perfil. Cada una tiene una estructura
 * distinta y todas comparten datos (`public/data/perfiles.json`), accesibilidad y calidad.
 */
const ROOT = resolve(import.meta.dirname, '..');
const SRC = resolve(ROOT, 'src');
const PARTIALS = resolve(SRC, 'partials');

/** Variantes: archivo, perfil que muestran y marca que identifica su estructura (única). */
const PAGES = [
  { file: 'perfil-portada.html', profile: 'docente', marca: 'au-profile-cover' },
  { file: 'perfil-lateral.html', profile: 'tutor', marca: 'au-profile-side' },
  { file: 'perfil-compacto.html', profile: 'estudiante', marca: 'au-profile-compact' },
  { file: 'perfil-credencial.html', profile: 'estudiante', marca: 'au-profile-id' },
  { file: 'perfil-institucion.html', profile: 'institucion', marca: 'au-profile-org' },
  { file: 'perfil-editable.html', profile: 'docente', marca: 'au-profile-edit' },
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
      const id = relative(PARTIALS, p).split(sep).join('/').replace(/\.(hbs|html)$/, '');
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

const data = JSON.parse(readFileSync(resolve(ROOT, 'public/data/perfiles.json'), 'utf8'));

describe('datos de perfiles (public/data/perfiles.json)', () => {
  it.each(['docente', 'tutor', 'estudiante', 'institucion'])('el perfil "%s" tiene lo mínimo', (k) => {
    const p = data[k];
    for (const campo of ['name', 'initials', 'role', 'institution', 'email', 'phone', 'since', 'bio']) {
      expect(typeof p[campo], `${k}.${campo}`).toBe('string');
      expect(p[campo].length, `${k}.${campo}`).toBeGreaterThan(0);
    }
    expect(p.stats).toHaveLength(3);
    expect(p.details.length).toBeGreaterThanOrEqual(3);
    expect(p.activity.length).toBeGreaterThanOrEqual(2);
    expect(p.initials).toMatch(/^[A-ZÁÉÍÓÚÑ0-9]{2}$/);
  });

  it('no usa fotos ni recursos externos', () => {
    expect(JSON.stringify(data)).not.toMatch(/https?:\/\//);
  });

  it('las fechas de la actividad tienen formato DD/MM/AAAA', () => {
    for (const p of Object.values(data)) {
      for (const a of /** @type {any} */ (p).activity) expect(a.when).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    }
  });
});

describe('variantes de perfil (spec 013 · V-02)', () => {
  for (const { file, profile, marca } of PAGES) {
    describe(file, () => {
      it('existe, con título, descripción y el perfil de datos que muestra', () => {
        expect(existsSync(resolve(SRC, file))).toBe(true);
        const ctx = /** @type {any} */ (pageContext(file));
        expect(ctx.title).not.toBe('Aula RD');
        expect(ctx.description?.length ?? 0).toBeGreaterThan(10);
        expect(ctx.profile?.name).toBe(data[profile].name);
      });

      it('usa el diseño de la aplicación: un solo h1, saltar al contenido, main y migas', () => {
        const html = render(file);
        expect((html.match(/<h1[\s>]/g) ?? []).length).toBe(1);
        expect(html).toMatch(/class="au-skip-link"/);
        expect(html).toMatch(/<main id="contenido"/);
        expect(html).toMatch(/class="au-breadcrumb"/);
        expect(html).toMatch(/<html lang="es-DO">/);
      });

      it('muestra los datos del perfil, escapados', () => {
        const html = render(file);
        expect(html).toContain(data[profile].name);
        expect(html).toContain(data[profile].initials);
      });

      it('el avatar es decorativo (iniciales) y no hay imágenes externas', () => {
        const html = render(file);
        expect(html).not.toMatch(/<img[^>]+src="(https?:)?\/\//i);
        for (const m of html.matchAll(/<img[^>]*>/g)) expect(m[0]).toMatch(/alt="/);
      });

      it('no tiene JavaScript ni estilos en línea, recursos externos ni enlaces vacíos', () => {
        const src = readFileSync(resolve(SRC, file), 'utf8');
        const html = render(file);
        expect(html).not.toMatch(/\son[a-z]+\s*=/i);
        expect(html).not.toMatch(/\sstyle\s*=/i);
        expect(html).not.toMatch(/(?:src|href)\s*=\s*"(https?:)?\/\/[^"]+"/i);
        expect(src).not.toContain('href="#"');
      });

      it('los ids no se repiten y sus enlaces a páginas existen', () => {
        const html = render(file);
        const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
        expect(new Set(ids).size, 'ids repetidos').toBe(ids.length);
        for (const m of html.matchAll(/href\s*=\s*"([a-z0-9-]+\.html)"/gi)) {
          expect(existsSync(resolve(SRC, m[1])), m[1]).toBe(true);
        }
      });

      it(`tiene su estructura propia (${marca})`, () => {
        expect(render(file)).toContain(marca);
      });

      it('aparece en el menú de la galería y queda marcada como activa', () => {
        const ctx = /** @type {any} */ (pageContext(file));
        const todos = ctx.nav.flatMap((i) => i.children ?? [i]);
        expect(todos.some((i) => i.href === file && i.active)).toBe(true);
      });
    });
  }

  it('cada variante tiene una estructura distinta: ninguna marca aparece en dos páginas', () => {
    for (const a of PAGES) {
      const otras = PAGES.filter((b) => b.file !== a.file && render(b.file).includes(a.marca)).map((b) => b.file);
      expect(otras, `${a.marca} también está en ${otras.join(', ')}`).toEqual([]);
    }
  });

  it('la variante con portada usa pestañas accesibles (data-au-tabs) con tres paneles', () => {
    const html = render('perfil-portada.html');
    expect(html).toContain('data-au-tabs');
    expect((html.match(/class="tab-pane/g) ?? []).length).toBe(3);
  });

  it('la variante compacta muestra la línea de tiempo con la actividad', () => {
    const html = render('perfil-compacto.html');
    expect(html).toContain('au-timeline');
    for (const a of data.estudiante.activity) expect(html).toContain(a.title);
  });

  it('la credencial es un solo bloque con la matrícula y un botón de imprimir', () => {
    const html = render('perfil-credencial.html');
    expect(html).toContain(data.estudiante.code);
    expect(html).toMatch(/data-au-action="print"/);
  });

  it('el título de la credencial hereda el color blanco (en claro, el de encabezado era oscuro sobre azul marino: 1.24:1)', () => {
    const scss = readFileSync(resolve(SRC, 'scss/components/_profile.scss'), 'utf8');
    expect(scss).toMatch(/\.au-profile-id \{[\s\S]*?h2 \{[^}]*color: inherit;/);
  });

  describe('perfil editable', () => {
    it('es un formulario validado con el esquema "perfil"', () => {
      const html = render('perfil-editable.html');
      expect(html).toContain('data-au-validate="perfil"');
      expect(html).toMatch(/<button[^>]*type="submit"/);
    });

    it('todo campo tiene su etiqueta y arranca con los datos del perfil', () => {
      const html = render('perfil-editable.html');
      for (const m of html.matchAll(/<(?:input|select|textarea)[^>]*\sid="([^"]+)"[^>]*>/g)) {
        if (/type="hidden"/.test(m[0])) continue;
        expect(html, `falta <label for="${m[1]}">`).toMatch(new RegExp(`<label[^>]*for="${m[1]}"`));
      }
      expect(html).toContain(`value="${data.docente.email}"`);
    });
  });
});
