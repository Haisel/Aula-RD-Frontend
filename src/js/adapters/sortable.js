/**
 * Ordenar arrastrando (SortableJS, carga diferida) — p. ej. orden de asignaturas o secciones.
 *
 * ```html
 * <ul class="list-group" data-au-sortable data-au-input="#orden">…<li data-id="mat">Matemática</li>…</ul>
 * <input type="hidden" name="orden" id="orden">
 * ```
 * @module adapters/sortable
 */
import { lazy } from './lazy.js';

export const loadSortable = lazy('SortableJS', async () => (await import('sortablejs')).default);

/**
 * Activa el ordenamiento.
 * @param {HTMLElement} container Lista.
 * @param {object} [options] Opciones de SortableJS.
 * @returns {Promise<any>} Instancia de Sortable.
 */
export async function dragSort(container, options = {}) {
  const Sortable = await loadSortable();
  const target = container.dataset.auInput
    ? /** @type {HTMLInputElement | null} */ (document.querySelector(container.dataset.auInput))
    : null;
  const sync = (/** @type {any} */ s) => {
    if (target) target.value = s.toArray().join(',');
  };
  const sortable = Sortable.create(container, {
    animation: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 0 : 150,
    handle: container.querySelector('[data-au-handle]') ? '[data-au-handle]' : undefined,
    ghostClass: 'au-sortable-ghost',
    dataIdAttr: 'data-id',
    onSort: () => sync(sortable),
    ...options,
  });
  sync(sortable);
  return sortable;
}
