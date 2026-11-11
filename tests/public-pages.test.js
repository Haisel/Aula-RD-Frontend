// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve, relative, sep } from 'node:path';
import Handlebars from 'handlebars';
import { pageContext, helpers } from '../src/data/pages.js';
import { schemas, validate } from '../src/js/helpers/schemas.js';

/**
 * Spec 013 · RF-01, RF-08, RN-03: páginas públicas (contacto, términos y privacidad) y los
 * enlaces que antes eran `href="#"` (pie de página, términos del registro, barra superior).
 * El texto legal es de RELLENO y debe estar rotulado como tal.
 */
const SRC = resolve(import.meta.dirname, '../src');
const PARTIALS = resolve(SRC, 'partials');

const PUBLICAS = ['contacto.html', 'terminos.html', 'privacidad.html', 'cookies.html', 'reembolsos.html'];
const LEGALES = ['terminos.html', 'privacidad.html', 'cookies.html', 'reembolsos.html'];

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

describe('páginas públicas (spec 013)', () => {
  for (const file of PUBLICAS) {
    describe(file, () => {
      it('existe, con título y descripción propios', () => {
        expect(existsSync(resolve(SRC, file))).toBe(true);
        const ctx = /** @type {{ title: string, description?: string }} */ (pageContext(file));
        expect(ctx.title).not.toBe('Aula RD');
        expect(ctx.description?.length ?? 0).toBeGreaterThan(10);
      });

      it('usa el diseño de la landing: barra, un solo h1, main y pie de página', () => {
        const html = render(file);
        expect((html.match(/<h1[\s>]/g) ?? []).length).toBe(1);
        expect(html).toMatch(/class="au-skip-link"/);
        expect(html).toMatch(/<main id="contenido"/);
        expect(html).toContain('au-navbar');
        expect(html).toContain('au-footer');
        expect(html).toMatch(/<html lang="es-DO">/);
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
        expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([]);
        for (const m of html.matchAll(/href\s*=\s*"([a-z0-9-]+\.html)(?:#[^"]*)?"/gi)) {
          expect(existsSync(resolve(SRC, m[1])), m[1]).toBe(true);
        }
      });
    });
  }

  for (const file of LEGALES) {
    describe(`${file} (texto legal)`, () => {
      const html = () => render(file);

      it('avisa que es un borrador pendiente de revisión jurídica', () => {
        expect(html()).toMatch(/role="note"[^>]*>[\s\S]*Borrador pendiente de revisión jurídica/);
      });

      it('tiene al menos cinco secciones con título h2 e id', () => {
        expect((html().match(/<h2 id="[^"]+"/g) ?? []).length).toBeGreaterThanOrEqual(5);
      });

      it('el índice enlaza a cada sección y todos los destinos existen', () => {
        const h = html();
        const destinos = [...h.matchAll(/<a href="#([a-z0-9-]+)"/g)].map((m) => m[1]);
        expect(destinos.length).toBeGreaterThanOrEqual(5);
        for (const d of destinos) expect(h, d).toContain(`id="${d}"`);
      });

      it('indica la fecha de la última actualización en formato DD/MM/AAAA', () => {
        expect(html()).toMatch(/Última actualización: \d{2}\/\d{2}\/\d{4}/);
      });
    });
  }

  describe('contacto', () => {
    const html = () => render('contacto.html');

    it('el formulario se valida con el esquema "contacto" y tiene botón de envío', () => {
      expect(schemas.has('contacto')).toBe(true);
      expect(html()).toContain('data-au-validate="contacto"');
      expect(html()).toMatch(/<button[^>]*type="submit"/);
    });

    it('todo campo tiene etiqueta enlazada', () => {
      const h = html();
      for (const m of h.matchAll(/<(?:input|select|textarea)\b[^>]*>/g)) {
        if (/type="(hidden|submit)"/.test(m[0])) continue;
        const id = m[0].match(/\sid="([^"]+)"/)?.[1];
        expect(id, m[0]).toBeTruthy();
        expect(h, id).toMatch(new RegExp(`<label[^>]*for="${id}"`));
      }
    });

    it('la fila no usa gutter horizontal en móvil (g-5 desbordaba 4 px a 390 px)', () => {
      expect(html()).not.toMatch(/class="row g-5"/);
      expect(html()).toMatch(/class="row gy-5 gx-lg-5"/);
    });

    it('los datos de contacto son de ejemplo y están rotulados como tales', () => {
      expect(html()).toMatch(/contacto@ejemplo\.do/);
      expect(html()).toMatch(/datos de contacto son de ejemplo/);
    });
  });
});

