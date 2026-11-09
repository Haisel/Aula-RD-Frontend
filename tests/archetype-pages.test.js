// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve, relative, sep } from 'node:path';
import Handlebars from 'handlebars';
import { pageContext, helpers } from '../src/data/pages.js';

/**
 * Spec 013 · T-08 a T-10 (RF-04): los ocho módulos que no caben en el arquetipo de tabla.
 * Planes (tarjetas), configuración (pestañas con formulario), asistencia y calificaciones
 * (cuadrículas de registro), bandeja de mensajes y calendario.
 */
const ROOT = resolve(import.meta.dirname, '..');
const SRC = resolve(ROOT, 'src');
const PARTIALS = resolve(SRC, 'partials');

/** Páginas: archivo, arquetipo y marca única de su estructura. */
const PAGES = [
  { file: 'superadmin-planes.html', arquetipo: 'plans', marca: 'au-plans' },
  { file: 'superadmin-configuracion.html', arquetipo: 'settings', marca: 'au-settings' },
  { file: 'institucion-configuracion.html', arquetipo: 'settings', marca: 'au-settings' },
  { file: 'docente-asistencia.html', arquetipo: 'attendance', marca: 'au-attendance' },
  { file: 'docente-calificaciones.html', arquetipo: 'grades', marca: 'au-grades' },
  { file: 'docente-mensajes.html', arquetipo: 'inbox', marca: 'au-inbox' },
  { file: 'docente-planificacion.html', arquetipo: 'calendar', marca: 'data-au-calendar' },
  { file: 'familia-horario.html', arquetipo: 'calendar', marca: 'data-au-calendar' },
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

/**
 * Contexto de módulo de una página.
 * @param {string} file Página.
 * @returns {any} Módulo.
 */
const moduleOf = (file) => /** @type {any} */ (pageContext(file)).module;

/**
 * Lee un JSON de `public/data/`.
 * @param {string} file Archivo.
 * @returns {any} Contenido.
 */
const data = (file) => JSON.parse(readFileSync(resolve(ROOT, 'public/data', file), 'utf8'));

/**
 * Controles de formulario visibles de un HTML.
 * @param {string} html HTML.
 * @returns {string[]} Etiquetas de apertura.
 */
const controls = (html) =>
  [...html.matchAll(/<(?:input|select|textarea)\b[^>]*>/g)]
    .map((m) => m[0])
    .filter((t) => !/type="(hidden|submit|reset|button)"/.test(t));

describe('módulos con arquetipo propio (spec 013)', () => {
  for (const { file, arquetipo } of PAGES) {
    describe(file, () => {
      it('existe, con su módulo y el arquetipo que le corresponde', () => {
        expect(existsSync(resolve(SRC, file))).toBe(true);
        expect(moduleOf(file).archetype).toBe(arquetipo);
      });

      it('muestra un solo h1 con el título del módulo, migas y aviso de demostración', () => {
        const html = render(file);
        expect((html.match(/<h1[\s>]/g) ?? []).length).toBe(1);
        expect(html).toContain(`>${moduleOf(file).title}</h1>`);
        expect(html).toMatch(/<nav aria-label="Migas de pan"/);
        expect(html).toMatch(/<li class="breadcrumb-item"><a href="dashboard-[a-z]+\.html">Inicio<\/a><\/li>/);
        expect(html).toContain('au-demo-note');
      });

      it('el menú de su portal la marca como activa', () => {
        const { nav } = /** @type {{ nav: { href?: string, active?: boolean }[] }} */ (pageContext(file));
        expect(nav.filter((i) => i.active).map((i) => i.href)).toEqual([file]);
      });

      it('todo control tiene nombre accesible y los ids no se repiten', () => {
        const html = render(file);
        for (const tag of controls(html)) {
          const id = tag.match(/\sid="([^"]+)"/)?.[1];
          const conEtiqueta = id && new RegExp(`<label[^>]*for="${id}"`).test(html);
          expect(conEtiqueta || /aria-label(ledby)?="[^"]+"/.test(tag), tag).toBeTruthy();
        }
        const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
        expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([]);
      });

      it('no tiene JavaScript ni estilos en línea, recursos externos ni enlaces vacíos', () => {
        const src = readFileSync(resolve(SRC, file), 'utf8');
        const html = render(file);
        expect(html).not.toMatch(/\son[a-z]+\s*=/i);
        expect(html).not.toMatch(/\sstyle\s*=/i);
        expect(html).not.toMatch(/(?:src|href)\s*=\s*"(https?:)?\/\/[^"]+"/i);
        expect(src).not.toContain('href="#"');
      });

      it('sus enlaces a otras páginas apuntan a archivos que existen', () => {
        for (const m of render(file).matchAll(/href\s*=\s*"([a-z0-9-]+\.html)"/gi)) {
          expect(existsSync(resolve(SRC, m[1])), m[1]).toBe(true);
        }
      });
    });
  }

  it('cada arquetipo se reconoce por su marca; las dos páginas de configuración comparten la suya', () => {
    for (const a of PAGES) {
      expect(render(a.file), a.file).toContain(a.marca);
      const otros = PAGES.filter((b) => b.marca !== a.marca && render(b.file).includes(a.marca)).map((b) => b.file);
      expect(otros, `${a.marca} también está en ${otros.join(', ')}`).toEqual([]);
    }
  });

  describe('planes (tarjetas)', () => {
    const html = render('superadmin-planes.html');
    const planes = data('planes.json');

    it('una tarjeta por plan, con su precio en pesos y su número de instituciones', () => {
      expect((html.match(/<article class="au-pricing/g) ?? []).length).toBe(planes.length);
      for (const p of planes) {
        expect(html).toContain(p.nombre);
        expect(html).toContain(`RD$ ${p.precio.toLocaleString('en-US')}.00`);
        expect(html).toContain(`${p.instituciones} instituciones`);
        expect(html).toContain(`Hasta ${p.estudiantes.toLocaleString('en-US')} estudiantes`);
      }
    });

    it('solo el plan destacado lleva la insignia y cada tarjeta tiene una acción con nombre', () => {
      expect((html.match(/au-pricing-flag/g) ?? []).length).toBe(1);
      for (const p of planes) expect(html).toContain(`aria-label="Editar el plan ${p.nombre}"`);
    });
  });

  describe('configuración (pestañas)', () => {
    for (const file of ['superadmin-configuracion.html', 'institucion-configuracion.html']) {
      it(`${file}: usa pestañas accesibles con tres paneles y un botón de guardar`, () => {
        const html = render(file);
        expect(html).toContain('data-au-tabs');
        expect((html.match(/class="tab-pane/g) ?? []).length).toBe(3);
        expect(html).toMatch(/<button[^>]*data-au-action="toast"[^>]*>Guardar cambios<\/button>/);
        expect(controls(html).length).toBeGreaterThanOrEqual(8);
      });
    }

    it('cada una tiene sus propios campos (no es la misma página)', () => {
      const a = render('superadmin-configuracion.html');
      const b = render('institucion-configuracion.html');
      expect(a).toContain('Correo de soporte');
      expect(b).toContain('RNC');
      expect(a).not.toContain('RNC');
    });
  });

  describe('asistencia (cuadrícula)', () => {
    const html = render('docente-asistencia.html');
    const filas = moduleOf('docente-asistencia.html').rows;

    it('valida con el esquema "asistencia" y tiene una sola fila por estudiante', () => {
      expect(html).toContain('data-au-validate="asistencia"');
      expect(filas.length).toBe(12);
      const cuerpo = html.slice(html.indexOf('<tbody>'), html.indexOf('</tbody>'));
      expect((cuerpo.match(/<tr>/g) ?? []).length).toBe(filas.length);
    });

    it('cada estudiante tiene tres opciones del mismo grupo (e1…e12) con nombre accesible y una marcada', () => {
      filas.forEach((/** @type {any} */ f, /** @type {number} */ i) => {
        const n = i + 1;
        for (const estado of ['presente', 'tardanza', 'ausente']) {
          expect(html).toMatch(new RegExp(`name="e${n}" value="${estado}"[^>]*aria-label="${f.nombre.replaceAll('&', '&amp;')} ${estado}"`));
        }
        expect((html.match(new RegExp(`name="e${n}"[^>]*checked`, 'g')) ?? []).length).toBe(1);
      });
    });
  });

  describe('calificaciones (cuadrícula)', () => {
    const html = render('docente-calificaciones.html');
    const filas = moduleOf('docente-calificaciones.html').rows;

    it('un campo numérico de 0 a 100 por estudiante y evaluación, con nombre accesible', () => {
      const campos = html.match(/<input[^>]*type="number"[^>]*>/g) ?? [];
      expect(campos.length).toBe(filas.length * 3);
      for (const c of campos) {
        expect(c).toMatch(/min="0"/);
        expect(c).toMatch(/max="100"/);
        expect(c).toMatch(/aria-label="[^"]+, (Quiz|Tarea|Examen)"/);
      }
    });

    it('avisa que la plantilla no calcula promedios ni guarda', () => {
      expect(html).toMatch(/no calcula/i);
    });
  });

  describe('mensajes (bandeja)', () => {
    const html = render('docente-mensajes.html');
    const mensajes = data('mensajes.json');

    it('una pestaña y un panel por mensaje, enlazados entre sí, dentro de data-au-tabs', () => {
      expect(html).toContain('data-au-tabs');
      expect((html.match(/class="tab-pane/g) ?? []).length).toBe(mensajes.length);
      for (const m of mensajes) {
        expect(html).toContain(`data-bs-target="#msg-${m.id}"`);
        expect(html).toContain(`id="msg-${m.id}"`);
        expect(html).toContain(m.asunto);
      }
    });

    it('marca los no leídos con texto (no solo con negrita) y cuenta cuántos son', () => {
      const sinLeer = mensajes.filter((/** @type {any} */ m) => !m.leido).length;
      expect((html.match(/No leído/g) ?? []).length).toBe(sinLeer);
      expect(html).toContain(`${sinLeer} sin leer`);
    });

    it('cada mensaje se puede responder', () => {
      expect((html.match(/>Responder</g) ?? []).length).toBe(mensajes.length);
    });
  });

  describe('calendario', () => {
    it('la planificación muestra el mes con los eventos de public/data', () => {
      const html = render('docente-planificacion.html');
      const src = html.match(/data-au-calendar="([^"]+)"/)?.[1] ?? '';
      expect(existsSync(resolve(ROOT, 'public', src)), src).toBe(true);
      expect(html).toMatch(/data-au-view="dayGridMonth"/);
    });

    it('el horario de la familia usa la vista de lista', () => {
      const html = render('familia-horario.html');
      expect(html).toMatch(/data-au-view="listMonth"/);
      expect(html).toMatch(/data-au-calendar="data\/eventos\.json"/);
    });

    it('el calendario tiene una región con nombre accesible', () => {
      for (const f of ['docente-planificacion.html', 'familia-horario.html']) {
        expect(render(f)).toMatch(/role="region"[^>]*aria-label="[^"]+"/);
      }
    });
  });
});
