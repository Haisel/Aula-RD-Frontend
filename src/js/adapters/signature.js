/**
 * Firma manuscrita (Signature Pad, carga diferida) — autorizaciones de tutores, actas.
 *
 * ```html
 * <canvas class="au-signature" data-au-signature data-au-input="#firma"></canvas>
 * <input type="hidden" name="firma" id="firma">
 * <button type="button" data-au-signature-clear="#mi-canvas">Borrar</button>
 * ```
 * @module adapters/signature
 */
import { lazy } from './lazy.js';
import { cssToken } from '../core/theme.js';

export const loadSignaturePad = lazy('Signature Pad', async () => (await import('signature_pad')).default);

/**
 * Activa la firma en un canvas. Ajusta la resolución a la pantalla y conserva el trazo al redimensionar.
 * @param {HTMLCanvasElement} canvas Lienzo.
 * @param {object} [options] Opciones de Signature Pad.
 * @returns {Promise<{ pad: any, clear: () => void, isEmpty: () => boolean, toDataURL: (type?: string) => string, destroy: () => void }>} Controlador.
 */
export async function attachSignature(canvas, options = {}) {
  const SignaturePad = await loadSignaturePad();
  const pad = new SignaturePad(canvas, {
    penColor: cssToken('text') || '#1f2937',
    backgroundColor: 'rgba(0,0,0,0)',
    ...options,
  });
  const target = canvas.dataset.auInput
    ? /** @type {HTMLInputElement | null} */ (document.querySelector(canvas.dataset.auInput))
    : null;
  const resize = () => {
    const data = pad.toData();
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext('2d')?.scale(ratio, ratio);
    pad.clear();
    pad.fromData(data);
  };
  resize();
  window.addEventListener('resize', resize);
  const sync = () => {
    if (target) target.value = pad.isEmpty() ? '' : pad.toDataURL('image/png');
  };
  pad.addEventListener('endStroke', sync);
  return {
    pad,
    clear: () => {
      pad.clear();
      sync();
    },
    isEmpty: () => pad.isEmpty(),
    toDataURL: (type = 'image/png') => pad.toDataURL(type),
    destroy: () => {
      window.removeEventListener('resize', resize);
      pad.off();
    },
  };
}
