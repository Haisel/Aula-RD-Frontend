/**
 * Adaptador de Choices.js (carga diferida): selects con búsqueda y selección múltiple.
 *
 * ```html
 * <select class="form-select" data-au-select name="provincia">…</select>
 * <select class="form-select" data-au-select multiple data-au-placeholder="Elija los grados">…</select>
 * ```
 * @module adapters/select
 */
import { lazy } from './lazy.js';

export const loadChoices = lazy('Choices.js', async () => (await import('choices.js')).default);

/**
 * Crea un select enriquecido.
 * @param {HTMLSelectElement} select Elemento `<select>`.
 * @param {object} [options] Opciones de Choices.js.
 * @returns {Promise<any>} Instancia de Choices.
 */
export async function createSelect(select, options = {}) {
  const Choices = await loadChoices();
  const instance = new Choices(select, {
    allowHTML: false,
    searchEnabled: select.options.length > 6 || select.multiple,
    shouldSort: false,
    itemSelectText: '',
    removeItemButton: select.multiple,
    placeholder: true,
    placeholderValue: select.dataset.auPlaceholder ?? null,
    searchPlaceholderValue: 'Buscar…',
    noResultsText: 'Sin resultados',
    noChoicesText: 'No hay más opciones',
    loadingText: 'Cargando…',
    addItemText: (/** @type {string} */ value) => `Presione Enter para agregar «${value}»`,
    ...options,
  });
  // Refleja el estado de validación en el contenedor visual de Choices
  const sync = () =>
    instance.containerOuter?.element?.classList.toggle('is-invalid', select.classList.contains('is-invalid'));
  const observer = new MutationObserver(sync);
  observer.observe(select, { attributes: true, attributeFilter: ['class'] });
  const destroy = instance.destroy.bind(instance);
  instance.destroy = () => {
    observer.disconnect();
    destroy();
  };
  return instance;
}
