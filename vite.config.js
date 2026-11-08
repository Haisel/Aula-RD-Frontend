// @ts-check
/**
 * Configuración de Vite para la plantilla Aula RD (neutra, tipo AdminKit).
 *
 * MODO DESARROLLO (`npm run dev`)
 *   - `root` = `src/`. Las páginas `src/*.html` se sirven con Handlebars (parciales de
 *     `src/partials/`) y cargan `src/js/app.js` como módulo con recarga en caliente.
 *
 * MODO BUILD (`npm run build`; `npm run build:single` para un único js IIFE sin chunks)
 *   - Vite compila UNA sola entrada (`src/js/app.js`, que importa `src/scss/app.scss`)
 *     y produce:
 *       dist/js/app.js     módulo ES (núcleo + fachada window.AU)
 *       dist/js/chunks/*   librerías pesadas que se descargan solo al usarse (decisión 003)
 *       dist/css/app.css   un solo CSS
 *       dist/fonts/*       fuentes (Plus Jakarta Sans, Bootstrap Icons)
 *       dist/img/*         lo que hay en public/img (logos, íconos)
 *   - Después, `scripts/build-html.mjs` genera `dist/*.html` desde las mismas páginas,
 *     enlazando `css/app.css` y `js/app.js`.
 *
 * @see docs/01-arquitectura.md
 */
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import handlebars from 'vite-plugin-handlebars';
import { readFileSync } from 'node:fs';
import { pageContext, helpers } from './src/data/pages.js';

const here = dirname(fileURLToPath(import.meta.url));
const src = resolve(here, 'src');

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));
// AU_SINGLE=1 → un solo archivo js/app.js (IIFE, sin chunks). Útil si su backend no puede servir módulos.
const SINGLE = process.env.AU_SINGLE === '1';

const FONT_RE = /\.(woff2?|ttf|otf|eot)$/i;
const IMG_RE = /\.(png|jpe?g|gif|svg|webp|avif|ico)$/i;

export default defineConfig(({ command }) => ({
  root: src,
  define: { __AU_VERSION__: JSON.stringify(pkg.version) },
  publicDir: resolve(here, 'public'),
  base: './',
  resolve: {
    alias: { '@': resolve(src, 'js'), '@scss': resolve(src, 'scss'), '@data': resolve(src, 'data') },
  },
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      scss: {
        // Bootstrap 5.3 aún usa @import y funciones globales de Sass: silenciamos esos avisos.
        silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'if-function'],
        quietDeps: true,
      },
    },
  },
  plugins: [
    command === 'serve' &&
      handlebars({
        partialDirectory: resolve(src, 'partials'),
        context: (pagePath) => pageContext(pagePath, { dev: true }),
        helpers,
      }),
  ],
  build: {
    outDir: resolve(here, 'dist'),
    emptyOutDir: true,
    sourcemap: true,
    cssCodeSplit: false,
    modulePreload: false,
    assetsInlineLimit: 0,
    // En build:single el JS único pesa ~2 MB a propósito; no tiene sentido advertirlo.
    chunkSizeWarningLimit: SINGLE ? 2500 : 600,
    rolldownOptions: {
      input: resolve(src, 'js/app.js'),
      // build:single incrusta los import() diferidos en el IIFE: `import.meta` no se usa y el aviso es ruido.
      ...(SINGLE ? { checks: { emptyImportMeta: false } } : {}),
      output: {
        format: SINGLE ? 'iife' : 'es',
        // build:single → sin chunks (Rolldown: `codeSplitting: false`; `inlineDynamicImports` está obsoleto)
        ...(SINGLE ? { codeSplitting: false } : {}),
        entryFileNames: 'js/app.js',
        chunkFileNames: 'js/chunks/[name]-[hash].js',
        assetFileNames: (asset) => {
          const name = asset.names?.[0] ?? '';
          if (name.endsWith('.css')) return 'css/app.css';
          if (FONT_RE.test(name)) return 'fonts/[name][extname]';
          if (IMG_RE.test(name)) return 'img/[name][extname]';
          return 'assets/[name][extname]';
        },
      },
    },
  },
  server: { port: 5173, open: '/index.html' },
}));
