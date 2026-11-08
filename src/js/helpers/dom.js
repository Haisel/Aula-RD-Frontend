/**
 * Utilidades mínimas de DOM.
 * @module helpers/dom
 */

/**
 * Devuelve el primer elemento que coincide con el selector.
 * @template {Element} [T=HTMLElement]
 * @param {string} selector Selector CSS.
 * @param {ParentNode} [root=document] Contenedor donde buscar.
 * @returns {T | null} El elemento o `null`.
 */
export function qs(selector, root = document) {
  return /** @type {T | null} */ (root.querySelector(selector));
}

/**
 * Devuelve todos los elementos que coinciden con el selector, como arreglo.
 * @template {Element} [T=HTMLElement]
 * @param {string} selector Selector CSS.
 * @param {ParentNode} [root=document] Contenedor donde buscar.
 * @returns {T[]} Arreglo (posiblemente vacío).
 */
export function qsa(selector, root = document) {
  return /** @type {T[]} */ (Array.from(root.querySelectorAll(selector)));
}

/**
 * Ejecuta `fn` cuando el DOM está listo (o de inmediato si ya lo está).
 * @param {() => void} fn Función a ejecutar.
 * @returns {void}
 */
export function ready(fn) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn, { once: true });
  } else {
    fn();
  }
}

/**
 * Lee un atributo `data-*` como JSON. Si no es JSON válido devuelve `fallback`.
 * @template T
 * @param {HTMLElement} el Elemento.
 * @param {string} key Nombre en camelCase del dataset (p. ej. `auChartData`).
 * @param {T} fallback Valor por defecto.
 * @returns {T} Objeto parseado o `fallback`.
 */
export function dataJson(el, key, fallback) {
  const raw = el.dataset[key];
  if (!raw) return fallback;
  try {
    return /** @type {T} */ (JSON.parse(raw));
  } catch {
    console.warn(`[AU] data-${key} no es JSON válido`, el);
    return fallback;
  }
}

/**
 * Crea un elemento con atributos y texto, sin usar innerHTML.
 * @template {keyof HTMLElementTagNameMap} K
 * @param {K} tag Etiqueta HTML.
 * @param {Record<string, string>} [attrs] Atributos.
 * @param {string} [text] Texto (se asigna con `textContent`, seguro contra XSS).
 * @returns {HTMLElementTagNameMap[K]} El elemento creado.
 */
export function h(tag, attrs = {}, text) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  if (text !== undefined) el.textContent = text;
  return el;
}
