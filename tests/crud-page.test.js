// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pageContext } from '../src/data/pages.js';

/**
 * Spec 012, T-16: contrato de `ejemplo-crud.html` y de su código de demostración.
 * RF-03 (crear, editar y borrar con validación, confirmación y aviso), RF-11 (Cómo se usa),
 * RF-13 (código aparte, no en `app.js`), RN-02 (nada se guarda en el navegador).
 */
const SRC = resolve(import.meta.dirname, '../src');
const PAGE = 'ejemplo-crud.html';
const DEMO = resolve(SRC, 'js/demo/crud.js');

/**
 * Lee un archivo fuente.
 * @param {string} path Ruta absoluta.
 * @returns {string} Contenido.
 */
const read = (path) => readFileSync(path, 'utf8');

describe('ejemplo-crud.html (spec 012 · T-16)', () => {
  it('existen la página y su código de demostración', () => {
    expect(existsSync(resolve(SRC, PAGE))).toBe(true);
    expect(existsSync(DEMO)).toBe(true);
  });

  it('el contexto activa la entrada de demostración y el menú de la galería (RF-13, RF-02)', () => {
    const ctx = /** @type {any} */ (pageContext(PAGE));
    expect(ctx.demo).toBe(true);
    expect(ctx.portal).toBe('galeria');
    expect(ctx.title).toMatch(/CRUD|Altas|Estudiantes/i);
  });

  it('declara la demostración con data-demo="crud" y trae tabla, formulario y aviso', () => {
    const html = read(resolve(SRC, PAGE));
    expect(html).toContain('data-demo="crud"');
    expect(html).toContain('data-au-validate="crud-estudiante"');
    expect(html).toMatch(/components\/demo-note/);
    expect(html).toMatch(/no se guardan|se pierden al recargar/i);
    expect(html).toMatch(/Cómo se usa/);
  });

  it('tiene los controles de los cuatro estados simulados y de deshacer', () => {
    const html = read(resolve(SRC, PAGE));
    for (const estado of ['normal', 'vacio', 'cargando', 'error']) {
      expect(html, estado).toContain(`value="${estado}"`);
    }
    expect(html).toContain('data-crud="deshacer"');
    expect(html).toContain('data-crud="nuevo"');
  });

  it('el código de demostración usa solo AU y no guarda nada en el navegador (RN-02, CA-14)', () => {
    const js = read(DEMO);
    expect(js).not.toMatch(/localStorage|sessionStorage|indexedDB|document\.cookie/);
    expect(js).not.toMatch(/from ['"](axios|sweetalert2|datatables|zod)/);
    expect(js).toMatch(/registerSchema\(\s*['"]crud-estudiante['"]/);
    expect(js).toMatch(/confirmDelete/);
  });

  it('está registrado en el punto de entrada de la galería', () => {
    expect(read(resolve(SRC, 'js/demo/galeria.js'))).toMatch(/crud/);
  });
});
