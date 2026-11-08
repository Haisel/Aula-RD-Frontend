// @ts-check
/**
 * Configuración de pruebas (Vitest + jsdom).
 * Las pruebas viven en `tests/` y prueban módulos puros de `src/js/`.
 */
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const here = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: { alias: { '@': resolve(here, 'src/js'), '@data': resolve(here, 'src/data') } },
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.js'],
    css: false,
    coverage: { include: ['src/js/**/*.js'] },
  },
});
