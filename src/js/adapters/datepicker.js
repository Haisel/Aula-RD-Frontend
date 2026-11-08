/**
 * Adaptador de Flatpickr (carga diferida), en español y formato `DD/MM/AAAA`.
 *
 * ```html
 * <input class="form-control" data-au-datepicker name="fecha">
 * <input class="form-control" data-au-datepicker="range" name="periodo">
 * <input class="form-control" data-au-datepicker="datetime" data-au-min="today">
 * ```
 * @module adapters/datepicker
 */
import { lazy } from './lazy.js';

export const loadFlatpickr = lazy('Flatpickr', async () => {
  const [{ default: flatpickr }, { Spanish }] = await Promise.all([
    import('flatpickr'),
    import('flatpickr/dist/l10n/es.js'),
  ]);
  return { flatpickr, Spanish };
});

/**
 * Crea un selector de fecha.
 * @param {HTMLInputElement} input Campo de texto.
 * @param {object} [options] Opciones de Flatpickr.
 * @returns {Promise<any>} Instancia de Flatpickr.
 */
export async function createDatepicker(input, options = {}) {
  const { flatpickr, Spanish } = await loadFlatpickr();
  const mode = input.dataset.auDatepicker;
  return flatpickr(input, {
    locale: Spanish,
    dateFormat: mode === 'datetime' ? 'd/m/Y H:i' : 'd/m/Y',
    enableTime: mode === 'datetime',
    time_24hr: false,
    allowInput: true,
    disableMobile: true,
    mode: mode === 'range' ? 'range' : 'single',
    minDate: input.dataset.auMin,
    maxDate: input.dataset.auMax,
    ...options,
  });
}