describe('esquema "contacto"', () => {
  /**
   * Valida datos con el esquema "contacto".
   * @param {Record<string, unknown>} data Datos.
   * @returns {ReturnType<typeof validate>} Resultado.
   */
  const check = (data) => validate(/** @type {any} */ (schemas.get('contacto')), data);
  const ok = {
    nombre: 'Ana Pérez',
    email: 'ana@colegio.edu.do',
    mensaje: 'Quisiera solicitar una demostración del sistema.',
  };

  it('acepta datos completos', () => {
    expect(check(ok).success).toBe(true);
  });

  it('pide nombre, correo y mensaje, con mensajes en español', () => {
    const r = check({ nombre: '', email: '', mensaje: '' });
    expect(r.errors.nombre).toBe('Escriba el nombre.');
    expect(r.errors.email).toBe('Escriba el correo.');
    expect(r.errors.mensaje).toMatch(/mensaje/);
  });

  it('rechaza un correo mal escrito y un mensaje demasiado corto', () => {
    expect(check({ ...ok, email: 'ana' }).errors.email).toMatch(/correo válido/);
    expect(check({ ...ok, mensaje: 'Hola' }).success).toBe(false);
  });

  it('limita el mensaje a 1,000 caracteres', () => {
    expect(check({ ...ok, mensaje: 'a'.repeat(1001) }).errors.mensaje).toBe('Use 1,000 caracteres o menos.');
  });
});

describe('enlaces que antes eran href="#"', () => {
  it('el pie de página lleva a contacto, términos y privacidad', () => {
    const html = hb.compile('{{> landing/footer}}')({ year: 2026 });
    expect(html).toContain('<a href="contacto.html">Contacto</a>');
    expect(html).toContain('<a href="terminos.html">Términos de uso</a>');
    expect(html).toContain('<a href="privacidad.html">Privacidad</a>');
  });

  it('el registro enlaza los términos y la privacidad', () => {
    const html = readFileSync(resolve(SRC, 'suscribir.html'), 'utf8');
    expect(html).toContain('<a href="terminos.html">términos de uso</a>');
    expect(html).toContain('<a href="privacidad.html">política de privacidad</a>');
  });

  it('el botón "Solicitar demostración" del cierre de la landing lleva a contacto', () => {
    const html = readFileSync(resolve(SRC, 'index.html'), 'utf8');
    expect(html).toMatch(/href="contacto\.html">Solicitar demostración<\/a>/);
  });

  it('el menú de usuario lleva a Mi perfil y a Preferencias', () => {
    const html = hb.compile('{{> app/topbar}}')({ user: { name: 'X', role: 'Y', initials: 'XY' } });
    expect(html).toMatch(/href="perfil-portada\.html"[^>]*>[\s\S]*?Mi perfil/);
    expect(html).toMatch(/href="perfil-editable\.html"[^>]*>[\s\S]*?Preferencias/);
  });

  it('cada aviso de la barra superior lleva a la página donde se atiende', () => {
    const html = hb.compile('{{> app/topbar}}')({ user: { name: 'X', role: 'Y', initials: 'XY' } });
    expect(html).toMatch(/href="institucion-cobros\.html"[^>]*>[\s\S]*?Pago registrado/);
    expect(html).toMatch(/href="institucion-calificaciones\.html"[^>]*>[\s\S]*?secciones sin calificaciones/);
    expect(html).toMatch(/href="institucion-comunicados\.html"[^>]*>[\s\S]*?Nuevo comunicado/);
  });

  it('los botones de los paneles llevan a su módulo', () => {
    const inst = readFileSync(resolve(SRC, 'dashboard-institucion.html'), 'utf8');
    expect(inst).toMatch(/href="institucion-estudiantes\.html"[^>]*>[\s\S]*?Agregar estudiante/);
    expect(inst).toMatch(/href="institucion-calificaciones\.html">Ver secciones</);
    const sa = readFileSync(resolve(SRC, 'dashboard-superadmin.html'), 'utf8');
    expect(sa).toMatch(/href="superadmin-instituciones\.html"[^>]*>[\s\S]*?Nueva institución/);
  });
});
