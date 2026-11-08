#!/usr/bin/env node
/**
 * Genera las páginas de ejemplo en `dist/*.html` a partir de `src/*.html` y `src/partials/**`.
 *
 * Usa el MISMO contexto y helpers que el servidor de desarrollo (`src/data/pages.js`), pero con
 * `dev: false`, de modo que cada página enlaza `css/app.css` y `js/app.js` (rutas relativas:
 * funcionan en cualquier backend y subcarpeta).
 *
 * Variables de entorno: `AU_SINGLE=1` → `<script defer>` (build de un solo archivo IIFE).
 */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import Handlebars from 'handlebars';
import { pageContext, helpers } from '../src/data/pages.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(root, 'src');
const PARTIALS = join(SRC, 'partials');
const DIST = join(root, 'dist');
const single = process.env.AU_SINGLE === '1';

if (!existsSync(join(DIST, 'js', 'app.js'))) {
  console.error('✖ Falta dist/js/app.js. Ejecute primero "vite build" (npm run build lo hace).');
  process.exit(1);
}

/** Registra recursivamente los parciales con nombre "carpeta/archivo". */
function registerPartials(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) registerPartials(full);
    else if (/\.(hbs|html)$/.test(name)) {
      const id = relative(PARTIALS, full)
        .replace(/\\/g, '/')
        .replace(/\.(hbs|html)$/, '');
      Handlebars.registerPartial(id, readFileSync(full, 'utf8'));
    }
  }
}

registerPartials(PARTIALS);
Handlebars.registerHelper(helpers);

const pages = readdirSync(SRC).filter((f) => f.endsWith('.html'));
for (const page of pages) {
  const template = Handlebars.compile(readFileSync(join(SRC, page), 'utf8'));
  const html = template(pageContext(page, { dev: false, single }));
  writeFileSync(join(DIST, page), html);
}
console.warn(`✔ ${pages.length} páginas → dist/ (${single ? 'un solo js, defer' : 'módulo ES + chunks'})`);
