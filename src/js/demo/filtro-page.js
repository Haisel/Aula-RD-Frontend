/**
 * Filtro en vivo de listas de la galería: búsqueda, contactos, preguntas frecuentes y galería de
 * imágenes (spec 013, T-19).
 *
 * El contenedor `[data-demo="filtro"]` tiene un campo `[data-filtro="texto"]`, un listado opcional
 * `[data-filtro="categoria"]` y elementos `[data-filtro-item]` con `data-categoria` opcional. Cada
 * cambio oculta los que no coinciden y anuncia el total. Nada se guarda (RN-02).
 * @module demo/filtro-page
 */
import { filtrar } from './filtro.js';

/**
 * Activa el filtro sobre su contenedor.
 * @param {HTMLElement} root Contenedor `[data-demo="filtro"]`.
 * @returns {void}
 */
export function filtro(root) {
  const input = /** @type {HTMLInputElement} */ (root.querySelector('[data-filtro="texto"]'));
  const cat = /** @type {HTMLSelectElement | null} */ (root.querySelector('[data-filtro="categoria"]'));
  const live = /** @type {HTMLElement} */ (root.querySelector('[data-filtro="anuncio"]'));
  const empty = /** @type {HTMLElement | null} */ (root.querySelector('[data-filtro="vacio"]'));
  const nodes = /** @type {HTMLElement[]} */ ([...root.querySelectorAll('[data-filtro-item]')]);
  const items = nodes.map((el) => ({
    el,
    texto: el.textContent ?? '',
    categoria: el.dataset.categoria ?? '',
  }));

  const apply = () => {
    const shown = new Set(filtrar(items, input.value, cat?.value ?? ''));
    for (const i of items) i.el.hidden = !shown.has(i);
    if (empty) empty.hidden = shown.size > 0;
    live.textContent = `${shown.size} de ${items.length} resultados.`;
  };

  input.addEventListener('input', apply);
  cat?.addEventListener('change', apply);
  apply();
}
