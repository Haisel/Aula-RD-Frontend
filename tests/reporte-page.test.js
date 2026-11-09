// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pageContext } from '../src/data/pages.js';

/**
 * Spec 012, T-17: contrato de `ejemplo-reporte.html` y de su código de demostración.
 * RF-04 (filtros que actualizan indicadores, gráficos y tabla; exportar a Excel; impresión),
 * RF-11 (Cómo se usa), RF-13 (código aparte, no en `app.js`), RN-02 (nada se guarda en el navegador).
 */
const SRC = resolve(import.meta.dirname, '../src');
const PAGE = 'ejemplo-reporte.html';
const DEMO = resolve(SRC, 'js/demo/reporte-page.js');

/**
 * Lee un archivo fuente.
 * @param {string} path Ruta absoluta.
 * @returns {string} Contenido.
 */
const read = (path) => readFileSync(path, 'utf8');

describe('ejemplo-reporte.html (spec 012 · T-17)', () => {
  it('existen la página y su código de demostración', () => {
    expect(existsSync(resolve(SRC, PAGE))).toBe(true);
    expect(existsSync(DEMO)).toBe(true);
  });

  it('el contexto activa la entrada de demostración y el menú de la galería', () => {
    const ctx = /** @type {any} */ (pageContext(PAGE));
    expect(ctx.demo).toBe(true);
    expect(ctx.portal).toBe('galeria');
    expect(ctx.title).toMatch(/reporte/i);
  });

  it('declara data-demo="reporte" con filtros, indicadores, gráficos y tabla', () => {
    const html = read(resolve(SRC, PAGE));
    expect(html).toContain('data-demo="reporte"');
    for (const hook of [
      'filtro-grado',
      'filtro-estado',
      'filtro-pagos',
      'limpiar',
      'region',
      'exportar',
      'imprimir',
    ]) {
      expect(html, hook).toContain(`data-rep="${hook}"`);
    }
    expect((html.match(/<canvas/g) ?? []).length).toBeGreaterThanOrEqual(2);
    expect(html).toMatch(/components\/demo-note/);
    expect(html).toMatch(/Cómo se usa/);
  });

  it('los gráficos tienen alternativa de texto', () => {
    const canvases = [...read(resolve(SRC, PAGE)).matchAll(/<canvas\b[^>]*>/g)].map((m) => m[0]);
    for (const tag of canvases) expect(tag).toMatch(/role="img"[^>]*aria-label=|aria-label=[^>]*role="img"/);
  });

  it('el código usa solo AU, exporta con AU.exportRows y no guarda nada en el navegador', () => {
    const js = read(DEMO);
    expect(js).not.toMatch(/localStorage|sessionStorage|indexedDB|document\.cookie/);
    expect(js).not.toMatch(/from ['"](axios|chart\.js|xlsx|datatables)/);
    expect(js).toMatch(/exportRows|exportExcel/);
    expect(js).toMatch(/openChart/);
    expect(js).toMatch(/from '\.\/reporte\.js'/);
  });

  it('define reglas de impresión que ocultan el menú y los controles', () => {
    const scss = read(resolve(SRC, 'scss/components/_report.scss'));
    expect(scss).toMatch(/@media print/);
    expect(scss).toMatch(/au-sidebar/);
  });

  it('está registrado en el punto de entrada de la galería', () => {
    expect(read(resolve(SRC, 'js/demo/galeria.js'))).toMatch(/reporte/);
  });
});
