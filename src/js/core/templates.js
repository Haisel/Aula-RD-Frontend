/**
 * Plantillas Handlebars en el navegador, para pintar JSON del backend.
 *
 * ```html
 * <template id="tpl-fila-cobro">
 *   <tr><td>{{nombre}}</td><td class="text-end">{{currency monto}}</td><td>{{status estado}}</td></tr>
 * </template>
 * ```
 * ```js
 * tbody.innerHTML = await AU.render('#tpl-fila-cobro', filas);   // arreglo → concatena
 * ```
 * Handlebars se descarga la primera vez que se usa (por eso `render` es asíncrona).
 * El HTML resultante pasa por DOMPurify. Handlebars escapa `{{valor}}` por defecto;
 * nunca use `{{{triple}}}` con datos del usuario.
 * @module core/templates
 */
import { lazy } from '../adapters/lazy.js';
import { sanitize } from '../helpers/sanitize.js';
import { formatCurrency, formatDate, formatNumber, formatPercent } from '../helpers/format.js';
import { statusVariant } from '../helpers/status.js';

/** @type {Map<string, (data: any) => string>} */
const cache = new Map();

/** @type {Array<[string, (...args: any[]) => unknown]>} */
const pendingHelpers = [];

const loadHandlebars = lazy('Handlebars', async () => {
  const { default: Handlebars } = await import('handlebars/dist/handlebars.js');
  const hb = Handlebars.create();
  hb.registerHelper('currency', (/** @type {any} */ v) => formatCurrency(Number(v)));
  hb.registerHelper('number', (/** @type {any} */ v) => formatNumber(Number(v)));
  hb.registerHelper('percent', (/** @type {any} */ v) => formatPercent(Number(v)));
  hb.registerHelper('date', (/** @type {any} */ v) => formatDate(v));
  hb.registerHelper('eq', (/** @type {any} */ a, /** @type {any} */ b) => a === b);
  hb.registerHelper('status', (/** @type {any} */ label) => {
    const text = hb.escapeExpression(String(label ?? ''));
    return new hb.SafeString(
      `<span class="au-status au-status-${statusVariant(String(label ?? ''))}">${text}</span>`,
    );
  });
  for (const [name, fn] of pendingHelpers) hb.registerHelper(name, /** @type {any} */ (fn));
  return hb;
});

/**
 * Compila (y guarda en caché) una plantilla.
 * @param {string} source `#id` de un `<template>` o el texto de la plantilla.
 * @returns {Promise<(data: any) => string>} Función de plantilla.
 */
export async function compile(source) {
  const hb = await loadHandlebars();
  const cached = cache.get(source);
  if (cached) return cached;
  let text = source;
  if (source.startsWith('#')) {
    const tpl = document.querySelector(source);
    if (!tpl) throw new Error(`[AU] No existe la plantilla ${source}`);
    text = tpl instanceof HTMLTemplateElement ? tpl.innerHTML : (tpl.textContent ?? '');
  }
  const fn = hb.compile(text);
  cache.set(source, fn);
  return fn;
}

/**
 * Renderiza una plantilla con datos. Si `data` es un arreglo, renderiza cada elemento y concatena.
 * @param {string} source `#id` de `<template>` o texto de plantilla.
 * @param {object | object[]} data Datos.
 * @returns {Promise<string>} HTML sanitizado.
 */
export async function render(source, data) {
  const fn = await compile(source);
  const html = Array.isArray(data) ? data.map((item) => fn(item)).join('') : fn(data);
  return sanitize(html);
}

/**
 * Registra un helper adicional.
 * @param {string} name Nombre del helper.
 * @param {(...args: any[]) => unknown} fn Implementación.
 * @returns {void}
 */
export function registerHelper(name, fn) {
  pendingHelpers.push([name, fn]);
  cache.clear();
  loadHandlebars()
    .then((hb) => hb.registerHelper(name, /** @type {any} */ (fn)))
    .catch(() => {});
}
