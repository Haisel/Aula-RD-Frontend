/**
 * Máscaras de entrada (IMask) para datos dominicanos.
 *
 * | `data-au-mask` | Formato           | Ejemplo          |
 * |-----------------|-------------------|------------------|
 * | `cedula`        | 000-0000000-0     | 001-1234567-8    |
 * | `rnc`           | 0-00-00000-0      | 1-01-12345-6     |
 * | `telefono`      | (000) 000-0000    | (809) 555-1234   |
 * | `moneda`        | 0,000.00          | 12,500.00        |
 * | `entero`        | 0,000             | 1,248            |
 *
 * El valor del input queda formateado; los validadores aceptan con o sin guiones.
 * IMask se descarga solo si la página tiene campos con máscara.
 * @module components/masks
 */
import { lazy } from '../adapters/lazy.js';

export const loadIMask = lazy('IMask', async () => (await import('imask')).default);

/** @type {Record<string, object>} */
export const MASKS = {
  cedula: { mask: '000-0000000-0' },
  rnc: { mask: '0-00-00000-0' },
  telefono: { mask: '(000) 000-0000' },
  moneda: {
    mask: 'Number',
    scale: 2,
    thousandsSeparator: ',',
    radix: '.',
    mapToRadix: ['.'],
    padFractionalZeros: true,
    normalizeZeros: true,
    min: 0,
  },
  entero: { mask: 'Number', scale: 0, thousandsSeparator: ',', min: 0 },
};

/**
 * Aplica una máscara.
 * @param {HTMLInputElement} input Campo.
 * @param {keyof typeof MASKS | object} mask Nombre de máscara o configuración de IMask.
 * @returns {Promise<any>} Instancia de IMask.
 */
export async function applyMask(input, mask) {
  const IMask = await loadIMask();
  /** @type {any} */
  let opts = typeof mask === 'string' ? MASKS[mask] : mask;
  if (!opts) throw new Error(`[AU] Máscara desconocida: ${String(mask)}`);
  if (opts.mask === 'Number') opts = { ...opts, mask: Number };
  return IMask(input, opts);
}

/** @type {import('../types.js').ComponentDefinition} */
export const maskComponent = {
  name: 'mask',
  selector: 'input[data-au-mask]',
  init(el) {
    const input = /** @type {HTMLInputElement} */ (el);
    if (!input.inputMode) input.inputMode = 'numeric';
    const pending = applyMask(input, input.dataset.auMask ?? '');
    return () => {
      pending.then((m) => m.destroy()).catch(() => {});
    };
  },
};
