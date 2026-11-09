// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pageContext } from '../src/data/pages.js';
import { estadoMarca } from '../src/js/demo/seleccion.js';

/**
 * Spec 012, T-15: contrato de `ejemplo-tablas.html` y de su código de demostración.
 * RF-06 (DataTables con selección de filas, acciones masivas según la selección, filtros externos
 * y fila de detalle), CA-07 (las acciones masivas se habilitan según la selección), RF-11 (Cómo se
 * usa), RF-13 (código aparte, no en `app.js`), RN-02 (nada se guarda en el navegador).
 */
const SRC = resolve(import.meta.dirname, '../src');
const PAGE = 'ejemplo-tablas.html';
const DEMO = resolve(SRC, 'js/demo/tablas-page.js');

/**
 * Lee un archivo fuente.
 * @param {string} path Ruta absoluta.
 * @returns {string} Contenido.
 */
const read = (path) => readFileSync(path, 'utf8');

describe('estadoMarca (casilla "seleccionar todo")', () => {
  it('ninguna fila marcada → desmarcada', () => {
    expect(estadoMarca(0, 10)).toBe('ninguna');
  });
  it('algunas filas marcadas → indeterminada', () => {
    expect(estadoMarca(3, 10)).toBe('algunas');
  });
  it('todas las filas marcadas → marcada', () => {
    expect(estadoMarca(10, 10)).toBe('todas');
  });
  it('sin filas visibles → desmarcada (no "todas")', () => {
    expect(estadoMarca(0, 0)).toBe('ninguna');
  });
});

describe('ejemplo-tablas.html (spec 012 · T-15)', () => {
  it('existen la página y su código de demostración', () => {
    expect(existsSync(resolve(SRC, PAGE))).toBe(true);
    expect(existsSync(DEMO)).toBe(true);
  });

  it('el contexto activa la entrada de demostración y el menú de la galería', () => {
    const ctx = /** @type {any} */ (pageContext(PAGE));
    expect(ctx.demo).toBe(true);
    expect(ctx.portal).toBe('galeria');
    expect(ctx.title).toMatch(/tabla/i);
  });

  it('declara data-demo="tablas" con filtros externos, contador y acciones masivas', () => {
    const html = read(resolve(SRC, PAGE));
    expect(html).toContain('data-demo="tablas"');
    for (const hook of ['filtro-grado', 'filtro-estado', 'region', 'anuncio', 'contador']) {
      expect(html, hook).toContain(`data-tbl="${hook}"`);
    }
    for (const accion of ['activar', 'desactivar', 'exportar', 'eliminar']) {
      const tag = html.match(new RegExp(`<button[^>]*data-tbl="${accion}"[^>]*>`))?.[0] ?? '';
      expect(tag, accion).toMatch(/\sdisabled(\s|>|=)/);
    }
    expect(html).toMatch(/components\/demo-note/);
    expect(html).toMatch(/Cómo se usa/);
  });

  it('el código usa solo AU, tiene fila de detalle, exporta y confirma el borrado', () => {
    const js = read(DEMO);
    expect(js).not.toMatch(/localStorage|sessionStorage|indexedDB|document\.cookie/);
    expect(js).not.toMatch(/from ['"](datatables|axios|xlsx)/);
    expect(js).toMatch(/createDataTable/);
    expect(js).toMatch(/\.child\(/);
    expect(js).toMatch(/aria-expanded/);
    expect(js).toMatch(/exportRows/);
    expect(js).toMatch(/confirmDelete/);
    expect(js).toMatch(/indeterminate/);
    expect(js).toMatch(/from '\.\/seleccion\.js'/);
  });

  it('está registrado en el punto de entrada de la galería', () => {
    expect(read(resolve(SRC, 'js/demo/galeria.js'))).toMatch(/tablas/);
  });
});
