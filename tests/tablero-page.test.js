// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pageContext } from '../src/data/pages.js';

/**
 * Spec 012, T-18: contrato de `ejemplo-kanban.html` y de su código de demostración.
 * RF-15 (tablero con tarjetas arrastrables, también por teclado y con aviso), RF-11 (Cómo se usa),
 * RF-13 (código aparte, no en `app.js`), RN-02 (nada se guarda en el navegador).
 */
const SRC = resolve(import.meta.dirname, '../src');
const PAGE = 'ejemplo-kanban.html';
const DEMO = resolve(SRC, 'js/demo/tablero-page.js');

/**
 * Lee un archivo fuente.
 * @param {string} path Ruta absoluta.
 * @returns {string} Contenido.
 */
const read = (path) => readFileSync(path, 'utf8');

describe('ejemplo-kanban.html (spec 012 · T-18)', () => {
  it('existen la página y su código de demostración', () => {
    expect(existsSync(resolve(SRC, PAGE))).toBe(true);
    expect(existsSync(DEMO)).toBe(true);
  });

  it('el contexto activa la entrada de demostración y el menú de la galería', () => {
    const ctx = /** @type {any} */ (pageContext(PAGE));
    expect(ctx.demo).toBe(true);
    expect(ctx.portal).toBe('galeria');
    expect(ctx.title).toMatch(/tablero|kanban|solicitudes/i);
  });

  it('declara data-demo="tablero" con región, anuncio y botón de restablecer', () => {
    const html = read(resolve(SRC, PAGE));
    expect(html).toContain('data-demo="tablero"');
    for (const hook of ['region', 'anuncio', 'reiniciar']) {
      expect(html, hook).toContain(`data-tab="${hook}"`);
    }
    expect(html).toMatch(/components\/demo-note/);
    expect(html).toMatch(/Cómo se usa/);
    expect(html, 'explica el teclado').toMatch(/teclado/i);
  });

  it('el código usa solo AU, arrastra con AU.dragSort, ofrece botones de mover y no guarda nada', () => {
    const js = read(DEMO);
    expect(js).not.toMatch(/localStorage|sessionStorage|indexedDB|document\.cookie/);
    expect(js).not.toMatch(/from ['"](sortablejs|axios)/);
    expect(js).toMatch(/dragSort/);
    expect(js).toMatch(/data-tab-move/);
    expect(js).toMatch(/from '\.\/tablero\.js'/);
  });

  it('define estilos propios para el tablero', () => {
    expect(read(resolve(SRC, 'scss/components/_kanban.scss'))).toMatch(/au-kanban/);
  });

  it('está registrado en el punto de entrada de la galería', () => {
    expect(read(resolve(SRC, 'js/demo/galeria.js'))).toMatch(/tablero/);
  });
});
