// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pageContext } from '../src/data/pages.js';

/**
 * Spec 013 · T-03 / RF-03 / CA-07: páginas de error reales (403, 404, 500) y de mantenimiento,
 * con el mismo diseño de la plantilla y siempre una salida.
 */
const SRC = resolve(import.meta.dirname, '../src');

const PAGES = [
  { file: '403.html', code: '403' },
  { file: '404.html', code: '404' },
  { file: '500.html', code: '500' },
  { file: 'mantenimiento.html', code: null },
];

/**
 * Lee una página fuente.
 * @param {string} file Nombre del archivo en `src/`.
 * @returns {string} Contenido.
 */
const read = (file) => readFileSync(resolve(SRC, file), 'utf8');

describe('páginas de error y de mantenimiento (spec 013 · RF-03)', () => {
  for (const { file, code } of PAGES) {
    describe(file, () => {
      it('existe', () => {
        expect(existsSync(resolve(SRC, file))).toBe(true);
      });

      it('usa el diseño de la plantilla (cabecera común, idioma es-DO y un solo h1)', () => {
        const html = read(file);
        expect(html).toMatch(/<html lang="es-DO">/);
        expect(html).toMatch(/\{\{>\s*layouts\/head\s*\}\}/);
        expect((html.match(/<h1[\s>]/g) ?? []).length).toBe(1);
      });

      it('tiene título y descripción propios (no el genérico)', () => {
        const ctx = /** @type {{ title: string, description?: string }} */ (pageContext(file));
        expect(ctx.title).not.toBe('Aula RD');
        expect(ctx.description?.length ?? 0).toBeGreaterThan(10);
      });

      it('siempre ofrece una salida a una página que existe', () => {
        const hrefs = [...read(file).matchAll(/href\s*=\s*"([a-z0-9-]+\.html)"/gi)].map((m) => m[1]);
        expect(hrefs.length).toBeGreaterThan(0);
        expect(hrefs).toContain('index.html');
        for (const h of hrefs) expect(existsSync(resolve(SRC, h)), h).toBe(true);
      });

      it('no tiene JavaScript ni estilos en línea ni recursos externos', () => {
        const html = read(file);
        expect(html).not.toMatch(/\son[a-z]+\s*=/i);
        expect(html).not.toMatch(/\sstyle\s*=/i);
        expect(html).not.toMatch(/<script\b(?![^>]*src=)[^>]*>[^<]+<\/script>/i);
        expect(html).not.toMatch(/(?:src|href)\s*=\s*"(https?:)?\/\/[^"]+"/i);
      });

      if (code) {
        it(`muestra el código ${code}`, () => {
          expect(read(file)).toMatch(new RegExp(`au-error-code[^>]*>\\s*${code}\\s*<`));
        });
      }
    });
  }

  it('la página 404 está en la raíz para que los servidores estáticos la usen', () => {
    expect(existsSync(resolve(SRC, '404.html'))).toBe(true);
  });
});
